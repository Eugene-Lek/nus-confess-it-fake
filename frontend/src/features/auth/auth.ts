import { config } from '@/config'

export function loggedIn(username: string) {
  if (typeof localStorage != undefined) {
    localStorage.setItem("username", username)
  }
}

export function loggedOut() {
  if (typeof localStorage != undefined) {
    localStorage.removeItem("username")
  }
}

export function getUser() {
  if (typeof localStorage != undefined) {
    return localStorage.getItem("username") || ""
  }
}

function getCookieByName(name: string) {
  const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
  for (let cookie of cookies) {
       cookie = cookie.trim();
       if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
       }
  }
 return null;
}

// Read the cookie directly from local storage in order to get the most
// up to date status on the user's authentication
export function userIsLoggedIn() {
  return !!getCookieByName(config.AUTH_COOKIE_NAME)
}