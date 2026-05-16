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
