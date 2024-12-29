package routes

import (
	"net/http"
	"os"

	"github.com/casbin/casbin/v2"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"backend/postgres"
)

// A wrapper for the Router that adds its dependencies as properties/fields. This way, they can be accessed by route handlers
type Router struct {
	*mux.Router
	postgresStore       *postgres.PostgresStore
	universalTranslator *ut.UniversalTranslator
	validate            *validator.Validate
	rootLogger          *Logger
	authEnforcer        casbin.IEnforcer
}

func NewRouter(postgres *postgres.PostgresStore, universalTranslator *ut.UniversalTranslator, validate *validator.Validate, rootLogger *Logger, authEnforcer casbin.IEnforcer) http.Handler {
	r := mux.NewRouter()

	router := &Router{
		Router:              r,
		postgresStore:       postgres,
		universalTranslator: universalTranslator,
		validate:            validate,
		rootLogger:          rootLogger,
		authEnforcer:        authEnforcer,
	}

	// Logging middleware wraps around error handling middleware because an error in logging has zero impact on the user
	router.Use(setRequestLogger(router.rootLogger))
	router.Use(logRequestCompletion)
	router.Use(errorHandling)
	router.Use(setTranslator(router.universalTranslator))
	router.Use(authenticateUser)
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
	postRouter.HandleFunc("/{postId}/conversion", router.handleUpdateDraftToPost).Methods("POST")
	postRouter.HandleFunc("/{postId}", router.handleDeletePost).Methods("DELETE")
	postRouter.HandleFunc("/{postId}/comments", router.handleGetCommentsByPostId).Methods("GET")
	postRouter.HandleFunc("/{postId}/vote", router.handleUpsertPostVote).Methods("PUT") // Endpoint for voting on a post
	postRouter.HandleFunc("/{postId}/vote", router.handleDeletePostVote).Methods("DELETE") // Endpoint for voting on a post
 
	commentRouter := apiRouter.PathPrefix("/comments").Subrouter()
	commentRouter.HandleFunc("/{commentId}", router.handleCreateComment).Methods("POST")
	commentRouter.HandleFunc("/{commentId}", router.handleUpdateComment).Methods("PUT")
	commentRouter.HandleFunc("/{commentId}", router.handleDeleteComment).Methods("DELETE")
	commentRouter.HandleFunc("/{commentId}/vote", router.handleUpsertCommentVote).Methods("PUT") // Endpoint for voting on a comment
	commentRouter.HandleFunc("/{commentId}/vote", router.handleDeleteCommentVote).Methods("DELETE") // Endpoint for voting on a comment

	router.NotFoundHandler = setRequestLogger(router.rootLogger)(errorHandling(http.HandlerFunc(router.handleNotFound))) // Custom 404 handler

	// Accept requests that come from the frontend domain
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	origins := handlers.AllowedOrigins([]string{os.Getenv("FRONTEND_URL")})
	creds := handlers.AllowCredentials()

	return handlers.CORS(headers, methods, origins, creds)(router)
}

func (router *Router) handleNotFound(w http.ResponseWriter, r *http.Request) {
	sendToErrorHandlingMiddleware(Err404NotFound, r)
}

