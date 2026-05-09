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

export type VendorApplicationVendorType = "market" | "pop-up";
export type VendorApplicationSubmissionStatus = "draft" | "submitted";

export interface VendorApplicationRecord {
  id: string;
  owner_id: string;
  shop_name: string | null;
  shop_address: string | null;
  email: string | null;
  phone_number: string | null;
  vendor_type: VendorApplicationVendorType | null;
  business_submission_timing: "now" | "later" | null;
  primary_business_document_type: string | null;
  primary_business_document_url: string | null;
  government_id_type: string | null;
  government_id_document_url: string | null;
  taxpayer_identification_number: string | null;
  vat_registration_status: "vat-registered" | "non-vat-registered" | null;
  bir_certificate_url: string | null;
  submission_status: VendorApplicationSubmissionStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

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
export type ActivityLogType = "approved" | "rejected" | "suspended" | "unsuspended" | "login" | "logout";

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

// POP-UP MAP
export interface PopUpMapVendor {
  id: string;
  displayNumber: number;
  name: string;
  address: string;
  scheduledDate: string;
  endRaw: string | null;
  startDate: string;
  endDate: string;
  lat: number;
  lng: number;
}



