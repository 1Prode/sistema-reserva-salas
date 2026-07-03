-- 1. Habilita a extensão pg_cron, caso ainda não esteja habilitada.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Agenda a limpeza diária de reservas encerradas há mais de 15 dias,
--    somente se um job com esse nome ainda não existir. Não remove nem
--    altera nenhum outro job já agendado.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job
    WHERE jobname = 'remover-reservas-finalizadas-15-dias'
  ) THEN
    PERFORM cron.schedule(
      'remover-reservas-finalizadas-15-dias',
      '0 6 * * *',
      $job$
        DELETE FROM public.reservas
        WHERE fim < NOW() - INTERVAL '15 days';
      $job$
    );
  END IF;
END;
$$;
