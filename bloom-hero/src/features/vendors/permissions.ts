export type VendorRegistrationType = "registered" | "unregistered";

export type VendorCapabilities = {
  canSellOnline: boolean;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canCreatePopups: boolean;
};

export const capabilitiesByRegistrationType: Record<
  VendorRegistrationType,
  VendorCapabilities
> = {
  registered: {
    canSellOnline: true,
    canManageOrders: true,
    canManageInventory: true,
    canCreatePopups: true,
  },
  unregistered: {
    canSellOnline: false,
    canManageOrders: false,
    canManageInventory: false,
    canCreatePopups: true,
  },
};

export function getVendorCapabilities(vendor: {
  business_registration_status: VendorRegistrationType;
  status: "pending" | "approved" | "rejected";
}) {
  if (vendor.status !== "approved") {
    return {
      canSellOnline: false,
      canManageOrders: false,
      canManageInventory: false,
      canCreatePopups: false,
    };
  }

  return capabilitiesByRegistrationType[vendor.business_registration_status];
}