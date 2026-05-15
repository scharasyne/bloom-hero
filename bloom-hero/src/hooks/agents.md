# Bloom Hero — `src/hooks` Guide

## Purpose
Client-only React hooks: loading/error state, `useEffect`, calling **features** (server queries/actions) or thin API routes.

## Rules
1. **No direct Supabase/DB** in hooks — use `features/<name>/queries` or `actions`.
2. **One hook per screen concern** — e.g. `useSearchResults`, `useVendors`.
3. **Types live in features** — import `AdminVendorRecord` from `features/admin/types`, not from hooks.
4. Hooks may re-export types for backward compatibility, but prefer importing from the feature.

## Pattern
```ts
// Good
const result = await listAdminVendors();
if (!result.ok) { setError(result.error); return; }
setData(result.data ?? []);
```

```ts
// Bad — move fetch to features/admin/queries/
const { data } = await supabase.from("vendors").select(...);
```
