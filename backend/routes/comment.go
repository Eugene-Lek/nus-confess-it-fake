package routes

import (
	"backend/postgres"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// The function "getComments" is an abstraction for all route handlers that involve fetching comments.
// It is not directly attached to any endpoint.
type getCommentsRequestInput struct {
	PostId string `validate:"required,notBlank,uuid4" name:"post id"`
	Query string `validate:"omitempty,notBlank" name:"query"`
	Author string `validate:"omitempty,notBlank" name:"author"`
	LikedBy string `validate:"omitempty,notBlank" name:"liked by"`
	Status string `validate:"omitempty,oneof=Draft Published Deleted" name:"status"`
	SortBy string `validate:"omitempty,oneof=newest popular relevance" name:"sort by"`
}

func (router *Router) getComments(w http.ResponseWriter, r *http.Request, input getCommentsRequestInput) {
	type responseBody struct {
		Comments []postgres.Comment `json:"comments"`
	}

	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	comments, err := router.postgresStore.GetComments(input.PostId, input.Author, input.Status, input.Query, input.LikedBy, input.SortBy)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("COMMENTS-FETCHED", "commentId", input.PostId, "author",  input.Author, "status", input.Status, "query", input.Query, "likedBy", input.LikedBy, "sortBy", input.SortBy)

	w.WriteHeader(http.StatusOK)
	w.Header().Add("content-type", "application/json")

	resBody := responseBody{
		Comments: comments,
	}
	json.NewEncoder(w).Encode(resBody)
}

func (router *Router) handleGetCommentsByPostId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	input := getCommentsRequestInput{
		PostId: vars["postId"],
		Status: "Published",
	}

	router.getComments(w, r, input)
}

func (router *Router) handleGetMyComments(w http.ResponseWriter, r *http.Request) {
	user := getAuthenticatedUser(r)

	input := getCommentsRequestInput{
		Query: r.URL.Query().Get("query"),
		SortBy: r.URL.Query().Get("sortBy"),
		Author: user.Username,
		Status: "Published", // Only show published comments
	}

	router.getComments(w, r, input)
}

func (router *Router) handleGetLikedComments(w http.ResponseWriter, r *http.Request) {
	user := getAuthenticatedUser(r)

	input := getCommentsRequestInput{
		Query: r.URL.Query().Get("query"),
		SortBy: r.URL.Query().Get("sortBy"),
		LikedBy: user.Username,
		Status: "Published",
	}

	router.getComments(w, r, input)
}

// The function "getCommentParams" is an abstraction for handleCreateComment and handleUpdateComment
// It is not directly attached to any endpoint
func (router *Router) getCommentParams(r *http.Request) (*postgres.Comment, error) {
	type requestInput struct {
		Id string `validate:"required,notBlank,uuid4" name:"id"`
		Body string `validate:"required,notBlank" name:"body"`
		Author    string `validate:"required,notBlank" name:"author"`
		PostId string `validate:"required,notBlank,uuid4" name:"post id"`
		ParentId string `validate:"omitempty,notBlank,uuid4" name:"parent id"`
	}

	var input requestInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		return nil, ErrInvalidJSON
	}

	vars := mux.Vars(r)
	input.Id = vars["commentId"]

	//Input validation
	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, input)
	if err != nil {
		return nil, err
	}

	// Make DB query
	comment := postgres.Comment{
		Id: input.Id,
		Body: input.Body,
		Author: input.Author,
		PostId: input.PostId,
		ParentId: input.ParentId,
	}

	return &comment, nil
}

func (router *Router) handleCreateComment(w http.ResponseWriter, r *http.Request) {

	comment, err := router.getCommentParams(r)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// If there is no error from getCommentParams, comment is guaranteed to be non-nil,
	// so dereferencing can occur safely
	err = router.postgresStore.CreateComment(*comment) 
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Add authorisation rules that allow the author to update/delete the comment
	var authenticatedPolicies = [][]string{
		{comment.Author, fmt.Sprintf("/api/{version}/comments/%s", comment.Id), "PUT"}, // Auth to update the comment
		{comment.Author, fmt.Sprintf("/api/{version}/comments/%s", comment.Id), "DELETE"}, // Auth to delete the comment
	}

	err = addAuthPolicies(authenticatedPolicies, router.authEnforcer)
	if (err != nil) {
		sendToErrorHandlingMiddleware(err, r)
		return		
	}


	requestLogger := getRequestLogger(r)
	requestLogger.Info("COMMENT-CREATED", "commentId", comment.Id)

	w.WriteHeader(http.StatusCreated)
}

func (router *Router) handleUpdateComment(w http.ResponseWriter, r *http.Request) {
	comment, err := router.getCommentParams(r)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// If there is no error from getCommentParams, comment is guaranteed to be non-nil,
	// so dereferencing can occur safely
	err = router.postgresStore.UpdateComment(*comment)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("COMMENT-UPDATED", "commentId", comment.Id)

	w.WriteHeader(http.StatusNoContent)
}

func (router *Router) handleDeleteComment(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		Id string `validate:"required,notBlank,uuid4" name:"id"`
	}

	vars := mux.Vars(r)
	input := requestInput{
		Id: vars["commentId"],
	}

	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	err = router.postgresStore.SoftDeleteComment(input.Id)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("COMMENT-SOFT-DELETED", "commentId", input.Id)

	w.WriteHeader(http.StatusNoContent)
}

func (router *Router) handleUpsertCommentVote(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		CommentId string `validate:"required,notBlank,uuid4" name:"id"`
		Vote string `validate:"required,oneof=Like Dislike" name:"vote"`
	}

	var input requestInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		sendToErrorHandlingMiddleware(ErrInvalidJSON, r)
	}
	
	vars := mux.Vars(r)
	input.CommentId = vars["commentId"]

	//Input validation
	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	commentVote := postgres.CommentVote{
		CommentId: input.CommentId,
		Viewer: user.Username,
		Vote: input.Vote,
	}
	err = router.postgresStore.UpsertCommentVote(commentVote)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("COMMENT-VOTE-CREATED", "commentId", commentVote.CommentId, "viewer", commentVote.Viewer)

	w.WriteHeader(http.StatusOK)
}