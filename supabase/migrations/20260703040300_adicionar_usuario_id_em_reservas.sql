-- A tabela já possui reservas existentes (2 linhas na verificação de
-- 2026-07-03), então a coluna é adicionada como NULLABLE para não quebrar
-- os dados atuais. Reservas com usuario_id NULL são tratadas pela aplicação
-- como "legadas": só um admin pode editá-las ou excluí-las.
ALTER TABLE public.reservas
  ADD COLUMN usuario_id UUID
    REFERENCES auth.users(id)
    ON DELETE RESTRICT;

CREATE INDEX reservas_usuario_id_indice
  ON public.reservas (usuario_id);
