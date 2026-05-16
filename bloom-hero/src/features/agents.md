# Features Agent Guide

Use this layout for every domain under `src/features/<name>/`. Route files in `src/app/` should stay thin; feature folders own behavior.

## Folder roles

| Folder | Purpose | Runs on |
|--------|---------|--------|
| `queries/` | Read-only data fetching (server) | Server |
| `actions/` | Mutations, `revalidatePath`, redirects | Server (`"use server"`) |
| `components/` | Interactive UI, modals, forms, nav shells | Client (`"use client"` when needed) |
| `utils/` | Pure helpers, constants, shared guards with no I/O | Either |
| `types.ts` | Types shared inside the feature | — |

## Rules

1. **One concern per file** — e.g. `getAdminDashboardData.ts`, not `adminData.ts` with mixed reads.
2. **Do not duplicate** — Before adding a query or component, search the same feature (and related features) for an existing one; extend it with parameters or conditions instead of copying.
3. **Cross-feature reads** — Call the owning feature’s query (e.g. admin uses `vendors/queries/listSubmittedVendorApplications`), don’t re-query the same table in two places unless the shape truly differs.
4. **No DB in route pages** — `page.tsx` composes server queries + client components; client pages use hooks that call actions or browser Supabase only where already established.
5. **Auth gates** — Shared checks live in `utils/` (e.g. `ensureAdmin`, `requireRole` in app layout). Actions and queries call them; don’t copy-paste auth logic.
6. **Components location** — Feature-specific UI lives in `features/<name>/components/`. Use `src/components/` only for app-wide primitives (e.g. `Modal`, root `NavBar`).
7. **Deletes** — Remove unused files when consolidating (old `components/<feature>/` copies, obsolete routes, duplicate queries).

## App routes vs features

- `src/app/(group)/` — Routing, layouts, `requireRole`, minimal composition.
- `src/app/(group)/agents.md` — URLs and layout notes for that route group.
- `src/features/<name>/` — All reusable logic and UI for that domain.

## Naming

- Queries: `getThing`, `listThings`.
- Actions: verb-first — `approveVendorApplication`, `setVendorSuspensionStatus`.
- Components: PascalCase, scoped name when helpful — `AdminSidebarNav`, `AdminVendorProfileModal`.

## Legacy naming

- **`business_type`** (`registered` | `unregistered`) is the vendor account model. Do not add market/pop-up **roles** or `/market/*` / `/pop-up/*` vendor dashboards.
- **`src/features/pop-up/`** is a product domain (schedule, gallery, map tables like `popup_locations`) — not a separate vendor type. Keep those imports; do not treat them as role split.

## When unsure

1. Check `sql-changes/all-schema.sql` for tables/columns.
2. Grep `src/features/<name>/` for existing queries/actions/components.
3. Prefer extending an existing export over adding a parallel file.
