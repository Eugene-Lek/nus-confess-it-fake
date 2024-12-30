-- Create a new user and use it to access the database instead of the default postgres user
-- This way, its privileges can be restricted to only the necessary ones
CREATE USER backend WITH PASSWORD 't2n9MvkO9sh9QyG';

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    textsearchable_index tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED,

    FOREIGN KEY (author) REFERENCES user_account(username)
);

-- Create a GIN index of the vector embeddings to speed up search
CREATE INDEX textsearch_post_idx ON post USING GIN (textsearchable_index);

CREATE TABLE IF NOT EXISTS post_tag (
    post_id UUID,
    tag VARCHAR(30),
    
    PRIMARY KEY (post_id, tag),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

-- Create an index with the tags lowercased to make case-insensitive search by
-- tags more efficient
CREATE INDEX tag_lower_index ON post_tag (lower(tag));

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
    parent_id UUID,
    parent_author VARCHAR(20),
    parent_body VARCHAR(10000),
    status STATUS NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Calculate the vector embeddings of the title and body combined to enable search by query
    textsearchable_index tsvector GENERATED ALWAYS AS (to_tsvector('english', body)) STORED,

    FOREIGN KEY (author) REFERENCES user_account(username),
    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);

-- Create a GIN index of the vector embeddings to speed up search
CREATE INDEX textsearch_comment_idx ON comment USING GIN (textsearchable_index);

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

--- Authorization Rules for non-logged in users
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/session', 'POST');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/session', 'DELETE');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/users/{username}', 'POST');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/posts', 'GET');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/posts/{postId}', 'GET');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/posts/{postId}/comments', 'GET');
INSERT INTO casbin_rule (Ptype, V0, V1, V2) VALUES ('p', '*', '/api/{version}/tags', 'GET');

-- Seed data (Users)
INSERT INTO user_account(username, password) VALUES ('Jerry_the_mouse', '$argon2id$v=19$m=65536,t=1,p=12$YE64ezFCyW7QxyX45BPaNQ$/enrxUso87fmQ/Ynd/ynzij+RCJKEaNTXuyj42scaU8');
INSERT INTO user_account(username, password) VALUES ('Tom_the_cat', '$argon2id$v=19$m=65536,t=1,p=12$YE64ezFCyW7QxyX45BPaNQ$/enrxUso87fmQ/Ynd/ynzij+RCJKEaNTXuyj42scaU8');
INSERT INTO user_account(username, password) VALUES ('Spike_the_dog', '$argon2id$v=19$m=65536,t=1,p=12$YE64ezFCyW7QxyX45BPaNQ$/enrxUso87fmQ/Ynd/ynzij+RCJKEaNTXuyj42scaU8');
INSERT INTO user_account(username, password) VALUES ('Nibbles_the_baby', '$argon2id$v=19$m=65536,t=1,p=12$YE64ezFCyW7QxyX45BPaNQ$/enrxUso87fmQ/Ynd/ynzij+RCJKEaNTXuyj42scaU8');
INSERT INTO user_account(username, password) VALUES ('Quacker_the_duck', '$argon2id$v=19$m=65536,t=1,p=12$YE64ezFCyW7QxyX45BPaNQ$/enrxUso87fmQ/Ynd/ynzij+RCJKEaNTXuyj42scaU8');

-- Seed data (Post 1 & its comments)
INSERT INTO post (id, title, body, author, status, created_at)
VALUES (
    'f6d3af06-bdf8-428d-9754-b11b81bae0ac', 
    '(BBA) would you recommend taking on a minor?',
    'im a current Y2 student in BBA, and looking to specialise in finance (just like most of the cohort). I don''t really think im very good at finance (and don''t plan to gun for high finance like IB), but would like to enter the corporate finance area.\n\nBecause I enjoy finance mod the most, and have my goals set in that sector, would taking on a minor in biz analytics or accounting be advisable?\n\np.s. And to the graduates working already! Do you all wish you had minored in something on top of your major?',
    'Jerry_the_mouse',
    'Published',
    '2024-12-10 10:59:30.810259+00'
    );
INSERT INTO post_tag (post_id, tag)
VALUES ('f6d3af06-bdf8-428d-9754-b11b81bae0ac', 'Looking for Advice');

INSERT INTO comment (id, body, author, post_id, status, created_at)
VALUES (
    '249a5d11-7d35-4769-af02-3df49a434005',
    'I personally think overloading with CS/CU mods while doing more internships (LOA/Credit bearing) would be more useful.',
    'Tom_the_cat',
    'f6d3af06-bdf8-428d-9754-b11b81bae0ac',
    'Published',
    '2024-12-10 11:23:30.810259+00'
);
INSERT INTO comment (id, body, author, post_id, parent_id, parent_author, parent_body, status, created_at)
VALUES (
    '5fc28bdf-a64b-4dce-8208-d32dcf7de4ba',
    'That''s what I''m doing! 10/10 recommend but after SEP',
    'Spike_the_dog',
    'f6d3af06-bdf8-428d-9754-b11b81bae0ac',
    '249a5d11-7d35-4769-af02-3df49a434005',
    'Tom_the_cat',
    'I personally think overloading with CS/CU mods while doing more internships (LOA/Credit bearing) would be more useful.',    
    'Published',
    '2024-12-10 12:14:30.810259+00'
);
INSERT INTO comment (id, body, author, post_id, status, created_at)
VALUES (
    'b75f682e-08b6-4f39-b8aa-caff7ab96cbe',
    'tbh 2nd majors and minors don''t exactly matter much, just do what u are interested in.',
    'Nibbles_the_baby',
    'f6d3af06-bdf8-428d-9754-b11b81bae0ac',
    'Published',
    '2024-12-10 12:01:30.810259+00'
);

