# Bloom Hero — database SQL (current)

This folder is the **canonical apply set** for the live database. Run scripts in the Supabase SQL editor (hosted or local), **one file at a time**, in order.

Historical drafts, archives, and the full schema dump stay in `sql-changes/`.

## Apply order (typical hosted DB)

| Step | File | Required? |
|------|------|-------------|
| 1 | `01-rls-helpers.sql` | **Yes** — fixes `permission denied for function is_admin` |
| 2 | `02-rls-policies.sql` | **Yes** — vendor/customer RLS the app expects (now also **enables RLS** on all affected tables; fixes advisor “Policy Exists RLS Disabled”) |
| 3 | `03-fk-indexes.sql` | Recommended — FK covering indexes |
| 4 | `04-database-hardening.sql` | Recommended — trigger `search_path`, anon table revokes |
| 5 | `05-postgrest-timezone.sql` | Optional — less `pg_timezone_names` load on schema reload |

**Optional** (only if missing on your DB):

| File | When |
|------|------|
| `optional/01-vendor-business-type.sql` | Still on legacy `vendor_type` / no `business_type` |
| `optional/02-vendor-suspension-appeals.sql` | Table `vendor_suspension_appeals` does not exist |
| `optional/03-disable-pg-graphql.sql` | Linter GraphQL exposure warnings; app uses REST only |

**Schema reference** (do not run as a single apply): `sql-changes/all-schema.sql` or `supabase/migrations/20260509200759_remote_schema.sql`.

---

## Briefing: what each area does

### 1. RLS helpers (`01-rls-helpers.sql`)

**Problem solved:** Login, home map, and any `users` / `vendors` select fail with `permission denied for function is_admin`.

**What it does:**

- Creates `private` schema with `SECURITY DEFINER` helpers: `is_admin`, `is_customer`, `is_vendor`, `current_user_role`, `current_vendor_id`, `can_read_public_vendor_catalog`, `is_approved_vendor_id`.
- Recreates **public wrappers** that delegate to `private.*` and grants `EXECUTE` to `anon` + `authenticated` (RLS policies still reference `public.is_admin()` in many places).
- Revokes `EXECUTE` from `PUBLIC` only so `/rest/v1/rpc/is_admin` is not open to the world (linter 0029).

### 2. RLS policies (`02-rls-policies.sql`)

**What it does:** Replaces many overlapping permissive policies with **one policy per command** (OR-combined rules). Uses `private.*` helpers with `(select …)` for initplan performance.

**Tables covered:** `orders`, `order_items`, `users`, `vendors`, `products`, `reviews`, `popup_locations`, `popup_location_requests`, `vendor_applications`, `vendor_suspension_appeals`.

**Product rules (app behaviour):**

- **Public catalog** (anon + customers): approved vendors, products, pop-up schedules, approved reviews — via `can_read_public_vendor_catalog()`.
- **Vendors** cannot browse other shops through the API (app also guards `/vendors/:id`).
- **Customers** own orders/cart; **vendors** own shop rows and their orders.
- **Admins** full access where policies include `is_admin()`.

### 3. FK indexes (`03-fk-indexes.sql`)

Indexes on foreign-key columns used in joins and cascades (`order_items`, `products`, `reviews`, `popup_*`, etc.). Safe to re-run.

### 4. Database hardening (`04-database-hardening.sql`)

- Sets `search_path TO public` on trigger functions (`handle_new_user`, category limit, `updated_at` triggers).
- Re-affirms `GRANT EXECUTE` on public RLS wrappers (must not revoke from `authenticated`/`anon`).
- `REVOKE ALL` from `anon` on sensitive tables: `orders`, `customers`, `activity_logs`, `vendor_applications`, etc. (guests use RLS on catalog tables only).

### 5. PostgREST timezone (`05-postgrest-timezone.sql`)

Sets `pgrst.db_timezone_enabled = false` on `authenticator` to stop expensive `pg_timezone_names` queries on every schema reload. Bloom Hero does not use PostgREST timezone headers.

---

## Optional migrations

### `optional/01-vendor-business-type.sql`

- Adds `business_type` enum: `registered` | `unregistered`.
- Migrates legacy `vendor_type` (`market`/`handcrafted` → registered, `pop-up` → unregistered).
- `vendors_owner_id_key` unique per owner.

Run once if the app expects `business_type` but the column is missing.

### `optional/02-vendor-suspension-appeals.sql`

Creates `vendor_suspension_appeals` + indexes + base RLS. After this, re-run `02-rls-policies.sql` so `vendor_suspension_appeals_select` is consolidated.

### `optional/03-disable-pg-graphql.sql`

Drops `pg_graphql` if you do not use GraphQL. REST + RLS remain the API.

---

## What is already in base schema (no extra file needed)

These are in `all-schema.sql` / remote migration — **not** duplicated here:

