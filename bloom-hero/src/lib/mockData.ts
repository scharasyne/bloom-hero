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

// simple bouquet list used by home/search pages
export const mockBouquets = [
  { id: 1, image_url: "/bouquets/roses.jpg", name: "Classic Red Roses", price: 600, shop_name: "Econo Flowers", distance: "1.2 km", category: "All-occasion", rating: 4.9, sold_count: 67 },
  { id: 2, image_url: "/bouquets/sunflower.jpg", name: "Sunflower Bliss", price: 450, shop_name: "Bloom Studio", distance: "0.8 km", category: "Birthday", rating: 4.8, sold_count: 43 },
  { id: 3, image_url: "/bouquets/pink-peonies.jpg", name: "Pink Peonies", price: 750, shop_name: "Petal & Co.", distance: "2.1 km", category: "Anniversary", rating: 5.0, sold_count: 91 },
];
