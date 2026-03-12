// CART
export type CartItemStatus = "available" | "out-of-stock" | "price-changed";

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
export type ActivityLogType = "approved" | "rejected" | "suspended" | "login";

export type DetailLine = {
  type: "order-verified" | "flag" | "reason" | "info";
  text: string;
};


export type ActivityLog = {
  id: string;
  adminName: string;
  timestamp: string;
  actionType: ActivityLogType;
  actionTitle: string;
  targetName: string;
  details: DetailLine[];
  tags: string[];
  quickLinks: { label: string; href: string }[];
  rating?: { score: number; max: number };
};



