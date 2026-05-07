import Link from "next/link";
import { Icon } from "@iconify/react";

type AlertItem = {
  label:   string;
  count:   number;
  href:    string;
  icon:    string;
  urgent?: boolean;
};

// TODO: replace with real usePendingCounts() hook connected to Supabase
const alerts: AlertItem[] = [
  { label: "Vendor applications", count: 3, href: "/admin/vendor-applications", icon: "mdi:clipboard-text-outline", urgent: true  },
  { label: "Flagged reviews",     count: 5, href: "/admin/review-moderation",   icon: "mdi:flag-outline",           urgent: true  },
  { label: "Accounts to review",  count: 2, href: "/admin/vendors",             icon: "mdi:account-alert-outline",  urgent: false },
];

const total = alerts.reduce((sum, a) => sum + a.count, 0);

export default function SidebarAlertCard() {
  if (total === 0) return null;

  return (
    <div className="rounded-[14px] border border-white/10 bg-white/8 p-[14px]">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[10px]">
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:bell-alert-outline" width={14} height={14} className="text-[#f87171]" />
          <span className="text-[12px] font-semibold text-white/80">Needs attention</span>
        </div>
        <span className="rounded-full bg-[#f87171] px-[7px] py-[3px] text-[10px] font-bold text-white leading-none">
          {total}
        </span>
      </div>

      {/* ── Rows ────────────────────────────────────── */}
      <div className="flex flex-col gap-[4px]">
        {alerts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-[8px] px-[10px] py-[7px] hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-[7px]">
              <Icon
                icon={item.icon}
                width={13} height={13}
                className={item.urgent ? "text-[#f87171]" : "text-white/40"}
              />
              <span className="text-[12px] text-white/60 group-hover:text-white/90 transition-colors leading-tight">
                {item.label}
              </span>
            </div>
            <span className={`text-[12px] font-bold ${item.urgent ? "text-[#f87171]" : "text-white/40"}`}>
              {item.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}