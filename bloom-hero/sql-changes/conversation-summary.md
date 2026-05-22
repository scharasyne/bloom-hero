# Bloom Hero — Conversation Summary (May 2026)

Summary of topics, changes, and decisions from this chat session.  
**Project:** `bloom-hero` (Next.js + Supabase)  
**Transcript ID:** [0f3dd75d-fcd0-425a-b8d1-c40c50a010f9](0f3dd75d-fcd0-425a-b8d1-c40c50a010f9)

---

## 1. TypeScript — `runSearch.ts`

**Problem:** `RunSearchParams` was missing fields used in the implementation:
- `city`
- `popupTiming`
- `popupSort`

**Fix:** Added optional properties to `RunSearchParams` in `src/features/search/queries/runSearch.ts`.

---

## 2. Slow Supabase queries

**User question:** How to deal with slow queries from `pg_stat_statements`.

**Findings:**
- Top query often `SELECT name FROM pg_timezone_names` (~25–47% of time) — PostgREST schema reload, not app code.
- Many heavy queries are Supabase Dashboard / `postgres` role (extensions, metadata), not `anon`/`authenticated`.
- Filter stats by role to see real app traffic.

**Fix:** `sql-changes/apply-postgrest-timezone-fix.sql` — sets `pgrst.db_timezone_enabled=false` on `authenticator` role + `NOTIFY pgrst, 'reload config'`.

---

## 3. Database linter — security warnings

**Linter issues addressed:** `function_search_path_mutable`, public RPC on helpers, `pg_graphql` exposure on sensitive tables.

**Script:** `sql-changes/apply-database-linter-fixes.sql`

| Fix | Detail |
|-----|--------|
| Search path | `SET search_path TO public` on trigger/helper functions |
| RPC lockdown | `REVOKE EXECUTE` from `anon`/`authenticated` on RLS helpers |
| Anon table access | `REVOKE ALL` on sensitive tables (`orders`, `customers`, `activity_logs`, etc.) |

**Optional:** `apply-disable-pg-graphql.sql` — drops `pg_graphql` if not used.

---

## 4. Vendor vs customer access (RLS)

**Script:** `sql-changes/apply-vendor-customer-access-rls.sql`

- RLS on `users`, `vendors`, `products`, `reviews`, `orders`, `order_items`, `popup_locations`, `popup_location_requests`, `vendor_applications`.
- Public catalog via `can_read_public_vendor_catalog()` — vendors cannot browse other shops via API.
- App guards: vendor redirect on `/vendors/:id`, cart, map/search links, location requests.

---

## 5. RLS performance — `auth_rls_initplan`

**Problem:** Policies calling `auth.uid()` / `is_admin()` without `(select ...)` re-evaluate per row.

**Script:** `sql-changes/apply-rls-initplan-fixes.sql`

- Wraps `auth.uid()` and helpers in `(select ...)` on legacy policy names.
- Fixes `can_read_public_vendor_catalog()`.
- Drops duplicate constraint `unique_vendor_owner` (keep `vendors_owner_id_key`).
- Keeps `customers_insert_own_role` initplan fix.
- **Does not** recreate split vendor-access policies — run consolidate script next.

---

## 6. RLS performance — `multiple_permissive_policies`

**Problem:** Multiple permissive policies per role/action (admin + customer + vendor) force Postgres to evaluate each policy on every query.

**Affected tables (from linter CSV):**  
`order_items`, `orders`, `popup_location_requests`, `popup_locations`, `products`, `reviews`, `users`, `vendor_applications`, `vendor_suspension_appeals`, `vendors`

**Script:** `sql-changes/apply-rls-consolidate-permissive-policies.sql`

Merges overlapping policies into **one policy per command** with OR-combined rules, e.g.:
- `orders_select`, `orders_insert`, `orders_update`
- `order_items_select/insert/update/delete`
- `users_select`, `users_update`
- `vendors_select/insert/update`
- `products_select`, `reviews_select`
- `popup_locations_*`, `popup_location_requests_insert/select`
- `vendor_applications_*`
- `vendor_suspension_appeals_select`

`apply-vendor-customer-access-rls.sql` updated to match for fresh installs.

---

## 7. FK covering indexes

**Script:** `sql-changes/apply-fk-indexes.sql` — 13 indexes on foreign-key columns for join/delete performance.

