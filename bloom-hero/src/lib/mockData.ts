import { CartItem, VendorApplication, ActivityLog } from "@/typess";

// ─── CART ITEMS ───────────────────────────────────────────
export const mockCartItems: CartItem[] = [
  {
    id: "1",
    productName: "Sunflower",
    vendorName: "Bloom & Co.",
    price: 45,
    qty: 2,
    maxQty: 10,
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    productName: "Pink Rose",
    vendorName: "Petal House",
    price: 60,
    oldPrice: 75,
    qty: 1,
    maxQty: 5,
    status: "price-changed",
    imageUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    productName: "White Lily",
    vendorName: "Garden Fresh",
    price: 55,
    qty: 3,
    maxQty: 8,
    status: "out-of-stock",
    imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
  },
];


// ─── VENDOR APPLICATIONS ──────────────────────────────────
export const mockVendorApplications: VendorApplication[] = [
  {
    id: "app-1",
    vendorName: "Bloom & Co.",
    ownerName: "Maria Santos",      
    type: "stall",
    dateApplied: "2026-03-14",
    email: "bloom@email.com",
    phone: "(+63) 912 345 6789",
    location: "Carbon Market, Cebu City",
    status: "pending",
    documents: { businessPermit: true, validId: true },
  },
  {
    id: "app-2",
    vendorName: "Petal & Stem",
    ownerName: "Jake Reyes",       
    type: "popup",
    dateApplied: "2026-03-10",
    email: "petal@email.com",
    phone: "(+63) 998 765 4321",
    location: "Ayala Center, Cebu City",
    status: "pending",
    documents: { businessPermit: false, validId: false },
  },
  {
    id: "app-3",
    vendorName: "Rose Garden",
    ownerName: "Clara Lim",        
    type: "stall",
    dateApplied: "2026-03-13",
    email: "rosegarden@email.com",
    phone: "(+63) 917 123 4567",
    location: "SM City Cebu, Cebu City",
    status: "pending",
    documents: { businessPermit: true, validId: false },
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    adminName: "Ari Rufila",
    timestamp: new Date(new Date().setHours(16, 45, 0, 0)).toISOString(),
    actionType: "approved",
    actionTitle: "Approved Review",
    targetName: "Maria Dela Cruz → Bloom & Co.",
    details: [
      { type: "order-verified", text: "Order #3245 • Verified Purchase" },
      { type: "flag",     text: "Approved despite flagged language" },
    ],
    tags: ["review-moderation", "approved"],
    quickLinks: [
      { label: "View Review", href: "/admin-review-moderation-panel" },
      { label: "View Order",  href: "/admin-review-moderation-panel" },
    ],
    rating: { score: 5, max: 5 },
  },
  {
    id: "log-2",
    adminName: "Ari Rufila",
    timestamp: new Date(new Date().setHours(16, 32, 0, 0)).toISOString(),
    actionType: "rejected",
    actionTitle: "Rejected Review & Blocked User",
    targetName: "John Santos → Petal & Stem",
    details: [
      { type: "info",  text: "No verified purchase" },
      { type: "flag",  text: "Reason: Suspected Competitor (IP match)" },
      { type: "flag",  text: "User blocked permanently" },
    ],
    tags: ["review-moderation", "rejected", "user-blocked"],
    quickLinks: [
      { label: "View Review", href: "/admin-review-moderation-panel" },
      { label: "View User",   href: "/admin-review-moderation-panel" },
    ],
    rating: { score: 2, max: 5 },
  },
  {
    id: "log-3",
    adminName: "Ari Rufila",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actionType: "suspended",
    actionTitle: "Suspended Vendor Account",
    targetName: "Bongbong's Flowers (Pop-up Vendor)",
    details: [
      { type: "reason", text: "Reason: Policy Violation" },
      { type: "flag",   text: "Multiple customer complaints" },
      { type: "info",   text: "Duration: Indefinite" },
      { type: "info",   text: "Notification email sent to Vendor" },
    ],
    tags: ["vendor-management", "suspension"],
    quickLinks: [
      { label: "View Vendor",     href: "/admin-vendor-management-dashboard" },
      { label: "View Complaints", href: "/admin-vendor-management-dashboard" },
    ],
  },
  {
    id: "log-4",
    adminName: "Ari Rufila",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actionType: "login",
    actionTitle: "Admin Login",
    targetName: "Admin Portal",
    details: [
      { type: "info", text: "Session started successfully" },
    ],
    tags: ["login", "admin"],
    quickLinks: [],
  },
];