- `orders.payment_method`, `orders.receipt_proof_url`
- Order statuses: `pending`, `to_pay`, `to_ship`, `completed`, `cancelled`, etc.
- Vendor profile columns: `location_text`, `phone_number`, `opens_at`, `closes_at`, `about`
- Checkout flow referenced in app (`to_pay` / online + COD) — no separate `add_order_payment_flow.sql` required if schema is up to date

---

## Mapping: old `sql-changes/` → this folder

| Old file (`sql-changes/`) | Use instead |
|---------------------------|-------------|
| `apply-rls-helpers-private-schema.sql` | `01-rls-helpers.sql` |
| `apply-rls-private-helper-grants-fix.sql` | Same as `01` (emergency duplicate) |
| `apply-rls-helper-execute-grants.sql` | Same as `01` (legacy public-only grants) |
| `apply-rls-consolidate-permissive-policies.sql` | `02-rls-policies.sql` |
| `apply-rls-initplan-fixes.sql` | Superseded by `02` if you run full consolidate |
| `apply-vendor-customer-access-rls.sql` | Superseded by `01` + `02` (greenfield only) |
| `apply-fk-indexes.sql` | `03-fk-indexes.sql` |
| `apply-database-linter-fixes.sql` | `04-database-hardening.sql` |
| `apply-postgrest-timezone-fix.sql` | `05-postgrest-timezone.sql` |
| `apply-vendor-business-type.sql` | `optional/01-vendor-business-type.sql` |
| `apply-vendor-suspension-appeals.sql` | `optional/02-vendor-suspension-appeals.sql` |
| `apply-disable-pg-graphql.sql` | `optional/03-disable-pg-graphql.sql` |
| `all-schema.sql` | Reference only |
| `CHANGES.md`, `conversation-summary.md`, `archives/` | History / notes only |

---

## Quick verification

```sql
-- Helpers callable
SELECT public.is_admin(), public.can_read_public_vendor_catalog();

-- Business type (if migrated)
SELECT business_type, count(*) FROM public.vendors GROUP BY 1;

-- Login: sign in as customer — no is_admin error
```

---

## If something breaks

| Symptom | Action |
|---------|--------|
| `permission denied for function is_admin` | Re-run `01-rls-helpers.sql` |
| `permission denied` / empty catalog after policies | Re-run **`01` then `02`** — `02` now runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on every table that has consolidated policies |
| `permission denied for table orders` (often twice on home/search) | Run **`sql-changes/fix-orders-table-access.sql`** — step **`04`** used to `REVOKE ALL` on `orders` from `anon`, which blocks RLS entirely; best-sellers needs `GRANT SELECT` + completed-order policies |
| Checkout mentions missing columns | Compare DB to `sql-changes/all-schema.sql` `orders` table |
| Slow Supabase stats / schema reload | Run `05-postgrest-timezone.sql` |

Do **not** put these under `supabase/migrations/` unless you intentionally version them for CI; they are manual hosted-DB scripts.

---

## Production cutover (from `migrations_backup/20260510000100_remote_schema.sql`)

Your production mirror is **not** the same as a sandbox that already ran `sql/01`–`02`. Expect these gaps on prod:

| Area | Production mirror | After `sql/` apply |
|------|-------------------|-------------------|
| `business_type` | `vendor_type` enum | `registered` / `unregistered` (`optional/01`) |
| RLS on catalog | **Off** on `vendors`, `products`, `reviews`, `popup_locations` (GRANT ALL to anon) | **On** — approved-vendor catalog rules |
| RLS helpers | `public.is_admin` only, broad GRANT | `private.*` + public wrappers |
| Appeals table | Missing | `optional/02` + re-run `02` |
| Checkout columns | `payment_method`, `to_pay` already present | No extra migration |

**Do not** run `all-schema.sql` or the full remote dump on production — use incremental `sql/` scripts only.

### Recommended prod order

1. **Backup** — Supabase dashboard backup or `pg_dump` before any change.
2. **Pre-check** (SQL editor on prod):

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name IN ('vendor_type', 'business_type');
SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('vendors', 'products', 'orders');
```

3. **`optional/01-vendor-business-type.sql`** — if still on `vendor_type`.
4. **`optional/02-vendor-suspension-appeals.sql`** — if appeals feature is live.
5. **`01-rls-helpers.sql`** then **`02-rls-policies.sql`** — schedule a quiet window; this changes who can read what.
6. **`03-fk-indexes.sql`**, **`04-database-hardening.sql`**, **`05-postgrest-timezone.sql`**.
7. **Deploy app** with `SUPABASE_SERVICE_ROLE_KEY` on the server (public catalog reads) and `business_type` code.
8. **Smoke test** — anon home/map, customer login, cart checkout, vendor own dashboard, admin.

### Deploy pairing

- Run **`optional/01` before** (or in the same release as) app code that reads `business_type`.
- Run **`01` + `02` before or with** the app build that assumes vendor/customer RLS (not wide-open GRANT ALL).

Keep `20260510000100_remote_schema.sql` as the rollback reference snapshot, not as something to re-apply.
