import type { ActivityLog, DetailLine } from "@/types";
import type { BusinessType } from "@/features/vendors/types";

export type AdminActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export type IssuedVendorCredentials = {
  userId: string;
  email: string;
  password: string;
};

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export type ReviewModerationRecord = {
  id: string;
  rating: number;
  comment: string | null;
  reviewDate: string;
  status: ReviewModerationStatus;
  orderId: string | null;
  customerName: string;
  vendorName: string;
  productName: string;
  productImageUrl: string | null;
};

export type ReviewOrderDetails = {
  id: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  vendorName: string;
  customerName: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
    imageUrl: string | null;
  }>;
};

export type AdminDashboardModerationTone = "warning" | "neutral" | "danger";

export type AdminDashboardModerationItem = {
  id: string;
  kind: "application" | "review";
  title: string;
  meta: string;
  statusLabel: string;
  tone: AdminDashboardModerationTone;
  href: string;
  sortAt: string;
};

export type AdminDashboardSuspendedVendor = {
  id: string;
  name: string;
  reason: string;
};

export type AdminNavAlertCounts = {
  pendingApplications: number;
  pendingReviews: number;
  suspendedVendors: number;
  pendingAppeals: number;
};

export type AdminDashboardData = {
  ordersProcessedThisMonth: number;
  platformCommissionThisMonth: number;
  pendingApplicationCount: number;
  pendingReviewCount: number;
  suspendedVendorCount: number;
  moderationQueue: AdminDashboardModerationItem[];
  suspendedVendors: AdminDashboardSuspendedVendor[];
  reviewQueueHref: string;
};

export type AdminVendorStatus = "active" | "suspended";

export type AdminVendorAppealSummary = {
  id: string;
  status: "pending" | "approved" | "rejected";
  appealMessage: string;
  adminResponse: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminVendorRecord = {
  id: string;
  ownerId: string;
  storeName: string;
  ownerName: string;
  businessType: BusinessType;
  status: AdminVendorStatus;
  location: string;
  joinedAt: string;
  createdAtIso: string;
  suspendedAt: string | null;
  suspensionReason: string | null;
  phoneNumber: string | null;
  about: string | null;
  totalOrders: number;
  email: string;
  appeals: AdminVendorAppealSummary[];
  pendingAppeal: AdminVendorAppealSummary | null;
};

export type ActivityLogInput = {
  adminUserId: string;
  actionType: import("@/types").ActivityLogType;
  actionTitle: string;
  targetName: string;
  targetId?: string | null;
  details?: DetailLine[];
  tags?: string[];
  quickLinks?: { label: string; href: string }[];
  rating?: { score: number; max: number } | null;
  metadata?: Record<string, unknown>;
};
