# AGENTS.md

## Purpose
This file defines how contributors and coding agents should work in this repository.

Primary goals:
- Reduce redundancy
- Reduce loading time
- Prioritize security
- Avoid exposing database logic to client UI code

## Repository Structure And Path Logic

### Root
- `components.json`: UI tooling config.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`: build/type/lint/style config.
- `sql-changes/`: schema and SQL migration history only. No UI logic.
- `public/`: static assets only.
- `notes.txt`, `changes-list.txt`: planning/reference artifacts.

### `src/proxy.ts`
Responsibility:
- Session continuity through Supabase SSR cookie bridge.
- Lightweight route guards.

Rules:
- Keep this file minimal and fast.
- Do not place heavy role resolution queries here on every request.
- Use route-level or server-action resolution for role-dependent decisions.

### `src/lib/`
Single source of shared runtime infrastructure.

- `src/lib/supabase/browser-client.ts`: browser-only Supabase client factory.
- `src/lib/supabase/server-client.ts`: server-only Supabase client factory.
- `src/lib/utils.ts`: shared utility helpers.
- `src/lib/mockData.ts`: test/demo placeholder data.

Rules:
- Any new cross-feature helper goes here first.
- Do not duplicate Supabase client creation in pages/components.

### `src/app/`
App Router entry point and route ownership.

- `src/app/layout.tsx`: root shell only.
- `src/app/page.tsx`: marketing/home entry.
- `src/app/(auth)/...`: sign in/sign up screens.
- `src/app/auth/callback/route.ts`: OAuth callback and post-auth routing.
- `src/app/(customer)/...`: customer-only pages.
- `src/app/(vendor)/market/...`: market vendor pages.
- `src/app/(vendor)/pop-up/...`: pop-up vendor pages.
- `src/app/admin/...`: admin pages.
- `src/app/select-role/page.tsx`: role selection flow.

Rules:
- Authorization and role resolution should happen on server routes/actions, not in client navbar/page effects.
- Keep redirect logic centralized (avoid repeating role routing in multiple client pages).
- Layout files should compose UI and avoid query-heavy logic.

### `src/components/`
Reusable UI building blocks and composed widgets.

- `src/components/ui/`: primitive UI components (button/input/card/etc).
- `src/components/admin/`: admin-specific reusable pieces.
- `src/components/vendors/`: vendor-specific reusable pieces.
- `src/components/navbar.tsx`: navigation presentation and minimal session-aware behavior.

Rules:
- Components should not perform privileged database role checks.
- Prefer props and server-provided state over per-component duplicate queries.
- Keep navigation link definitions centralized in one map/config.

### `src/hooks/`
Client hooks for front-end state concerns.

Rules:
- Hooks should wrap reusable client state behavior.
- Avoid duplicating fetch/query logic that already exists in server routes.

### `src/typess/`
Shared TypeScript types.

Rules:
- Move repeated inline types here.
- Keep role, vendor, and profile model types canonical here.

## Security-First Rules

1. Never expose database decision logic in client UI components.
- Client components can read auth session state.
- Role/vendor authorization checks must be server-side.

2. Minimize cookie surface.
- Store only non-sensitive UI state when necessary.
- Do not store private user profile payloads in client-readable cookies.

3. Keep authorization server-enforced.
- Client nav state is presentation only.
- Real access control must be in server checks and Supabase RLS.

4. Avoid direct table probing in shared UI components.
- No repeated `users`/`vendors` role checks inside navbar-like components.

## Redundancy-Reduction Rules

1. Single source of truth for role routing.
- One server flow should decide destination for admin/vendor/customer.

2. Single source of truth for nav links.
- Define nav states in one place and reuse.

3. Single Supabase client factories.
- Always use files in `src/lib/supabase/`.

4. Shared types first.
- If a shape is used in 2+ files, move it into `src/typess/`.

5. Remove drafts after merge.
- Consolidate or delete files like duplicate navbar drafts when final logic is stable.

## Performance Rules

1. Prefer server resolution once, not repeated client fetch loops.
2. Avoid role-related DB calls in `useEffect` for global components.
3. Keep middleware/proxy lightweight to protect TTFB.
4. Use route-group layouts for shared UI to avoid repeated rendering logic.

## Change Playbook By Task

### If changing login, OAuth, or role selection
Edit:
- `src/app/(auth)/...`
- `src/app/auth/callback/route.ts`
- `src/app/select-role/page.tsx`
- optionally `src/proxy.ts` (only if session bridge/guard behavior changes)

Do not:
- Reimplement role redirect logic inside multiple client components.

### If changing navbar behavior
Edit:
- `src/components/navbar.tsx`
- relevant layout route group files under `src/app/(customer)` or `src/app/(vendor)`

Do not:
- Add fresh DB role queries to navbar.

### If adding reusable UI
Edit:
- `src/components/ui/` for primitives
- feature wrapper in `src/components/` or `src/components/admin|vendors/`

Do not:
- Copy-paste similar JSX across pages.

## Definition Of Done For New Changes
- No duplicate role-routing branches across multiple client pages.
- No new client component performs privileged role DB checks.
- Shared types/helpers are reused instead of copied.
- Route guard/auth logic remains server-owned.
- New logic is added in the correct folder based on ownership above.
