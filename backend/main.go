package main

import (
	"backend/postgres"
	"backend/routes"
	"fmt"
	"net/http"
	"os"
	"time"

	pgadapter "github.com/casbin/casbin-pg-adapter"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/go-pg/pg/v10"
)

func main() {
	// Logger is instantiated first so it can be used to log the application start up
	logOutputMedium := os.Stdout
	rootLogger := routes.NewRootLogger(logOutputMedium)

	routes.AuthSecretKey = []byte(os.Getenv("AUTH_SECRET_KEY"))
	backendPort := os.Getenv("BACKEND_PORT")
	DbHost := os.Getenv("DB_HOST")
	DbPort := os.Getenv("DB_PORT")
	DbUserPassword := os.Getenv("DB_USER_PASSWORD")

	listenAddress := fmt.Sprintf("0.0.0.0:%v", backendPort) /// 0.0.0.0 is used to faciliate binding to any ip address
	dbConnString := fmt.Sprintf("host=%v port=%v user=backend password=%v dbname=backend sslmode=disable", DbHost, DbPort, DbUserPassword)

	// Connect to the database
	postgresStore, err := postgres.NewPostgresStore(dbConnString)
	opts, _ := pg.ParseURL(fmt.Sprintf("postgres://backend:%v@%v:%v/backend?sslmode=disable", DbUserPassword, DbHost, DbPort))
	retry := 0
	for err != nil {
		retry += 1
		if (retry > 30) {
			// wait up to 30 seconds for the db to be set up
			rootLogger.Fatal("DB-CONNECTION-FAILED", "errorMessage", fmt.Sprintf("Could not connect to database: %s", err))
		}
		
		rootLogger.Info("WAITING-FOR-DB-SETUP", "user", opts.User, "host", opts.Addr, "database", opts.Database)
		time.Sleep(time.Second)

		postgresStore, err = postgres.NewPostgresStore(dbConnString)		
	}
	rootLogger.Info("DB-CONNECTION-ESTABLISHED", "user", opts.User, "host", opts.Addr, "database", opts.Database)


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

	// Load the auth policies
	db := pg.Connect(opts)
	defer db.Close()

	a, err := pgadapter.NewAdapterByDB(db, pgadapter.SkipTableCreate())
	if err != nil {
		rootLogger.Fatal("AUTHORIZATION-ADAPTER-INSTANTIATION-FAILED", "errorMessage", fmt.Sprintf("Could not instantiate Authorization Adapter: %s", err))
	} else {
		rootLogger.Info("AUTHORIZATION-ADAPTER-INSTANTIATED", "user", opts.User, "host", opts.Addr, "database", opts.Database)
	}

	m, _ := model.NewModelFromString(routes.AuthModel)
	authEnforcer, err := casbin.NewEnforcer(m, a)
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

	router := routes.NewRouter(postgresStore, universalTranslator, validate, rootLogger, authEnforcer)

	rootLogger.Info("STARTING-UP")
	rootLogger.Info("SERVER-STARTED", "address", listenAddress)
	http.ListenAndServe(listenAddress, router)
}
