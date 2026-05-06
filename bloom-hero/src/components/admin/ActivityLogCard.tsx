"use client";

import { Icon } from "@iconify/react";
import { ActivityLog, DetailLine } from "@/typess";

type Props = { log: ActivityLog };

const dotConfig = {
  approved:    { color: "bg-[#2e7d5b]",  text: "text-[#2e7d5b]",  icon: "mdi:check-circle"   },
  rejected:    { color: "bg-[#c43c30]",  text: "text-[#c43c30]",  icon: "mdi:close-circle"   },
  suspended:   { color: "bg-[#b86a2a]",  text: "text-[#b86a2a]",  icon: "mdi:alert-circle"   },
  unsuspended: { color: "bg-[#2e7d5b]",  text: "text-[#2e7d5b]",  icon: "mdi:check-circle"   },
  login:       { color: "bg-[#1565c0]",  text: "text-[#1565c0]",  icon: "mdi:login"          },
  logout:      { color: "bg-[#7a746e]",  text: "text-[#7a746e]",  icon: "mdi:logout"         },
};

const actionIcon = {
  approved:    "mdi:check-circle",
  rejected:    "mdi:close-circle",
  suspended:   "mdi:alert",        
  unsuspended: "mdi:check-circle",
  login:       "mdi:login",
  logout:      "mdi:logout",
};

function DetailRow({ detail }: { detail: DetailLine }) {
  // Order + Verified line — smaller, gray, no icon
  if (detail.type === "order-verified") {
  // Split on "•" to separate order # from verified purchase
    const [orderPart, verifiedPart] = detail.text.split(" • ");
    return (
        <div className="flex gap-[6px] items-center px-[12px]">
        <span className="text-[#7a746e] text-[13px]">{orderPart} •</span>
        <Icon icon="mdi:check-circle" width={14} height={14} className="text-[#2e7d5b] shrink-0" />
        <span className="text-[#7a746e] text-[13px]">{verifiedPart}</span>
        </div>
    );
    }


  const iconMap: Record<Exclude<DetailLine["type"], "order-verified">, { icon: string; className: string }> = {
    flag:    { icon: "mdi:flag",                className: "text-[#cc3526]"  },
    reason:  { icon: "mdi:alert-circle",        className: "text-[#b86a2a]"  },
    info:    { icon: "mdi:information-outline", className: "text-[#7a746e]"  },
  };

  const { icon, className } = iconMap[detail.type];

  return (
    <div className="flex gap-[6px] items-center px-[12px]">
        <Icon icon={icon} width={16} height={16} className={`${className} shrink-0`} />
        <span className={`text-[14px] ${detail.type === "info" ? "text-[#7a746e]" : "text-[#2c2a28]"}`}>
        {detail.text}
        </span>
    </div>
  );
}

function StarRating({ score, max }: { score: number; max: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {Array.from({ length: max }).map((_, i) => (
        <Icon
          key={i}
          icon="mdi:star"
          width={16}
          height={16}
          className={i < score ? "text-[#b86a2a]" : "text-[#7a746e]"}
        />
      ))}
      <span className="text-[#2c2a28] text-[16px] font-medium ml-[4px]">{score}.0</span>
    </span>
  );
}


export default function ActivityLogCard({ log }: Props) {
  const { adminName, timestamp, actionType, actionTitle, targetName, details, tags, quickLinks } = log;
  const cfg = dotConfig[actionType];

  const formatted = new Date(timestamp).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* ── Card Top ───────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px] items-center">
          {/* Colored status dot */}
          <div className={`${cfg.color} rounded-[6px] size-[20px] shrink-0`} />
          {/* Timestamp + Admin */}
          <span className="font-semibold text-[24px] text-[#2c2a28] leading-[32px]">
            {formatted}
          </span>
          <span className="font-semibold text-[24px] text-[#2c2a28] leading-[32px]">
            {adminName}
          </span>
        </div>
        {/* Three-dot kebab menu — UI only */}
        <button className="flex items-center justify-center size-[32px] rounded-[8px] hover:bg-[#f3f2f0] transition-colors cursor-pointer">
          <Icon icon="mdi:dots-vertical" width={20} height={20} className="text-[#7a746e]" />
        </button>
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Action Title ───────────────────────────── */}
      <div className={`${cfg.text} flex gap-[8px] items-center px-[12px]`}>
        <Icon icon={actionIcon[actionType]} width={24} height={24} className="shrink-0" />
        <p className="font-bold text-[24px] leading-[32px] uppercase tracking-[0.5px]">
            {actionTitle}
        </p>
    </div>

      {/* ── Info Stack ─────────────────────────────── */}
      <div className="flex flex-col gap-[10px] w-full">
        {/* Target name */}
        <div className="flex items-center gap-[8px] flex-wrap px-[12px]">
        <p className="font-medium text-[20px] text-[#2c2a28] leading-[24px]">
            {targetName}
        </p>
        {log.rating && <StarRating score={log.rating.score} max={log.rating.max} />}
      </div>

        {/* Details lines */}
        {details.map((detail, i) => (
        <DetailRow key={i} detail={detail} />
        ))}


        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-[10px] items-center flex-wrap px-[12px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-white border border-[#edeae6] text-[#7a746e] text-[14px] font-normal px-[12px] py-[8px] rounded-[12px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ────────────────────────────────── */}
      {quickLinks.length > 0 && <div className="bg-[#e6e2dd] h-px w-full" />}

      {/* ── Quick Links ────────────────────────────── */}
      {quickLinks.length > 0 && (
        <div className="flex gap-[10px] items-center px-[12px] flex-wrap">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => console.log(`Navigating to: ${link.href}`)}
              className="bg-white border border-[#e6e2dd] text-[#2c2a28] text-[14px] font-medium h-[44px] px-[16px] rounded-[12px] cursor-pointer hover:bg-[#f3f2f0] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
