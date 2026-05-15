# Vendor Agent Guide

See also: `src/features/agents.md`.

## Scope
- Single vendor account model at `/vendor/*`.
- `business_type`: `registered` (catalog + orders) | `unregistered` (schedule, gallery, location requests).
- Legacy split **market / pop-up vendor roles** is removed from UI and routing.

## Routes (`src/app/(vendor)/vendor/`)
- Dashboard, products, orders, profile, schedule, settings — all under `/vendor/*`.
- Public customer profile: `/vendors/[vendorId]` (not under this group).

## Redirects
- Legacy `/market/*` and `/pop-up/*` URLs redirect to `/vendor/*` via `next.config.ts`.
- Legacy public `/market/:id` and `/pop-up/:id` redirect to `/vendors/:id`.

## Feature folders
- `src/features/vendors/` — shared vendor profile, dashboard, application, settings shell.
- `src/features/pop-up/` — **product features** (schedule, gallery, map, location requests), not a separate vendor role. All vendors may use these; registered vendors also get catalog/orders when approved.

## Auth
- Same `/login` as other roles; post-login vendors go to `/vendor/dashboard`.

## Rules
- Gate catalog/orders with `canManageCatalog(businessType)` and approval status.
- Use `getVendorIdByOwner()` — do not filter by legacy `vendor_type`.
- `normalizeBusinessType()` maps old application values (`market`, `pop-up`) to `registered` / `unregistered` when reading legacy rows.
- Do not add `/vendor/market/*` or `/vendor/pop-up/*` routes.

## Layout
- `(vendor)/layout.tsx` — vendor auth + `VendorSuspensionGate`.
- Page-level `VendorDashboardSidebarCard` for in-page nav; no duplicate route trees.