-- Seed data (Post 2 & its comments)
INSERT INTO post (id, title, body, author, status, created_at)
VALUES (
    'cbf5a558-466f-4f89-8c0c-00b2bdb70729', 
    'super late for winter school course mapping. am I cooked?',
    'I went to Yonsei for winter school last year (around this time lol). Last year, I submitted the course mapping form on Edurec but didn''t get an update about the approval. It completely slipped my mind that I haven''t submitted the transcript from the partner university and just remembered today. I combed through some websites but can''t find a direct contact to email my official transcript to...am I screwed? What can I do?\n\n(Alr emailed GRO this morning)',
    'Tom_the_cat',
    'Published',
    '2024-12-11 08:57:30.810259+00'
    );
INSERT INTO post_tag (post_id, tag)
VALUES ('cbf5a558-466f-4f89-8c0c-00b2bdb70729', 'Question');
INSERT INTO post_vote (post_id, viewer, vote) VALUES 
('cbf5a558-466f-4f89-8c0c-00b2bdb70729', 'Tom_the_cat', 'Like'),
('cbf5a558-466f-4f89-8c0c-00b2bdb70729', 'Spike_the_dog', 'Dislike');

INSERT INTO comment (id, body, author, post_id, status, created_at)
VALUES (
    '4e5949e8-1216-4a17-ab10-924b927d405d',
    'i think you can submit on EduRec still?',
    'Jerry_the_mouse',
    'cbf5a558-466f-4f89-8c0c-00b2bdb70729',
    'Published',
    '2024-12-11 11:45:30.810259+00'
);

-- Seed data (Post 3 & its comments)
INSERT INTO post (id, title, body, author, status, created_at)
VALUES (
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 
    'What are y’all doing this winter!',
    'After sleeping 20 hrs today I finally recovered from the sem! Are y’all traveling? Interning? Gaming? Tell me more! (Positive vibes only pls I just woke up)',
    'Quacker_the_duck',
    'Published',
    '2024-12-09 16:12:30.810259+00'
    );
INSERT INTO post_tag (post_id, tag)
VALUES ('fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 'Discussion');
INSERT INTO post_vote (post_id, viewer, vote) VALUES 
('fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 'Tom_the_cat', 'Like'),
('fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 'Spike_the_dog', 'Like'),
('fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 'Jerry_the_mouse', 'Like'),
('fbd21d94-77f0-4305-8f37-2c84ffda5dd5', 'Nibbles_the_baby', 'Like');

INSERT INTO comment (id, body, author, post_id, status, created_at)
VALUES (
    '7b6c8971-ac87-4a71-9052-8af42d766ced',
    'Gaming',
    'Tom_the_cat',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    'Published',
    '2024-12-09 18:13:30.810259+00'
);
INSERT INTO comment (id, body, author, post_id, parent_id, parent_author, parent_body, status, created_at)
VALUES (
    '0dd4fe2a-fad5-44b8-adb8-c8ab6f6b2818',
    'PoE 2?',
    'Spike_the_dog',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    '7b6c8971-ac87-4a71-9052-8af42d766ced',
    'Tom_the_cat',    
    'Gaming',    
    'Published',
    '2024-12-09 18:14:30.810259+00'
),
(
    '7c6d9d65-a866-403b-a4ad-870a5fa46730',
    'fellow gamer',
    'Nibbles_the_baby',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    '7b6c8971-ac87-4a71-9052-8af42d766ced',
    'Tom_the_cat',    
    'Gaming',       
    'Published',
    '2024-12-09 18:19:30.810259+00'
),
(
    'f7dd2c6a-f95e-4402-81b6-571266553b7c',
    'What game?',
    'Jerry_the_mouse',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    '7b6c8971-ac87-4a71-9052-8af42d766ced',
    'Tom_the_cat',    
    'Gaming',       
    'Published',
    '2024-12-09 18:20:30.810259+00'
);
INSERT INTO comment (id, body, author, post_id, status, created_at)
VALUES (
    '8346828d-b0f6-4105-bb7c-985655a3f34b',
    'Christmas MOOD',
    'Jerry_the_mouse',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    'Published',
    '2024-12-09 16:59:30.810259+00'
);
INSERT INTO comment (id, body, author, post_id, parent_id, parent_author, parent_body, status, created_at)
VALUES (
    '65f0624c-7aa9-4812-bba0-1ad94059d6df',
    'No more Christmas mood becos of 24th Dec',
    'Nibbles_the_baby',
    'fbd21d94-77f0-4305-8f37-2c84ffda5dd5',
    '8346828d-b0f6-4105-bb7c-985655a3f34b',
    'Jerry_the_mouse',    
    'Christmas MOOD',    
    'Published',
    '2024-12-09 17:01:30.810259+00'
);

--- Docker commands
--- docker run --name dev -p 5433:5432 -e POSTGRES_PASSWORD=abcd1234 -e POSTGRES_DB=backend -v C:\Users\lekwc\Documents\Coding\Projects\CVWO Assignment\nus-confess-it-fake\backend\db_init.sql:/docker-entrypoint-initdb.d/init.sql -d postgres 
--- docker exec -it dev psql -U backend
