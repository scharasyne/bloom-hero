import { Product, CartItem, VendorApplication, ActivityLog, Order } from "@/typess";

// ─── PRODUCTS ─────────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: "p1",
    productName: "Sunflower",
    vendorName: "Bloom & Co.",
    price: 45,
    qty: 12,
    maxQty: 10,
    status: "available",
    imageUrl: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "p2",
    productName: "Pink Rose",
    vendorName: "Petal House",
    price: 60,
    qty: 5,
    maxQty: 5,
    status: "price-changed",
    imageUrl: [
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "p3",
    productName: "White Lily",
    vendorName: "Garden Fresh",
    price: 55,
    qty: 0,
    maxQty: 8,
    status: "out-of-stock",
    imageUrl: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
    ],
  },
];

// ─── ORDERS ─────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "o1",
    vendorName: "Bloom & Co.",
    orderNumber: "3245",
    datePlaced: "Feb 12, 2026",
    items: [
      {
        id: "i1",
        name: "Romantic Rose Bouquet",
        thumbnail:
          "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=200&h=200&fit=crop",
        qty: 1,
        price: 665,
      },
    ],
    subtotal: 665,
    deliveryFee: 100,
    total: 765,
    status: "to-pay",
    paymentDue: "Feb 13, 2026",
  },
  {
    id: "o7",
    vendorName: "Bloom & Co.",
    orderNumber: "1234567",
    datePlaced: "Feb 12, 2026",
    items: [
      {
        id: "i1",
        name: "Romantic Rose Bouquet",
        thumbnail:
          "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=200&h=200&fit=crop",
        qty: 1,
        price: 665,
      },
    ],
    subtotal: 665,
    deliveryFee: 100,
    total: 765,
    status: "to-pay",
    paymentDue: "Feb 13, 2026",
  },
  {
    id: "o2",
    vendorName: "Petal House",
    orderNumber: "3246",
    datePlaced: "Feb 10, 2026",
    items: [
      {
        id: "i2",
        name: "Classic Red Roses",
        thumbnail:
          "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop",
        qty: 1,
        price: 700,
      },
    ],
    subtotal: 700,
    deliveryFee: 100,
    total: 800,
    status: "to-ship",
  },
  {
    id: "o3",
    vendorName: "Garden Fresh",
    orderNumber: "3247",
    datePlaced: "Feb 8, 2026",
    items: [
      {
        id: "i3",
        name: "Sunflower Bouquet",
        thumbnail:
          "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop",
        qty: 2,
        price: 450,
      },
    ],
    subtotal: 900,
    deliveryFee: 120,
    total: 1020,
    status: "to-receive",
    courier: "LBC Express",
    trackingNumber: "LBC123456",
  },
  {
    id: "o4",
    vendorName: "Bloom & Co.",
    orderNumber: "3248",
    datePlaced: "Feb 1, 2026",
    items: [
      {
        id: "i4",
        name: "Tulip Arrangement",
        thumbnail:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
        qty: 1,
        price: 600,
      },
    ],
    subtotal: 600,
    deliveryFee: 100,
    total: 700,
    status: "completed",
    deliveredDate: "Feb 5, 2026",
    reviewed: true,
    reviewSnippet: "Beautiful tulips, fresh and vibrant!",
  },
];

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
    dateApplied: "2026-03-10",
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
    dateApplied: "2026-03-08",
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
    dateApplied: "2026-03-09",
    email: "rosegarden@email.com",
    phone: "(+63) 917 123 4567",
    location: "SM City Cebu, Cebu City",
    status: "pending",
    documents: { businessPermit: true, validId: false },
  },
];


// ─── ACTIVITY LOGS ────────────────────────────────────────
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-03-08T16:45:00",
    adminName: "Ari Mendoza",
    actionType: "approved",
    actionTitle: "Approved Review",
    targetName: "Maria Dela Cruz → Bloom & Co.",
    details: "Approved despite flagged language (verified purchase confirmed)",
    tags: ["review-moderation", "approved"],
  },
  {
    id: "log-2",
    timestamp: "2026-03-08T16:32:00",
    adminName: "Ari Mendoza",
    actionType: "rejected",
    actionTitle: "Rejected Review & Blocked User",
    targetName: "John Santos → Petal & Stem",
    details: "Suspected competitor (IP match with vendor)",
    tags: ["review-moderation", "rejected", "user-blocked"],
  },
  {
    id: "log-3",
    timestamp: "2026-03-08T14:15:00",
    adminName: "Ari Mendoza",
    actionType: "suspended",
    actionTitle: "Suspended Vendor Account",
    targetName: "Bongbong's Flowers (Pop-up)",
    details: "Policy violation — Multiple customer complaints",
    tags: ["vendor-management", "suspension"],
  },
  {
    id: "log-4",
    timestamp: "2026-03-08T11:23:00",
    adminName: "Ari Mendoza",
    actionType: "approved",
    actionTitle: "Approved Vendor Application",
    targetName: "Rose Garden (Stall Vendor)",
    details: "Documents: Business Permit ✓ • Valid ID ✓",
    tags: ["vendor-applications", "approved"],
  },
  {
    id: "log-5",
    timestamp: "2026-03-08T09:05:00",
    adminName: "Ari Mendoza",
    actionType: "login",
    actionTitle: "Admin Login",
    targetName: "Cebu City, Central Visayas, PH",
    details: "IP: 203.177.xxx.xxx • Desktop (Windows) • Chrome 120",
    tags: ["authentication", "login"],
  },
];
