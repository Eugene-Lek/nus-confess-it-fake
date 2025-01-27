package postgres

import (
	"database/sql"

	_ "github.com/lib/pq" // Import pq for its side effects (driver install)
)

type User struct {
	Username string
	Password string
}

func (postgres *PostgresStore) CreateUser(user User) error {
	query := `
		INSERT INTO user_account (username, password) 
		VALUES ($1, $2)`
	_, err := postgres.db.Exec(query, user.Username, user.Password)
	
	return checkPostgresErr(err)
}

func (postgres *PostgresStore) GetUser(username string) (*User, error) {
	var user User

	query := `SELECT password FROM user_account WHERE username = $1`
	err := postgres.db.QueryRow(query, username).Scan(&user.Password)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}

	err = checkPostgresErr(err)
	if err != nil {
		return nil, err
	} else {
		user.Username = username
		return &user, nil
	}
}