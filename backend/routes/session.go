package routes

import (
	"encoding/json"
	"net/http"

	"github.com/alexedwards/argon2id"
	"github.com/gorilla/sessions"

	"backend/httperror"
	"backend/postgres"
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
	user, err := router.postgresStore.GetUser(reqBody.Username)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}
	if user == nil {
		// If the user doesn't exist, ise a default password to avoid revealing the fact
		// that the account does not exist
		user = &postgres.User{Password: "default"}
	}

	//validate the password
	passwordMatch, err := argon2id.ComparePasswordAndHash(reqBody.Password, user.Password)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}
	if !passwordMatch {
		sendToErrorHandlingMiddleware(ErrUserUnauthenticated, r)
		return
	}

	// If the session isn't in the req context, it tries to retrieve the it from the session store
	// If it isn't in the session store, it returns a new session with an empty session id
	session, err := router.sessionStore.Get(r, authSessionName)
	if err != nil {
		sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
		return
	}

	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		//Secure: true, --> only in production where the frontend has an SSL certificate
	}
	session.Values["username"] = reqBody.Username
	err = router.sessionStore.Save(r, w, session)
	if err != nil {
		sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
		return
	}

	// Check that session was saved & get its ID
	s, err := router.sessionStore.Get(r, authSessionName)
	if err != nil {
		sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
		return
	}

	reqLogger := getRequestLogger(r)
	reqLogger.Info("SESSION-CREATED", "sessionId", s.ID)
	reqLogger.Info("USER-AUTHENTICATED", "username", reqBody.Username)

	w.WriteHeader(http.StatusCreated)
}

func (router *Router) handleLogout(w http.ResponseWriter, r *http.Request) {
	session, err := router.sessionStore.Get(r, authSessionName)
	if err != nil {
		sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
		return
	}

	// Used for logging later
	username, sessionExists := session.Values["username"].(string)

	session.Options = &sessions.Options{
		MaxAge: -1,
	}

	// Deletes the session from the storage & sets the cookie's max age to -1
	err = router.sessionStore.Save(r, w, session)
	if err != nil {
		sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
		return
	}

	reqLogger := getRequestLogger(r)
	if sessionExists {
		reqLogger.Info("SESSION-DELETED", "username", username)
	} else {
		reqLogger.Warn("SESSION-ALREADY-DELETED", "sessionId", session.ID)
	}

	w.WriteHeader(http.StatusNoContent)
}
