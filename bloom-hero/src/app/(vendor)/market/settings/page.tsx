"use client";

import { MarketSettings } from "@/app/(vendor)/_components/settings/market-settings";

export default function MarketSettingsPage() {
  return (
    <main className="flex h-screen bg-[#fbf7f4]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="lg:p-6">
      </div>
      <div className="flex-1 overflow-hidden">
        <MarketSettings />
      </div>
    </main>
  );
}