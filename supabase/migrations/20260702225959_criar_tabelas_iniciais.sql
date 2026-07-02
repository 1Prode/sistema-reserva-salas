CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nome VARCHAR(100) NOT NULL UNIQUE,

  capacidade INTEGER NOT NULL
    CHECK (capacidade > 0),

  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sala_id UUID NOT NULL
    REFERENCES public.salas(id)
    ON DELETE RESTRICT,

  titulo VARCHAR(150) NOT NULL,

  responsavel VARCHAR(100) NOT NULL,

  participantes INTEGER NOT NULL
    CHECK (participantes > 0),

  inicio TIMESTAMPTZ NOT NULL,

  fim TIMESTAMPTZ NOT NULL,

  duracao_minutos INTEGER NOT NULL
    CHECK (duracao_minutos IN (30, 60)),

  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reserva_fim_apos_inicio
    CHECK (fim > inicio),

  CONSTRAINT reserva_duracao_correspondente
    CHECK (
      fim = inicio
        + duracao_minutos * INTERVAL '1 minute'
    )
);

CREATE INDEX reservas_sala_id_indice
  ON public.reservas(sala_id);

CREATE INDEX reservas_inicio_indice
  ON public.reservas(inicio);