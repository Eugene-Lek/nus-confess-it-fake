package routes

import (
	"encoding/json"
	"net/http"

	"backend/postgres"

	"github.com/alexedwards/argon2id"
)

const authSessionName = "authenticated"

func (router *Router) handleLogin(w http.ResponseWriter, r *http.Request) {
	type requestBody struct {
		Username string `validate:"required" name:"username"`
		Password string `validate:"required" name:"password"`
	}
	var reqBody requestBody
	err := json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		sendToErrorHandlingMiddleware(ErrInvalidJSON, r)
		return
	}

	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, reqBody)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Get the user's password hash
	var noUser bool
	user, err := router.postgresStore.GetUser(reqBody.Username)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}
	if user == nil {
		// If the user doesn't exist, is a default password to avoid revealing the fact
		// that the account does not exist
		// The value of the hash corresponds to the password "default" and
		// is pre-calculated to avoid unnecessary repeated calculation
		noUser = true
		user = &postgres.User{Password: "$argon2id$v=19$m=65536,t=1,p=12$xiUvMEm2uNkJpCcbp8T+lg$iMvmVHMimECtndXR+KwSXhUV/XAvM0Hp/6adUrKWHus"}
	}

	//validate the password
	passwordMatch, err := argon2id.ComparePasswordAndHash(reqBody.Password, user.Password)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}
	if !passwordMatch || noUser {
		sendToErrorHandlingMiddleware(ErrUserUnauthenticated, r)
		return
	}

	authCookie, err := createAuthCookie(user.Username)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	reqLogger := getRequestLogger(r)
	reqLogger.Info("JWT-CREATED", "jwt", authCookie.Value, "username", user.Username)
	reqLogger.Info("USER-AUTHENTICATED", "username", user.Username)
	
	http.SetCookie(w, authCookie) // Cookie must be set before header is written otherwise cookie will not be set
	w.WriteHeader(http.StatusCreated)	
}

func (router *Router) handleLogout(w http.ResponseWriter, r *http.Request) {
	expiredCookie := createExpiredAuthCookie()
	
	user := getAuthenticatedUser(r)
	reqLogger := getRequestLogger(r)
	reqLogger.Info("JWT-DELETED", "username", user.Username)

	http.SetCookie(w, expiredCookie) // Cookie must be set before header is written otherwise cookie will not be set
	w.WriteHeader(http.StatusNoContent)
}
