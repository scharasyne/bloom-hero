Proposed Project Structure (Next.js + Supabase)

Root

- `package.json`: scripts (dev/build/start/test/lint), dependency list.
- `next.config.js` / `next.config.ts`
- `tsconfig.json`
- `.env.example`: required env keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` if used).
- `README.md`
- `public/`: static assets (images, fonts, robots.txt, favicon).
- `sql-changes/` or `supabase/migrations/`: versioned SQL migration files (you already have `sql-changes` — keep or move to `supabase/migrations/`).
- `supabase/`

  - `supabase/config.toml` (optional)
  - `migrations/`: DB migration SQL files
  - `functions/`: Supabase Edge Functions (if used)
  - `seed/`: seed scripts/data
  - `storage/` (docs for buckets or policies)

`src/`

- `app/` (Next 13+ app router)
  - `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
  - Per-area folders: `(auth)/`, `(customer)/`, `(vendor)/`, `admin/`, `api/` (server components & route handlers)
  - `_components/` (app-scoped UI wrappers)

- `pages/` (only if using pages router for API or legacy routes)
  - `api/` (serverless API endpoints if not using app route handlers)

- `components/`
  - Presentational and container components (organize by domain): `ui/` (buttons, inputs, forms), `vendors/`, `admin/`, `cart/`, `shared/`
  - `index.ts` or barrel files to re-export

- `hooks/`
  - `useAuth.tsx`, `useCart.ts`, `useVendors.ts`, etc.

- `lib/`
  - `supabaseClient.ts` — single Supabase client factory (both browser and server patterns)
  - `db.ts` or `server/db.ts` — server-side helpers (RPC calls, typed queries)
  - `validators.ts`, `formatters.ts`, `helpers.ts`

- `services/`
  - `supabase/` — data access layer (DAOs): `users.ts`, `vendors.ts`, `orders.ts` — functions returning typed results
  - `api/` — wrappers for external APIs

- `server/`
  - `auth/` — server auth utilities (session handling, middleware)
  - `middleware.ts` — Next.js middleware
  - `rpc/` — server only procedures

- `styles/`
  - `globals.css`, `tailwind.config.js` (if used), `tokens/` (design tokens)

- `types/`
  - `index.ts` — shared TS types and zod schemas

- `config/`
  - `constants.ts`, `featureFlags.ts`

- `tests/`
  - `unit/`, `integration/`, `e2e/` (Cypress/Playwright)

- `scripts/`
  - utility scripts: `migrate-db.ts`, `seed-db.ts`, `check-env.ts`

`infra/` (optional)

- `.github/workflows/` — CI config (lint, test, build)
- `Dockerfile`, `docker-compose.yml` (if containerized)
- `terraform/` or `bicep/` (infra as code) or deployment manifests

`dev-tools/`

- linting, format configs (`.eslintrc`, `prettier`, `eslint.config.mjs` already present)
- `husky/` hooks, `commitlint` config

Notes on key files and responsibilities

- `src/lib/supabaseClient.ts`: export a single client factory that detects server vs client usage; use service role only on server-side functions.
- `src/services/supabase/*`: implement all DB reads/writes here — keep React components free of raw SQL or query logic.
- `src/server/*`: server-only helpers containing service-side authentication and background jobs (edge functions).
- `supabase/migrations/` (or keep `sql-changes`): store all DB schema changes versioned; include a `README` describing ordering and how to apply locally and in CI.
- `public/bouquets/` (existing): keep vendor assets under `public/` or a storage bucket; add `supabase/storage` policy docs in `supabase/`.

Migration & maintainability recommendations (brief)

- Consolidate data access into `src/services/supabase/*` and remove direct supabase calls from components.
- Centralize env keys in `.env.example` and validate at app start using a `check-env` script.
- Add TypeScript types and Zod schemas in `src/types/` and validate API inputs/outputs.
- Add CI workflow: `lint -> test -> build -> deploy`; run DB migrations in deploy step.
- Adopt barrel exports and small focused modules (each component file should export a single component).

ASCII Visual Map (compact)

|
|-- `package.json`
|-- `next.config.ts`
|-- `tsconfig.json`
|-- `.env.example`
|-- `README.md`
|-- `public/`
|    |-- `bouquets/`
|    |-- (static assets)
|-- `sql-changes/`  or  `supabase/migrations/`
|-- `supabase/`
|    |-- `migrations/`
|    |-- `functions/`
|    |-- `seed/`
|
|_____ `src/`
     |
     |___ `app/` (Next App Router)
     |     |__ `layout.tsx`
     |     |__ `page.tsx`
     |     |__ `loading.tsx`
     |     |__ `_components/`
     |     |__ `(auth)/`
     |     |__ `(customer)/`
     |     |__ `(vendor)/`
     |     |__ `admin/`
     |     |__ `api/` (route handlers / server components)
     |
     |___ `pages/` (optional, legacy router / API)
     |
     |___ `components/`
     |     |__ `ui/` (Button, Input, Modal)
     |     |__ `vendors/` (VendorCard, VendorList)
     |     |__ `cart/`, `admin/`, `shared/`
     |
     |___ `hooks/`
     |     |__ `useAuth.ts`, `useCart.ts`, `useVendors.ts`
     |
     |___ `lib/`
     |     |__ `supabaseClient.ts` (shared client factory)
     |     |__ `db.ts`, `validators.ts`, `formatters.ts`
     |
     |___ `services/`
     |     |__ `supabase/`
     |          |__ `users.ts`
     |          |__ `vendors.ts`
     |          |__ `orders.ts`
     |
     |___ `server/`
     |     |__ `auth/` (server auth helpers)
     |     |__ `middleware.ts`
     |     |__ `rpc/`
     |
     |___ `styles/`
     |     |__ `globals.css`, `tokens/`
     |
     |___ `types/`
     |     |__ `index.ts` (shared TS types, zod schemas)
     |
     |___ `config/`
     |     |__ `constants.ts`, `featureFlags.ts`
     |
     |___ `tests/`
     |     |__ `unit/`, `integration/`, `e2e/`
     |
     |___ `scripts/`
           |__ `migrate-db.ts`, `seed-db.ts`, `check-env.ts`
