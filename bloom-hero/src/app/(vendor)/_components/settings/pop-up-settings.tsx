"use client";

import { useState } from "react";
import {
  SectionCard, SectionHeader,
  SettingRow, SettingRowFull,
  Toggle, FieldInput, FieldTextarea, FieldSelect, Btn,
  AccountTab, SettingsShell,
} from "./shared";

// ─── Tab: Appearance ──────────────────────────────────────────────────────────

function AppearanceTab() {
  const [showOnDirectory, setShowOnDirectory] = useState(true);
  const [allowFollows, setAllowFollows]       = useState(true);
  const [showSoldOut, setShowSoldOut]         = useState(false);

  return (
    <div>
      <SectionCard>
        <SectionHeader icon="mdi:storefront-outline" title="Public Profile" desc="How your pop-up booth appears to customers browsing BloomHero" />
        <SettingRowFull label="Profile Photo" hint="Recommended: 400×400px, PNG or JPG, max 2MB">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2f5d3a] flex items-center justify-center text-white text-lg font-bold shrink-0">PV</div>
            <div className="flex flex-col gap-1">
              <button className="text-[12.5px] font-semibold text-[#2f5d3a] underline underline-offset-2 text-left hover:text-[#26502f] transition-colors duration-150">Upload new photo</button>
              <button className="text-[12.5px] font-semibold text-[#c0392b] underline underline-offset-2 text-left hover:text-[#9b2a1e] transition-colors duration-150">Remove photo</button>
              <span className="text-[11px] text-[#a8b5ac]">PNG, JPG up to 2MB</span>
            </div>
          </div>
        </SettingRowFull>
        <SettingRowFull label="Profile Details" hint="Shown on your public pop-up listing">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="Display Name" type="text" defaultValue="Petal Pop-up" />
            <FieldInput label="Tagline"      type="text" placeholder="e.g. Blooms wherever we go" />
            <div className="col-span-2">
              <FieldTextarea label="About" defaultValue="Seasonal blooms and dried arrangements brought fresh to your favorite pop-up events around Cebu." />
            </div>
          </div>
        </SettingRowFull>
        <SettingRowFull label="Contact Info" hint="How customers can reach you">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="Contact Email" type="email" defaultValue="hello@petalpopup.ph" />
            <FieldInput label="Phone / Viber" type="tel"   defaultValue="+63 917 000 0000" />
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:link-variant" title="Social Links" desc="Let customers follow you between events" />
        <SettingRowFull label="Social Profiles">
          <div className="grid grid-cols-1 gap-2.5">
            <FieldInput label="Instagram" type="url" placeholder="https://instagram.com/yourhandle" />
            <FieldInput label="Facebook"  type="url" placeholder="https://facebook.com/yourpage" />
            <FieldInput label="TikTok"    type="url" placeholder="https://tiktok.com/@yourhandle" />
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:eye-outline" title="Profile Visibility" desc="Control how your pop-up profile is shown" />
        <SettingRow label="Show on vendor directory" hint="Customers can discover your profile between events">
          <Toggle checked={showOnDirectory} onChange={setShowOnDirectory} />
        </SettingRow>
        <SettingRow label="Allow customers to follow you" hint="Followers get notified when you announce a new pop-up event">
          <Toggle checked={allowFollows} onChange={setAllowFollows} />
        </SettingRow>
        <SettingRow label="Show sold-out products" hint="Keep sold-out items visible with a 'Sold Out' badge on your profile">
          <Toggle checked={showSoldOut} onChange={setShowSoldOut} />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Schedule & Requests ─────────────────────────────────────────────────

function ScheduleTab() {
  const [autoAccept, setAutoAccept]           = useState(false);
  const [requireDeposit, setRequireDeposit]   = useState(true);
  const [notifyFollowers, setNotifyFollowers] = useState(true);
  const [advanceNotice, setAdvanceNotice]     = useState(true);

  return (
    <div>
      <SectionCard>
        <SectionHeader icon="mdi:map-marker-radius-outline" title="Pop-up Preferences" desc="Your default preferences for event organizer requests" />
        <SettingRowFull label="Preferred Event Types" hint="Select all that apply — organizers will see this when inviting you">
          <div className="flex flex-wrap gap-2 mt-1">
            {["Night Market", "Trade Fair", "Food Festival", "Art Market", "Weekend Bazaar", "Corporate Event", "Wedding Fair"].map((tag) => (
              <button key={tag} className="px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-[#edeae6] text-[#6b7a6f] hover:border-[#2f5d3a] hover:text-[#2f5d3a] hover:bg-[#eef4f0] transition-all duration-150 cursor-pointer">
                {tag}
              </button>
            ))}
          </div>
        </SettingRowFull>
        <SettingRowFull label="Preferred Setup Areas" hint="Locations you're willing to travel to">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="City / Municipality" type="text" defaultValue="Cebu City" />
            <FieldInput label="Max travel radius"   type="text" placeholder="e.g. 30 km" />
          </div>
        </SettingRowFull>
        <SettingRowFull label="Booth Requirements" hint="Space and logistics needs shared with organizers upfront">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldInput label="Min. booth size" type="text" placeholder="e.g. 2m × 2m" />
            <FieldSelect label="Power outlet">
              <option>Not required</option>
              <option>1 outlet (standard)</option>
              <option>2+ outlets</option>
            </FieldSelect>
            <div className="col-span-2">
              <FieldTextarea label="Additional notes" placeholder="e.g. Requires shaded area, needs access to water, etc." />
            </div>
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:clipboard-check-outline" title="Request Handling" desc="How you respond to pop-up event invitations" />
        <SettingRow label="Auto-accept event requests" hint="Automatically confirm requests that match your preferences">
          <Toggle checked={autoAccept} onChange={setAutoAccept} />
        </SettingRow>
        <SettingRow label="Require deposit confirmation" hint="Only finalize booking once organizer confirms your booth deposit">
          <Toggle checked={requireDeposit} onChange={setRequireDeposit} />
        </SettingRow>
        <SettingRowFull label="Minimum advance notice" hint="Reject requests that don't give you enough lead time">
          <div className="flex items-center gap-2.5 mt-1">
            <input type="number" defaultValue={7} min={1} className="h-9 w-20 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-semibold text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15" />
            <span className="text-[13px] text-[#6b7a6f] font-medium">days before the event</span>
            <Toggle checked={advanceNotice} onChange={setAdvanceNotice} />
          </div>
        </SettingRowFull>
      </SectionCard>

      <SectionCard>
        <SectionHeader icon="mdi:bullhorn-outline" title="Event Announcements" desc="Settings for notifying your followers about upcoming pop-ups" />
        <SettingRow label="Notify followers on new event" hint="Send an in-app notification to all followers when you confirm a pop-up">
          <Toggle checked={notifyFollowers} onChange={setNotifyFollowers} />
        </SettingRow>
        <SettingRowFull label="Default announcement message" hint="Pre-filled message sent to followers — you can edit it per event">
          <FieldTextarea defaultValue="We'll be at [Event Name] on [Date]! Come find us at [Location]. See you there 🌸" />
        </SettingRowFull>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

type NotifKey = "newRequest" | "requestUpdate" | "eventReminder" | "newFollower" | "productInterest" | "digest" | "promos";

function NotificationsTab() {
  const [email, setEmail] = useState<Record<NotifKey, boolean>>({
    newRequest: true, requestUpdate: true, eventReminder: true,
    newFollower: false, productInterest: true, digest: true, promos: false,
  });
  const [inApp, setInApp] = useState<Record<NotifKey, boolean>>({
    newRequest: true, requestUpdate: true, eventReminder: true,
    newFollower: true, productInterest: false, digest: false, promos: false,
  });
  const [quietHours, setQuietHours] = useState(true);

  const rows: Array<{ key: NotifKey; label: string; hint: string }> = [
    { key: "newRequest",      label: "New pop-up request",          hint: "When an event organizer invites you to their event"       },
    { key: "requestUpdate",   label: "Request status update",       hint: "When your application is accepted, rejected, or modified" },
    { key: "eventReminder",   label: "Upcoming event reminder",     hint: "Reminder sent 48 hours before a confirmed pop-up"         },
    { key: "newFollower",     label: "New follower",                hint: "When a customer starts following your pop-up profile"     },
    { key: "productInterest", label: "Product interest",            hint: "When someone saves or shares one of your listed products" },
    { key: "digest",          label: "Weekly performance digest",   hint: "A summary of profile views, followers, and engagement"    },
    { key: "promos",          label: "Promotions & platform updates", hint: "BloomHero news, feature releases, and vendor tips"      },
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

// ─── Exported Component ───────────────────────────────────────────────────────

type PopUpSettingsTab = "appearance" | "schedule" | "notifications" | "account";

const tabs: Array<{ id: PopUpSettingsTab; label: string }> = [
  { id: "appearance",    label: "Appearance"          },
  { id: "schedule",      label: "Schedule & Requests" },
  { id: "notifications", label: "Notifications"       },
  { id: "account",       label: "Account"             },
];

export function PopUpSettings() {
  const [activeTab, setActiveTab] = useState<PopUpSettingsTab>("appearance");

  const panels: Record<PopUpSettingsTab, React.ReactNode> = {
    appearance:    <AppearanceTab />,
    schedule:      <ScheduleTab />,
    notifications: <NotificationsTab />,
    account:       <AccountTab vendorType="pop-up" />,
  };

  return (
    <SettingsShell
      subtitle="Manage your pop-up profile, schedule preferences, and account."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as PopUpSettingsTab)}
      panels={panels}
    />
  );
}