import {
  vendorOfferingBadgeLabel,
  type VendorOfferingBadge,
} from "@/features/vendors/utils/vendorOfferings";

export function VendorOfferingBadges({
  badges,
  className = "",
}: {
  badges: VendorOfferingBadge[];
  className?: string;
}) {
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex rounded-full bg-[#f3eee8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]"
        >
          {vendorOfferingBadgeLabel(badge)}
        </span>
      ))}
    </div>
  );
}
