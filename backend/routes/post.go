package routes

import (
	"backend/postgres"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func (router *Router) handleGetPost(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		PostId string `validate:"required,notBlank,uuid4" name:"post id"`
	}

	type responseBody struct {
		Post postgres.Post `json:"post"`
	}

	vars := mux.Vars(r)
	input := requestInput{
		PostId: vars["postId"],
	}

	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	post, err := router.postgresStore.GetPostById(user.Username, input.PostId)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}
	if post == nil {
		sendToErrorHandlingMiddleware(Err404NotFound, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-FETCHED", "postId", post.Id)

	w.WriteHeader(http.StatusCreated)
	w.Header().Add("content-type", "application/json")

	json.NewEncoder(w).Encode(post)
}

// The function "getPosts" is an abstraction for all route handlers that involve fetching posts.
// It is not directly attached to any endpoint.
type getPostsRequestInput struct {
	Query string `validate:"omitempty,notBlank" name:"query"`
	Tags []string `validate:"omitempty,notBlank" name:"tags"`
	Author string `validate:"omitempty,notBlank" name:"author"`
	LikedBy string `validate:"omitempty,notBlank" name:"liked by"`
	Statuses []string `validate:"omitempty,dive,oneof=Draft Published Deleted" name:"statuses"`
	SortBy string `validate:"omitempty,oneof=Newest Popular Relevance" name:"sort by"`
}

func (router *Router) getPosts(w http.ResponseWriter, r *http.Request, input getPostsRequestInput) {
	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	posts, err := router.postgresStore.GetPosts(user.Username, input.Author, input.Statuses, input.Query, input.Tags, input.LikedBy, input.SortBy)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POSTS-FETCHED", "query", input.Query, "tags", input.Tags, "author", input.Author, "likedBy", input.LikedBy, "sortBy", input.SortBy)

	w.WriteHeader(http.StatusOK)
	w.Header().Add("content-type", "application/json")

	json.NewEncoder(w).Encode(posts)
}

func (router *Router) handleGetPosts(w http.ResponseWriter, r *http.Request) {
	r.ParseForm() // Parses the query params in such a way that values belonging to the same key are merged into an array
	input := getPostsRequestInput{
		Query: r.URL.Query().Get("query"),
		Tags: r.Form["tag"],
		SortBy: r.URL.Query().Get("sortBy"),
		Statuses: []string{"Published"},
	}

	router.getPosts(w, r, input)
}

func (router *Router) handleGetMyPosts(w http.ResponseWriter, r *http.Request) {
	user := getAuthenticatedUser(r)
	r.ParseForm() // Parses the query params in such a way that values belonging to the same key are merged into an array

	input := getPostsRequestInput{
		Query: r.URL.Query().Get("query"),
		Tags: r.Form["tag"],
		SortBy: r.URL.Query().Get("sortBy"),
		Author: user.Username,
		Statuses: []string{"Published", "Deleted"}, // Only show published and deleted posts
	}

	router.getPosts(w, r, input)
}

func (router *Router) handleGetMyDrafts(w http.ResponseWriter, r *http.Request) {
	user := getAuthenticatedUser(r)
	r.ParseForm() // Parses the query params in such a way that values belonging to the same key are merged into an array

	input := getPostsRequestInput{
		Query: r.URL.Query().Get("query"),
		Tags: r.Form["tag"],
		SortBy: r.URL.Query().Get("sortBy"),
		Author: user.Username,
		Statuses: []string{"Draft"},
	}

	router.getPosts(w, r, input)
}

func (router *Router) handleGetLikedPosts(w http.ResponseWriter, r *http.Request) {
	user := getAuthenticatedUser(r)
	r.ParseForm() // Parses the query params in such a way that values belonging to the same key are merged into an array

	input := getPostsRequestInput{
		Query: r.URL.Query().Get("query"),
		Tags: r.Form["tag"],
		SortBy: r.URL.Query().Get("sortBy"),
		LikedBy: user.Username,
		Statuses: []string{"Published", "Deleted"},
	}

	router.getPosts(w, r, input)
}

// The function "getPostParams" is an abstraction for handleCreatePost and handleUpdatePost
// It is not directly attached to any endpoint
func (router *Router) getPostParams(r *http.Request) (*postgres.Post, error) {
	type requestInput struct {
		Id string `validate:"required,notBlank,uuid4" name:"id"`
		Title string `validate:"required,notBlank" name:"title"`
		Body string `validate:"required,notBlank" name:"body"`
		Tags []string // Tags are optional
		Status string `validate:"required,oneof=Draft Published Deleted" name:"status"`
	}

	var input requestInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		return nil, ErrInvalidJSON
	}

	vars := mux.Vars(r)
	input.Id = vars["postId"]

	//Input validation
	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, input)
	if err != nil {
		return nil, err
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	post := postgres.Post{
		Id: input.Id,
		Title: input.Title,
		Body: input.Body,
		Tags: input.Tags,
		Author: user.Username,
		Status: input.Status,
	}

	return &post, nil
}

