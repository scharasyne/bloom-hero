"use client";

import { PopUpSettings } from "@/app/(vendor)/_components/settings/pop-up-settings";

export default function PopUpSettingsPage() {
  return (
    <main className="flex min-h-screen bg-[#fbf7f4]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="flex-1 overflow-hidden px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <PopUpSettings />
      </div>
    </main>
  );
}