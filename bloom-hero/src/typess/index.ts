// CART
export type CartItemStatus = "available" | "out-of-stock" | "price-changed";
export type OrderStatus = "to-pay" | "to-ship" | "to-receive" | "completed";


export interface Product {
  id: string;
  productName: string;
  vendorName: string;
  price: number;
  qty: number;       
  maxQty: number;    
  status: string;    
  imageUrl: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  thumbnail: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  vendorName: string;
  orderNumber: string;
  datePlaced: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentDue?: string;
  courier?: string;
  trackingNumber?: string;
  deliveredDate?: string;
    reviewed?: boolean;
  reviewSnippet?: string;
}

export interface CartItem {
  id: string;
  productName: string;
  vendorName: string;
  price: number;
  oldPrice?: number; // only needed when status === "price-changed"
  qty: number;
  maxQty: number;
  status: CartItemStatus;
  imageUrl: string;
}

// VENDOR APPLICATIONS
export type VendorType = "stall" | "popup";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface VendorApplication {
  id: string;
  vendorName: string;
  ownerName: string; 
  type: VendorType;
  dateApplied: string; // ISO date string e.g. "2026-03-06"
  email: string;
  phone: string;
  location: string;
  status: ApplicationStatus;
  documents: {
    businessPermit: boolean;
    validId: boolean;
  };
}

// ACTIVITY LOGS
export type ActionType = "approved" | "rejected" | "suspended" | "login";

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO datetime string
  adminName: string;
  actionType: ActionType;
  actionTitle: string;
  targetName: string;
  details: string;
  tags: string[];
}
