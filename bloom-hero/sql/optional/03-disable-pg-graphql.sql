-- Manual only. Run in the Supabase SQL editor (local or hosted).
-- Do not place this file under supabase/migrations.
--
-- Clears Supabase linter 0026 / 0027 (pg_graphql_*_table_exposed).
-- Bloom Hero uses the REST API (supabase-js), not the GraphQL endpoint.
-- RLS still protects data; this only removes GraphQL schema introspection.
--
-- Rollback (if you add GraphQL later):
--   CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;

DROP EXTENSION IF EXISTS pg_graphql CASCADE;
