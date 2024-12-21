package postgres

import (
	"backend/httperror"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Comment struct {
	Id        string
	Body      string
	Author    string
	PostId    string
	ParentId  string
	Status    string
	Likes     int
	Dislikes  int
	CreatedAt string
	UpdatedAt string
}

type CommentVote struct {
	Viewer string
	CommentId string
	Vote string
}

func (postgres *PostgresStore) CreateComment(comment Comment) error {
	// Parent id is optional, so let it be null if parent id is not provided

	var err error
	if (comment.ParentId == "") {
		query := `
			INSERT INTO comment (id, body, author, post_id, status) 
			VALUES ($1, $2, $3, $4, $5)`
		_, err = postgres.db.Exec(query, comment.Id, comment.Body, comment.Author, comment.PostId, comment.Status)
	} else {
		query := `
			INSERT INTO comment (id, body, author, post_id, status, parent_id) 
			VALUES ($1, $2, $3, $4, $5, $6)`
		_, err = postgres.db.Exec(query, comment.Id, comment.Body, comment.Author, comment.PostId, comment.Status, comment.ParentId)
	}

	return checkPostgresErr(err)
}

// Get comments by post, author, search query, and who liked them (all optional) 
// and sort by either newest, mosts likes, or relevance (default is by relevance)
// (relevance is by search query. If search query is empty, then sort by newest first)
func (postgres *PostgresStore) GetComments(postId string, author string, status string, searchQuery string, likedBy string, sortBy string) ([]Comment, error) {
	query := `SELECT c.id, c.body, c.author, c.post_id, c.parent_id, c.status,
					  COUNT(case when comment_vote.vote = 'Like' then 1 else null end) AS likes,
					  COUNT(case when comment_vote.vote = 'Dislike' then 1 else null end) AS dislikes,
					  c.created_at, c.updated_at
			  FROM comment AS c
			  LEFT JOIN comment_vote ON comment_vote.comment_id = c.id
			  WHERE 1 = 1`

	// Append conditions to the query based on the arguments provided
	conditionCount := 1
	conditions := []any{}
	if (postId != "") {
		query = query + fmt.Sprintf(" AND c.post_id = $%v", conditionCount)
		conditions = append(conditions, postId)
		conditionCount += 1
	}
	if (author != "") {
		query = query + fmt.Sprintf(" AND c.author = $%v", conditionCount)
		conditions = append(conditions, author)
		conditionCount += 1
	}
	if (status != "") {
		query = query + fmt.Sprintf(" AND c.status = $%v", conditionCount)
		conditions = append(conditions, status)
		conditionCount += 1
	}
	if (strings.Trim(searchQuery, " ") != "") {
		query = query + fmt.Sprintf(" AND c.textsearchable_index @@ plainto_tsquery($%v)", conditionCount)
		conditions = append(conditions, searchQuery)
		conditionCount += 1
	}
	if (likedBy != "") {
		query = query + fmt.Sprintf(" AND comment_vote.viewer = $%v", conditionCount)
		conditions = append(conditions, likedBy)
		conditionCount += 1
	}
	query = query + " GROUP BY c.id"

	// Append the corresponding "order by" statement
	switch sortBy {
	case "newest":
		query = query + " ORDER BY c.created_at DESC"
	case "popular":
		query = query + " ORDER BY likes DESC"
	case "relevance":
		// If search query is empty, sort by tag relevance
		// If tags are empty, sort by newest first
		if (searchQuery != "") {
			query = query + fmt.Sprintf(` ORDER BY ts_rank_cd(c.textsearchable_index, plainto_tsquery(%s)) DESC`, searchQuery)
		} else {
			query = query + " ORDER BY c.created_at DESC"
		}
	}

	// Execute the query
	rows, err := postgres.db.Query(query, conditions...)
	if err != nil {
		return nil, httperror.NewInternalServerError(err)
	}
	defer rows.Close()

	comments := []Comment{}

	for rows.Next() {
		var comment Comment
		var parentId sql.NullString

		err := rows.Scan(
			&comment.Id, &comment.Body, &comment.Author, &comment.PostId, 
			&parentId, &comment.Status, 
			&comment.Likes, &comment.Dislikes, &comment.CreatedAt, &comment.UpdatedAt)

		err = checkPostgresErr(err)
		if (err != nil) {
			return nil, err
		} else {
			comment.ParentId = parentId.String
			comments = append(comments, comment)
		}
	}

	return comments, nil
}

func (postgres *PostgresStore) UpdateComment(comment Comment) error {
	query := `
		UPDATE comment SET body = $1, post_id = $2, status = $3, parent_id = $4, updated_at = $5 
		WHERE id = $6`
	_, err := postgres.db.Exec(query, comment.Body, comment.PostId, comment.Status, comment.ParentId, time.Now(), comment.Id)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) SoftDeleteComment(postId string) error {
	// Set the status to 'deleted' and clear the body
	query := `
		UPDATE post SET body = '', status = 'Deleted', updated_at = $1 
		WHERE id = $2`
	_, err := postgres.db.Exec(query, time.Now(), postId)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) UpsertCommentVote(commentVote CommentVote) error {
	// Create the vote or update it if it already exists
	query := `
		INSERT INTO comment_vote (viewer, comment_id, vote) VALUES ($1, $2, $3)
		ON CONFLICT(viewer, post_id) DO UPDATE SET vote = $3`
	_, err := postgres.db.Exec(query, commentVote.Viewer, commentVote.CommentId, commentVote.Vote)
	return checkPostgresErr(err)
}