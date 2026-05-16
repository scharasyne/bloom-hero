# Admin Agent Guide

See also: `src/features/agents.md` (shared feature-folder rules).

## Scope
- One admin dashboard at `/admin/*` inside the `(admin)` route group.
- Route files orchestrate only; data and UI live in `src/features/admin/`.
- Approve applications with `business_type` (`registered` | `unregistered`).

## Routes (`src/app/(admin)/admin/`)
| Path | File |
|------|------|
| `/admin/dashboard` | `admin/dashboard/page.tsx` |
| `/admin/vendor-applications` | `admin/vendor-applications/page.tsx` |
| `/admin/vendors` | `admin/vendors/page.tsx` |
| `/admin/review-moderation` | `admin/review-moderation/page.tsx` |
| `/admin/activity-logs` | `admin/activity-logs/page.tsx` |

`/admin/suspension-appeals` redirects to `/admin/vendors` (appeals handled in vendor profile modal).

## Auth
- Same sign-in as all roles: `/login` (`src/app/(auth)/login/page.tsx`).
- Post-login routing is role-based in `src/features/auth/actions/actions.ts` (`resolvePostLoginDestination`); admins go to `/admin/dashboard`.
- Sign out goes to `/login`. Do not add `/admin-log-in` or a separate admin auth route.

## Layout
- `src/app/(admin)/layout.tsx` — `requireRole(["admin"])`, loads `getAdminNavAlertCounts`, renders `AdminSidebarNav`.
- Do not duplicate layout padding or sidebar in page files.

## Feature ownership (`src/features/admin/`)

### queries/
- `getAdminDashboardData.ts` — dashboard metrics and moderation queue.
- `getAdminNavAlertCounts.ts` — sidebar/header alert badge counts.
- `getSubmittedVendorApplications.ts` — admin-gated application list.
- `getReviewModerationReviews.ts`, `getReviewOrderDetails.ts` — review moderation.

### actions/
- `logActivity.ts` — activity log writes.
- `approveVendorApplication.ts`, `rejectVendorApplication.ts`
- `setVendorSuspensionStatus.ts`, `reviewVendorSuspensionAppeal.ts`
- `updateReviewStatus.ts`

### components/
- `AdminSidebarNav.tsx`, `AdminSidebarAlertCard.tsx` — shell nav (desktop sidebar + mobile bottom icons).
- `AdminDashboardPageView.tsx`, `AdminVendorProfileModal.tsx`
- `ApplicationCard.tsx`, `ActivityLogCard.tsx`

### utils/
- `ensureAdmin.ts` — use everywhere; do not copy.
- `adminNavConfig.ts` — nav item constants.
- `adminDashboardConstants.ts`, `formatAdminCurrency.ts`, `reviewModeration.ts`, `vendorApplicationApproval.ts`

### types.ts
- Admin-specific types (`AdminNavAlertCounts`, `ReviewModerationRecord`, etc.).

### Delegated (do not duplicate)
- `src/features/vendors/queries/listSubmittedVendorApplications.ts` — raw application list.
- Vendor suspension/appeals on admin vendors page via `useVendors` + `AdminVendorProfileModal`.

## UI rules
- Do not add `src/components/admin/` — all admin UI is under `src/features/admin/components/`.
- Root `NavBar` is hidden on `/admin/*` via `NavBarShell`.

## Safety
- Gate every admin mutation with `ensureAdmin()`.
- No parallel route tree under `src/app/admin/` — use `(admin)` only.
