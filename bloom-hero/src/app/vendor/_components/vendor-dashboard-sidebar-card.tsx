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
    products:  `/vendor/${vendorType}/list-product`,
  };
}

export function VendorDashboardSidebarCard({
  activeTab,
  vendorType,
}: VendorDashboardSidebarCardProps) {
  const tabRoutes = getTabRoutes(vendorType);

  return (
    <aside
      className="flex flex-col w-[240px] h-full bg-[#fbf7f4] border-r border-[#edeae6] shrink-0"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Nav Items */}
      <nav
        aria-label="Vendor dashboard navigation"
        className="flex-1 flex flex-col gap-[4px] px-[16px]"
      >
        {tabs[vendorType].map((tab) => {
          const isActive = tab.id === activeTab;
          const route = tabRoutes[tab.id];

          const activeContent = (
            <div className="flex items-center gap-[12px] h-[48px] px-[16px] rounded-[12px] w-full bg-[#D14D41] shadow-md shadow-red-100">
              <Icon icon={tab.icon} width={20} height={20} className="text-white shrink-0" />
              <span className="text-white text-[15px] font-semibold tracking-[0.3px]">
                {tab.label}
              </span>
            </div>
          );

          const inactiveClassName =
            "flex items-center gap-[12px] h-[48px] px-[16px] rounded-[12px] w-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 cursor-pointer";

          const inactiveContent = (
            <>
              <Icon icon={tab.icon} width={20} height={20} className="shrink-0" />
              <span className="text-[15px] font-medium tracking-[0.3px]">{tab.label}</span>
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

      {/* Sign Out */}
      <div className="px-[16px] py-[16px] border-t border-slate-100">
        <button className="flex items-center gap-[12px] h-[48px] px-[16px] rounded-[12px] w-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 cursor-pointer">
          <Icon icon="mdi:logout" width={20} height={20} className="shrink-0" />
          <span className="text-[15px] font-medium tracking-[0.3px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}