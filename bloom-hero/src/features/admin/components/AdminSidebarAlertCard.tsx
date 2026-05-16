import Link from "next/link";
import { Icon } from "@iconify/react";
import type { AdminNavAlertCounts } from "@/features/admin/types";

type AlertItem = {
  label: string;
  count: number;
  href: string;
  icon: string;
  urgent?: boolean;
};

type AdminSidebarAlertCardProps = {
  counts: AdminNavAlertCounts;
};

export function AdminSidebarAlertCard({ counts }: AdminSidebarAlertCardProps) {
  const alerts: AlertItem[] = [
    {
      label: "Vendor applications",
      count: counts.pendingApplications,
      href: "/admin/vendor-applications",
      icon: "mdi:clipboard-text-outline",
      urgent: counts.pendingApplications > 0,
    },
    {
      label: "Pending reviews",
      count: counts.pendingReviews,
      href: "/admin/review-moderation",
      icon: "mdi:star-outline",
      urgent: counts.pendingReviews > 0,
    },
    {
      label: "Suspension appeals",
      count: counts.pendingAppeals,
      href: "/admin/vendors",
      icon: "mdi:gavel",
      urgent: counts.pendingAppeals > 0,
    },
    {
      label: "Suspended vendors",
      count: counts.suspendedVendors,
      href: "/admin/vendors",
      icon: "mdi:account-alert-outline",
      urgent: false,
    },
  ].filter((item) => item.count > 0);

  const total = alerts.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return null;

  return (
    <div className="rounded-[14px] border border-white/10 bg-white/10 p-[14px]">
      <div className="flex items-center justify-between mb-[10px]">
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:bell-alert-outline" width={14} height={14} className="text-[#f87171]" />
          <span className="text-[12px] font-semibold text-white/80">Needs attention</span>
        </div>
        <span className="rounded-full bg-[#f87171] px-[7px] py-[3px] text-[10px] font-bold text-white leading-none">
          {total}
        </span>
      </div>

      <div className="flex flex-col gap-[4px]">
        {alerts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-[8px] px-[10px] py-[7px] hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-[7px] min-w-0">
              <Icon
                icon={item.icon}
                width={13}
                height={13}
                className={`shrink-0 ${item.urgent ? "text-[#f87171]" : "text-white/40"}`}
              />
              <span className="text-[12px] text-white/60 group-hover:text-white/90 transition-colors leading-tight truncate">
                {item.label}
              </span>
            </div>
            <span
              className={`text-[12px] font-bold shrink-0 ml-2 ${item.urgent ? "text-[#f87171]" : "text-white/40"}`}
            >
              {item.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
