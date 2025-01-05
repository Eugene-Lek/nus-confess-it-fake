# NUSConfessIT Fake

This is a fake NUSConfessIT website
* [Functionality](#functionality)
* [Project Architecture](#project-architecture)
* [How to set up the Development Environment](#setting-up-the-development-environment)

## Functionality

All users can:
* Create an account that is authenticated by username and password
* Login and Logout
* View posts filtered by keyword and/or tags and sorted by Newest, Popular (net likes), or Relevance (Newest by default)
* View my posts, my drafts and liked posts, filtered by keyword and/or tags and sorted by Newest, Popular, or Relevance (Newest by default)
* View a particular post by clicking its card
* View my comments and liked comments, filtered by keyword and sorted by Newest, Popular or Relevance (Newest by default)
* View a particular comment by clicking its card. This will redirect the user to the post that the comment belongs to and automatically scroll to the particular comment

Logged in users can:
* Create, edit, and delete their own posts
* Create, edit, and delete their own drafts
* Create, edit, and delete their own comments under posts and in response to other comments
* Like/Dislike all posts and comments

Other nice features:
* Users are prompted to log in if they attempt an action/page visit that requires logging in
* Input validation and error messages in both frontend and backend
* Logging
* Both desktop and mobile viewing are supported

## Project Architecture
Backend
 * **httperror package**
   * Defines a struct representing a http error (http status, message, error code)
   * Defines an Internal Server Error constructor
 * **postgres package**
   * Defines the data models and types
 * **routes package**
   * Defines the routes and route handlers
 * **main package**
   * Instantiates dependencies (e.g. postgres provider)
   * Passes these dependencies into the router constructor to create a router
   * Starts a server with the router

Frontend (src folder)
 * **pages**
   * Defines all the pages of the website
 * **features**
   * Defines the features of the website (e.g. sidebar, topbar, popups, content etc)
   * In accordance with the principle of **Locality of Behaviour**, the tsx components, redux slices, RTK Query endpoints, and css styles for each feature are all located in the same folder (instead of being separated)
 * **redux**
   * redux utils that are used by all features of the website
 * **validation**
   * validation utils that are used by all features of the website  
 * **styles**
   * styles that are used by all features of the website

## Setting up the development environment
* **Clone the project**
```
git clone https://github.com/Eugene-Lek/nus-confess-it-fake.git
```

* **Set up the frontend**
  1. Navigate to the /frontend folder via the command line
  ```
  cd path/to/frontend
  ```
  2. Install dependencies
  ```
  npm install
  npm audit fix --force
  ```
  3. Run the server
  ```
  npm run dev
  ```


* **Set up the backend**
  1. Build the backend server container
  ```
  docker-compose -f compose.dev.yaml build
  ```
  2. Run the server and database containers
  ```
  docker-compose -f compose.dev.yaml up -d
  ```