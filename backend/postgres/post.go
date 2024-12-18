package postgres

import (
	"backend/httperror"
	"fmt"
	"strings"
	"time"

	"github.com/lib/pq"
)

type Post struct {
	id        string
	title     string
	body      string
	tags      []string
	author    string
	status    Status
	likes     int
	dislikes  int
	createdAt string
	updatedAt string
}

type PostVote struct {
	viewer string
	postId string
	vote string
}

func (postgres *PostgresStore) CreatePost(post Post) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.InternalServerError
	}
	defer tx.Rollback()

	// Create a row in the post table
	query := `
		INSERT INTO post (id, title, body, author, status) 
		VALUES ($1, $2, $3, $4, $5)`
	_, err = tx.Exec(query, post.id, post.title, post.body, post.author, post.status)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}

	// Create the post-tag mappings
	for i := 0; i < len(post.tags); i++ {
		query := `
			INSERT INTO post_tag (post_id, tag) 
			VALUES ($1, $2)`
		_, err = tx.Exec(query, post.id, post.tags[i])
		err = checkPostgresErr(err)
		if err != nil {
			return err
		}
	}

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.InternalServerError
	}

	return nil
}

func (postgres *PostgresStore) GetPostById(postId string) (*Post, error) {
	var post Post

	// Use a subquery to aggregate the tags of a particular post
	// Then, join the result with the post_vote table to get the like and dislike counts of the post
	// Note: Left join is used for both queries as a post may not have any tags nor votes
	query := `SELECT (p.id, p.author, p.title, p.body, p.tags, p.status,
					  COUNT(post_vote.like) AS likes, COUNT(post_vote.dislike) AS dislikes,
					  p.created_at, p.updated_at)
			  FROM (
			  		SELECT (post.id AS id, post.author AS author, post.title AS title, 
							post.body AS body, array_agg(post_tag.tag) AS tags, post.status AS status, 
							post.created_at AS created_at, post.updated_at AS updated_at) 
			   		FROM post
			   		LEFT JOIN post_tag ON post.id = post_tag.post_id
			   		WHERE post.id = $1
			   		GROUP BY post.id
			   ) AS p
			   LEFT JOIN post_vote ON post_vote.post_id = p.id
			   GROUP BY p.id`
	err := postgres.db.QueryRow(query, postId).Scan(
			&post.id, &post.author, &post.title, &post.body, pq.Array(&post.tags), &post.status, 
			&post.likes, &post.dislikes, &post.createdAt, &post.updatedAt)
	
	err = checkPostgresErr(err)
	if (err != nil) {
		return nil, err
	} else {
		return &post, nil
	}
}

