CREATE DATABASE admin;
CREATE USER admin WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE admin TO admin;
\connect admin

CREATE TABLE public.users
(
    id bigserial NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password character(128) NOT NULL,
    PRIMARY KEY (id),
);
