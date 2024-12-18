package postgres

import (
	"backend/httperror"
	"database/sql"

	"github.com/lib/pq"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)

	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStore{
		db: db,
	}, nil
}

type Postgres2 interface {
	// User models
	CreateUser(User) 
	GetUser(username string) User

	// Post models
	CreatePost(Post)

	// Note: Posts can be sorted by time or likes.
	GetPostById(id string) Post
	GetPosts(author string, query string, tags string, sortBy string) []Post
	GetDrafts(author string, query string, tags string, sortBy string)
	GetTags() []string

	UpdatePost(Post)
	UpdateDraft(Post)

	DeletePost(id string)

	// Comment models
	CreateComment(Comment)
	GetCommentsByPost(postId string) []Comment
	UpdateComment(Comment)
	DeleteComment(id string)

	// Vote models
	CreatePostVote(viewer string, postId string, vote string)
	CreateCommentVote(viewer string, postId string)
}

type Status struct {
	Draft string
	Published string
	Deleted string
}

func checkPostgresErr(err any) error {
	if pgErr, ok := err.(*pq.Error); ok {
		switch pgErr.Code {
		case "23505":
			// Unique Violation
			return UniqueViolationError
		case "23503":
			// Foreign Key Violation
			return InvalidForeignKeyError
		default:
			return httperror.InternalServerError
		}
	} else if err != nil {
		return httperror.InternalServerError
	} else {
		return nil
	}
}