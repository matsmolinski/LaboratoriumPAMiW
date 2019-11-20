\connect admin

CREATE TABLE public.users
(
    id bigserial NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password character(128) NOT NULL,
    PRIMARY KEY (id),
);
