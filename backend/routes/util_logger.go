package routes

import (
	"context"
	"io"
	"log"
	"log/slog"
	"os"
)

// Embed the slog.Logger struct to inherit all its methods & fields
type Logger struct {
	*slog.Logger
}

// Overwrite the below methods in order to implement my preferred versions
func (l Logger) With(args ...any) *Logger {
	return &Logger{l.Logger.With(args...)}
}

func (l Logger) Info(msg string, args ...any) {
	l.Logger.Info(msg, slog.Group("details", args...))
}

func (l Logger) Warn(msg string, args ...any) {
	l.Logger.Warn(msg, slog.Group("details", args...))
}

func (l Logger) Error(msg string, args ...any) {
	l.Logger.Error(msg, slog.Group("details", args...))
}

func (l Logger) Debug(msg string, args ...any) {
	l.Logger.Debug(msg, slog.Group("details", args...))
}

func (l Logger) Fatal(msg string, args ...any) {
	l.Logger.Log(context.Background(), 12, msg, slog.Group("details", args...))
	os.Exit(1)
}

const serviceName = "backend"

// Returns a root logger with the chosen output medium
func NewRootLogger(w io.Writer) *Logger {
	// Instantiate logger with JSON format & output medium
	rootLogger := slog.New(slog.NewJSONHandler(w, nil))

	// Add metadata that apply to all requests
	hostName, err := os.Hostname()
	if err != nil {
		log.Fatalf("Logger could not retrieve hostname: %s", err)
	}

	rootLogger = rootLogger.With("name", serviceName, "hostname", hostName)

	return &Logger{rootLogger}
}
