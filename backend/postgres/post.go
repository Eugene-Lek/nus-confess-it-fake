package postgres

import (
	"backend/httperror"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/lib/pq"
)

type Post struct {
	Id        string `json:"id"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	Tags      []string `json:"tags"`
	Author    string `json:"author"`
	Status    string `json:"status"`
	Likes     int `json:"likes"`
	Dislikes  int `json:"dislikes"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
	UserVote      string   `json:"userVote"`	
}

type PostVote struct {
	Viewer string
	PostId string
	Vote string
}

func (postgres *PostgresStore) CreatePost(post Post) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}
	defer tx.Rollback()

	// Create a row in the post table
	query := `
		INSERT INTO post (id, title, body, author, status) 
		VALUES ($1, $2, $3, $4, $5)`
	_, err = tx.Exec(query, post.Id, post.Title, post.Body, post.Author, post.Status)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}

	// Create the post-tag mappings
	for i := 0; i < len(post.Tags); i++ {
		query := `
			INSERT INTO post_tag (post_id, tag) 
			VALUES ($1, $2)`
		_, err = tx.Exec(query, post.Id, post.Tags[i])
		err = checkPostgresErr(err)
		if err != nil {
			return err
		}
	}

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}

	return nil
}

func (postgres *PostgresStore) GetPostById(username string, postId string) (*Post, error) {
	var post Post
	var userVote sql.NullString

	// Use a subquery to aggregate the tags, likes, and dislikes
	// Then join the result with the post table to get the other details of the posts
	// Note 1: Left join is used for both joins as a post may not have any tags nor votes
	query := `SELECT post.id, post.author, post.title, post.body, p.tags, post.status,
					  p.likes, p.dislikes,
					  post.created_at, post.updated_at, post_vote.vote
			  FROM (
			  		SELECT post.id AS id, 
							array_remove(array_agg(DISTINCT post_tag.tag), NULL) AS tags, 
							COUNT(case when post_vote.vote = 'Like' then 1 else null end) AS likes,
					  		COUNT(case when post_vote.vote = 'Dislike' then 1 else null end) AS dislikes
			   		FROM post
			   		LEFT JOIN post_tag ON post.id = post_tag.post_id
					LEFT JOIN post_vote ON post.id = post_vote.post_id
			   		WHERE post.id = $1
			   		GROUP BY id
			   ) AS p				
			   INNER JOIN post ON post.id = p.id
			   LEFT JOIN post_vote ON p.id = post_vote.post_id 
			   	    AND post_vote.viewer = $2`
	err := postgres.db.QueryRow(query, postId, username).Scan(
			&post.Id, &post.Author, &post.Title, &post.Body, pq.Array(&post.Tags), &post.Status, 
			&post.Likes, &post.Dislikes, &post.CreatedAt, &post.UpdatedAt, &userVote)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}

	err = checkPostgresErr(err)
	if (err != nil) {
		return nil, err
	} else {
		post.UserVote = userVote.String
		return &post, nil
	}
}

// Get posts by author, status, search query, tags, and who liked them (all optional) 
// and sort by either newest, mosts likes, or relevance (default is by relevance)
// (relevance is by search query. If search query is empty, then relevance is by tag)
func (postgres *PostgresStore) GetPosts(username string, author string, statuses []string, searchQuery string, tags []string, likedBy string, sortBy string) ([]Post, error) {
	
	// Use a subquery to aggregate the tags, likes, dislikes, and the user's vote
	// Then join the result with the post table to get the other details of the posts
	// Note 1: In the subquery, group by must be applied to all 3 fields in order to select 
	//         post_vote.vote for each user
	// Note 2: In the subquery, outer join is used because the user may not have voted on the post
	// Note 2: Left join is used for both joins as a post may not have any tags nor votes
	// Note 3: An intermediate column called "tags_lowercased" is created to enable 
	//         case-insensitive filtering by tags. It is supported by an index

	query := `SELECT post.id, post.author, post.title, post.body, p.tags, post.status,
						p.likes, p.dislikes,
						post.created_at, post.updated_at,
						post_vote.vote
			  FROM (
			  		SELECT post.id AS id, 
							array_remove(array_agg(DISTINCT post_tag.tag), NULL) AS tags,
							array_remove(array_agg(DISTINCT lower(post_tag.tag)), NULL) AS tags_lowercased, 
							COUNT(case when post_vote.vote = 'Like' then 1 else null end) AS likes,
					  		COUNT(case when post_vote.vote = 'Dislike' then 1 else null end) AS dislikes,
							array_agg(post_vote.viewer) AS likers
			   		FROM post
			   		LEFT JOIN post_tag ON post.id = post_tag.post_id
					LEFT JOIN post_vote ON post.id= post_vote.post_id				
			   		GROUP BY id
			   ) AS p
			   INNER JOIN post ON post.id = p.id
			   LEFT JOIN post_vote ON p.id = post_vote.post_id 
			   	    AND post_vote.viewer = $1			   
			   WHERE 1 = 1`

	// Append conditions to the query based on the arguments provided
	conditionCount := 2
	conditions := []any{username}
	if (author != "") {
		query = query + fmt.Sprintf(" AND post.author = $%v", conditionCount)
		conditions = append(conditions, author)
		conditionCount += 1
	}
	if (len(statuses) > 0) {
		query = query + fmt.Sprintf(" AND post.status = ANY($%v)", conditionCount)
		conditions = append(conditions, pq.Array(statuses))
		conditionCount += 1
	}
	if (strings.Trim(searchQuery, " ") != "") {
		query = query + fmt.Sprintf(" AND post.textsearchable_index @@ plainto_tsquery($%v)", conditionCount)
		conditions = append(conditions, searchQuery)
		conditionCount += 1
	}
	if (len(tags) > 0) {
		query = query + fmt.Sprintf(" AND p.tags_lowercased && $%v", conditionCount)

		// Lowercase all tags to enable case-insensitive search
		for i := 0; i < len(tags); i += 1 {
			tags[i] = strings.ToLower(tags[i])
		}

		conditions = append(conditions, pq.Array(tags))
		conditionCount += 1		
	}
	if (likedBy != "") {
		query = query + fmt.Sprintf(" AND $%v = ANY(p.likers)", conditionCount)
		conditions = append(conditions, likedBy)
		conditionCount += 1
	}

	// Append the corresponding "order by" statement
	switch sortBy {
	case "Newest":
		query = query + " ORDER BY post.created_at DESC"
	case "Popular":
		query = query + " ORDER BY p.likes - p.dislikes DESC"
	case "Relevance":
		// If search query is empty, sort by tag relevance
		// If tags are empty, sort by newest first
		if (searchQuery != "") {
			query = query + fmt.Sprintf(` ORDER BY ts_rank_cd(post.textsearchable_index, plainto_tsquery($%v)) DESC`, conditionCount)
			conditions = append(conditions, searchQuery)
			conditionCount += 1
		} else if (len(tags) > 0) {
			query = query + fmt.Sprintf(` ORDER BY cardinality(ARRAY(SELECT * FROM UNNEST(p.tags) WHERE UNNEST = ANY($%v)))`, conditionCount)
			conditions = append(conditions, pq.Array(tags))
			conditionCount += 1
		} else { 
			query = query + " ORDER BY post.created_at DESC"
		}
	default:
		query = query + " ORDER BY post.created_at DESC"
	}
	fmt.Print(query)

	// Execute the query
	rows, err := postgres.db.Query(query, conditions...)
	if err != nil {
		return nil, httperror.NewInternalServerError(err)
	}
	defer rows.Close()

	posts := []Post{}

	for rows.Next() {
		var post Post
		var userVote sql.NullString

		err := rows.Scan(
			&post.Id, &post.Author, &post.Title, &post.Body, pq.Array(&post.Tags), &post.Status, 
			&post.Likes, &post.Dislikes, &post.CreatedAt, &post.UpdatedAt, &userVote)

		err = checkPostgresErr(err)
		if (err != nil) {
			return nil, err
		} else {
			post.UserVote = userVote.String
			posts = append(posts, post)
		}
	}

	return posts, nil
}