**Note:** Linter may report "unused index" in dev — normal shortly after creation; keep unless confirmed redundant.

---

## 8. Vendor suspension appeals

**Script:** `sql-changes/apply-vendor-suspension-appeals.sql` — table, indexes, RLS (own insert/select; admin select/update). SELECT merged in consolidate script.

---

## 9. Auth — `getUser()` vs `getSession()`

**Issue:** Server code using `getSession()` is insecure (cookie data not verified with Auth server).

**Changes made:**
- `src/features/auth/queries/getAuthUser.ts` — `cache()` + `getUser()`
- `getCachedUserProfile.ts`, `getCachedVendorCommonProfile.ts`, `revalidateUserCache.ts`
- `order-status.ts`, `getOrderSessionUserId.ts`, `getVendorOrdersPage.ts`

**Still pending:** Many files still reference `getSession()` (terminal shows warnings on `/vendor/orders`). Grep `getSession` under `src/` to finish migration.

---

## 10. Dev server — JSX build errors (terminal)

Invalid closing tag `</motionless>` (likely corrupted `motion.div` or similar):

| File | Symptom |
|------|---------|
| `PopUpVendorModal.tsx:55` | Expected closing tag for `<motion.div>` |
| `SearchPage.tsx:262, 274, 425` | `Expected '</', got ')'` |
| `PopUpResultCard.tsx:61` | Mismatched `</motionless>` vs `<article>` |

**Status:** Repo grep shows no `motionless` left — may already be fixed; verify `npm run dev` if 500s return.

**Other browser warning:** `/navbar-logo.png` — set `width: auto` or `height: auto` when resizing one dimension in CSS.

---

## 11. Recommended SQL apply order (hosted Supabase)

Run each file once in **SQL Editor**:

1. `apply-rls-initplan-fixes.sql`
2. `apply-rls-consolidate-permissive-policies.sql`
3. `apply-fk-indexes.sql` (if not applied)
4. `apply-postgrest-timezone-fix.sql`
5. As needed: `apply-database-linter-fixes.sql`, `apply-disable-pg-graphql.sql`, `apply-vendor-customer-access-rls.sql` (greenfield), `apply-vendor-suspension-appeals.sql`

Re-run database linter after steps 1–2 to confirm `auth_rls_initplan` and `multiple_permissive_policies` clear.

---

## 12. SQL scripts reference

| File | Purpose |
|------|---------|
| `all-schema.sql` | Schema reference |
| `apply-vendor-business-type.sql` | `business_type` enum migration |
| `apply-vendor-customer-access-rls.sql` | Full vendor/customer RLS (consolidated shape) |
| `apply-rls-initplan-fixes.sql` | Initplan + legacy policies |
| `apply-rls-consolidate-permissive-policies.sql` | One permissive policy per action |
| `apply-fk-indexes.sql` | FK indexes |
| `apply-postgrest-timezone-fix.sql` | Stop `pg_timezone_names` spam |
| `apply-database-linter-fixes.sql` | search_path, RPC, anon revokes |
| `apply-disable-pg-graphql.sql` | Drop pg_graphql |
| `apply-vendor-suspension-appeals.sql` | Appeals table + RLS |
| `CHANGES.md` | Vendor business type + linter notes |

---

## 13. Optional follow-ups

- [ ] Run consolidate + initplan on production if not done; re-check linter
- [ ] Migrate remaining `getSession()` call sites to `getAuthUser()`
- [ ] Confirm JSX files compile (no `motionless` typos)
- [ ] Align `apply-vendor-suspension-appeals.sql` SELECT with consolidated policy
- [ ] `customers` legacy policies — verify no duplicate permissive policies remain

---

## 14. Next.js — `cookies()` inside `unstable_cache()` (fixed)

**Error (Next.js 16):** Route `/` used `cookies()` inside a function cached with `unstable_cache()`.

**Stack:**
- `createSupabaseServerClient` → `cookies()`
- `loadUserProfile` → `getCachedUserProfile` (`unstable_cache`)
- `getSession` → `RootLayout`

**Cause:** `getCachedUserProfile` and `getCachedVendorCommonProfile` used `unstable_cache()` but called `createSupabaseServerClient()`, which reads auth cookies. Dynamic data (`cookies()`, `headers()`) cannot run inside `unstable_cache` callbacks.

