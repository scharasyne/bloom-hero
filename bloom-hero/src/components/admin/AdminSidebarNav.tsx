"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";


const navItems = [
  { label: "Dashboard",           href: "/admin/dashboard",                  icon: "mdi:home" },
  { label: "Vendor Applications", href: "/admin/vendor-applications",         icon: "mdi:clipboard-text" },
  { label: "Vendors",             href: "/admin/vendors", icon: "mdi:account-multiple" },
  { label: "Reviews",             href: "/admin/review-moderation",     icon: "mdi:star" },
  { label: "Activity Logs",       href: "/admin/activity-logs",               icon: "mdi:clock" },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-col gap-[12px] items-start px-[24px] py-[16px] h-full border-r border-[#edeae6] w-[240px] shrink-0"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return isActive ? (
          <div
            key={item.label}
            className="bg-[#eaf3ef] flex gap-[12px] h-[48px] items-center px-[12px] rounded-[12px] w-full"
          >
            <div className="bg-[#2e7d5b] h-[28px] w-[4px] rounded-full shrink-0" />
            <Icon icon={item.icon} width={20} height={20} className="text-[#2e7d5b] shrink-0" />
            <span className="text-[#2e7d5b] text-[16px] font-medium tracking-[0.64px]">
              {item.label}
            </span>
          </div>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className="flex gap-[12px] h-[48px] items-center px-[12px] rounded-[12px] w-full hover:bg-[#f3f2f0] transition-colors cursor-pointer"
          >
            <Icon icon={item.icon} width={20} height={20} className="text-[#5f5a55] shrink-0" />
            <span className="text-[#5f5a55] text-[16px] font-medium tracking-[0.64px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
