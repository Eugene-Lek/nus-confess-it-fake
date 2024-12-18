package postgres

import (
	"backend/httperror"
	"fmt"
	"strings"
	"time"
)

type Comment struct {
	id        string
	body      string
	author    string
	postId    string
	parentId  string
	status    Status
	likes     int
	dislikes  int
	createdAt string
	updatedAt string
}

type CommentVote struct {
	viewer string
	commentId string
	vote string
}

func (postgres *PostgresStore) CreateComment(comment Comment) error {
	query := `
		INSERT INTO comment (id, body, author, post_id, status, parent_id) 
		VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := postgres.db.Exec(query, comment.id, comment.body, comment.author, comment.postId, comment.status, comment.parentId)
	return checkPostgresErr(err)
}

// Get comments by post, author, search query, and who liked them (all optional) 
// and sort by either newest, mosts likes, or relevance (default is by relevance)
// (relevance is by search query. If search query is empty, then sort by newest first)
func (postgres *PostgresStore) GetComments(author string, searchQuery string, likedBy string, sortBy string) ([]Comment, error) {
	query := `SELECT (c.id, c.body, c.author, c.post_id, c.parent_id, c.status
					  COUNT(comment_vote.like) AS likes, COUNT(comment_vote.dislike) AS dislikes,
					  c.created_at, c.updated_at)
			  FROM comment AS c
			  LEFT JOIN comment_vote ON comment_vote.comment_id = c.id
			  WHERE 1 = 1`

	// Append conditions to the query based on the arguments provided
	conditionCount := 1
	conditions := []any{}
	if (author != "") {
		query = query + fmt.Sprintf(" AND c.author = $%v", conditionCount)
		conditions = append(conditions, author)
		conditionCount += 1
	}
	if (strings.Trim(searchQuery, " ") != "") {
		query = query + fmt.Sprintf(" AND c.textsearchable_index @@ to_tsquery($%v)", conditionCount)
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
		query = query + " ORDER BY c.likes DESC"
	case "relevance":
		// If search query is empty, sort by tag relevance
		// If tags are empty, sort by newest first
		if (searchQuery != "") {
			query = query + fmt.Sprintf(` ORDER BY ts_rank_cd(c.textsearchable_index, to_tsquery(%s)) DESC`, searchQuery)
		} else {
			query = query + " ORDER BY c.created_at DESC"
		}
	}

	// Execute the query
	rows, err := postgres.db.Query(query, conditions...)
	if err != nil {
		return nil, httperror.InternalServerError
	}
	defer rows.Close()

	comments := []Comment{}

	for rows.Next() {
		var comment Comment

		err := rows.Scan(
			&comment.id, &comment.body, &comment.author, &comment.postId, 
			&comment.parentId, &comment.status, 
			&comment.likes, &comment.dislikes, &comment.createdAt, &comment.updatedAt)

		err = checkPostgresErr(err)
		if (err != nil) {
			return nil, err
		} else {
			comments = append(comments, comment)
		}
	}

	return comments, nil
}

func (postgres *PostgresStore) UpdateComment(comment Comment) error {
	query := `
		UPDATE comment SET body = $1, post_id = $2, status = $3, parent_id = $4, updated_at = $5 
		WHERE id = $6`
	_, err := postgres.db.Exec(query, comment.body, comment.postId, comment.status, comment.parentId, time.Now(), comment.id)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) CreateCommentVote(postVote PostVote) error {
	query := `
		INSERT INTO comment_vote (viewer, comment_id, vote) 
		VALUES ($1, $2, $3)`
	_, err := postgres.db.Exec(query, postVote.viewer, postVote.postId, postVote.vote)
	
	return checkPostgresErr(err)
}