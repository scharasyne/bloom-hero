"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type MarketTab = "dashboard" | "products" | "orders" | "profile" | "settings";
type PopUpTab  = "dashboard" | "products" | "schedule" | "profile" | "settings";
type AnyTab    = MarketTab | PopUpTab;

type VendorDashboardSidebarCardProps = {
  vendorType: "market" | "pop-up";
};

type TabItem = {
  id:    AnyTab;
  label: string;
  href:  string;
  icon:  string;
};

const marketTabs: TabItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/market/dashboard",    icon: "mdi:view-dashboard-outline"  },
  { id: "products",  label: "Products",  href: "/market/products",     icon: "mdi:flower-outline"          },
  { id: "orders",    label: "Orders",    href: "/market/orders",        icon: "mdi:clipboard-list-outline"  },
  { id: "profile",   label: "Profile",   href: "/market/profile",       icon: "mdi:account-outline"         },
  { id: "settings",  label: "Settings",  href: "/market/settings",      icon: "mdi:cog-outline"             },
];

const popUpTabs: TabItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/pop-up/dashboard",    icon: "mdi:view-dashboard-outline" },
  { id: "products",  label: "Products",  href: "/pop-up/products",     icon: "mdi:flower-outline"         },
  { id: "schedule",  label: "Schedule",  href: "/pop-up/schedule",     icon: "mdi:calendar-month-outline" },
  { id: "profile",   label: "Profile",   href: "/pop-up/profile",      icon: "mdi:account-outline"        },
  { id: "settings",  label: "Settings",  href: "/pop-up/settings",     icon: "mdi:cog-outline"            },
];

export function VendorDashboardSidebarCard({
  vendorType,
}: VendorDashboardSidebarCardProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const tabs     = vendorType === "market" ? marketTabs : popUpTabs;
  const subtitle = vendorType === "market" ? "Market Vendor" : "Pop-up Vendor";

  // Derive active tab from current pathname — no prop needed
  const activeTab = tabs.find((tab) => pathname.includes(tab.href))?.id ?? "dashboard";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 h-screen w-[260px] shrink-0 flex flex-col bg-[#faf6f0] border-r border-[#e8e0d5]">

      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="px-6 py-7 border-b border-[#e8e0d5]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#e8ede8] flex items-center justify-center shrink-0">
            <Icon icon="mdi:flower-tulip" width={22} height={22} className="text-[#5a7a5a]" />
          </div>
          <div>
            <p className="text-[#2c2a26] font-bold text-[16px] leading-none tracking-wide">
              BloomHero
            </p>
            <p className="text-[#a89e8e] text-[11px] mt-1 uppercase tracking-[0.12em]">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav
        className="flex flex-col gap-0.5 px-4 py- flex-1"
        aria-label="Vendor dashboard navigation"
      >
        {/* {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return isActive ? (
            <div
              key={tab.id}
              className="flex items-center gap-3 h-11 px-3 rounded-xl w-full bg-[#e8ede8] border border-[#c8d8c8]"
            >
              <Icon icon={tab.icon} width={18} height={18} className="text-[#4a6b4a] shrink-0" />
              <span className="text-[#3a5a3a] text-[14px] font-semibold">{tab.label}</span>
            </div>
          ) : (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex items-center gap-3 h-11 px-3 rounded-xl w-full text-[#7a6e60] hover:text-[#3a5a3a] hover:bg-[#f0ebe3] transition-all duration-150"
            >
              <Icon icon={tab.icon} width={18} height={18} className="shrink-0" />
              <span className="text-[14px] font-medium">{tab.label}</span>
            </Link>
          );
        })} */}
        {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-3 h-12 px-4 rounded-xl w-full transition-all duration-150 ${
              isActive
                ? "bg-[#e8ede8] border border-[#c8d8c8] text-[#3a5a3a]"
                : "text-[#7a6e60] hover:text-[#3a5a3a] hover:bg-[#f0ebe3]"
            }`}
          >
            <Icon
              icon={tab.icon}
              width={20}
              height={20}
              className={`shrink-0 ${isActive ? "text-[#4a6b4a]" : ""}`}
            />
            <span className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
      </nav>

      {/* ── Vendor type badge ─────────────────────────────── */}
      <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-[#f0ebe3] border border-[#e0d8cc]">
        <div className="flex items-center gap-2">
          <Icon
            icon={vendorType === "market" ? "mdi:store-outline" : "mdi:tent-outline"}
            width={16}
            height={16}
            className="text-[#8a7a6a] shrink-0"
          />
          <p className="text-[12px] text-[#8a7a6a] font-medium">
            {vendorType === "market" ? "Selling at market" : "Selling at pop-up"}
          </p>
        </div>
      </div>

      {/* ── Sign out ──────────────────────────────────────── */}
      <div className="px-4 pb-6">
        <div className="border-t border-[#e8e0d5] pt-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 h-11 w-full px-4 rounded-xl text-[#a89e8e] hover:text-[#3a5a3a] hover:bg-[#f0ebe3] transition-all duration-150"
          >
            <Icon icon="mdi:logout" width={17} height={17} />
            <span className="text-[14px] font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}