**Fix:** Use React `cache()` for per-request deduplication instead of `unstable_cache` for cookie-backed Supabase reads.

| File | Change |
|------|--------|
| `src/features/auth/queries/getCachedUserProfile.ts` | `unstable_cache` → `cache()` from `react` |
| `src/features/vendors/queries/getCachedVendorCommonProfile.ts` | same |
| `src/features/auth/utils/revalidateUserCache.ts` | `revalidateTag` → `revalidatePath("/", "layout")` for navbar after profile edits |

**Trade-off:** Profile data is no longer cached across requests for 300s; each request refetches (still deduped within one request). Acceptable for auth-scoped data.

**Other dev warning:** Multiple lockfiles — Turbopack picked `C:\Users\zarah\package-lock.json` as root. Set `turbopack.root` in `next.config` or remove stray lockfile if builds mis-resolve.

### Terminal excerpt (`terminals/9.txt`, unstable_cache)

```text
⨯ Error: Route / used `cookies()` inside a function cached with `unstable_cache()`. ...
    at createSupabaseServerClient (src\lib\supabase\server-client.ts:19:38)
    at loadUserProfile (src\features\auth\queries\getCachedUserProfile.ts:17:52)
 GET / 500 in 6.2s
```

---

## 15. Login — `permission denied for function is_admin` (fixed)

**Error:** `POST /login` 500 — `permission denied for function is_admin` when `getUserRoleById` selects from `users`.

**Cause:** `apply-database-linter-fixes.sql` revoked `EXECUTE` on RLS helpers (`is_admin`, `is_customer`, etc.) from `authenticated`. Consolidated `users_select` policies call `(select public.is_admin())`; without `EXECUTE`, every `users` query fails after sign-in.

**Root cause:** `apply-database-linter-fixes.sql` revoked `EXECUTE` on `is_admin()` etc. from **both** `anon` and `authenticated`. RLS policies still call those functions for every row check — guests (map/home) and login both need `EXECUTE`.

**Catch-22:**
| Action | App | Linter 0029 |
|--------|-----|-------------|
| Revoke EXECUTE from authenticated/anon | Broken (your errors) | Clean |
| Grant EXECUTE on `public.*` helpers | Works | WARN (RPC `/rest/v1/rpc/is_admin`) |

**Emergency fix:** Run `sql-changes/apply-rls-helper-execute-grants.sql` — `GRANT EXECUTE` to **anon + authenticated** on `public.*` helpers.

**Permanent fix (clears 0029):**
1. `apply-rls-helpers-private-schema.sql` — helpers in `private` schema (not PostgREST-exposed)
2. `apply-rls-consolidate-permissive-policies.sql` — policies use `private.is_admin()` etc.

Run emergency script on **hosted** Supabase too if `.env.local` points there.

### Terminal excerpt (`terminals/9.txt`, login error)

```text
[browser] ⨯ unhandledRejection: Error: permission denied for function is_admin
    at getUserRoleById (src\features\users\queries\getUserRole.ts:6:20)
    at resolvePostLoginDestination (src\features\auth\actions\actions.ts:28:14)
 POST /login 500 in 1073ms
  └─ ƒ signInWithPasswordAction("test@customer.com", "customer")
```

---

## 16. Dev terminal log (`npm run dev`, terminal 4)

Source: `terminals/4.txt` lines 7–1019 (session excerpt).  
Command: `npm run dev` in `bloom-hero`.

