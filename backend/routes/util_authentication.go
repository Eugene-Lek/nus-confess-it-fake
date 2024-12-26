package routes

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("secret")
const authCookieName = "auth"

func createAuthCookie(username string) (*http.Cookie, error) {	
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"iss": "nus-confess-it",
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})

	signedJWT, err := claims.SignedString(secretKey)
	if err != nil {
		return nil, err
	}

	return &http.Cookie{
		Name: authCookieName,
		Value: signedJWT,
		Domain: "localhost",
		Path: "/",
		Expires: time.Now().Add(24 * time.Hour),
		// Secure: true, // Only set to true in production
	}, nil
}

func createExpiredAuthCookie() *http.Cookie {
	return &http.Cookie{
		Name: authCookieName,
		Value: "",
		Domain: "localhost",
		Path: "/",
		MaxAge: -1,
	}
}