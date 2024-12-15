package postgres

import "backend/httperror"

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
	_, err = tx.Exec(query, post.id, post.title, post.body, post.author, "Published")
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
		return httperror.NewInternalServerError(err)
	}

	return nil
}
