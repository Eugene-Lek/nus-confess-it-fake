package routes

import (
	"backend/postgres"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/alexedwards/argon2id"
	"github.com/gorilla/mux"
)

func (router *Router) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		Username    string `validate:"required,notBlank" name:"username"`
		Password string `validate:"required,notBlank,min=10,password" name:"password"`
	}

	var input requestInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		sendToErrorHandlingMiddleware(ErrInvalidJSON, r)
		return
	}

	vars := mux.Vars(r)
	input.Username = vars["username"]

	//Input validation
	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Hash the password
	hashedPassword, err := argon2id.CreateHash(input.Password, argon2id.DefaultParams)

	// Make DB query
	user := postgres.User{
		Username: input.Username,
		Password: hashedPassword,
	}
	err = router.postgresStore.CreateUser(user)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Add policies to give authenticated users the authorization to do things (e.g. create a post)
	var authenticatedPolicies = [][]string{
		{user.Username, "/api/{version}/posts/{postId}", "POST"}, // Auth to create posts
		{user.Username, "/api/{version}/posts/{postId}/vote", "PUT"}, // Auth to liked/dislike posts
		{user.Username, fmt.Sprintf("/api/{version}/users/%s/posts", user.Username), "GET"}, // Auth to see own posts
		{user.Username, fmt.Sprintf("/api/{version}/users/%s/drafts", user.Username), "GET"}, // Auth to see own drafts
		{user.Username, fmt.Sprintf("/api/{version}/users/%s/liked-posts", user.Username), "GET"}, // Auth to see liked posts

		{user.Username, "/api/{version}/comments/{commentId}", "POST"}, // Auth to create comments
		{user.Username, "/api/{version}/comments/{commentId}/vote", "PUT"}, // Auth to liked/dislike comments
		{user.Username, fmt.Sprintf("/api/{version}/users/%s/comments", user.Username), "GET"}, // Auth to see own comments
		{user.Username, fmt.Sprintf("/api/{version}/users/%s/liked-comments", user.Username), "GET"}, // Auth to see liked comments
	}

	err = addAuthPolicies(authenticatedPolicies, router.authEnforcer)
	if (err != nil) {
		sendToErrorHandlingMiddleware(err, r)
		return		
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("USER-CREATED", "username", user.Username)

	w.WriteHeader(http.StatusCreated)
}
