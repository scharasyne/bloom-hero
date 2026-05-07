# Bloom Hero Agent Guide

## Scope
- Keep vendor profile updates small and UI-first.
- Prefer modal entry points for profile editing.
- Do not introduce long or verbose code blocks.

## Vendor Profile Structure
- Common fields: profile picture (stored on `users.profile_photo_url`), location, phone number, schedule time, preview as customer, edit profile modal.
- Tabs for both `pop-up` and `market`: `Reviews`, `About`.
- `pop-up` specific tabs: `Schedule`, `Gallery`.
- `market` specific tab: `Bouquets`.

## Data Rules
- Phone number format: `+63` followed by 9 digits.
- Store searchable location text and optional coordinates.
- Keep shared profile fields in `vendors` except profile photo in `users`.

## UI Rules
- `Edit profile` opens a modal shell first.
- Add form fields inside modal only when explicitly requested.
- Keep copy short and consistent across vendor/customer profile pages.

## Schema Reference
- If unfamiliar with table/column state, check `sql-changes/all-schema.sql` first before making DB-related changes.
