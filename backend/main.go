package main
import (
	"net/http"
)

func main() {
	listenAddress := "localhost:3000"
	connString := "host=localhost port=5433 user=hr_information_system password=abcd1234 dbname=hr_information_system sslmode=disable"
	
	http.ListenAndServe(listenAddress, router)
}