package main

import (
	"backend/postgres"
	"backend/routes"
	"fmt"
	"net/http"
	"os"

	"github.com/casbin/casbin/v2"
	pgadapter "github.com/casbin/casbin-pg-adapter"
	"github.com/go-pg/pg/v10"
)

func main() {
	// Logger is instantiated first so it can be used to log the application start up
	logOutputMedium := os.Stdout
	rootLogger := routes.NewRootLogger(logOutputMedium)

	listenAddress := "localhost:5000"
	dbConnString := "host=localhost port=5433 user=backend password=abcd1234 dbname=backend sslmode=disable"

	postgres, err := postgres.NewPostgresStore(dbConnString)
	if err != nil {
		rootLogger.Fatal("DB-CONNECTION-FAILED", "errorMessage", fmt.Sprintf("Could not connect to database: %s", err))
	} else {
		opts, _ := pg.ParseURL("postgres://backend:abcd1234@localhost:5433/backend?sslmode=disable")
		rootLogger.Info("DB-CONNECTION-ESTABLISHED", "user", opts.User, "host", opts.Addr, "database", opts.Database)
	}

	// A Translator maps tags to text templates (you must register these tags & templates yourself)
	// In the case of cardinals & ordinals, numerical parameters are also taken into account
	// Validation check parameters are then interpolated into these templates
	// By default, a Translator will only contain guiding rules that are based on the nature of its language
	// E.g. English Cardinals are only categorised into either "One" or "Other"
	universalTranslator := routes.NewUniversalTranslator()

	validate, err := routes.NewValidator(universalTranslator)
	if err != nil {
		rootLogger.Fatal("VALIDATOR-INSTANTIATION-FAILED", "errorMessage", fmt.Sprintf("Could not instantiate validator: %s", err))
	} else {
		rootLogger.Info("VALIDATOR-INSTANTIATED")
	}

	opts, _ := pg.ParseURL("postgres://backend:abcd1234@localhost:5433/backend?sslmode=disable")
	db := pg.Connect(opts)
	defer db.Close()

	a, err := pgadapter.NewAdapterByDB(db, pgadapter.SkipTableCreate())
	if err != nil {
		rootLogger.Fatal("AUTHORIZATION-ADAPTER-INSTANTIATION-FAILED", "errorMessage", fmt.Sprintf("Could not instantiate Authorization Adapter: %s", err))
	} else {
		rootLogger.Info("AUTHORIZATION-ADAPTER-INSTANTIATED", "user", opts.User, "host", opts.Addr, "database", opts.Database)
	}

	authEnforcer, err := casbin.NewEnforcer("auth_model.conf", a)
	if err != nil {
		rootLogger.Fatal("AUTHORIZATION-ENFORCER-INSTANTIATION-FAILED", "errorMessage", fmt.Sprintf("Could not instantiate Authorization Enforcer: %s", err))
	} else {
		rootLogger.Info("AUTHORIZATION-ENFORCER-INSTANTIATED")
	}

	if err := authEnforcer.LoadPolicy(); err != nil {
		rootLogger.Fatal("AUTHORIZATION-POLICY-LOAD-FAILED", "errorMessage", fmt.Sprintf("Could not load policy into Authorization Enforcer: %s", err))
	} else {
		rootLogger.Info("AUTHORIZATION-POLICY-LOADED")
	}

	router := routes.NewRouter(postgres, universalTranslator, validate, rootLogger, authEnforcer)

	rootLogger.Info("STARTING-UP")
	rootLogger.Info("SERVER-STARTED", "address", listenAddress)
	http.ListenAndServe(listenAddress, router)
}
