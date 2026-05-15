import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { SearchPopUpRow } from "@/features/search/types";
import { publicVendorProfilePath } from "@/features/vendors/utils/publicVendorPaths";

export function PopUpResultCard({
  popup,
  showProfileLink = true,
}: {
  popup: SearchPopUpRow;
  showProfileLink?: boolean;
}) {
  const profileHref = publicVendorProfilePath(popup.vendor_id);
  const statusLabel =
    popup.status === "happening" ? "Happening now" : popup.status === "upcoming" ? "Upcoming" : "Past";

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-[22px] border border-[#edeae6] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_12px_30px_0px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3 px-5 py-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              popup.status === "happening"
                ? "bg-[#e8f3ed] text-[#2f5d3a]"
                : "bg-[#f3eee8] text-[#7a7a7a]"
            }`}
          >
            {statusLabel}
          </span>
          <h3 className="text-[20px] font-semibold leading-tight text-[#1f1f1f]">{popup.shop_name}</h3>
          <p className="flex items-start gap-2 text-[14px] leading-6 text-[#7a7a7a]">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#2f5d3a]" />
            <span>{popup.location}</span>
          </p>
          <p className="flex items-center gap-2 text-[14px] text-[#7a7a7a]">
            <Calendar size={16} className="shrink-0 text-[#2f5d3a]" />
            <span>
              {popup.start_label}
              {popup.end_label !== popup.start_label ? ` – ${popup.end_label}` : ""}
              {popup.time_label ? ` • ${popup.time_label}` : ""}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-5 sm:flex-row">
        {showProfileLink ? (
          <Link
            href={profileHref}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#e1dbd4] px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4]"
          >
            View profile
          </Link>
        ) : null}
        <Link
          href="/map"
          className={`inline-flex flex-1 items-center justify-center rounded-full border border-[#e1dbd4] px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4] ${showProfileLink ? "" : "w-full"}`}
        >
          View on map
        </Link>
      </div>
    </article>
  );
}
