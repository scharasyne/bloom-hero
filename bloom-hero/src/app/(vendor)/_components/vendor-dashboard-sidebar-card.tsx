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
    // { id: "messages",  label: "Messages",  icon: "mdi:message-outline" },
    { id: "profile",   label: "Profile",   icon: "mdi:account-outline" },
    { id: "schedule",  label: "Schedule",  icon: "mdi:calendar-outline" },
  ],
  market: [
    { id: "dashboard", label: "Dashboard", icon: "mdi:home-outline" },
    { id: "products",  label: "Products",  icon: "mdi:package-variant" },
    { id: "orders",    label: "Orders",    icon: "mdi:clipboard-list-outline" },
    // { id: "messages",  label: "Messages",  icon: "mdi:message-outline" },
    { id: "profile",   label: "Profile",   icon: "mdi:account-outline" },
  ],
};

function getTabRoutes(vendorType: VendorType): Partial<Record<TabId, string>> {
  return {
    dashboard: `/${vendorType}/dashboard`,
    products:  `/${vendorType}/products`,
    profile: `/${vendorType}/profile`,
    orders: `/${vendorType}/orders`,
    messages: `/${vendorType}/messages`,
    schedule: `/pop-up/schedule`,
  };
}

export function VendorDashboardSidebarCard({
  activeTab,
  vendorType,
}: VendorDashboardSidebarCardProps) {
  const tabRoutes = getTabRoutes(vendorType);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#edeae6] bg-[#fbf7f4] md:static md:z-auto md:flex md:h-full md:border-t-0 md:border-r md:w-48 md:min-w-48 lg:w-52 lg:min-w-52 xl:w-60 xl:min-w-60"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Nav Items */}
      <nav
        aria-label="Vendor dashboard navigation"
        className="flex items-center justify-around px-2 py-2 md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-1 md:px-2 md:py-2 lg:px-3 lg:py-1 xl:px-4 xl:py-0"
      >
        {tabs[vendorType].map((tab) => {
          const isActive = tab.id === activeTab;
          const route = tabRoutes[tab.id];

          const activeContent = (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f5d3a] shadow-md shadow-[#2f5d3a]/20 md:h-10 md:w-full md:justify-start md:gap-2 md:rounded-lg md:px-2 lg:h-11 lg:gap-2.5 lg:px-3 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-4">
              <Icon icon={tab.icon} width={20} height={20} className="text-white shrink-0 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
              <span className="hidden whitespace-nowrap text-white text-[13px] font-semibold tracking-[0.3px] md:inline lg:text-[14px] xl:text-[15px]">
                {tab.label}
              </span>
            </div>
          );

          const inactiveClassName =
            "flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-[#eef4f0] hover:text-[#2f5d3a] transition-all duration-200 cursor-pointer md:h-10 md:w-full md:justify-start md:gap-2 md:rounded-lg md:px-2 lg:h-11 lg:gap-2.5 lg:px-3 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-4";

          const inactiveContent = (
            <>
              <Icon icon={tab.icon} width={20} height={20} className="shrink-0 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
              <span className="hidden whitespace-nowrap text-[13px] font-medium tracking-[0.3px] md:inline lg:text-[14px] xl:text-[15px]">{tab.label}</span>
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
      {/* <div className="px-[16px] py-[16px] border-t border-slate-100">
        <button className="flex items-center gap-[12px] h-[48px] px-[16px] rounded-[12px] w-full text-slate-500 hover:bg-red-50 hover:text-[#D24B46] transition-all duration-200 cursor-pointer">
          <Icon icon="mdi:logout" width={20} height={20} className="shrink-0" />
          <span className="text-[15px] font-medium tracking-[0.3px]">Sign Out</span>
        </button>
      </div> */}
    </aside>
  );
}