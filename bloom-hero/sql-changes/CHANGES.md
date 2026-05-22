# Vendor business type transition

## SQL model

- Manual reference: `sql-changes/all-schema.sql`
- Manual apply script: `sql-changes/apply-vendor-business-type.sql`
- `public.business_type` enum: `registered`, `unregistered`
- Legacy `public.vendor_type` values map as:
  - `market`, `handcrafted` → `registered`
  - `pop-up` → `unregistered`
- `vendors` and `vendor_applications` use `business_type`
- One vendor row per owner (`vendors_owner_id_key`)

Run `apply-vendor-business-type.sql` in the local Supabase SQL editor after checking duplicate `owner_id` rows.

## App rules

- One vendor dashboard at `/vendor/*`
- Registered vendors: products, orders, catalog dashboard metrics
- All vendors: pop-up schedule, gallery, location requests, profile
- Unregistered vendors: no product list, add product, or vendor orders

## Code updates

### Types and helpers
- `src/features/vendors/types.ts`
- `src/features/vendors/utils/normalizeBusinessType.ts`
- `src/features/vendors/utils/catalogAccess.ts`
- `src/types/index.ts` (`VendorApplicationRecord.business_type`)

### Vendor application
- `src/features/vendors/components/VendorApplicationForm.tsx`
- `src/features/vendors/actions/submitVendorApplication.ts`
- `src/features/vendors/actions/saveVendorApplicationDraft.ts`
- `src/features/vendors/actions/upsertVendorOwnerById.ts`
- `src/features/vendors/queries/getVendorApplicationDraft.ts`
- `src/features/vendors/queries/listSubmittedVendorApplications.ts`
- `src/features/vendors/utils/validateVendorApplication.ts`

### Admin
- `src/app/admin/vendor-applications/actions.ts`
- `src/components/admin/ApplicationCard.tsx`
- `src/app/admin/vendors/page.tsx`
- `src/hooks/useVendors.ts`

### Auth and session
- `src/features/auth/queries/getSession.ts`
- `src/features/auth/actions/actions.ts`
- `src/features/auth/components/Login.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/forgot-password/page.tsx`
- `src/components/navbar.tsx`

### Vendor dashboard
- `src/app/(vendor)/vendor/*`
- `src/features/vendors/components/VendorDashboardSidebarCard.tsx`
- `src/features/vendors/queries/getVendorCommonProfile.ts`
- `src/features/vendors/queries/getVendorStatus.ts`
- `src/features/vendors/queries/getVendorProfileByOwnerId.ts`
- Legacy `/market/*` and `/pop-up/*` vendor routes redirect to `/vendor/*`

### Catalog and orders
- `src/features/vendors/actions/actions.ts`
- `src/features/products/components/ListProduct.tsx`
- `src/features/products/components/AddProduct.tsx`
- `src/features/orders/queries/getVendorOrdersPage.ts`
- `src/features/orders/components/VendorOrdersTable.tsx`
- `src/app/actions/order-status.ts`

### Customer-facing vendor pages
- `src/features/vendors/queries/getVendorProfile.ts`
- `src/features/vendors/interface.ts`
- `src/features/vendors/components/CustomerVendorProfile.tsx`
- `src/app/(vendor)/market/[vendorId]/page.tsx`
- `src/app/(vendor)/pop-up/[vendorId]/page.tsx`
- `src/app/search/page.tsx`
- `src/app/api/search/route.ts`
- `src/lib/best-sellers.ts`
- `src/components/BestSellersSection.tsx`
- `src/features/products/queries/getProductById.ts`

### Pop-up actions
- `src/lib/vendors/pop-up/actions.ts` (owner-scoped vendor lookup)

## Still legacy or optional cleanup

- `src/lib/vendors/dashboard/actions.ts` duplicate of feature dashboard query
- `src/lib/mockData.ts` admin mock rows still use old labels
- `src/features/vendors/components/settings/*` still split market/pop-up settings UI
- `supabase/migrations/20260509200759_remote_schema.sql` still defines legacy `vendor_type` until production is migrated
- Product search flower rows may still expose legacy `vendor_type` from joined data until queries are updated

## Verification

```sql
SELECT business_type, count(*) FROM public.vendors GROUP BY 1;
SELECT business_type, count(*) FROM public.vendor_applications GROUP BY 1;
```

After applying SQL, sign in as vendor and confirm `/vendor/dashboard`, registered-only tabs, and application/admin labels use `registered` / `unregistered`.

## Vendor vs customer access (RLS)

Manual apply: `sql-changes/apply-vendor-customer-access-rls.sql`

- Enables RLS on `users`, `vendors`, `products`, `reviews`, `orders`, `order_items`, `popup_locations`, `popup_location_requests`, `vendor_applications`.
- Public catalog reads (approved vendors, products, schedules, approved reviews) are limited to **anon + customers** via `can_read_public_vendor_catalog()` — vendors cannot browse other shops through the API.
- `popup_location_requests` inserts require `is_customer()` and an existing `customers` row.
- `customers` insert policy requires customer role (blocks vendors from creating a customer row to bypass checks).

App guards:

- `/vendors/:id` — vendors redirected unless it is their own shop (preview).
- Location request API/action — customers only.
- Map/search profile links hidden for logged-in vendors.
- `/cart` — vendors redirected to `/vendor/dashboard` in `src/proxy.ts`.

## Database linter (performance)

Apply in Supabase SQL editor:

1. **`apply-rls-initplan-fixes.sql`** (run once) — all `auth_rls_initplan` policy fixes, `can_read_public_vendor_catalog()`, vendor-access + suspension policy names, legacy policy names, drop duplicate `unique_vendor_owner` constraint.
2. `apply-vendor-customer-access-rls.sql` — only if setting up RLS from scratch (full table set; policies match initplan script).
3. `apply-vendor-suspension-appeals.sql` — only if the appeals table does not exist yet.

Also available: `apply-database-linter-fixes.sql`, `apply-rls-helper-execute-grants.sql` (run if login fails with `permission denied for function is_admin`), `apply-disable-pg-graphql.sql`, `apply-postgrest-timezone-fix.sql`, `apply-fk-indexes.sql` (missing FK covering indexes).

**Unused index (INFO):** linter may flag indexes with zero scans in dev. Keep them unless you have confirmed they are redundant; several support admin/search features not exercised locally yet.

**Consolidated permissive policies:** `apply-rls-consolidate-permissive-policies.sql` (run after initplan fixes) — one policy per action with OR-combined rules. Also baked into `apply-vendor-customer-access-rls.sql` for fresh installs.

**Dev terminal log archive:** `sql-changes/archives/dev-terminal-log-2026-05-16.txt`
