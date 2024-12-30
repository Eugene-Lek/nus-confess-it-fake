package routes

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var AuthSecretKey []byte
const authCookieName = "auth"

func makeCookie(value string) *http.Cookie {
	return &http.Cookie{
		Name: authCookieName,
		Value: value,
		Path: "/",
	}
}

func createAuthCookie(username string) (*http.Cookie, error) {	
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"iss": "nus-confess-it",
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})

	signedJWT, err := claims.SignedString(AuthSecretKey)
	if err != nil {
		return nil, err
	}

	cookie := makeCookie(signedJWT)
	cookie.Expires = time.Now().Add(24 * time.Hour)

	return cookie, nil
}

func createExpiredAuthCookie() *http.Cookie {
	cookie := makeCookie("")
	cookie.MaxAge = -1

	return cookie
}