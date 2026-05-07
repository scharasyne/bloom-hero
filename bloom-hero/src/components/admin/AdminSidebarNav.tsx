"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import SidebarAlertCard from "@/components/admin/SidebarAlertCard";

const navItems = [
  { label: "Dashboard",           href: "/admin/dashboard",          icon: "mdi:home-outline"             },
  { label: "Vendor Applications", href: "/admin/vendor-applications", icon: "mdi:clipboard-text-outline"   },
  { label: "Vendors",             href: "/admin/vendors",             icon: "mdi:account-multiple-outline" },
  { label: "Reviews",             href: "/admin/review-moderation",   icon: "mdi:star-outline"             },
  { label: "Activity Logs",       href: "/admin/activity-logs",       icon: "mdi:clock-outline"            },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="sticky top-0 h-screen w-[260px] shrink-0 flex flex-col bg-[#162d1e]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="px-[24px] py-[28px] border-b border-white/10">
        <div className="flex items-center gap-[10px]">
          <div className="size-[34px] rounded-[10px] bg-white/15 flex items-center justify-center shrink-0">
            <Icon icon="mdi:flower-tulip-outline" width={18} height={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[15px] leading-none tracking-wide">Arianna</p>
            <p className="text-white/40 text-[10px] mt-[4px] uppercase tracking-[0.12em]">BloomHero Admin</p>
          </div>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────── */}
      <nav className="flex flex-col gap-[4px] px-[14px] py-[18px] flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return isActive ? (
            <div
              key={item.label}
              className="flex gap-[10px] h-[44px] items-center px-[12px] rounded-[12px] w-full bg-white"
            >
              <Icon icon={item.icon} width={18} height={18} className="text-[#162d1e] shrink-0" />
              <span className="text-[#162d1e] text-[14px] font-bold">{item.label}</span>
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="flex gap-[10px] h-[44px] items-center px-[12px] rounded-[12px] w-full text-white/55 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <Icon icon={item.icon} width={18} height={18} className="shrink-0" />
              <span className="text-[14px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ────────────────────────────────────── */}
      <div className="px-[14px] pb-[24px] flex flex-col gap-[8px]">
        <SidebarAlertCard />

        <div className="border-t border-white/10 pt-[8px]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-[10px] h-[40px] w-full px-[12px] rounded-[12px] text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <Icon icon="mdi:logout" width={16} height={16} />
            <span className="text-[13px] font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}