func updateTags(post Post, tx *sql.Tx) error {
	// Delete the current post-tag mappings and create new ones
	query := `DELETE FROM post_tag WHERE post_id = $1`
	_, err := tx.Exec(query, post.Id)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}	

	for i := 0; i < len(post.Tags); i++ {
		query := `
			INSERT INTO post_tag (post_id, tag) 
			VALUES ($1, $2)`
		_, err = tx.Exec(query, post.Id, post.Tags[i])
		err = checkPostgresErr(err)
		if err != nil {
			return err
		}
	}

	return nil
}

func (postgres *PostgresStore) UpdatePost(post Post) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}
	defer tx.Rollback()

	// Update the existing row in the post table
	query := `
		UPDATE post SET title = $1, body = $2, updated_at = $3 
		WHERE id = $4`
	_, err = tx.Exec(query, post.Title, post.Body, time.Now(), post.Id)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}

	err = updateTags(post, tx)
	if err != nil {
		return err
	}

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}

	return nil
}

func (postgres *PostgresStore) UpdateDraftToPost(post Post) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}
	defer tx.Rollback()

	// Update the existing row in the post table
	query := `
		UPDATE post SET title = $1, body = $2, status = 'Published', created_at = $3, updated_at = $4
		WHERE id = $5`
	now := time.Now()
	_, err = tx.Exec(query, post.Title, post.Body, now, now, post.Id)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}
	
	err = updateTags(post, tx)
	if err != nil {
		return err
	}

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}

	return nil
}

func (postgres *PostgresStore) SoftDeletePost(postId string) error {
	tx, err := postgres.db.Begin()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}
	defer tx.Rollback()

	// Set the status to 'deleted' and clear the body (retain the title for reference)
	query := `
		UPDATE post SET title='', body = '', status = 'Deleted', updated_at = $1 
		WHERE id = $2`
	_, err = tx.Exec(query, time.Now(), postId)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}

	// Delete the post-tag mappings and create new ones
	query = `DELETE FROM post_tag WHERE post_id = $1`
	_, err = tx.Exec(query, postId)
	err = checkPostgresErr(err)
	if err != nil {
		return err
	}	

	// Commit the transaction if all queries are successful
	err = tx.Commit()
	if err != nil {
		return httperror.NewInternalServerError(err)
	}

	return nil
}

func (postgres *PostgresStore) UpsertPostVote(postVote PostVote) error {
	// Create the vote or update it if it already exists
	query := `
		INSERT INTO post_vote (viewer, post_id, vote) VALUES ($1, $2, $3)
		ON CONFLICT(viewer, post_id) DO UPDATE SET vote = $3`
	_, err := postgres.db.Exec(query, postVote.Viewer, postVote.PostId, postVote.Vote)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) DeletePostVote(postVote PostVote) error {
	// Create the vote or update it if it already exists
	query := `
		DELETE FROM post_vote WHERE viewer = $1 AND post_id = $2`
	_, err := postgres.db.Exec(query, postVote.Viewer, postVote.PostId)
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) GetTags() ([]string, error) {
	query := `SELECT DISTINCT tag FROM post_tag`
	rows, err := postgres.db.Query(query)
	if err != nil {
		return nil, httperror.NewInternalServerError(err)
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