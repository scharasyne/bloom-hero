"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/OrderCard";
import { mockOrders } from "@/lib/mockData";
import { Icon } from "@iconify/react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function OrdersPage() {
  const { data: orders } = useOrders();
  const [activeTab, setActiveTab] = useState<"to-pay" | "to-ship" | "to-receive" | "completed">("to-pay");

  const filtered = orders.filter((o) => o.status === activeTab);
  const unpaidCount = orders.filter((o) => o.status === "to-pay").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f2ee]">
      <NavBar />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-12 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-[#e6e2dd] bg-[#f3f2f0] w-full max-w-2xl mb-6">
          {["to-pay", "to-ship", "to-receive", "completed"].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 h-[48px] flex items-center justify-center relative
                font-['Quicksand',sans-serif] font-medium text-[16px] tracking-[-0.08px] whitespace-nowrap
                ${activeTab === tab ? "text-[#2f6b4f]" : "text-[#2c2a28]"}`}
            >
              {idx < 3 && (
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 bottom-0 border-r border-[#e6e2dd] pointer-events-none"
                />
              )}
              <p className="leading-[52px]">
                {tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </button>
          ))}
        </div>

        {/* Warning banner for unpaid orders */}
        {activeTab === "to-pay" && unpaidCount > 0 && (
          <div className="flex items-center gap-2 bg-[#f7e8d8] border border-[#e6e2dd] text-[#2c2a28] rounded-lg px-4 py-3 mb-6">
            <Icon icon="tabler:alert-triangle" className="text-[#d65245] text-xl flex-shrink-0" />
            <span>
              You have {unpaidCount} unpaid {unpaidCount === 1 ? "order" : "orders"}. Orders not paid by the deadline may be cancelled.
            </span>
          </div>
        )}

        {activeTab === "to-ship" && unpaidCount > 0 && (
          <div className="flex items-center gap-2 bg-[#f7e8d8] border border-[#e6e2dd] text-[#2c2a28] rounded-lg px-4 py-3 mb-6">
            <Icon icon="tabler:alert-triangle" className="text-[#d65245] text-xl flex-shrink-0" />
            <span>
              You have {unpaidCount} unpaid {unpaidCount === 1 ? "order" : "orders"}. Orders not paid by the deadline may be cancelled.
            </span>
          </div>
        )}

        {/* Orders List */}
        {filtered.length === 0 ? (
          <p className="text-gray-600">
            {activeTab === "to-pay" && "No pending payments"}
            {activeTab === "to-ship" && "No orders waiting to be shipped"}
            {activeTab === "to-receive" && "No orders in transit"}
            {activeTab === "completed" && "No completed orders yet"}
          </p>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} variant={activeTab} />
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}
