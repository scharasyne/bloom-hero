"use client";

import { VendorMarketDashboardContent } from "@/app/(vendor)/_components/vendor-market-dashboard-content";
import { VendorPopUpDashboardContent } from "@/app/(vendor)/_components/vendor-popup-dashboard-content";

type VendorDashboardContentProps = {
  vendorType: "market" | "pop-up";
};

export function VendorDashboardContent({
  vendorType,
}: VendorDashboardContentProps) {
  if (vendorType === "market") {
    return <VendorMarketDashboardContent />;
  }

  return <VendorPopUpDashboardContent />;
}