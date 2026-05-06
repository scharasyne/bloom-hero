"use client";

import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import { PopUpSettings } from "@/app/(vendor)/_components/settings/pop-up-settings";

export default function PopUpSettingsPage() {
  return (
    <main className="flex h-screen bg-[#fbf7f4]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="settings" vendorType="pop-up" />
      </div>
      <div className="flex-1 overflow-hidden">
        <PopUpSettings />
      </div>
    </main>
  );
}