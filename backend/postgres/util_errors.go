package postgres

import (
	"net/http"
	"backend/httperror"
)

var UniqueViolationError = &httperror.Error{
	Status: http.StatusConflict,
	Code: "UNIQUE-VIOLATION-ERROR",
}

var InvalidForeignKeyError = &httperror.Error{
	Status: http.StatusBadRequest,
	Code: "INVALID-FOREIGN-KEY-ERROR",
}