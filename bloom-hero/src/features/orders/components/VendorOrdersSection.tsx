import { OrderCard } from "@/features/orders/components/OrderCard";
import type { TabKey } from "@/features/orders/constants";
import type { VendorOrderSection } from "@/features/orders/types";

function IconStorefront({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

type VendorOrdersSectionProps = {
  section: VendorOrderSection;
  activeTab: TabKey;
};

export function VendorOrdersSection({ section, activeTab }: VendorOrdersSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[#e6e2dd] bg-white px-4 py-3 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e6e2dd] bg-[#faf8f5] text-[#2f5d3a] shadow-sm">
          <IconStorefront />
        </div>
        <p className="min-w-0 truncate text-sm font-bold text-[#2f2f2f]">{section.vendorName}</p>
        <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#A39E96]">
          {section.cards.length} item{section.cards.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3 pl-0 sm:pl-2">
        {section.cards.map((card) => (
          <OrderCard
            key={card.itemId}
            order={card.order}
            item={card.row}
            activeTab={activeTab}
          />
        ))}
      </div>
    </div>
  );
}
