# Bloom Hero Agent Guide

## Scope
- Transfer relevant query/data-access code from `src/app` into the matching `src/features/<feature>` folder.
- Keep app route files focused on orchestration and UI; move only queries, database calls, database fetches, and other read-only data access into `src/features`.
- Keep each file focused on a single purpose and a single feature.
- Include utility code in the routing decision, not just feature-specific query/action code.

## Safety Rule
- Do not change the behavior, wording, logic, or data shape of any file during this transfer.
- The only allowed work is breaking files apart, moving code to the correct feature folder, and sorting it into the right query/action/util location.
- If a file needs to be split, preserve the original implementation exactly in the new file unless the split itself requires a minimal import path adjustment.

## Routing Rules
- Put read-only functions in `queries/`.
- Put write functions in `actions/`.
- Put reusable stateless helpers in `utils/` when they do not read or write feature data.
- Treat these as write functions: insert, update, delete, upload, revalidate, redirect, cache mutation, status changes, and any other side-effecting operation.
- Treat these as query functions: fetch, list, get, find, derive, map, and any function that only reads data and returns it without changing state.
- If a file in `src/app` contains multiple functions with different purposes, split it into separate files so each function moves to the correct feature folder.
- Do not keep unrelated read and write functions in the same feature file.

## Placement Rules
- Use the feature that owns the data or behavior:
	- `src/features/vendors/queries` for vendor reads.
	- `src/features/vendors/actions` for vendor writes.
	- `src/features/pop-up/queries` for pop-up reads.
	- `src/features/pop-up/actions` for pop-up writes.
	- `src/features/products/queries` and `src/features/products/actions` for product data.
	- `src/features/customers/queries` and `src/features/customers/actions` for customer data.
	- `src/features/reviews/queries` and `src/features/reviews/actions` for review data.
	- `src/features/users/queries` and `src/features/users/actions` for user profile and account data.
	- `src/features/auth/actions` for auth flows that change session state.
- Use `src/features/<feature>/utils` only when a helper is specific to that feature and does not belong in queries or actions.
- Keep feature-owned types in `src/features/<feature>/types.ts` and import them into the files that need them.
- Do not duplicate type definitions across queries, actions, utils, or component files.
- Keep truly shared helpers outside feature folders only when they are used across multiple features and do not belong to one domain.

## Transfer Notes
- If you find redundancies or duplicates while moving code, call them out explicitly and include the source file each duplicate came from.
- Preserve behavior and data shape when splitting or relocating code; only adjust import paths when needed.

## Split Example
- If one app file exports `getVendorProfile` and `updateVendorProfile`, create:
	- `src/features/vendors/queries/getVendorProfile.ts`
	- `src/features/vendors/actions/updateVendorProfile.ts`
- If one app file exports several unrelated reads, create one query file per function.
- If one app file exports several unrelated mutations, create one action file per function.

## Outcome
- The result should make it obvious from the path whether a function only reads, performs a mutation, or is a reusable helper, and which feature owns it.

## Routing Rules for Client-Side Components
- **Route-level components**: Keep in `src/app/(customer)/<route>/components/` for route-specific UI.
- **Reusable customer components**: Move customer-facing, reusable components to `src/features/customers/components/`.
- **Review-related components**: Move components whose primary purpose is reviews, ratings, or comments to `src/features/reviews/components/`.
- **Shared components**: Keep truly shared UI in `src/components/` only if used by both customer and vendor features.
- **Feature-scoped components**: Place in `src/features/<feature>/components/` when the component is tightly coupled to a specific feature (e.g., cart summary → `src/features/cart/components/`, product display → `src/features/products/components/`).
- Each component should follow single-responsibility and clear naming conventions.

## Component Organization Pattern
```
src/app/(customer)/
├── components/           # Small route helpers and shells used only in customer routes
│   ├── CustomerHeader.tsx
│   └── CustomerShell.tsx
├── cart/
│   ├── components/       # Cart-route specific components (kept here if only used by this route)
│   │   └── CartSummary.tsx
│   └── page.tsx
└── profile/
    ├── components/       # Profile route specific components
    │   └── ProfilePreview.tsx
    └── page.tsx

src/features/customers/components/
├── CustomerCard.tsx       # Reusable customer-facing UI (move customer-* components here)
├── ProfilePreview.tsx
└── CustomerOrdersList.tsx

src/features/reviews/components/
├── ReviewList.tsx         # All review-related components (ratings, comments)
├── ReviewForm.tsx
└── ReviewBadge.tsx

src/features/cart/components/
├── CartItem.tsx
├── CartTotals.tsx
└── CartCheckoutForm.tsx

src/features/products/components/
```

## Transfer Workflow

### Step 1: Identify Server/DB Code
- Scan `src/app/(customer)/` route files for direct database queries and server calls.
- Identify which feature owns each piece of code (products, cart, customers, reviews).

### Step 2: Move Server/DB Code
- Create or update `src/features/<feature>/queries/` for read-only data access.
- Create or update `src/features/<feature>/actions/` for mutations and side effects.
- Update route files to import from feature folders.

### Step 3: Organize Components
- Audit components in `src/app/(customer)/components/` and route-specific folders.
- Move customer-specific, reusable components to `src/features/customers/components/`.
- Move review-related components to `src/features/reviews/components/`.
- Keep route-only UI in `src/app/(customer)/<route>/components/`.

### Step 4: Update Imports
- Route files import from `src/features/<feature>/queries`, `src/features/<feature>/actions`.
- Components import from co-located or feature-level `_components/` folders.
- Avoid circular dependencies: queries/actions must not import components.

## Split Example
- If `src/app/(customer)/cart/actions.ts` exports `getCartItems` and `updateCartItem`:
		- Move `getCartItems` → `src/features/cart/queries/getCartItems.ts`
		- Move `updateCartItem` → `src/features/cart/actions/updateCartItem.ts`

## Transfer Notes
- If you find redundancies or duplicates while moving code, call them out explicitly and include the source file each duplicate came from.
- Preserve behavior and data shape when splitting or relocating code; only adjust import paths when needed.

## Outcome
- The result should make it obvious from the path whether:
	- A function only reads, performs a mutation, or is a reusable helper
	- Which feature owns it
	- Whether a component is route-specific, feature-level, or shared across customer areas
- All customer route files remain focused on UI orchestration and data fetching from features.
- No database queries or server actions live in route files; they live in appropriate feature folders.
- Components are organized by ownership: route-specific in route folders, feature-level in `src/features/<feature>/components/`.
