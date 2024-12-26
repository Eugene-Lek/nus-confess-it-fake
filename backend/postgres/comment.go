package postgres

import (
	"backend/httperror"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/lib/pq"
)

type Comment struct {
	Id            string   `json:"id"`
	Body          string   `json:"body"`
	Author        string   `json:"author"`
	PostId        string   `json:"postId"`
	ParentComment *Comment `json:"parentComment"`
	Status        string   `json:"status"`
	Likes         int      `json:"likes"`
	Dislikes      int      `json:"dislikes"`
	CreatedAt     string   `json:"createdAt"`
	UpdatedAt     string   `json:"updatedAt"`
	UserVote      string   `json:"userVote"`
}

type CommentVote struct {
	Viewer    string
	CommentId string
	Vote      string
}

func (postgres *PostgresStore) CreateComment(comment Comment) error {
	// Parent id is optional, so let it be null if parent id is not provided

	var err error
	if comment.ParentComment == nil {
		query := `
			INSERT INTO comment (id, body, author, post_id, status) 
			VALUES ($1, $2, $3, $4, $5)`
		_, err = postgres.db.Exec(query, comment.Id, comment.Body, comment.Author, comment.PostId, "Published")
	} else {
		query := `
			INSERT INTO comment (id, body, author, post_id, status, parent_id, parent_author, parent_body) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
		_, err = postgres.db.Exec(query, comment.Id, comment.Body, comment.Author, comment.PostId, 
								"Published", comment.ParentComment.Id, comment.ParentComment.Author, comment.ParentComment.Body)
	}

	return checkPostgresErr(err)
}

// Get comments by post, author, search query, and who liked them (all optional)
// and sort by either newest, mosts likes, or relevance (default is by relevance)
// (relevance is by search query. If search query is empty, then sort by newest first)
func (postgres *PostgresStore) GetComments(username string, postId string, author string, statuses []string, searchQuery string, likedBy string, sortBy string) ([]Comment, error) {

	// select the user's vote and parent_comment's author and body too because the frontend needs it
	// In the subquery, group by must be applied to all 3 fields in order to select comment_vote.vote for each user
	query := `SELECT c.id, c.body, c.author, c.post_id, c.status,
					  c.parent_id, c.parent_author, c.parent_body,
					  c_votes.likes, c_votes.dislikes,
					  c.created_at, c.updated_at,
					  comment_vote.vote
			  FROM (
			  		SELECT comment.id AS id, 
							COUNT(case when comment_vote.vote = 'Like' then 1 else null end) AS likes,
					  		COUNT(case when comment_vote.vote = 'Dislike' then 1 else null end) AS dislikes
			   		FROM comment
					LEFT JOIN comment_vote ON comment.id = comment_vote.comment_id
			   		GROUP BY id
			   ) AS c_votes
			  INNER JOIN comment AS c ON c.id = c_votes.id
			  LEFT JOIN comment_vote ON c.id = comment_vote.comment_id 
					AND comment_vote.viewer = $1			  
			  WHERE 1 = 1`

	// Append conditions to the query based on the arguments provided
	conditionCount := 2
	conditions := []any{username}
	if postId != "" {
		query = query + fmt.Sprintf(" AND c.post_id = $%v", conditionCount)
		conditions = append(conditions, postId)
		conditionCount += 1
	}
	if author != "" {
		query = query + fmt.Sprintf(" AND c.author = $%v", conditionCount)
		conditions = append(conditions, author)
		conditionCount += 1
	}
	if (len(statuses) > 0) {
		query = query + fmt.Sprintf(" AND c.status = ANY($%v)", conditionCount)
		conditions = append(conditions, pq.Array(statuses))
		conditionCount += 1
	}	
	if strings.Trim(searchQuery, " ") != "" {
		query = query + fmt.Sprintf(" AND c.textsearchable_index @@ plainto_tsquery($%v)", conditionCount)
		conditions = append(conditions, searchQuery)
		conditionCount += 1
	}
	if likedBy != "" {
		query = query + fmt.Sprintf(" AND comment_vote.viewer = $%v", conditionCount)
		conditions = append(conditions, likedBy)
		conditionCount += 1
	}

	// Append the corresponding "order by" statement
	switch sortBy {
	case "Newest":
		query = query + " ORDER BY c.created_at DESC"
	case "Oldest":
		query = query + " ORDER BY c.created_at ASC"
	case "Popular":
		query = query + " ORDER BY c_votes.likes DESC"
	case "Relevance":
		// If search query is empty, sort by tag relevance
		// If tags are empty, sort by newest first
		if searchQuery != "" {
			query = query + fmt.Sprintf(` ORDER BY ts_rank_cd(c.textsearchable_index, plainto_tsquery($%v)) DESC`, conditionCount)
			conditions = append(conditions, searchQuery)
			conditionCount += 1
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
		var parentAuthor sql.NullString
		var parentBody sql.NullString
		var userVote sql.NullString

		err := rows.Scan(
			&comment.Id, &comment.Body, &comment.Author, &comment.PostId,
			&comment.Status, &parentId, &parentAuthor, &parentBody,
			&comment.Likes, &comment.Dislikes, &comment.CreatedAt, &comment.UpdatedAt, &userVote)

		err = checkPostgresErr(err)
		if err != nil {
			return nil, err
		} else {
			if parentId.String == "" {
				// If the parent comment id is null, that means the comment does not have a parent
				// Thus, set the parent comment field to nil
				comment.ParentComment = nil
			} else {
				comment.ParentComment = new(Comment)
				comment.ParentComment.Id = parentId.String
				comment.ParentComment.Author = parentAuthor.String
				comment.ParentComment.Body = parentBody.String
			}

			comment.UserVote = userVote.String

			comments = append(comments, comment)
		}
	}

	return comments, nil
}

func (postgres *PostgresStore) UpdateComment(comment Comment) error {
	var parentId sql.NullString
	var parentAuthor sql.NullString
	var parentBody sql.NullString
	if (comment.ParentComment == nil) {
		null := sql.NullString{
			Valid: false,
		}
		parentId = null
		parentAuthor = null
		parentBody = null
	} else {
		parentId = sql.NullString{
			String: comment.ParentComment.Id,
			Valid: true,
		}
		parentAuthor = sql.NullString{
			String: comment.ParentComment.Author,
			Valid: true,
		}
		parentBody = sql.NullString{
			String: comment.ParentComment.Body,
			Valid: true,
		}				
	}

	query := `
		UPDATE comment SET body = $1, post_id = $2, parent_id = $3, parent_author = $4, parent_body = $5, updated_at = $6 
		WHERE id = $7`
	_, err := postgres.db.Exec(query, comment.Body, comment.PostId, parentId, parentAuthor, parentBody, time.Now(), comment.Id)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) SoftDeleteComment(commentId string) error {
	// Set the status to 'deleted' and clear the body
	query := `
		UPDATE comment SET body = '', status = 'Deleted', updated_at = $1 
		WHERE id = $2`
	_, err := postgres.db.Exec(query, time.Now(), commentId)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) UpsertCommentVote(commentVote CommentVote) error {
	// Create the vote or update it if it already exists
	query := `
		INSERT INTO comment_vote (viewer, comment_id, vote) VALUES ($1, $2, $3)
		ON CONFLICT(viewer, comment_id) DO UPDATE SET vote = $3`
	_, err := postgres.db.Exec(query, commentVote.Viewer, commentVote.CommentId, commentVote.Vote)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) DeleteCommentVote(commentVote CommentVote) error {
	// Create the vote or update it if it already exists
	query := `
		DELETE FROM comment_vote WHERE viewer = $1 AND comment_id = $2`
	_, err := postgres.db.Exec(query, commentVote.Viewer, commentVote.CommentId)
	return checkPostgresErr(err)
}