func (router *Router) handleCreatePost(w http.ResponseWriter, r *http.Request) {

	post, err := router.getPostParams(r)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// If there is no error from getPostParams, post is guaranteed to be non-nil,
	// so dereferencing can occur safely
	err = router.postgresStore.CreatePost(*post) 
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Add authorisation rules that allow the author to update/delete the post
	var authenticatedPolicies = [][]string{
		{post.Author, fmt.Sprintf("/api/{version}/posts/%s", post.Id), "PUT"}, // Auth to update the post
		{post.Author, fmt.Sprintf("/api/{version}/posts/%s/conversion", post.Id), "POST"}, // Auth to convert a draft to a post
		{post.Author, fmt.Sprintf("/api/{version}/posts/%s", post.Id), "DELETE"}, // Auth to delete the post
	}

	err = addAuthPolicies(authenticatedPolicies, router.authEnforcer)
	if (err != nil) {
		sendToErrorHandlingMiddleware(err, r)
		return		
	}


	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-CREATED", "postId", post.Id)

	w.WriteHeader(http.StatusCreated)
}

func (router *Router) handleUpdatePost(w http.ResponseWriter, r *http.Request) {
	post, err := router.getPostParams(r)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// If there is no error from getPostParams, post is guaranteed to be non-nil,
	// so dereferencing can occur safely
	err = router.postgresStore.UpdatePost(*post)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-UPDATED", "postId", post.Id)

	w.WriteHeader(http.StatusNoContent)
}

func (router *Router) handleUpdateDraftToPost(w http.ResponseWriter, r *http.Request) {
	post, err := router.getPostParams(r)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// If there is no error from getPostParams, post is guaranteed to be non-nil,
	// so dereferencing can occur safely	
	err = router.postgresStore.UpdateDraftToPost(*post)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("UPDATED-DRAFT-TO-POST", "postId", post.Id)

	w.WriteHeader(http.StatusNoContent)
}

func (router *Router) handleDeletePost(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		Id string `validate:"required,notBlank,uuid4" name:"id"`
	}

	vars := mux.Vars(r)
	input := requestInput{
		Id: vars["postId"],
	}

	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	err = router.postgresStore.SoftDeletePost(input.Id)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-SOFT-DELETED", "postId", input.Id)

	w.WriteHeader(http.StatusNoContent)
}

func (router *Router) handleUpsertPostVote(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		PostId string `validate:"required,notBlank,uuid4" name:"id"`
		Vote string `validate:"required,oneof=Like Dislike" name:"vote"`
	}

	var input requestInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		sendToErrorHandlingMiddleware(ErrInvalidJSON, r)
	}
	
	vars := mux.Vars(r)
	input.PostId = vars["postId"]

	//Input validation
	translator := getTranslator(r)
	err = validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	postVote := postgres.PostVote{
		PostId: input.PostId,
		Viewer: user.Username,
		Vote: input.Vote,
	}
	err = router.postgresStore.UpsertPostVote(postVote)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-VOTE-UPSERTED", "postId", postVote.PostId, "viewer", postVote.Viewer)

	w.WriteHeader(http.StatusOK)
}

func (router *Router) handleDeletePostVote(w http.ResponseWriter, r *http.Request) {
	type requestInput struct {
		PostId string `validate:"required,notBlank,uuid4" name:"id"`
	}

	vars := mux.Vars(r)
	input := requestInput{
		PostId: vars["postId"],
	}

	//Input validation
	translator := getTranslator(r)
	err := validateStruct(router.validate, translator, input)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	// Make DB query
	user := getAuthenticatedUser(r)
	postVote := postgres.PostVote{
		PostId: input.PostId,
		Viewer: user.Username,
	}
	err = router.postgresStore.DeletePostVote(postVote)
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("POST-VOTE-DELETED", "postId", postVote.PostId, "viewer", postVote.Viewer)

	w.WriteHeader(http.StatusOK)
}

func (router *Router) handleGetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := router.postgresStore.GetTags()
	if err != nil {
		sendToErrorHandlingMiddleware(err, r)
		return
	}

	requestLogger := getRequestLogger(r)
	requestLogger.Info("TAGS-FETCHED")

	w.WriteHeader(http.StatusOK)
	w.Header().Add("content-type", "application/json")

	json.NewEncoder(w).Encode(tags)
}