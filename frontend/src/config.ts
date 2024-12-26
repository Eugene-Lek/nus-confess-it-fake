// Config details are stored here instead of a hidden env file because the frontend will
// be hosted on S3 instead of a server

// Also, these configurations do not need to be kept secret

const BACKEND_SERVER_HOST= "localhost"
const BACKEND_SERVER_PORT= 5000
const BACKEND_SERVER_PROTOCOL= "http"

const API_VERSION = 1

interface Config {
    BACKEND_BASE_URL: string,
    AUTH_COOKIE_NAME: string
}


export const config: Config = {
    BACKEND_BASE_URL: `${BACKEND_SERVER_PROTOCOL}://${BACKEND_SERVER_HOST}:${BACKEND_SERVER_PORT}/api/v${API_VERSION}`,
    AUTH_COOKIE_NAME: "auth"
}