# Bloom Hero — `src/lib` Guide

## Keep here (shared infrastructure)
- `supabase/` — browser, server, and admin Supabase clients
- `utils.ts` — `cn()` and other generic UI helpers (no domain)
- `utils/email.ts` — email normalization/validation used across features

## Do not add here
- Domain queries (products, vendors, search, orders) → `src/features/<name>/queries/`
- Domain mutations → `src/features/<name>/actions/`
- Feature-specific types → `src/features/<name>/types.ts`
- React hooks → `src/hooks/` (client orchestration only; no direct DB)

## Rule
Only place code in `lib` when it is used by **multiple features** and is **not owned by one domain**.
