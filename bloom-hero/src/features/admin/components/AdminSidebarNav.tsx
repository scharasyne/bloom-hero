"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AdminSidebarAlertCard } from "@/features/admin/components/AdminSidebarAlertCard";
import { ADMIN_NAV_ITEMS } from "@/features/admin/utils/adminNavConfig";
import type { AdminNavAlertCounts } from "@/features/admin/types";

type AdminSidebarNavProps = {
  alertCounts: AdminNavAlertCounts;
};

function alertTotal(counts: AdminNavAlertCounts) {
  return (
    counts.pendingApplications +
    counts.pendingReviews +
    counts.suspendedVendors +
    counts.pendingAppeals
  );
}

export default function AdminSidebarNav({ alertCounts }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const totalAlerts = alertTotal(alertCounts);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#edeae6] bg-[#fbf7f4] px-4 md:hidden"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 shrink-0 rounded-lg bg-[#162d1e] flex items-center justify-center">
            <Icon icon="mdi:flower-tulip-outline" width={16} height={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#2c2a28] leading-none truncate">BloomHero</p>
            <p className="text-[10px] text-[#7a746e] uppercase tracking-wide">Admin</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {totalAlerts > 0 ? (
            <Link
              href="/admin/vendor-applications"
              aria-label={`${totalAlerts} items need attention`}
              className="relative flex size-10 items-center justify-center rounded-full text-[#7a746e] hover:bg-[#edeae6] transition-colors"
            >
              <Icon icon="mdi:bell-alert-outline" width={20} height={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f87171] px-1 text-[10px] font-bold text-white">
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex size-10 items-center justify-center rounded-full text-[#7a746e] hover:bg-[#edeae6] transition-colors"
          >
            <Icon icon="mdi:logout" width={20} height={20} />
          </button>
        </div>
      </header>

      {/* Desktop sidebar — never rendered in mobile document flow */}
      <div className="max-md:hidden md:block md:w-[260px] md:shrink-0">
        <aside
          className="sticky top-0 flex h-screen w-[260px] flex-col bg-[#162d1e]"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          <div className="px-6 py-7 border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="size-[34px] rounded-[10px] bg-white/15 flex items-center justify-center shrink-0">
                <Icon icon="mdi:flower-tulip-outline" width={18} height={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-[15px] leading-none tracking-wide">BloomHero</p>
                <p className="text-white/40 text-[10px] mt-1 uppercase tracking-[0.12em]">Admin</p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3.5 py-4" aria-label="Admin navigation">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return isActive ? (
                <div
                  key={item.href}
                  className="flex h-11 items-center gap-2.5 rounded-xl bg-white px-3"
                >
                  <Icon icon={item.icon} width={18} height={18} className="text-[#162d1e] shrink-0" />
                  <span className="text-[#162d1e] text-sm font-bold">{item.label}</span>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-11 items-center gap-2.5 rounded-xl px-3 text-white/55 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Icon icon={item.icon} width={18} height={18} className="shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-2 px-3.5 pb-6">
            <AdminSidebarAlertCard counts={alertCounts} />
            <div className="border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon icon="mdi:logout" width={16} height={16} />
                <span className="text-[13px] font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav — icons only */}
      <nav
        aria-label="Admin navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#162d1e] bg-[#162d1e] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          if (isActive) {
            return (
              <div
                key={item.href}
                aria-current="page"
                aria-label={item.label}
                className="flex size-11 items-center justify-center rounded-full bg-white"
              >
                <Icon icon={item.icon} width={22} height={22} className="text-[#162d1e]" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex size-11 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon icon={item.icon} width={22} height={22} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
