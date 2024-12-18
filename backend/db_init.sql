-- Create a new user and use it to access the database instead of the default postgres user
-- This way, we can restrict its privileges to only the necessary ones
CREATE USER backend WITH PASSWORD 'abcd1234';

-- Revoke all Schema-level & Table-level permissions from the Public role (default role assigned to all users)
-- Note that "public" is also the name for the default Schema (a Schema is a namespace containing Tables among other things)
REVOKE ALL ON SCHEMA public FROM public;
REVOKE ALL ON ALL TABLEs IN SCHEMA public FROM public;

-- Grant all NECESSARY Schema-level & Table-level permissions to the api user
-- Schema-level permissions are necessary to access anything inside the Schema (including Tables)
-- Note: The 2nd statement only grants the api user these permissions for Tables created by postgres (user)
GRANT USAGE ON SCHEMA public TO backend;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO backend;


-- Import necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "intarray";

-- Enums
CREATE TYPE STATUS AS ENUM (
    'Draft',
    'Published',
    'Deleted'
);

CREATE TYPE VOTE AS ENUM (
    'Like',
    'Dislike'
);

-- Tables
CREATE TABLE IF NOT EXISTS user_account (
    username VARCHAR(20) PRIMARY KEY,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS post (
    id UUID PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    body VARCHAR(10000) NOT NULL,
    author VARCHAR(20) NOT NULL,
    status STATUS NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Calculate the vector embeddings of the title and body combined to enable search by query
    textsearchable_index tsvector GENERATED ALWAYS AS (to_tsvector('english', title || " " || body)) STORED,

    FOREIGN KEY (author) REFERENCES user_account(id)
);

-- Create a GIN index of the vector embeddings to speed up search
CREATE INDEX textsearch_idx ON post USING GIN (textsearchable_index);

CREATE TABLE IF NOT EXISTS post_tag (
    post_id UUID,
    tag VARCHAR(30),
    
    PRIMARY KEY (post_id, tag),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

CREATE TABLE IF NOT EXISTS post_vote (
    viewer VARCHAR(20),
    post_id UUID,
    vote VOTE NOT NULL,

    PRIMARY KEY (viewer, post_id),
    FOREIGN KEY (viewer) REFERENCES user_account(username),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

CREATE TABLE IF NOT EXISTS comment (
    id UUID PRIMARY KEY,
    body VARCHAR(10000) NOT NULL,
    author VARCHAR(20) NOT NULL,
    post_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    status STATUS NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Calculate the vector embeddings of the title and body combined to enable search by query
    textsearchable_index tsvector GENERATED ALWAYS AS (to_tsvector('english', title || " " || body)) STORED,

    FOREIGN KEY (author) REFERENCES user_account(id),
    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);

-- Create a GIN index of the vector embeddings to speed up search
CREATE INDEX textsearch_idx ON post USING GIN (textsearchable_index);



CREATE TABLE IF NOT EXISTS comment_vote (
    viewer VARCHAR(20),
    comment_id UUID,
    vote VOTE NOT NULL,
    
    PRIMARY KEY (viewer, comment_id),
    FOREIGN KEY (viewer) REFERENCES user_account(username),
    FOREIGN KEY (comment_id) REFERENCES comment(id)
);

-- Authorization Rule table
CREATE TABLE IF NOT EXISTS casbin_rule (
    ID UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    Ptype VARCHAR(300) CHECK (Ptype IN ('p', 'g')),
    V0 VARCHAR(300),
    V1 VARCHAR(300),
    V2 VARCHAR(300),
    V3 VARCHAR(300),
    V4 VARCHAR(300),
    V5 VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),        

    UNIQUE NULLS NOT DISTINCT (Ptype, V0, V1, V2, V3, V4, V5)
);

--- SEED DATA

--- Docker commands
--- docker run --name dev -p 5433:5432 -e POSTGRES_PASSWORD=abcd1234 -e POSTGRES_DB=backend -v C:\Users\lekwc\Documents\Coding\Projects\CVWO Assignment\nus-confess-it\backend\db_init.sql:/docker-entrypoint-initdb.d/init.sql -d postgres 
--- docker exec -it dev psql -U backend
