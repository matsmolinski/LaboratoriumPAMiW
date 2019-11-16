CREATE DATABASE db;
CREATE USER admin WITH PASSWORD 'zetis';
GRANT ALL PRIVILEGES ON DATABASE db TO admin;
\connect app

CREATE TABLE public.users
(
    id bigserial NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password character(128) NOT NULL,
    PRIMARY KEY (id),
);
