-- Defesa em profundidade: a aplicação usa a service role (que ignora RLS)
-- em todas as rotas e faz a checagem de autorização manualmente em código.
-- Estas policies existem para não deixar as tabelas abertas caso algum
-- client com a chave publicável venha a consultá-las diretamente no futuro.

ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autenticado_le_salas"
  ON public.salas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "autenticado_cria_salas"
  ON public.salas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_atualiza_salas"
  ON public.salas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  );

CREATE POLICY "admin_exclui_salas"
  ON public.salas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  );

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autenticado_le_reservas"
  ON public.reservas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "autenticado_cria_reservas"
  ON public.reservas
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "dono_ou_admin_atualiza_reservas"
  ON public.reservas
  FOR UPDATE
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  )
  WITH CHECK (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  );

CREATE POLICY "dono_ou_admin_exclui_reservas"
  ON public.reservas
  FOR DELETE
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.perfis
      WHERE id = auth.uid()
        AND papel = 'admin'
    )
  );
