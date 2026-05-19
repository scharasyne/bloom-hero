import type { BusinessType } from "@/features/vendors/types";

export type VendorOfferings = {
  offersOnlineOrders: boolean;
  holdsPopups: boolean;
};

export type VendorOfferingBadge = "online-orders" | "pop-up";

export function getVendorOfferings(input: {
  businessType: BusinessType;
  holdsPopups?: boolean | null;
}): VendorOfferings {
  const isRegistered = input.businessType === "registered";

  return {
    offersOnlineOrders: isRegistered,
    holdsPopups: isRegistered ? Boolean(input.holdsPopups ?? true) : true,
  };
}

export function getVendorOfferingBadges(offerings: VendorOfferings): VendorOfferingBadge[] {
  const badges: VendorOfferingBadge[] = [];
  if (offerings.offersOnlineOrders) badges.push("online-orders");
  if (offerings.holdsPopups) badges.push("pop-up");
  return badges;
}

export function vendorOfferingBadgeLabel(badge: VendorOfferingBadge): string {
  if (badge === "online-orders") return "Orders";
  return "Pop-up";
}
