FROM golang:1.23-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Go application source code into the container
COPY ./backend .

# Build the Go application
RUN go build -o backend .

# Alpine Linux base image
FROM alpine:latest

# Set the working directory inside the final container
WORKDIR /app

# Copy the binary built in the previous stage
COPY --from=build /app/backend .

# Expose the port your application will listen on (adjust as needed)
EXPOSE 5000

# Run your Go application
CMD ["./backend"]