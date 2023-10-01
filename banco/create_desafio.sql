-- Database: desafio

-- DROP DATABASE IF EXISTS desafio;

CREATE DATABASE desafio
    WITH
    OWNER = borjovsky
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


-- Table: public.usuarios

-- DROP TABLE IF EXISTS public.usuarios;

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id integer NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
    nome character varying(255) COLLATE pg_catalog."default" NOT NULL,
    nascimento date,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    criado_em timestamp without time zone DEFAULT now(),
    alterado_em timestamp without time zone DEFAULT now(),
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usuarios
    OWNER to borjovsky;

-- Trigger: atualizar_alterado_em_trigger

-- DROP TRIGGER IF EXISTS atualizar_alterado_em_trigger ON public.usuarios;

CREATE OR REPLACE TRIGGER atualizar_alterado_em_trigger
    BEFORE UPDATE 
    ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.atualiza_alterado_em();