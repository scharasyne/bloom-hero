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

// ─── VENDOR DASHBOARD (MARKET) ───────────────────────────
export type MarketKPIItem = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: string;
  href: string;
};

export type MarketRecentOrder = {
  id: string;
  customerName: string;
  item: string;
  status: "Pending" | "Completed" | "Cancelled";
  amount: string;
  date: string;
};

export type MarketLowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export type MarketUpcomingOrder = {
  date: string;
  day: string;
  count: number;
  isToday?: boolean;
};

export type MarketTrendPoint = {
  label: string;
  value: number;
};

export const mockMarketKPIs: MarketKPIItem[] = [
  { label: "Revenue (7 days)",   value: "₱8,420", change: "+12.3%", positive: true,  icon: "mdi:cash-multiple",          href: "/market/orders"   },
  { label: "Orders (7 days)",    value: "54",      change: "+2%",    positive: true,  icon: "mdi:shopping-outline",       href: "/market/orders"   },
  { label: "Pending Fulfilment", value: "6",       change: "",       positive: false, icon: "mdi:clock-alert-outline",    href: "/market/orders"   },
  { label: "Low-Stock Products", value: "3",       change: "",       positive: false, icon: "mdi:package-variant-closed", href: "/market/products" },
];

export const mockMarketRecentOrders: MarketRecentOrder[] = [
  { id: "1", customerName: "Maria Santos",  item: "Red Rose Bouquet",     status: "Pending",   amount: "₱1,200", date: "Apr 22, 2026 · 2:00 PM"  },
  { id: "2", customerName: "Jose Reyes",    item: "Sunflower Bundle",     status: "Completed", amount: "₱850",   date: "Apr 21, 2026 · 4:30 PM"  },
  { id: "3", customerName: "Ana Cruz",      item: "White Lily Wrap",      status: "Completed", amount: "₱1,400", date: "Apr 21, 2026 · 11:00 AM" },
  { id: "4", customerName: "Pedro Lim",     item: "Mixed Spring Bouquet", status: "Cancelled", amount: "₱960",   date: "Apr 20, 2026 · 9:15 AM"  },
  { id: "5", customerName: "Carla Mendoza", item: "Tulip Arrangement",    status: "Pending",   amount: "₱1,050", date: "Apr 20, 2026 · 8:00 AM"  },
];

export const mockMarketLowStock: MarketLowStockProduct[] = [
  { id: "1", name: "Red Rose Bouquet",  stock: 2 },
  { id: "2", name: "White Lily Wrap",   stock: 1 },
  { id: "3", name: "Tulip Arrangement", stock: 3 },
];

export const mockMarketUpcomingOrders: MarketUpcomingOrder[] = [
  { date: "22", day: "Wed", count: 3, isToday: true },
  { date: "23", day: "Thu", count: 2 },
  { date: "24", day: "Fri", count: 6 },
  { date: "25", day: "Sat", count: 1 },
  { date: "26", day: "Sun", count: 4 },
];

export const mockMarketRevenueTrend: MarketTrendPoint[] = [
  { label: "Apr 10", value: 360 },
  { label: "Apr 11", value: 390 },
  { label: "Apr 12", value: 410 },
  { label: "Apr 13", value: 425 },
  { label: "Apr 14", value: 445 },
  { label: "Apr 15", value: 430 },
  { label: "Apr 16", value: 460 },
  { label: "Apr 17", value: 480 },
  { label: "Apr 18", value: 500 },
  { label: "Apr 19", value: 515 },
  { label: "Apr 21", value: 555 },
  { label: "Apr 22", value: 600 },
];

// ── Vendors ────────────────────────────────────────────────
export type VendorStatus = "active" | "suspended";
export type VendorType   = "market" | "pop-up";

export type VendorRecord = {
  id:          string;
  storeName:   string;
  ownerName:   string;
  vendorType:  VendorType;
  status:      VendorStatus;
  location:    string;
  joinedAt:    string;
  totalOrders: number;
  email:       string;
};

