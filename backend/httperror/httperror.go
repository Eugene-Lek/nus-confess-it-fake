package httperror

import (
	"fmt"
	"net/http"

	"github.com/pkg/errors"
)

// Define a custom error in order to track the http status of the error too
// Code refers to a custom error code
type Error struct {
	Status  int
	Code    string
	Message string
}

func (e *Error) Error() string {
	return e.Message
}

func NewInternalServerError(err error) *Error {
	err = errors.New(err.Error()) // wraps the original error in a pkg/errors error. This way, the stack trace is included

	return &Error{
		Status:  http.StatusInternalServerError,
		Message: fmt.Sprintf("%+v", err), // include the stack trace in the error message
		Code:    "INTERNAL-SERVER-ERROR",
	}
}
