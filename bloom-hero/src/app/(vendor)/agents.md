# Vendor business-type transition

## Goal
- One vendor account per owner.
- One vendor dashboard at `/vendor/*`.
- `business_type` (`registered` | `unregistered`) replaces split market/pop-up vendor accounts.
- Registered vendors can manage catalog products and receive orders.
- All vendors can manage pop-ups: schedule, gallery, location requests, profile.

## Transition notes
- Full file list and SQL mapping: `sql-changes/CHANGES.md`
- Local schema reference: `sql-changes/all-schema.sql` (`registered` | `unregistered` only).
- Manual DB apply script: `sql-changes/apply-vendor-business-type.sql` (not run by Supabase CLI).
- Shared types: `src/features/vendors/types.ts` (`BusinessType`).
- Owner-scoped vendor reads: `getVendorCommonProfileByOwner`, `getVendorStatusByOwner`, `getVendorProfileByOwnerId`, `getVendorIdByOwner`.
- Unified dashboard routes: `src/app/(vendor)/vendor/*`.
- Sidebar hides Products and Orders when `businessType` is `unregistered`.
- Server gates on `/vendor/products`, `/vendor/add-product`, `/vendor/orders`, product actions, and order queries.
- Legacy `/market/*` and `/pop-up/*` vendor pages redirect to `/vendor/*`.
- Login, auth callback, and forgot-password send vendors to `/vendor/dashboard`.
- Admin approval writes `business_type` when creating a vendor row.

## Still legacy / follow-up
- `vendors.vendor_type` and `vendor_applications.vendor_type` remain for application intake and admin review.
- Customer-facing routes still split: `src/app/(vendor)/market/[vendorId]`, `src/app/(vendor)/pop-up/[vendorId]`, search, best sellers, navbar session fields.
- Vendor application form still asks market vs pop-up; map to registered vs unregistered on submit/approval.
- Settings still use pop-up settings UI for every vendor.
- `src/features/vendors/components/VendorProfile.tsx` and `src/lib/vendors/**` still reference legacy vendor type paths.
- Drop `vendor_type` from `vendors` after data and UI migration.

## Directories to touch next
- `src/app/(vendor)/market` and `src/app/(vendor)/pop-up` — customer previews and redirects only.
- `src/app/(customer)` — vendor discovery and product ordering for registered vendors.
- `src/app/admin/vendor-applications` — application labels and approval mapping.
- `src/features/vendors/components/VendorApplicationForm.tsx` — business registration choice.
- `src/components/navbar.tsx` — session uses `business_type`.
- `src/app/search`, `src/app/api/search`, `src/lib/best-sellers.ts` — public vendor metadata.
- `src/features/orders`, `src/features/products` — remove remaining `vendor_type` filters.
- `supabase/migrations` still holds the legacy remote snapshot; edit vendor model in `sql-changes/` instead.

## Rules while transitioning
- Do not add parallel market/pop-up vendor dashboards.
- Gate catalog and order features with `canManageCatalog` in `src/features/vendors/utils/catalogAccess.ts`.
- Prefer `owner_id` lookups over `vendor_type` / `business_type` filters except when gating registered-only behavior.
