-- 1. Adiciona a coluna nome (nullable por enquanto, para permitir o preenchimento).
ALTER TABLE public.perfis
  ADD COLUMN nome TEXT;

-- 2. Preenche usuários existentes com um nome derivado do username.
--    Ex.: pedro.brasil -> Pedro Brasil / joao.silva2 -> Joao Silva
UPDATE public.perfis
SET nome = NULLIF(
  TRIM(
    initcap(
      regexp_replace(
        regexp_replace(username, '[0-9]+$', ''),
        '[.]', ' ', 'g'
      )
    )
  ),
  ''
)
WHERE nome IS NULL;

-- Salvaguarda: garante que nenhum perfil fique sem nome mesmo em casos atípicos.
UPDATE public.perfis
SET nome = username
WHERE nome IS NULL OR TRIM(nome) = '';

-- 3. Torna a coluna obrigatória agora que todos os perfis possuem um valor.
ALTER TABLE public.perfis
  ALTER COLUMN nome SET NOT NULL;

-- 4. Garante que o nome seja consistente.
ALTER TABLE public.perfis
  ADD CONSTRAINT perfis_nome_valido
  CHECK (char_length(TRIM(nome)) BETWEEN 2 AND 150);

-- 5. Atualiza a função de criação de perfil para também gravar o nome.
CREATE OR REPLACE FUNCTION public.lidar_com_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  nome_normalizado TEXT;
BEGIN
  nome_normalizado := NULLIF(
    TRIM(regexp_replace(NEW.raw_user_meta_data ->> 'nome', '\s+', ' ', 'g')),
    ''
  );

  IF nome_normalizado IS NULL THEN
    nome_normalizado := NULLIF(
      TRIM(
        initcap(
          regexp_replace(
            regexp_replace(NEW.raw_user_meta_data ->> 'username', '[0-9]+$', ''),
            '[.]', ' ', 'g'
          )
        )
      ),
      ''
    );
  END IF;

  IF nome_normalizado IS NULL THEN
    nome_normalizado := NEW.raw_user_meta_data ->> 'username';
  END IF;

  INSERT INTO public.perfis (id, username, nome, papel)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    nome_normalizado,
    'usuario'
  );

  RETURN NEW;
END;
$$;
