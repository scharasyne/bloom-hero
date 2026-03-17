"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

type TabId = "dashboard" | "products" | "orders" | "messages" | "profile" | "schedule";
type VendorType = "market" | "pop-up";

type VendorDashboardSidebarCardProps = {
  activeTab?: TabId;
  vendorType: VendorType;
};

const tabs: Record<"pop-up" | "market", Array<{ id: TabId; label: string; icon: string }>> = {
  "pop-up": [
    { id: "dashboard", label: "Dashboard", icon: "mdi:home-outline" },
    { id: "products",  label: "Products",  icon: "mdi:package-variant" },
    { id: "orders",    label: "Orders",    icon: "mdi:clipboard-list-outline" },
    { id: "messages",  label: "Messages",  icon: "mdi:message-outline" },
    { id: "profile",   label: "Profile",   icon: "mdi:account-outline" },
    { id: "schedule",  label: "Schedule",  icon: "mdi:calendar-outline" },
  ],
  market: [
    { id: "dashboard", label: "Dashboard", icon: "mdi:home-outline" },
    { id: "products",  label: "Products",  icon: "mdi:package-variant" },
    { id: "orders",    label: "Orders",    icon: "mdi:clipboard-list-outline" },
    { id: "messages",  label: "Messages",  icon: "mdi:message-outline" },
    { id: "profile",   label: "Profile",   icon: "mdi:account-outline" },
  ],
};


function getTabRoutes(vendorType: VendorType): Partial<Record<TabId, string>> {
  return {
    dashboard: `/vendor/${vendorType}/dashboard`,
    products: `/vendor/${vendorType}/list-product`,
  };
}

export function VendorDashboardSidebarCard({
  activeTab,
  vendorType,
}: VendorDashboardSidebarCardProps) {
  const tabRoutes = getTabRoutes(vendorType);

  return (
    <aside
      className="flex flex-col gap-[12px] items-start px-[24px] py-[16px] h-full border-r border-[#edeae6] w-[240px] shrink-0"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <nav aria-label="Vendor dashboard navigation" className="w-full flex flex-col gap-[12px]">
        {tabs[vendorType].map((tab) => {
          const isActive = tab.id === activeTab;
          const route = tabRoutes[tab.id];

          const activeContent = (
            // Active state
            <div className="bg-[#fdf0ef] flex gap-[12px] h-[48px] items-center px-[12px] rounded-[12px] w-full">
              <div className="bg-[#D96A63] h-[28px] w-[4px] rounded-full shrink-0" />
              <Icon icon={tab.icon} width={20} height={20} className="text-[#D96A63] shrink-0" />
              <span className="text-[#D96A63] text-[16px] font-medium tracking-[0.64px]">
                {tab.label}
              </span>
            </div>
          );

          const inactiveClassName =
            "flex gap-[12px] h-[48px] items-center px-[12px] rounded-[12px] w-full hover:bg-[#f3f2f0] transition-colors cursor-pointer";

          const inactiveContent = (
            <>
              <Icon icon={tab.icon} width={20} height={20} className="text-[#5f5a55] shrink-0" />
              <span className="text-[#5f5a55] text-[16px] font-medium tracking-[0.64px]">
                {tab.label}
              </span>
            </>
          );

          if (isActive) {
            return <div key={tab.id}>{activeContent}</div>;
          }

          if (route) {
            return (
              <Link key={tab.id} href={route} className={inactiveClassName}>
                {inactiveContent}
              </Link>
            );
          }

          return (
            <div key={tab.id} className={inactiveClassName}>
              {inactiveContent}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
