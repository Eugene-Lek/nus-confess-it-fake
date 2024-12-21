package routes

import (
	"net/http"

	"github.com/casbin/casbin/v2"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"

	"backend/postgres"
)

// A wrapper for the Router that adds its dependencies as properties/fields. This way, they can be accessed by route handlers
type Router struct {
	*mux.Router
	postgresStore       *postgres.PostgresStore
	universalTranslator *ut.UniversalTranslator
	validate            *validator.Validate
	rootLogger          *Logger
	sessionStore        sessions.Store
	authEnforcer        casbin.IEnforcer
}

func NewRouter(postgres *postgres.PostgresStore, universalTranslator *ut.UniversalTranslator, validate *validator.Validate, rootLogger *Logger, sessionStore sessions.Store, authEnforcer casbin.IEnforcer) *Router {
	r := mux.NewRouter()

	router := &Router{
		Router:              r,
		postgresStore:       postgres,
		universalTranslator: universalTranslator,
		validate:            validate,
		rootLogger:          rootLogger,
		sessionStore:        sessionStore,
		authEnforcer:        authEnforcer,
	}

	// Logging middleware wraps around error handling middleware because an error in logging has zero impact on the user
	router.Use(setRequestLogger(router.rootLogger))
	router.Use(logRequestCompletion)
	router.Use(errorHandling)
	router.Use(setTranslator(router.universalTranslator))
	router.Use(authenticateUser(router.sessionStore))
	router.Use(verifyAuthorization(router.authEnforcer))

	apiRouter := r.PathPrefix("/api/v1").Subrouter()
	apiRouter.HandleFunc("/session", router.handleLogin).Methods("POST")
	apiRouter.HandleFunc("/session", router.handleLogout).Methods("DELETE")
	apiRouter.HandleFunc("/tags", router.handleGetTags).Methods("GET") // Gets all tags of all posts

	userRouter := apiRouter.PathPrefix("/users/{username}").Subrouter()
	userRouter.HandleFunc("", router.handleCreateUser).Methods("POST")
	userRouter.HandleFunc("/posts", router.handleGetMyPosts).Methods("GET")
	userRouter.HandleFunc("/drafts", router.handleGetMyDrafts).Methods("GET")
	userRouter.HandleFunc("/liked-posts", router.handleGetLikedPosts).Methods("GET")
	userRouter.HandleFunc("/comments", router.handleGetMyComments).Methods("GET")
	userRouter.HandleFunc("/liked-comments", router.handleGetLikedComments).Methods("GET")

	postRouter := apiRouter.PathPrefix("/posts").Subrouter()
	postRouter.HandleFunc("", router.handleGetPosts).Methods("GET")
	postRouter.HandleFunc("/{postId}", router.handleGetPost).Methods("GET")
	postRouter.HandleFunc("/{postId}", router.handleCreatePost).Methods("POST")
	postRouter.HandleFunc("/{postId}", router.handleUpdatePost).Methods("PUT")
	postRouter.HandleFunc("/{postId}", router.handleDeletePost).Methods("DELETE")
	postRouter.HandleFunc("/{postId}/comments", router.handleGetCommentsByPostId).Methods("GET")
	postRouter.HandleFunc("/{postId}/vote", router.handleUpsertPostVote).Methods("PUT") // Endpoint for voting on a post
 
	commentRouter := apiRouter.PathPrefix("/comments").Subrouter()
	commentRouter.HandleFunc("/{commentId}", router.handleCreateComment).Methods("POST")
	commentRouter.HandleFunc("/{commentId}", router.handleUpdateComment).Methods("PUT")
	commentRouter.HandleFunc("/{commentId}", router.handleDeleteComment).Methods("DELETE")
	commentRouter.HandleFunc("/{commentId}/vote", router.handleUpsertCommentVote).Methods("POST") // Endpoint for voting on a comment

	router.NotFoundHandler = setRequestLogger(router.rootLogger)(errorHandling(http.HandlerFunc(router.handleNotFound))) // Custom 404 handler

	return router
}

func (router *Router) handleNotFound(w http.ResponseWriter, r *http.Request) {
	sendToErrorHandlingMiddleware(Err404NotFound, r)
}

