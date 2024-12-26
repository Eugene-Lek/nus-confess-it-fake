package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/casbin/casbin/v2"
	ut "github.com/go-playground/universal-translator"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/mux"

	"backend/httperror"
	"backend/postgres"
)

type contextKey int

const (
	requestLoggerKey contextKey = iota
	errorKey
	translatorKey
	authenticatedUserKey
)

// Allows the updated logger to be accessed by previous middleware layers
// This is necessary because the request context is updated by copy and not by reference
type LoggerTransport struct {
	Logger *Logger
}

// Creates a request-specific logger & adds it to the request context
func setRequestLogger(rootLogger *Logger) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestId := uuid.New().String()
			requestLogger := rootLogger.With("requestId", requestId, "clientIp", r.RemoteAddr, "url", r.URL.Path, "method", r.Method)

			r = r.WithContext(context.WithValue(r.Context(), requestLoggerKey, &LoggerTransport{Logger: requestLogger}))

			next.ServeHTTP(w, r)
		})
	}
}

func getRequestLogger(r *http.Request) *Logger {
	requestLoggerTransport := r.Context().Value(requestLoggerKey).(*LoggerTransport)
	return requestLoggerTransport.Logger
}

// Implementation of http.ResponseWriter so the response status is recorded for logging purposes too!
// Inherits all methods from http.ResponseWriter except WriteHeader
type ResponseWriterRecorder struct {
	http.ResponseWriter
	status int
}

func (wr *ResponseWriterRecorder) WriteHeader(status int) {
	wr.ResponseWriter.WriteHeader(status)
	wr.status = status
}

// Note: "X-Real-Ip" and "X-Forwarded-For" headers are not used for the clientIp because they can be modified by the client == security risk
func logRequestCompletion(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()

		wr := ResponseWriterRecorder{w, 0}
		next.ServeHTTP(&wr, r)

		duration := time.Since(startTime)

		requestLogger := getRequestLogger(r)
		requestLogger.Info("REQUEST-COMPLETED", "responseTime", duration.String(), "status", wr.status)
	})
}

type ErrorTransport struct {
	Error error
}

func errorHandling(next http.Handler) http.Handler {
	type errorResponseBody struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create an ErrorTransport struct instance and pass it into the Request Context by reference
		// This way, any modifications to the ErrorTransport (i.e. adding an Error to it) can be accessed inside this
		// middleware scope

		errTransport := new(ErrorTransport)
		r = r.WithContext(context.WithValue(r.Context(), errorKey, errTransport))

		// Call the remaining middleware(s) & router handler. If an error occurs, it will be added to the same errTransport
		// defined above
		next.ServeHTTP(w, r)

		if errTransport.Error == nil {
			// If no error was attached to the ErrorTransport, end the middleware call
			return
		}

		err, ok := errTransport.Error.(*httperror.Error)
		if !ok {
			// If the error provided is not a httperror.Error, convert it to an InternalServerError
			err = httperror.NewInternalServerError(errTransport.Error)
		}

		var message string
		requestLogger := getRequestLogger(r)
		if err.Code == "INTERNAL-SERVER-ERROR" {
			// Do not reveal internal server error stack traces to the client!!
			traceId := uuid.New().String()
			message = fmt.Sprintf("Something went wrong. Trace ID: %s", traceId)

			errorMessage, stackTrace, _ := strings.Cut(err.Error(), "\n")
			requestLogger.Error(err.Code, "errorMessage", errorMessage, "stackTrace", stackTrace, "traceId", traceId)
		} else {
			message = err.Error()
			requestLogger.Warn(err.Code, "errorMessage", err.Error())
		}

		body := errorResponseBody{
			Code:    err.Code,
			Message: message,
		}
		w.Header().Add("content-type", "application/json")
		w.WriteHeader(err.Status)
		json.NewEncoder(w).Encode(body)
	})
}

// Sends the httperror.Error to the error handling middleware via the Request Context
// The error is assigned to an existing pointer in the Request context
func sendToErrorHandlingMiddleware(err error, r *http.Request) {
	if errTransport, ok := r.Context().Value(errorKey).(*ErrorTransport); ok {
		errTransport.Error = err
	}
}

func setTranslator(universalTranslator *ut.UniversalTranslator) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			acceptLanguageHeader := r.Header.Get("Accept-Language")
			language := strings.Split(acceptLanguageHeader, "-")[0]

			translator, _ := universalTranslator.GetTranslator(language)

			r = r.WithContext(context.WithValue(r.Context(), translatorKey, translator))

			next.ServeHTTP(w, r)
		})
	}
}

func getTranslator(r *http.Request) ut.Translator {
	translator, _ := r.Context().Value(translatorKey).(ut.Translator)
	return translator
}

func authenticateUser(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var token *jwt.Token
			var loggedIn bool

			authCookie, err := r.Cookie(authCookieName)
			if err == http.ErrNoCookie {
				loggedIn = false
			} else if err != nil {
				sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
				return
			} else {
				// Parse the token with the secret key
				token, err = jwt.Parse(authCookie.Value, func(token *jwt.Token) (interface{}, error) {
					return AuthSecretKey, nil
				})
				if err != nil {
					sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
					return
				}

				loggedIn = token.Valid
			}


			user := postgres.User{
				Username: "", // Usernames cannot be empty so it is safe to use an empty username for non-logged in users
			}
			if loggedIn {
				username, err := token.Claims.GetSubject()
				if err != nil {
					sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
					return
				}

				user = postgres.User{
					Username: username,
				}
			}

			r = r.WithContext(context.WithValue(r.Context(), authenticatedUserKey, user))

			// Add the username to the request logger
			// This way, activity can be tracked on both a user basis
			reqLogger := getRequestLogger(r)
			reqLoggerWithUserID := reqLogger.With("username", user.Username)
			if loggerTransport, ok := r.Context().Value(requestLoggerKey).(*LoggerTransport); ok {
				loggerTransport.Logger = reqLoggerWithUserID
			}

			next.ServeHTTP(w, r)
		})
}

func getAuthenticatedUser(r *http.Request) postgres.User {
	user, _ := r.Context().Value(authenticatedUserKey).(postgres.User)
	return user
}

func verifyAuthorization(authEnforcer casbin.IEnforcer) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := getAuthenticatedUser(r)
			authorized, err := authEnforcer.Enforce(user.Username, r.URL.Path, r.Method)
			if err != nil {
				sendToErrorHandlingMiddleware(httperror.NewInternalServerError(err), r)
				return
			}

			if !authorized {				
				sendToErrorHandlingMiddleware(ErrUserUnauthorised, r)
				return
			}

			reqLogger := getRequestLogger(r)
			reqLogger.Info("USER-AUTHORISED", "username", user.Username, "resource", r.URL.Path, "method", r.Method)

			next.ServeHTTP(w, r)
		})
	}
}


