-- Manual only. Run in the Supabase SQL editor (local or hosted).
-- Do not place this file under supabase/migrations.
--
-- Stops PostgREST from running SELECT name FROM pg_timezone_names on each
-- schema cache reload (often ~500ms+ and dominates pg_stat_statements).
--
-- Safe unless you rely on the PostgREST "Prefer: timezone" header.
-- Bloom Hero does not use that header.
--
-- Rollback:
--   ALTER ROLE authenticator SET pgrst.db_timezone_enabled TO 'true';
--   NOTIFY pgrst, 'reload config';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
    EXECUTE 'ALTER ROLE authenticator SET pgrst.db_timezone_enabled TO ''false''';
  END IF;
END
$$;

NOTIFY pgrst, 'reload config';

-- Verify (optional):
-- SELECT rolname, rolconfig FROM pg_roles WHERE rolname = 'authenticator';
