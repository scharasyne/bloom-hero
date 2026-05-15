// Source: `src/app/(customer)/orders/page.tsx`

import Footer from "@/components/footer";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { TABS, EMPTY_STATE, type TabKey } from "@/features/orders/constants";
import type { OrderGroup } from "@/features/orders/types";

function IconPackage({ className = "" }: { className?: string }) {
  return (
    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20 7l-8 4.5L4 7" /><path d="M12 11.5V21" />
      <path d="M20 7v10l-8 4-8-4V7l8-4 8 4z" /><path d="M16 5.25l-8 4.5" />
    </svg>
  );
}

export function CustomerOrdersSignInView() {
  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-[#fbf7f4] px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e6e2dd] px-8 py-10 text-center max-w-md w-full">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f0]">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#D24B46" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 1 1 8 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#2f2f2f] mb-2">Sign in to view your orders</h1>
          <p className="text-sm text-[#6D6863] mb-6">You need to be logged in to view your purchase history.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-[#D24B46] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#A53A35] transition-colors"
          >
            Go to Login
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

type CustomerOrdersPageViewProps = {
  activeTab: TabKey;
  orders: OrderGroup[];
};

export function CustomerOrdersPageView({ activeTab, orders }: CustomerOrdersPageViewProps) {
  const emptyState = EMPTY_STATE[activeTab];

  return (
    <>
      <main className="min-h-screen bg-[#fbf7f4] page-x pb-16 pt-4 sm:pt-6">
        <div className="mx-auto w-full max-w-230 pt-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2f2f2f] tracking-tight">
              Purchase History
            </h1>
            <p className="mt-1 text-sm text-[#A39E96] font-medium">
              Track and manage your BloomHero orders
            </p>

            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {TABS.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <a
                    key={t.key}
                    href={`?tab=${t.key}`}
                    className={[
                      "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                      isActive
                        ? "bg-[#D24B46] text-white shadow-sm shadow-[#D24B46]/20"
                        : "bg-white text-[#A39E96] border border-[#e6e2dd] hover:border-[#c0b8b0] hover:text-[#6D6863]",
                    ].join(" ")}
                  >
                    {t.label}
                  </a>
                );
              })}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#e6e2dd] bg-white px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f5f0] text-[#c0b8b0]">
                <IconPackage />
              </div>
              <h3 className="text-base font-bold text-[#2f2f2f]">{emptyState.heading}</h3>
              <p className="mt-2 max-w-xs text-sm text-[#A39E96]">{emptyState.body}</p>
              <a
                href="/"
                className="mt-6 inline-flex items-center rounded-full bg-[#D24B46] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#A53A35] transition-colors shadow-sm"
              >
                Browse Flowers
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} activeTab={activeTab} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
