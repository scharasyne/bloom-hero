import type { BusinessType } from "@/features/vendors/types";
import type { AdminVendorAppealSummary, AdminVendorRecord, AdminVendorStatus } from "@/features/admin/types";

type AppealRow = {
  id: string;
  appeal_message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type VendorRow = {
  id: string;
  shop_name: string | null;
  business_type: BusinessType;
  status: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  location_text: string | null;
  phone_number: string | null;
  about: string | null;
  owner: {
    name: string | null;
    email: string | null;
  } | null;
  appeals: AppealRow[] | null;
};

function normalizeStatus(suspendedAt: string | null): AdminVendorStatus {
  return suspendedAt ? "suspended" : "active";
}

function mapAppeal(row: AppealRow): AdminVendorAppealSummary {
  return {
    id: row.id,
    status: row.status as AdminVendorAppealSummary["status"],
    appealMessage: row.appeal_message,
    adminResponse: row.admin_response,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

export function mapAdminVendor(row: VendorRow): AdminVendorRecord {
  const appeals = (row.appeals ?? [])
    .map(mapAppeal)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingAppeal = appeals.find((appeal) => appeal.status === "pending") ?? null;

  return {
    id: row.id,
    storeName: row.shop_name?.trim() || "Vendor Shop",
    ownerName: row.owner?.name?.trim() || "Vendor Owner",
    businessType: row.business_type,
    status: normalizeStatus(row.suspended_at),
    location: row.location_text?.trim() || "Location unavailable",
    joinedAt: new Date(row.created_at).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAtIso: row.created_at,
    suspendedAt: row.suspended_at,
    suspensionReason: row.suspension_reason?.trim() || null,
    phoneNumber: row.phone_number?.trim() || null,
    about: row.about?.trim() || null,
    totalOrders: 0,
    email: row.owner?.email?.trim() || "No email",
    appeals,
    pendingAppeal,
  };
}
