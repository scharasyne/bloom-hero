"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { BusinessType } from "@/features/vendors/types";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";
import { VENDOR_NAV_ITEMS, type VendorNavItemId } from "@/features/vendors/utils/vendorNavConfig";

type VendorDashboardSidebarCardProps = {
  activeTab?: VendorNavItemId;
  businessType: BusinessType;
};

const catalogTabs = new Set<VendorNavItemId>(["products", "orders"]);

function mobileTabOrderClass(tabId: VendorNavItemId): string {
  if (tabId === "settings") return "hidden md:flex";
  if (tabId === "profile") return "order-5 md:order-none";
  if (tabId === "schedule") return "order-4 md:order-none";
  if (tabId === "orders") return "order-3 md:order-none";
  if (tabId === "products") return "order-2 md:order-none";
  if (tabId === "dashboard") return "order-1 md:order-none";
  return "md:order-none";
}

export function VendorDashboardSidebarCard({
  activeTab,
  businessType,
}: VendorDashboardSidebarCardProps) {
  const catalogUnlocked = canManageCatalog(businessType);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#edeae6] bg-[#fbf7f4] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:static md:z-auto md:flex md:h-full md:border-t-0 md:border-r md:pb-0 md:w-48 md:min-w-48 lg:w-52 lg:min-w-52 xl:w-60 xl:min-w-60"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <nav
        aria-label="Vendor dashboard navigation"
        className="flex items-center justify-around px-2 py-2 md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-1 md:px-2 md:py-2 lg:px-3 lg:py-1 xl:px-4 xl:py-0"
      >
        {VENDOR_NAV_ITEMS.map((tab) => {
          const isActive = tab.id === activeTab;
          const route = tab.href;
          const isCatalogLocked = catalogTabs.has(tab.id) && !catalogUnlocked;
          const orderClass = mobileTabOrderClass(tab.id);

          const activeContent = (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f5d3a] shadow-md shadow-[#2f5d3a]/20 md:h-10 md:w-full md:justify-start md:gap-2 md:rounded-lg md:px-2 lg:h-11 lg:gap-2.5 lg:px-3 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-4">
              <Icon icon={tab.icon} width={20} height={20} className="text-white shrink-0 md:size-[18px] lg:size-5" />
              <span className="hidden whitespace-nowrap text-white text-[13px] font-semibold tracking-[0.3px] md:inline lg:text-[14px] xl:text-[15px]">
                {tab.label}
              </span>
            </div>
          );

          const inactiveClassName =
            "flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-[#eef4f0] hover:text-[#2f5d3a] transition-all duration-200 cursor-pointer md:h-10 md:w-full md:justify-start md:gap-2 md:rounded-lg md:px-2 lg:h-11 lg:gap-2.5 lg:px-3 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-4";

          const lockedClassName =
            "flex h-11 w-11 items-center justify-center rounded-full text-slate-400 blur-[0.4px] opacity-60 transition-all duration-200 cursor-pointer md:h-10 md:w-full md:justify-start md:gap-2 md:rounded-lg md:px-2 lg:h-11 lg:gap-2.5 lg:px-3 xl:h-12 xl:gap-3 xl:rounded-xl xl:px-4";

          const inactiveContent = (
            <>
              <Icon icon={tab.icon} width={20} height={20} className="shrink-0 md:size-[18px] lg:size-5" />
              <span className="hidden whitespace-nowrap text-[13px] font-medium tracking-[0.3px] md:inline lg:text-[14px] xl:text-[15px]">{tab.label}</span>
            </>
          );

          if (isActive) {
            return (
              <div key={tab.id} className={orderClass}>
                {activeContent}
              </div>
            );
          }

          if (isCatalogLocked && route) {
            return (
              <Link key={tab.id} href={route} className={cn(lockedClassName, orderClass)}>
                {inactiveContent}
              </Link>
            );
          }

          return (
            <Link key={tab.id} href={route} className={cn(inactiveClassName, orderClass)}>
              {inactiveContent}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
