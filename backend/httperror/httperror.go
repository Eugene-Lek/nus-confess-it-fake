package httperror

// Define a custom error in order to track the http status of the error too
// Code refers to a custom error code
type Error struct {
	Status int
	Code string
}

func (e *Error) Error() string {
	return e.Code
}

var InternalServerError = &Error{
	Status: http.StatusInternalServerError,
	Code: "INTERNAL-SERVER-ERROR",
}