// simple bouquet list used by home/search pages
// Add this `images` field to each bouquet in your mockBouquets array in mockData.ts:

export const mockBouquets = [
  {
    id: 1,
    image_url: "/bouquets/roses.jpg",
    images: [
      "/bouquets/roses.jpg",
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=400&q=80",
    ],
    name: "Classic Red Roses",
    price: 600,
    shop_name: "Econo Flowers",
    distance: "1.2 km",
    category: "All-occasion",
    rating: 4.9,
    sold_count: 67,
  },
  {
    id: 2,
    image_url: "/bouquets/sunflower.jpg",
    images: [
      "/bouquets/sunflower.jpg",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80",
    ],
    name: "Sunflower Bliss",
    price: 450,
    shop_name: "Bloom Studio",
    distance: "0.8 km",
    category: "Birthday",
    rating: 4.8,
    sold_count: 43,
  },
  {
    id: 3,
    image_url: "/bouquets/pink-peonies.jpg",
    images: [
      "/bouquets/pink-peonies.jpg",
      "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400&q=80",
    ],
    name: "Pink Peonies",
    price: 750,
    shop_name: "Petal & Co.",
    distance: "2.1 km",
    category: "Anniversary",
    rating: 5.0,
    sold_count: 91,
  },
  {
    id: 4,
    image_url: "/bouquets/roses.jpg",
    images: [
      "/bouquets/roses.jpg",
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=400&q=80",
    ],
    name: "Classic Red Roses",
    price: 600,
    shop_name: "Econo Flowers",
    distance: "1.2 km",
    category: "All-occasion",
    rating: 4.9,
    sold_count: 67,
  },
  {
    id: 5,
    image_url: "/bouquets/roses.jpg",
    images: [
      "/bouquets/roses.jpg",
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=400&q=80",
    ],
    name: "Classic Red Roses",
    price: 600,
    shop_name: "Econo Flowers",
    distance: "1.2 km",
    category: "All-occasion",
    rating: 4.9,
    sold_count: 67,
  },
  {
    id: 6,
    image_url: "/bouquets/roses.jpg",
    images: [
      "/bouquets/roses.jpg",
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=400&q=80",
    ],
    name: "Classic Red Roses",
    price: 600,
    shop_name: "Econo Flowers",
    distance: "1.2 km",
    category: "All-occasion",
    rating: 4.9,
    sold_count: 67,
  },
];

// ─── VENDOR DASHBOARD (POP-UP) ────────────────────────────

export type MostRequestedItem = {
  city: string;
  count: number;
};

export type RecentRequestItem = {
  date: string;
  city: string;
  barangay: string;
  landmark: string;
};

export type UpcomingEventItem = {
  title: string;
  time: string;
  location: string;
  date: { month: string; day: string };
  status: string;
};

export const mockMostRequested: MostRequestedItem[] = [
  { city: "Muntinlupa", count: 73 },
  { city: "Ortigas",    count: 51 },
  { city: "Diliman",    count: 33 },
  { city: "Makati",     count: 27 },
];

export const mockRecentRequests: RecentRequestItem[] = [
  { date: "Jan 18, 2026", city: "Quezon City", barangay: "Loyola Heights", landmark: "UP Town" },
  { date: "Jan 18, 2026", city: "Taguig",      barangay: "BGC",            landmark: "High Street" },
  { date: "Jan 17, 2026", city: "Pasig",       barangay: "Kapitolyo",      landmark: "Estancia" },
  { date: "Jan 16, 2026", city: "Manila",      barangay: "Malate",         landmark: "Robinsons" },
];

export const mockUpcomingEvents: UpcomingEventItem[] = [
  { title: "LOST BOOKS", time: "12 PM – 5 PM", location: "CAO Building, Osmeña Blvd.", date: { month: "FEB", day: "14" }, status: "Open" },
  { title: "LOST BOOKS", time: "12 PM – 5 PM", location: "CAO Building, Osmeña Blvd.", date: { month: "FEB", day: "14" }, status: "Open" },
  { title: "LOST BOOKS", time: "12 PM – 5 PM", location: "CAO Building, Osmeña Blvd.", date: { month: "FEB", day: "15" }, status: "Open" },
  { title: "LOST BOOKS", time: "12 PM – 5 PM", location: "CAO Building, Osmeña Blvd.", date: { month: "FEB", day: "16" }, status: "Open" },
];