export const mockVendors: VendorRecord[] = [
  { id: "1", storeName: "Petal & Co.",       ownerName: "Maria Santos", vendorType: "market", status: "active",    location: "Stall 12-A, Carbon Market",   joinedAt: "Nov 3, 2024",  totalOrders: 142, email: "maria.santos@email.com"  },
  { id: "2", storeName: "Bloom & Bud",       ownerName: "Jose Reyes",   vendorType: "market", status: "active",    location: "Stall 7-B, Carbon Market",    joinedAt: "Dec 15, 2024", totalOrders: 98,  email: "jose.reyes@email.com"    },
  { id: "3", storeName: "Sampaguita Street", ownerName: "Ana Cruz",     vendorType: "pop-up", status: "suspended", location: "Pop-up Event · IT Park",      joinedAt: "Jan 10, 2025", totalOrders: 23,  email: "ana.cruz@email.com"      },
  { id: "4", storeName: "Zarah's Flowers",   ownerName: "Zarah Lim",    vendorType: "market", status: "suspended", location: "Stall 3-C, Carbon Market",    joinedAt: "Oct 22, 2024", totalOrders: 67,  email: "zarah.lim@email.com"     },
  { id: "5", storeName: "Garden Fresh",      ownerName: "Ben Tan",      vendorType: "pop-up", status: "active",    location: "Pop-up Event · Ayala Center", joinedAt: "Feb 5, 2025",  totalOrders: 51,  email: "ben.tan@email.com"       },
  { id: "6", storeName: "The Flower Room",   ownerName: "Claire Uy",    vendorType: "market", status: "active",    location: "Stall 20-D, Carbon Market",   joinedAt: "Mar 1, 2025",  totalOrders: 38,  email: "claire.uy@email.com"     },
];

// ── Reviews ────────────────────────────────────────────────
export type ReviewStatus = "pending" | "flagged" | "approved" | "rejected";

export type ReviewRecord = {
  id:               string;
  reviewerName:     string;
  storeName:        string;
  rating:           number;
  postedAt:         string;
  body:             string;
  photoAttached?:   boolean;
  flagReason?:      string;
  orderNumber?:     string;
  verifiedPurchase: boolean;
  status:           ReviewStatus;
  showInvestigate?: boolean;
  showBlockUser?:   boolean;
};

export const mockReviews: ReviewRecord[] = [
  {
    id: "r1", reviewerName: "Rock Tongue Rosa", storeName: "Bloom & Co.",
    rating: 5, postedAt: "Feb 12, 2026",
    body: "Terrible service! Flowers arrived dead. Scam!",
    flagReason: "Inappropriate language detected",
    orderNumber: "3245", verifiedPurchase: true,
    status: "flagged",
  },
  {
    id: "r2", reviewerName: "Robin De Fresh", storeName: "Petal & Stem",
    rating: 2, postedAt: "Feb 11, 2026",
    body: "Overpriced and bad quality. Don't buy here!!!",
    photoAttached: true,
    flagReason: "Competitor suspected (IP match)",
    orderNumber: undefined, verifiedPurchase: false,
    status: "flagged", showInvestigate: true, showBlockUser: true,
  },
  {
    id: "r3", reviewerName: "Lena Flores", storeName: "Garden Fresh",
    rating: 1, postedAt: "Feb 10, 2026",
    body: "Never received my order and no response from vendor.",
    flagReason: "Spam score high",
    orderNumber: "3201", verifiedPurchase: true,
    status: "flagged", showBlockUser: true,
  },
  {
    id: "r4", reviewerName: "Marco Villanueva", storeName: "The Flower Room",
    rating: 4, postedAt: "Feb 9, 2026",
    body: "Good quality flowers, delivery was a bit late but overall satisfied.",
    orderNumber: "3188", verifiedPurchase: true,
    status: "pending",
  },
  {
    id: "r5", reviewerName: "Sofia Ramos", storeName: "Petal & Co.",
    rating: 5, postedAt: "Feb 9, 2026",
    body: "Absolutely beautiful arrangement! Will definitely order again.",
    orderNumber: "3190", verifiedPurchase: true,
    status: "pending",
  },
  {
    id: "r6", reviewerName: "Diego Cruz", storeName: "Bloom & Bud",
    rating: 3, postedAt: "Feb 8, 2026",
    body: "Flowers were okay, nothing special. Expected more for the price.",
    orderNumber: "3175", verifiedPurchase: true,
    status: "pending",
  },
];