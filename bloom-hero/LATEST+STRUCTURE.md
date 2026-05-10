In vendors, instead of pop-up and market, we could go with registered/unregistered

Registered vendors can do literally anything: post popups, sell online, and have access to order management/inventory
Unregistered means: vendors without business registration
Registered means: vendors with business registration
Unregistered vendors can only host pop-ups
All vendors still have to provide personal IDs

Suggested fix on the database: change the vendor_type from market and pop-up to registered/unregistered. 

During the vendor registration, we can provide a direction/guide that states “vendors without business registration cannot post products and do order management; however, they can post popup schedules. On the other hand, registered businesses can post products, schedule pop-ups, and do order management.”

Proposed architecture: Feature-based architecture

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (vendor)/
│   │   └── vendor/
│   │       ├── dashboard/
│   │       ├── popups/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── inventory/      # keep only if expanding beyond stocks column
│   │       └── profile/
│   ├── (customer)/
│   │   ├── marketplace/
│   │   ├── vendors/
│   │   └── orders/
│   └── admin/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── schemas/
│   │   └── types.ts
│   ├── users/                  # ← add this, your users table is its own domain
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   └── types.ts
│   ├── vendors/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── permissions.ts
│   │   └── types.ts
│   ├── products/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── permissions.ts
│   │   └── types.ts
│   ├── orders/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── permissions.ts
│   │   └── types.ts
│   ├── reviews/                # ← add this, reviews table is substantial
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── permissions.ts
│   │   └── types.ts
│   ├── messages/               # ← add this, has realtime needs
│   │   ├── components/
│   │   ├── hooks/              # useMessages.ts — realtime subscription
│   │   ├── actions/
│   │   ├── queries/
│   │   └── types.ts
│   ├── popups/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   └── types.ts
│   ├── categories/             # ← add this, admin manages it
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── types.ts
│   ├── inventory/              # ← optional, merge into products if simple
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   └── types.ts
│   └── admin/
│       ├── components/
│       ├── actions/
│       ├── queries/
│       ├── schemas/
│       └── types.ts
│
├── components/
│   ├── ui/                     # Button, Input, Modal, Badge — zero business context
│   ├── shared/                 # cross-feature: Avatar, RatingStars, StatusBadge
│   └── layout/                 # Header, Footer, Sidebar, PageWrapper
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient
│   │   ├── server.ts           # createServerClient
│   │   └── middleware.ts       # Supabase session helper
│   ├── utils.ts                # cn(), formatPrice(), formatDate()
│   └── constants.ts            # app-wide constants
│
├── types/
│   └── database.types.ts       # supabase gen types — never edit manually
│
└── middleware.ts                # Next.js route protection — must be here