// Get posts by author, status, search query, tags, and who liked them (all optional) 
// and sort by either newest, mosts likes, or relevance (default is by relevance)
// (relevance is by search query. If search query is empty, then relevance is by tag)
func (postgres *PostgresStore) GetPosts(author string, status string, searchQuery string, tags []string, likedBy string, sortBy string) ([]Post, error) {
	// Use a subquery to aggregate the tags of the filtered posts
	// Then, join the result with the post_vote table to get the like and dislike counts of the post
	// Note: Left join is used for both queries as a post may not have any tags nor votes
	query := `SELECT (p.id, p.author, p.title, p.body, p.tags, p.status,
					  COUNT(post_vote.like) AS likes, COUNT(post_vote.dislike) AS dislikes,
					  p.created_at, p.updated_at)
			  FROM (
			  		SELECT (post.id AS id, post.author AS author, post.title AS title, 
							post.body AS body, array_agg(post_tag.tag) AS tags, post.status AS status, 
							post.created_at AS created_at, post.updated_at AS updated_at,
							post.textsearchable_index AS textsearchable_index) 
			   		FROM post
			   		LEFT JOIN post_tag ON post.id = post_tag.post_id
			   		GROUP BY post.id
			   ) AS p
			   LEFT JOIN post_vote ON post_vote.post_id = p.id
			   WHERE 1 = 1`

	// Append conditions to the query based on the arguments provided
	conditionCount := 1
	conditions := []any{}
	if (author != "") {
		query = query + fmt.Sprintf(" AND p.author = $%v", conditionCount)
		conditions = append(conditions, author)
		conditionCount += 1
	}
	if (status != "") {
		query = query + fmt.Sprintf(" AND p.status = $%v", conditionCount)
		conditions = append(conditions, status)
		conditionCount += 1
	}
	if (strings.Trim(searchQuery, " ") != "") {
		query = query + fmt.Sprintf(" AND p.textsearchable_index @@ to_tsquery($%v)", conditionCount)
		conditions = append(conditions, searchQuery)
		conditionCount += 1
	}
	if (len(tags) > 0) {
		query = query + fmt.Sprintf(" AND p.tags && $%v", conditionCount)
		conditions = append(conditions, pq.Array(tags))
		conditionCount += 1		
	}
	if (likedBy != "") {
		query = query + fmt.Sprintf(" AND post_vote.viewer = $%v", conditionCount)
		conditions = append(conditions, likedBy)
		conditionCount += 1
	}
	query = query + " GROUP BY p.id"

	// Append the corresponding "order by" statement
	switch sortBy {
	case "newest":
		query = query + " ORDER BY p.created_at DESC"
	case "popular":
		query = query + " ORDER BY p.likes DESC"
	case "relevance":
		// If search query is empty, sort by tag relevance
		// If tags are empty, sort by newest first
		if (searchQuery != "") {
			query = query + fmt.Sprintf(` ORDER BY ts_rank_cd(p.textsearchable_index, to_tsquery(%s)) DESC`, searchQuery)
		} else if (len(tags) > 0) {
			query = query + fmt.Sprintf(` ORDER BY cardinality(p.tags & %v)`, pq.Array(tags))
		} else {
			query = query + " ORDER BY p.created_at DESC"
		}
	}

	// Execute the query
	rows, err := postgres.db.Query(query, conditions...)
	if err != nil {
		return nil, httperror.InternalServerError
	}
	defer rows.Close()

	posts := []Post{}

	for rows.Next() {
		var post Post

		err := rows.Scan(
			&post.id, &post.author, &post.title, &post.body, pq.Array(&post.tags), &post.status, 
			&post.likes, &post.dislikes, &post.createdAt, &post.updatedAt)

		err = checkPostgresErr(err)
		if (err != nil) {
			return nil, err
		} else {
			posts = append(posts, post)
		}
	}

	return posts, nil
}

func (postgres *PostgresStore) UpdatePost(post Post) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.InternalServerError
	}
	defer tx.Rollback()

	// Update the existing row in the post table
	query := `
		UPDATE post SET title = $1, body = $2, status = $3, updated_at = $4 
		WHERE id = $5`
	_, err = tx.Exec(query, post.title, post.body, post.status, time.Now(), post.id)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}

	// Delete the current post-tag mappings and create new ones
	query = `DELETE FROM post_tag WHERE post_id = $1`
	_, err = tx.Exec(query, post.id)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}	

	for i := 0; i < len(post.tags); i++ {
		query := `
			INSERT INTO post_tag (post_id, tag) 
			VALUES ($1, $2)`
		_, err = tx.Exec(query, post.id, post.tags[i])
		err = checkPostgresErr(err)
		if err != nil {
			return err
		}
	}

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.InternalServerError
	}

	return nil
}

func (postgres *PostgresStore) CreatePostVote(postVote PostVote) error {
	query := `
		INSERT INTO post_vote (viewer, post_id, vote) 
		VALUES ($1, $2, $3)`
	_, err := postgres.db.Exec(query, postVote.viewer, postVote.postId, postVote.vote)
	
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) GetTags() ([]string, error) {
	query := `SELECT DISTINCT tag FROM post_tags`
	rows, err := postgres.db.Query(query)
	if err != nil {
		return nil, httperror.InternalServerError
	}
	defer rows.Close()

	tags := []string{}

	for rows.Next() {
		var tag string

		err := rows.Scan(&tag)

		err = checkPostgresErr(err)
		if (err != nil) {
			return nil, err
		} else {
			tags = append(tags, tag)
		}
	}

	return tags, nil
}