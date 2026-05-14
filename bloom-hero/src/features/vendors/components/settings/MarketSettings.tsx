// Source: src/app/(vendor)/_components/settings/market-settings.tsx

/*
      STILL HARD CODED - IMPLEMENT CHANGES TO DATABASE
*/

"use client";

import { useState } from "react";
import {
  SectionCard, SectionHeader,
  SettingRow, SettingRowFull,
  Toggle, FieldInput, FieldTextarea, FieldSelect, Btn,
  AccountTab, SettingsShell,
} from "./shared";

// ─── Tab: Store Profile ───────────────────────────────────────────────────────

function ProfileTab() {
  const [storeVisible, setStoreVisible] = useState(true);
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [showOnMap, setShowOnMap]       = useState(true);
  const [allowReviews, setAllowReviews] = useState(true);

  return (
    <div>
      <SectionCard>
        <SectionHeader icon="mdi:home-outline" title="Store Identity" desc="How your shop appears to customers on BloomHero" />
        <SettingRowFull label="Store Logo" hint="Recommended: 400×400px, PNG or JPG, max 2MB">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2f5d3a] flex items-center justify-center text-white text-lg font-bold shrink-0">SB</div>
            <div className="flex flex-col gap-1">
              <button className="text-[12.5px] font-semibold text-[#2f5d3a] underline underline-offset-2 text-left hover:text-[#26502f] transition-colors duration-150">Upload new photo</button>
              <button className="text-[12.5px] font-semibold text-[#c0392b] underline underline-offset-2 text-left hover:text-[#9b2a1e] transition-colors duration-150">Remove photo</button>
              <span className="text-[11px] text-[#a8b5ac]">PNG, JPG up to 2MB</span>
            </div>
          </div>
        </SettingRowFull>
        <SettingRowFull label="Store Details" hint="Fill in your public store information">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="Store Name"     type="text"  defaultValue="Sunshine Blooms" />
            <FieldInput label="Display Tagline" type="text" placeholder="e.g. Fresh cuts, every day" />
            <div className="col-span-2">
              <FieldTextarea label="Store Description" defaultValue="Fresh, locally-sourced flowers delivered with care." />
            </div>
          </div>
        </SettingRowFull>
        <SettingRowFull label="Contact & Location" hint="Used for customer inquiries and map listings">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="Contact Email" type="email" defaultValue="hello@sunshinebloom.ph" />
            <FieldInput label="Phone Number"  type="tel"   defaultValue="+63 912 345 6789" />
            <div className="col-span-2">
              <FieldInput label="Market / Stall Address" type="text" defaultValue="Stall 12, Sugbo Mercado, Cebu City" />
            </div>
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:file-document-outline" title="Store Policies" desc="Refund, return, and custom order policies shown on your profile" />
        <SettingRowFull label="Return & Refund Policy">
          <FieldTextarea defaultValue="All sales are final. Damaged goods must be reported within 24 hours with photo proof." />
        </SettingRowFull>
        <SettingRowFull label="Custom Order Lead Time" hint="How many days advance notice do you need for custom orders?">
          <div className="flex items-center gap-2.5">
            <input type="number" defaultValue={3} min={1} className="h-9 w-20 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-semibold text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15" />
            <span className="text-[13px] text-[#6b7a6f] font-medium">business days</span>
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:eye-outline" title="Store Visibility" desc="Control how and where your store is shown" />
        <SettingRow label="Show store on marketplace" hint="Customers can discover and browse your store publicly">
          <Toggle checked={storeVisible} onChange={setStoreVisible} />
        </SettingRow>
        <SettingRow label="Accept new orders" hint="Temporarily pause orders without hiding your store">
          <Toggle checked={acceptOrders} onChange={setAcceptOrders} />
        </SettingRow>
        <SettingRow label="Show stall location on map" hint="Display your exact stall pin in the market map view">
          <Toggle checked={showOnMap} onChange={setShowOnMap} />
        </SettingRow>
        <SettingRow label="Allow customer reviews" hint="Let verified buyers leave ratings and feedback">
          <Toggle checked={allowReviews} onChange={setAllowReviews} />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

type NotifKey = "newOrder" | "cancelled" | "payment" | "review" | "lowStock" | "digest" | "promos";

function NotificationsTab() {
  const [email, setEmail] = useState<Record<NotifKey, boolean>>({
    newOrder: true, cancelled: true, payment: true,
    review: false, lowStock: true, digest: true, promos: false,
  });
  const [inApp, setInApp] = useState<Record<NotifKey, boolean>>({
    newOrder: true, cancelled: true, payment: false,
    review: true, lowStock: true, digest: false, promos: false,
  });
  const [quietHours, setQuietHours] = useState(true);

  const rows: Array<{ key: NotifKey; label: string; hint: string }> = [
    { key: "newOrder",   label: "New order received",            hint: "When a customer places an order at your stall" },
    { key: "cancelled",  label: "Order cancelled",               hint: "When a customer or system cancels an order"    },
    { key: "payment",    label: "Payment received",              hint: "Confirmation when payment is settled"          },
    { key: "review",     label: "New customer review",           hint: "When someone leaves a rating or comment"       },
    { key: "lowStock",   label: "Low stock alert",               hint: "When a product drops below your threshold"     },
    { key: "digest",     label: "Weekly performance digest",     hint: "A summary of sales, views, and top products"   },
    { key: "promos",     label: "Promotions & platform updates", hint: "BloomHero news, feature releases, vendor tips" },
  ];

  return (
    <div>
      <SectionCard>
        <SectionHeader icon="mdi:bell-outline" title="Notification Preferences" desc="Choose how you receive alerts for each event type" />
        <div className="grid grid-cols-[1fr_72px_72px] px-6 py-2.5 border-b border-[#f0ece8]">
          <div />
          <div className="text-[11px] font-bold text-[#a8b5ac] uppercase tracking-[0.5px] text-center">Email</div>
          <div className="text-[11px] font-bold text-[#a8b5ac] uppercase tracking-[0.5px] text-center">In-app</div>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr_72px_72px] items-center px-6 py-3.5 border-b border-[#f0ece8] last:border-b-0 hover:bg-[#f4f8f5] transition-colors duration-150">
            <div>
              <p className="text-[13px] font-semibold text-[#1e2a22]">{row.label}</p>
              <p className="text-[11.5px] text-[#6b7a6f] mt-0.5 leading-snug">{row.hint}</p>
            </div>
            <div className="flex justify-center">
              <Toggle checked={email[row.key]} onChange={(v) => setEmail((p) => ({ ...p, [row.key]: v }))} />
            </div>
            <div className="flex justify-center">
              <Toggle checked={inApp[row.key]} onChange={(v) => setInApp((p) => ({ ...p, [row.key]: v }))} />
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:clock-outline" title="Quiet Hours" desc="Suppress in-app alerts during these hours" />
        <SettingRow label="Enable quiet hours" hint="Notifications are batched and delivered after the window ends">
          <Toggle checked={quietHours} onChange={setQuietHours} />
        </SettingRow>
        {quietHours && (
          <SettingRowFull label="Quiet window">
            <div className="flex items-center gap-3 mt-1">
              <input type="time" defaultValue="22:00" className="h-9 w-28 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-semibold text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15" />
              <span className="text-[12px] text-[#a8b5ac] font-medium">to</span>
              <input type="time" defaultValue="07:00" className="h-9 w-28 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-semibold text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15" />
            </div>
          </SettingRowFull>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Business Hours ──────────────────────────────────────────────────────

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

function HoursTab() {
  const days: Array<{ key: DayKey; label: string; defaultOpen: boolean; open: string; close: string }> = [
    { key: "monday",    label: "Monday",    defaultOpen: true,  open: "07:00", close: "18:00" },
    { key: "tuesday",   label: "Tuesday",   defaultOpen: true,  open: "07:00", close: "18:00" },
    { key: "wednesday", label: "Wednesday", defaultOpen: true,  open: "07:00", close: "18:00" },
    { key: "thursday",  label: "Thursday",  defaultOpen: true,  open: "07:00", close: "18:00" },
    { key: "friday",    label: "Friday",    defaultOpen: true,  open: "07:00", close: "20:00" },
    { key: "saturday",  label: "Saturday",  defaultOpen: true,  open: "06:00", close: "20:00" },
    { key: "sunday",    label: "Sunday",    defaultOpen: false, open: "07:00", close: "18:00" },
  ];

  const [open, setOpen] = useState<Record<DayKey, boolean>>(
    Object.fromEntries(days.map((d) => [d.key, d.defaultOpen])) as Record<DayKey, boolean>
  );
  const [phHolidays, setPhHolidays] = useState(true);

  const timeInputClass = "h-8 w-24 px-2.5 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-semibold text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15";

  return (
    <div>
      <SectionCard>
        <SectionHeader icon="mdi:calendar-outline" title="Operating Hours" desc="Shown on your store profile and used for order scheduling" />
        {days.map((day) => (
          <div key={day.key} className="grid grid-cols-[120px_1fr_auto] items-center px-6 py-3 gap-3 border-b border-[#f0ece8] last:border-b-0 hover:bg-[#f4f8f5] transition-colors duration-150">
            <span className="text-[13px] font-semibold text-[#1e2a22]">{day.label}</span>
            {open[day.key] ? (
              <div className="flex items-center gap-2">
                <input type="time" defaultValue={day.open}  className={timeInputClass} />
                <span className="text-[12px] text-[#a8b5ac] font-medium">–</span>
                <input type="time" defaultValue={day.close} className={timeInputClass} />
              </div>
            ) : (
              <span className="text-[12.5px] text-[#a8b5ac] font-medium italic">Closed</span>
            )}
            <Toggle checked={open[day.key]} onChange={(v) => setOpen((p) => ({ ...p, [day.key]: v }))} />
          </div>
        ))}
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:calendar-remove-outline" title="Holiday Closures" desc="Mark specific dates when your store will be closed" />
        <SettingRow label="Auto-apply PH public holidays" hint="Automatically mark national holidays as closed days">
          <Toggle checked={phHolidays} onChange={setPhHolidays} />
        </SettingRow>
        <SettingRowFull label="Add a closure date">
          <div className="flex items-center gap-2.5 mt-1">
            <input type="date" className="h-9 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-medium text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15" />
            <input type="text" placeholder="Reason (optional)" className="h-9 flex-1 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-medium text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15 placeholder:text-[#a8b5ac]" />
            <Btn variant="secondary">Add</Btn>
          </div>
        </SettingRowFull>
      </SectionCard>
    </div>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────

type MarketSettingsTab = "profile" | "notifications" | "hours" | "account";

const tabs: Array<{ id: MarketSettingsTab; label: string }> = [
  { id: "profile",       label: "Store Profile"  },
  { id: "notifications", label: "Notifications"  },
  { id: "hours",         label: "Business Hours" },
  { id: "account",       label: "Account"        },
];

export function MarketSettings() {
  const [activeTab, setActiveTab] = useState<MarketSettingsTab>("profile");

  const panels: Record<MarketSettingsTab, React.ReactNode> = {
    profile:       <ProfileTab />,
    notifications: <NotificationsTab />,
    hours:         <HoursTab />,
    account:       <AccountTab vendorType="market" />,
  };

  return (
    <SettingsShell
      subtitle="Manage your store profile, notifications, and preferences."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as MarketSettingsTab)}
      panels={panels}
    />
  );
}