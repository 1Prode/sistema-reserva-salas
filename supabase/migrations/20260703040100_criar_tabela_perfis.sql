CREATE TABLE public.perfis (
  id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  username TEXT NOT NULL
    CHECK (
      username = LOWER(username)
      AND char_length(username) BETWEEN 3 AND 80
      AND username ~ '^[a-z]+[.][a-z]+[0-9]*$'
    ),

  papel TEXT NOT NULL DEFAULT 'usuario'
    CHECK (papel IN ('usuario', 'admin')),

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX perfis_username_unico
  ON public.perfis (LOWER(username));

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_le_o_proprio_perfil"
  ON public.perfis
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
