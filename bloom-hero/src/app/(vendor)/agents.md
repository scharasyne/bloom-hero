# Bloom Hero Vendor Agent Guide

## Scope
- Transfer relevant query/data-access code from `src/app/(vendor)` into the matching `src/features/<feature>` folder.
- Keep app route files focused on orchestration and UI; move only queries, database calls, database fetches, and other read-only data access into `src/features`.
- Keep each file focused on a single purpose and a single feature.
- Include utility code in the routing decision, not just feature-specific query/action code.
- Organize vendor-specific UI components in `src/app/(vendor)/components/` or feature-specific component folders.

## Safety Rule
- Do not change the behavior, wording, logic, or data shape of any file during this transfer.
- The only allowed work is breaking files apart, moving code to the correct feature folder, and sorting it into the right query/action/util location.
- If a file needs to be split, preserve the original implementation exactly in the new file unless the split itself requires a minimal import path adjustment.

## Routing Rules for Server/DB Code
- Put read-only functions in `queries/`.
- Put write functions in `actions/`.
- Put reusable stateless helpers in `utils/` when they do not read or write feature data.
- Treat these as write functions: insert, update, delete, upload, revalidate, redirect, cache mutation, status changes, and any other side-effecting operation.
- Treat these as query functions: fetch, list, get, find, derive, map, and any function that only reads data and returns it without changing state.
- If a file in `src/app/(vendor)` contains multiple functions with different purposes, split it into separate files so each function moves to the correct feature folder.
- Do not keep unrelated read and write functions in the same feature file.

## Placement Rules for Server/DB Code
- Use the feature that owns the data or behavior:
	- `src/features/vendors/queries` for vendor reads.
	- `src/features/vendors/actions` for vendor writes.
	- `src/features/pop-up/queries` for pop-up reads.
	- `src/features/pop-up/actions` for pop-up writes.
	- `src/features/products/queries` and `src/features/products/actions` for product data.
	- `src/features/orders/queries` and `src/features/orders/actions` for order data.
	- `src/features/reviews/queries` for review reads.
	- `src/features/users/queries` and `src/features/users/actions` for user profile and account data.
	- `src/features/auth/actions` for auth flows that change session state.
- Use `src/features/<feature>/utils` only when a helper is specific to that feature and does not belong in queries or actions.
- Keep feature-owned types in `src/features/<feature>/types.ts` and import them into the files that need them.
- Do not duplicate type definitions across queries, actions, utils, or component files.
- Keep truly shared helpers outside feature folders only when they are used across multiple features and do not belong to one domain.

## Routing Rules for Client-Side Components
- **Route-level components**: Keep in `src/app/(vendor)/<route>/components/` for route-specific UI.
- **Reusable vendor components**: Move to `src/features/<feature>/components/` if used across multiple vendor routes.
- **Shared vendor components**: Keep in `src/app/(vendor)/components/` only if used within multiple routes but not feature-specific.
- **Feature-scoped components**: Place in `src/features/<feature>/components/` when the component is tightly coupled to a specific feature (e.g., pop-up dashboard, market analytics).
- Each component should have a single responsibility and clear naming.

## Component Organization Pattern
```
src/app/(vendor)/
├── components/           # Shared vendor components (layout shells, sidebars)
│   ├── VendorSidebar.tsx
│   └── DashboardLayout.tsx
├── market/
│   ├── components/       # Market-route specific components
│   │   └── MarketHeader.tsx
│   └── page.tsx
└── pop-up/
    ├── components/       # Pop-up route specific components
    │   └── PopUpCard.tsx
    └── page.tsx

src/features/pop-up/components/
├── PopUpDashboard.tsx     # Feature-level UI specific to pop-ups
├── PopUpForm.tsx
└── PopUpSchedule.tsx

src/features/products/components/
├── ProductCard.tsx        # Used by both customer and vendor features
├── ProductGallery.tsx
└── BouquetPreview.tsx
```

## Transfer Workflow

### Step 1: Identify Server/DB Code
- Scan `src/app/(vendor)/_actions/` for server actions and mutations.
- Scan route files for direct database queries.
- Identify which feature owns each piece of code.

### Step 2: Move Server/DB Code
- Create or update `src/features/<feature>/queries/` for read-only data access.
- Create or update `src/features/<feature>/actions/` for mutations and side effects.
- Update imports in route files to call from feature folders.

### Step 3: Organize Components
- Audit all components in `src/app/(vendor)/components/` and route-specific folders.
- Identify which are truly route-specific vs. feature-level vs. reusable across routes.
- Move feature-level components to `src/features/<feature>/components/`.
- Keep route-specific UI in `src/app/(vendor)/<route>/components/`.

### Step 4: Update Imports
- Route files import from `src/features/<feature>/queries`, `src/features/<feature>/actions`.
- Components import from co-located or feature-level `components/` folders.
- Avoid circular dependencies: queries/actions should never import components.

## Transfer Notes
- If you find redundancies or duplicates while moving code, call them out explicitly and include the source file each duplicate came from.
- Preserve behavior and data shape when splitting or relocating code; only adjust import paths when needed.
- Document any vendor-specific utilities that cannot be moved to a single feature (place in `src/features/vendors/utils`).

## Split Example
- If `src/app/(vendor)/_actions/` exports `getVendorDashboard` and `updateVendorSchedule`:
	- Move `getVendorDashboard` → `src/features/vendors/queries/getVendorDashboard.ts`
	- Move `updateVendorSchedule` → `src/features/vendors/actions/updateVendorSchedule.ts`
- If one vendor route has market-specific components, create:
	- `src/app/(vendor)/market/components/MarketAnalytics.tsx` (route-specific)
	- Move pop-up dashboard to `src/features/pop-up/components/PopUpDashboard.tsx` (feature-level)

## Outcome
- The result should make it obvious from the path whether:
  - A function only reads, performs a mutation, or is a reusable helper
  - Which feature owns it
  - Whether a component is route-specific, feature-level, or shared across vendor areas
- All vendor route files remain focused on UI orchestration and data fetching from features.
- No database queries or server actions live in route files; they live in appropriate feature folders.
