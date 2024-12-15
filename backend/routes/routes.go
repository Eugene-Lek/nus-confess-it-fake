package routes

import (
	"net/http"

	"github.com/alexedwards/argon2id"
	//"github.com/casbin/casbin/v2"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"

	"multi-tenant-HR-information-system-backend/httperror"
	"multi-tenant-HR-information-system-backend/storage"
)

// A wrapper for the Router that adds its dependencies as properties/fields. This way, they can be accessed by route handlers
type Router struct {
	*mux.Router
	postgres            postgres.Postgres
	universalTranslator *ut.UniversalTranslator
	validate            *validator.Validate
	sessionStore        sessions.Store
	authEnforcer        casbin.IEnforcer
}

func newRouter() {

}