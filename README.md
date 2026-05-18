# BloomHero

BloomHero is an online marketplace for flower vendors and buyers in the Philippines. It brings fragmented social media listings into a centralized catalog with search, reviews, and vendor tooling, while supporting pop-up vendors through a map-based location feature.

## Why it exists

The local floriculture market is growing, but vendors rely on unstructured social media listings. Buyers struggle with discovery, trust, and vendor comparisons. BloomHero addresses this by providing structured listings, vendor profiles, and a transparent review system.

## Key features

- Vendor registration and profile management
- Product listing and categorization (bouquets, potted plants, handcrafted items)
- Search and filtering across vendors and products
- Customer reviews and ratings
- Order tracking and vendor order management
- Pop-up vendor map and location requests
- Admin dashboard for approvals and platform oversight

## Tech stack

- Next.js (App Router), React, TypeScript
- Supabase (auth, database, storage)
- Tailwind CSS
- Playwright for end-to-end tests
- Leaflet for map UI

## Getting started

### Prerequisites

- Node.js 20+ recommended
- Supabase project (hosted or local)

### Install

```bash
npm install
```

### Environment Variables
Create a `.env.local` file at the repo root. Minimum keys:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is required for admin workflows (vendor approvals, public catalog reads when RLS is enabled).
- If you use a local database, add `DATABASE_URL` as needed.

### Run the app
```bash
npm run dev
```
Open http://localhost:3000

## Database setup (Supabase)
The canonical SQL apply set is in the `sql/` folder. Apply the scipts one at a time in order, using the Supabase SQL editor.

See the detailed guidance in `sql/README.md`.

### Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production build locally
- `npm run lint` - lint

## Project structure (high level)
- `src/app/` - Next.js App Router routes and UI
- `src/components/` - shared UI components
- `src/features/` - feature modules (admin, auth, vendors, orders, etc.)
- `src/lib/` - helpers, Supabase clients
- `sql/` - production SQL apply set
- `sql-changes/` - historical changes and schema snapshots
- `tests/` - test assets

## Contributing
- Keep data access through Supabase helpers in `src/lib/` and feature actions.
- Follow existing patterns in `src/features/*`.
- Add or update SQL in `sql` for production changes and document in `sql/README.md`.