```text
 GET /vendor/products 200 in 711ms (next.js: 15ms, proxy.ts: 176ms, application-code: 521ms)
 GET /vendor/products 200 in 704ms (next.js: 14ms, proxy.ts: 177ms, application-code: 514ms)
 GET /vendor/products 200 in 652ms (next.js: 8ms, proxy.ts: 114ms, application-code: 529ms)
 GET /vendor/products 200 in 744ms (next.js: 33ms, proxy.ts: 204ms, application-code: 507ms)
 GET /vendor/products 200 in 621ms (next.js: 9ms, proxy.ts: 151ms, application-code: 460ms)
 GET /vendor/products 200 in 543ms (next.js: 8ms, proxy.ts: 156ms, application-code: 379ms)
 GET /vendor/products 200 in 737ms (next.js: 6ms, proxy.ts: 95ms, application-code: 636ms)
 GET /vendor/products 200 in 441ms (next.js: 15ms, proxy.ts: 123ms, application-code: 303ms)
 GET /vendor/products 200 in 613ms (next.js: 11ms, proxy.ts: 107ms, application-code: 494ms)
 GET /vendor/products 200 in 477ms (next.js: 10ms, proxy.ts: 107ms, application-code: 359ms)
 GET /vendor/products 200 in 894ms (next.js: 16ms, proxy.ts: 182ms, application-code: 696ms)
 GET /vendor/products 200 in 693ms (next.js: 32ms, proxy.ts: 166ms, application-code: 495ms)
 GET /vendor/products 200 in 739ms (next.js: 13ms, proxy.ts: 169ms, application-code: 557ms)
 GET /vendor/products 200 in 538ms (next.js: 13ms, proxy.ts: 133ms, application-code: 393ms)
âœ“ Compiled in 933ms
 GET /vendor/products 200 in 1630ms (next.js: 376ms, proxy.ts: 322ms, application-code: 933ms)
âœ“ Compiled in 925ms
 GET /vendor/products 200 in 2.9s (next.js: 757ms, proxy.ts: 591ms, application-code: 1577ms)
 GET /vendor/products 200 in 4.2s (next.js: 43ms, proxy.ts: 946ms, application-code: 3.3s)
 GET /vendor/profile 200 in 1580ms (next.js: 587ms, proxy.ts: 115ms, application-code: 878ms)
 GET /vendors/e36b27f2-39b3-4f63-aeae-fdd6733ea901 200 in 1085ms (next.js: 414ms, proxy.ts: 68ms, application-code: 604ms)
 GET / 200 in 234ms (next.js: 62ms, proxy.ts: 86ms, application-code: 86ms)
[browser] Image with src "/navbar-logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
 GET /api/best-sellers?limit=6 200 in 567ms (next.js: 314ms, proxy.ts: 172ms, application-code: 81ms)
 POST / 200 in 590ms (next.js: 12ms, proxy.ts: 155ms, application-code: 424ms)
  â””â”€ Æ’ getPopUpMapVendors() in 384ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 POST / 200 in 244ms (next.js: 8ms, proxy.ts: 185ms, application-code: 51ms)
  â””â”€ Æ’ getPopUpMapVendors() in 31ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 GET / 200 in 145ms (next.js: 6ms, proxy.ts: 98ms, application-code: 41ms)
 GET /search?scope=flowers&category=birthday 200 in 1204ms (next.js: 273ms, proxy.ts: 67ms, application-code: 865ms)
[browser] Image with src "/navbar-logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
 GET /api/search?scope=flowers&price=Any&sort=Best+Sellers&category=birthday 200 in 194ms (next.js: 73ms, proxy.ts: 79ms, application-code: 42ms)
 GET / 200 in 172ms (next.js: 11ms, proxy.ts: 113ms, application-code: 48ms)
 POST / 200 in 374ms (next.js: 8ms, proxy.ts: 269ms, application-code: 97ms)
  â””â”€ Æ’ getPopUpMapVendors() in 74ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 GET /api/best-sellers?limit=6 200 in 351ms (next.js: 33ms, proxy.ts: 236ms, application-code: 83ms)
 POST / 200 in 199ms (next.js: 7ms, proxy.ts: 147ms, application-code: 46ms)
  â””â”€ Æ’ getPopUpMapVendors() in 27ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
âœ“ Compiled in 611ms
 GET / 200 in 1367ms (next.js: 470ms, proxy.ts: 227ms, application-code: 670ms)
 GET / 200 in 1431ms (next.js: 11ms, proxy.ts: 473ms, application-code: 948ms)
 GET / 200 in 765ms (next.js: 21ms, proxy.ts: 314ms, application-code: 431ms)
 GET / 200 in 2.5s (next.js: 25ms, proxy.ts: 841ms, application-code: 1630ms)
âœ“ Compiled in 666ms
 GET /api/best-sellers?limit=6 200 in 1575ms (next.js: 416ms, proxy.ts: 183ms, application-code: 976ms)
 POST / 200 in 2.1s (next.js: 1392ms, proxy.ts: 602ms, application-code: 137ms)
  â””â”€ Æ’ getPopUpMapVendors() in 66ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 GET / 200 in 479ms (next.js: 9ms, proxy.ts: 236ms, application-code: 235ms)
 GET / 200 in 250ms (next.js: 6ms, proxy.ts: 92ms, application-code: 151ms)
 GET / 200 in 259ms (next.js: 8ms, proxy.ts: 102ms, application-code: 148ms)
âœ“ Compiled in 450ms
â¨¯ ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
Expected corresponding JSX closing tag for <div>
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Parsing ecmascript source code failed

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]



./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
Expected corresponding JSX closing tag for <div>
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]


 GET / 500 in 398ms (next.js: 135ms, proxy.ts: 229ms, application-code: 33ms)
â¨¯ ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
Expected corresponding JSX closing tag for <div>
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Parsing ecmascript source code failed

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]



./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
Expected corresponding JSX closing tag for <div>
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]


 GET / 500 in 232ms (next.js: 54ms, proxy.ts: 148ms, application-code: 31ms)
[browser] Uncaught Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
Expected corresponding JSX closing tag for <div>
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7
  53 |         </Link>
  54 |       </div>
> 55 |     </motionless>
     |       ^^^^^^^^^^
  56 |   );
  57 | }
  58 |

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpMap.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/_components/DesktopClient.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/page.tsx [Server Component]


    at <unknown> (Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7)
    at <unknown> (Error: (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/pop-up/components/PopUpVendorModal.tsx:55:7)
âœ“ Compiled in 1210ms
 GET / 200 in 1607ms (next.js: 374ms, proxy.ts: 176ms, application-code: 1057ms)
 GET /api/best-sellers?limit=6 200 in 475ms (next.js: 271ms, proxy.ts: 140ms, application-code: 64ms)
 POST / 200 in 486ms (next.js: 306ms, proxy.ts: 132ms, application-code: 47ms)
  â””â”€ Æ’ getPopUpMapVendors() in 32ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 GET / 200 in 857ms (next.js: 320ms, proxy.ts: 197ms, application-code: 341ms)
 GET / 200 in 256ms (next.js: 5ms, proxy.ts: 88ms, application-code: 163ms)
 GET / 200 in 230ms (next.js: 7ms, proxy.ts: 106ms, application-code: 117ms)
 GET / 200 in 549ms (next.js: 203ms, proxy.ts: 173ms, application-code: 172ms)
 GET / 200 in 158ms (next.js: 5ms, proxy.ts: 74ms, application-code: 78ms)
 GET / 200 in 158ms (next.js: 5ms, proxy.ts: 67ms, application-code: 86ms)
âœ“ Compiled in 549ms
 GET / 200 in 894ms (next.js: 450ms, proxy.ts: 158ms, application-code: 287ms)
 GET / 200 in 568ms (next.js: 177ms, proxy.ts: 184ms, application-code: 207ms)
 GET / 200 in 137ms (next.js: 5ms, proxy.ts: 76ms, application-code: 56ms)
âœ“ Compiled in 544ms
[browser] Image with src "/navbar-logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
âœ“ Compiled in 1064ms
 GET / 200 in 1148ms (next.js: 487ms, proxy.ts: 254ms, application-code: 407ms)
 GET / 200 in 437ms (next.js: 9ms, proxy.ts: 159ms, application-code: 269ms)
 GET / 200 in 717ms (next.js: 275ms, proxy.ts: 128ms, application-code: 314ms)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 426ms (next.js: 53ms, proxy.ts: 67ms, application-code: 306ms)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 975ms (next.js: 285ms, proxy.ts: 174ms, application-code: 516ms)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 1208ms (next.js: 284ms, proxy.ts: 185ms, application-code: 738ms)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 851ms (next.js: 21ms, proxy.ts: 136ms, application-code: 693ms)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 1085ms (next.js: 313ms, proxy.ts: 181ms, application-code: 590ms)
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 500 in 237ms (next.js: 18ms, proxy.ts: 198ms, application-code: 21ms)
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 500 in 163ms (next.js: 20ms, proxy.ts: 114ms, application-code: 28ms)
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 500 in 206ms (next.js: 44ms, proxy.ts: 136ms, application-code: 26ms)
[browser] Uncaught Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      


    at <unknown> (Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11)
    at <unknown> (Error: (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11)
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
Expected '</', got ')'
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:262:11
  260 |               />
  261 |             </motionless>
> 262 |           ) : null}
      |           ^
  263 |           {showFlowers || showVendors ? (
  264 |             <div className="mb-6">
  265 |               <SearchFilters

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
âœ“ Compiled in 2.1s
[browser] ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:274:11
Expected '</', got ')'
  272 |               />
  273 |             </motionless>
> 274 |           ) : null}
      |           ^
  275 |
  276 |           <section>
  277 |             {(q || category || scope === "popups") && (

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:274:11
  272 |               />
  273 |             </motionless>
> 274 |           ) : null}
      |           ^
  275 |
  276 |           <section>
  277 |             {(q || category || scope === "popups") && (

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 5.6s (next.js: 572ms, proxy.ts: 590ms, application-code: 4.4s)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 500 in 536ms (next.js: 45ms, proxy.ts: 394ms, application-code: 97ms)
[browser] Uncaught Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19
Expected '</', got ')'
  423 |                       ))}
  424 |                     </motionless>
> 425 |                   ) : (
      |                   ^
  426 |                     <div className="rounded-2xl border border-dashed border...
  427 |                       No upcoming pop-ups matched this search.
  428 |                     </motionless>

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19
  423 |                       ))}
  424 |                     </motionless>
> 425 |                   ) : (
      |                   ^
  426 |                     <div className="rounded-2xl border border-dashed border...
  427 |                       No upcoming pop-ups matched this search.
  428 |                     </motionless>

Import trace:
  Server Component:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx      


    at <unknown> (Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19)
    at <unknown> (Error: (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx:425:19)
âœ“ Compiled in 3.6s
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 3.1s (next.js: 408ms, proxy.ts: 318ms, application-code: 2.3s)
 GET /vendors/446d8e0a-ea10-4d92-881f-c276d169e81d 200 in 4.2s (next.js: 877ms, proxy.ts: 205ms, application-code: 3.1s)
 GET / 200 in 283ms (next.js: 45ms, proxy.ts: 102ms, application-code: 135ms)
[browser] Image with src "/navbar-logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
 POST / 200 in 729ms (next.js: 7ms, proxy.ts: 313ms, application-code: 409ms)
  â””â”€ Æ’ getPopUpMapVendors() in 382ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
 GET /api/best-sellers?limit=6 200 in 735ms (next.js: 294ms, proxy.ts: 301ms, application-code: 140ms)
 POST / 200 in 274ms (next.js: 8ms, proxy.ts: 201ms, application-code: 64ms)
  â””â”€ Æ’ getPopUpMapVendors() in 47ms bloom-hero/src/features/pop-up/queries/getPopUpMapVendors.ts
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /dashboard 307 in 3.2s (next.js: 1922ms, proxy.ts: 102ms, application-code: 1214ms)
 GET /vendor/dashboard 200 in 2.1s (next.js: 531ms, proxy.ts: 107ms, application-code: 1460ms)
 GET /api/vendor-dashboard 200 in 602ms (next.js: 111ms, proxy.ts: 175ms, application-code: 316ms)
âœ“ Compiled in 271ms
 GET /vendor/dashboard 200 in 1365ms (next.js: 214ms, proxy.ts: 322ms, application-code: 829ms)
 GET /vendor/dashboard 200 in 300ms (next.js: 6ms, proxy.ts: 95ms, application-code: 198ms)
âœ“ Compiled in 1372ms
 GET /vendor/dashboard 200 in 701ms (next.js: 229ms, proxy.ts: 163ms, application-code: 309ms)
 GET /vendor/dashboard 200 in 232ms (next.js: 5ms, proxy.ts: 79ms, application-code: 147ms)
 GET /vendor/dashboard 200 in 242ms (next.js: 4ms, proxy.ts: 83ms, application-code: 154ms)
 GET /vendor/dashboard 200 in 288ms (next.js: 10ms, proxy.ts: 101ms, application-code: 177ms)
âœ“ Compiled in 192ms
âœ“ Compiled in 1370ms
 GET /vendor/dashboard 200 in 1373ms (next.js: 579ms, proxy.ts: 224ms, application-code: 569ms)
 GET /vendor/dashboard 200 in 373ms (next.js: 7ms, proxy.ts: 172ms, application-code: 194ms)
 GET /vendor/dashboard 200 in 263ms (next.js: 5ms, proxy.ts: 77ms, application-code: 182ms)
 GET /vendor/dashboard 200 in 309ms (next.js: 7ms, proxy.ts: 92ms, application-code: 210ms)
 GET /vendor/dashboard 200 in 401ms (next.js: 7ms, proxy.ts: 100ms, application-code: 294ms)
 GET /vendor/dashboard 200 in 640ms (next.js: 247ms, proxy.ts: 135ms, application-code: 258ms)
 GET /vendor/dashboard 200 in 2.5s (next.js: 7ms, proxy.ts: 124ms, application-code: 2.4s)
 GET /vendor/dashboard 200 in 3.2s (next.js: 208ms, proxy.ts: 242ms, application-code: 2.7s)
 GET /vendor/dashboard 200 in 2.3s (next.js: 441ms, proxy.ts: 1283ms, application-code: 562ms)
 GET /vendor/dashboard 200 in 549ms (next.js: 8ms, proxy.ts: 229ms, application-code: 311ms)
 GET /vendor/dashboard 200 in 750ms (next.js: 239ms, proxy.ts: 146ms, application-code: 365ms)
 GET /vendor/dashboard 200 in 679ms (next.js: 227ms, proxy.ts: 161ms, application-code: 291ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 2.9s (next.js: 1816ms, proxy.ts: 94ms, application-code: 974ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1317ms (next.js: 430ms, proxy.ts: 222ms, application-code: 665ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 791ms (next.js: 238ms, proxy.ts: 145ms, application-code: 408ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1352ms (next.js: 313ms, proxy.ts: 186ms, application-code: 853ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 627ms (next.js: 189ms, proxy.ts: 171ms, application-code: 267ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 576ms (next.js: 196ms, proxy.ts: 120ms, application-code: 260ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 723ms (next.js: 222ms, proxy.ts: 187ms, application-code: 315ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 818ms (next.js: 305ms, proxy.ts: 201ms, application-code: 312ms)
 GET /vendor/orders 500 in 203ms (next.js: 10ms, proxy.ts: 176ms, application-code: 17ms)
 GET /vendor/orders 500 in 145ms (next.js: 11ms, proxy.ts: 115ms, application-code: 18ms)
[browser] Uncaught Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20
Expected '</', got 'jsx text'
  59 |           View on map
  60 |         </Link>
> 61 |       </motionless>
     |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 62 |     </article>
     | ^^^^
  63 |   );
  64 | }
  65 |

Parsing ecmascript source code failed

Generated code of loaders [next/dist/build/babel/loader] transform of file content of Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:
./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20
  59 |           View on map
  60 |         </Link>
> 61 |       </motionless>
     |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 62 |     </article>
     | ^^^^
  63 |   );
  64 | }
  65 |

Import traces:
  Client Component Browser:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx [Client Component Browser]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx [Client Component SSR]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/SearchPage.tsx [Server Component]
    ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/app/search/page.tsx [Server Component]


    at <unknown> (Error: ./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20)
    at <unknown> (Error: (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20)
    at <unknown> (./Downloads/code/129/latest/01/bloom-hero/bloom-hero/src/features/search/components/PopUpResultCard.tsx:61:20)
âœ“ Compiled in 1740ms
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1709ms (next.js: 345ms, proxy.ts: 280ms, application-code: 1083ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1263ms (next.js: 206ms, proxy.ts: 135ms, application-code: 923ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 557ms (next.js: 165ms, proxy.ts: 139ms, application-code: 254ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 556ms (next.js: 195ms, proxy.ts: 138ms, application-code: 223ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1181ms (next.js: 231ms, proxy.ts: 171ms, application-code: 779ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 508ms (next.js: 15ms, proxy.ts: 98ms, application-code: 395ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1273ms (next.js: 284ms, proxy.ts: 273ms, application-code: 715ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 663ms (next.js: 225ms, proxy.ts: 152ms, application-code: 286ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 672ms (next.js: 250ms, proxy.ts: 144ms, application-code: 277ms)
âœ“ Compiled in 542ms
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1226ms (next.js: 414ms, proxy.ts: 289ms, application-code: 523ms)
âœ“ Compiled in 432ms
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1305ms (next.js: 436ms, proxy.ts: 232ms, application-code: 637ms)
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
 GET /vendor/orders 200 in 1808ms (next.js: 350ms, proxy.ts: 215ms, application-code: 1243ms)
âœ“ Compiled in 945ms
```