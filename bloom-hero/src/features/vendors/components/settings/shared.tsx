// Source: src/app/(vendor)/_components/settings/shared.tsx

"use client";

import { Icon } from "@iconify/react";
import { DeleteAccountControl } from "@/features/auth/components/DeleteAccountControl";
import type { BusinessType } from "@/features/vendors/types";

// ─── SectionCard ─────────────────────────────────────────────────────────────

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#edeae6] rounded-2xl overflow-hidden shadow-sm mb-4">
      {children}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-[#f0ece8] sm:px-6">
      <div className="w-8 h-8 rounded-lg bg-[#eef4f0] flex items-center justify-center text-[#2f5d3a] shrink-0">
        <Icon icon={icon} width={16} height={16} />
      </div>
      <div>
        <p className="text-[13.5px] font-bold text-[#1e2a22] leading-tight">{title}</p>
        <p className="text-[11.5px] text-[#a8b5ac] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

export function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 border-b border-[#f0ece8] last:border-b-0 hover:bg-[#f4f8f5] transition-colors duration-150 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1e2a22]">{label}</p>
        {hint && <p className="text-[11.5px] text-[#6b7a6f] mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

// ─── SettingRowFull ───────────────────────────────────────────────────────────

export function SettingRowFull({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 border-b border-[#f0ece8] last:border-b-0 hover:bg-[#f4f8f5] transition-colors duration-150">
      <p className="text-[13px] font-semibold text-[#1e2a22] mb-0.5">{label}</p>
      {hint && <p className="text-[11.5px] text-[#6b7a6f] mb-3 leading-snug">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /*
    Props must be serializable for components in the "use client" entry file. "onChange" is a function that's not a Server Action. 
    Rename "onChange" either to "action" or have its name end with "Action" e.g. "onChangeAction" to indicate it is a Server Action.
  */
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-[42px] shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5d3a] focus-visible:ring-offset-2 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${checked ? "bg-[#2f5d3a]" : "bg-[#ddd]"}`}
    >
      <span
        className={`pointer-events-none inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm mt-0.75 transition-transform duration-200 ${
          checked ? "translate-x-5.25" : "translate-x-0.75"
        }`}
      />
    </button>
  );
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

export function FieldInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[11px] font-bold text-[#a8b5ac] uppercase tracking-[0.5px]">
          {label}
        </span>
      )}
      <input
        {...props}
        className={`h-9 px-3 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-medium text-[#1e2a22] bg-white outline-none transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15 placeholder:text-[#a8b5ac] ${props.className ?? ""}`}
      />
    </div>
  );
}

// ─── FieldSelect ──────────────────────────────────────────────────────────────

export function FieldSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[11px] font-bold text-[#a8b5ac] uppercase tracking-[0.5px]">
          {label}
        </span>
      )}
      <select
        {...props}
        className="h-9 pl-3 pr-8 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-medium text-[#1e2a22] bg-white outline-none appearance-none cursor-pointer transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a6f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ─── FieldTextarea ────────────────────────────────────────────────────────────

export function FieldTextarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[11px] font-bold text-[#a8b5ac] uppercase tracking-[0.5px]">
          {label}
        </span>
      )}
      <textarea
        {...props}
        className="px-3 py-2.5 border-[1.5px] border-[#edeae6] rounded-lg font-[Quicksand] text-[13px] font-medium text-[#1e2a22] bg-white outline-none resize-y min-h-[80px] leading-relaxed transition-all duration-150 focus:border-[#2f5d3a] focus:ring-2 focus:ring-[#2f5d3a]/15 placeholder:text-[#a8b5ac]"
      />
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────

export function Btn({
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:   "bg-[#2f5d3a] text-white shadow-[0_2px_6px_rgba(47,93,58,0.25)] hover:bg-[#26502f]",
    secondary: "bg-[#eef4f0] text-[#2f5d3a] hover:bg-[#ddeee4]",
    ghost:     "bg-transparent text-[#6b7a6f] border-[1.5px] border-[#edeae6] hover:bg-[#f9f6f2] hover:text-[#1e2a22]",
    danger:    "bg-[#fdf2f1] text-[#c0392b] border-[1.5px] border-[rgba(192,57,43,0.15)] hover:bg-[#fbe8e6]",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg font-[Quicksand] text-[12.5px] font-semibold cursor-pointer transition-all duration-150 active:translate-y-px ${styles[variant]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

// ─── DangerSection ────────────────────────────────────────────────────────────
export function DangerSection({ businessType }: { businessType: BusinessType }) {
  const label = businessType === "registered" ? "store" : "profile";

  return (
    <div className="bg-white border-[1.5px] border-[rgba(192,57,43,0.2)] rounded-2xl overflow-hidden shadow-sm mb-4">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(192,57,43,0.1)]">
        <div className="w-8 h-8 rounded-lg bg-[#fdf2f1] flex items-center justify-center text-[#c0392b] shrink-0">
          <Icon icon="mdi:alert-outline" width={16} height={16} />
        </div>
        <div>
          <p className="text-[13.5px] font-bold text-[#c0392b] leading-tight">Danger Zone</p>
          <p className="text-[11.5px] text-[#a8b5ac] mt-0.5">Irreversible actions — please proceed carefully</p>
        </div>
      </div>
      <SettingRow
        label={`Deactivate ${label}`}
        hint={`Temporarily hide your ${label} from the marketplace. You can reactivate anytime.`}
      >
        <Btn variant="danger">Deactivate {label.charAt(0).toUpperCase() + label.slice(1)}</Btn>
      </SettingRow>
      <SettingRow
        label="Delete account"
        hint="Permanently remove your profile, products, and all data. This cannot be undone."
      >
        <DeleteAccountControl triggerClassName="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg font-[Quicksand] text-[12.5px] font-semibold cursor-pointer transition-all duration-150 bg-[#fdf2f1] text-[#c0392b] border-[1.5px] border-[rgba(192,57,43,0.15)] hover:bg-[#fbe8e6]" />
      </SettingRow>
    </div>
  );
}

// ─── AccountTab ───────────────────────────────────────────────────────────────
import { useState } from "react";

export function AccountTab({ businessType }: { businessType: BusinessType }) {
  const [twoFactor, setTwoFactor]     = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [compactView, setCompactView] = useState(false);

  return (
    <div>
      <SectionCard>
        <SectionHeader
          icon="mdi:lock-outline"
          title="Sign-in & Security"
          desc="Manage your password and authentication settings"
        />
        <SettingRowFull label="Change Password">
          <div className="grid grid-cols-2 gap-2.5 max-w-md">
            <div className="col-span-2">
              <FieldInput label="Current Password" type="password" placeholder="Enter current password" />
            </div>
            <FieldInput label="New Password"     type="password" placeholder="Min. 8 characters" />
            <FieldInput label="Confirm Password" type="password" placeholder="Repeat new password" />
          </div>
          <div className="mt-3">
            <Btn variant="primary">Update Password</Btn>
          </div>
        </SettingRowFull>
        <SettingRow label="Two-factor authentication (2FA)" hint="Require a verification code on every new device login">
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </SettingRow>
        <SettingRow label="Login alerts" hint="Email me when a new device signs into my account">
          <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
        </SettingRow>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          icon="mdi:tune-variant"
          title="Display Preferences"
          desc="Personalize your dashboard experience"
        />
        <SettingRow label="Language" hint="Dashboard interface language">
          <FieldSelect>
            <option>English</option>
            <option>Filipino</option>
            <option>Cebuano</option>
          </FieldSelect>
        </SettingRow>
        <SettingRow label="Currency display" hint="Default currency shown across the dashboard">
          <FieldSelect>
            <option>PHP — Philippine Peso</option>
            <option>USD — US Dollar</option>
          </FieldSelect>
        </SettingRow>
        <SettingRow label="Date format" hint="How dates appear in orders and reports">
          <FieldSelect>
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </FieldSelect>
        </SettingRow>
        <SettingRow label="Compact dashboard view" hint="Reduce spacing for a denser, more data-rich layout">
          <Toggle checked={compactView} onChange={setCompactView} />
        </SettingRow>
      </SectionCard>

      <DangerSection businessType={businessType} />
    </div>
  );
}

// ─── SettingsShell ────────────────────────────────────────────────────────────
// The outer frame (header, tab bar, save bar, toast) reused by both pages

export function SettingsShell({
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  panels,
}: {
  subtitle: string;
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  panels: Record<string, React.ReactNode>;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="page-x pt-6 pb-1 sm:pt-7">
        <h1 className="text-[20px] font-bold text-[#1e2a22] tracking-[-0.4px]">Settings</h1>
        <p className="text-[13px] text-[#6b7a6f] mt-0.5">{subtitle}</p>
      </div>

      <div className="page-x mt-5 flex gap-0.5 overflow-x-auto border-b border-[#edeae6]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-semibold rounded-t-md border-b-2 transition-all duration-150 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? "text-[#2f5d3a] border-[#2f5d3a]"
                : "text-[#6b7a6f] border-transparent hover:text-[#2f5d3a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-7 pt-6 pb-4">
        {panels[activeTab]}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#edeae6] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(47,93,58,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
        <p className="text-[12.5px] text-[#6b7a6f]">
          <span className="font-bold text-[#1e2a22]">Unsaved changes</span> — don&apos;t forget to save before leaving
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Btn variant="ghost">Discard</Btn>
          <Btn variant="primary" onClick={handleSave}>
            <Icon icon="mdi:content-save-outline" width={14} height={14} />
            {saved ? "Saved!" : "Save Changes"}
          </Btn>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-16 right-6 z-50 flex items-center gap-2 bg-[#2f5d3a] text-white text-[13px] font-semibold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Icon icon="mdi:check-circle-outline" width={16} height={16} />
          Settings saved successfully
        </div>
      )}
    </div>
  );
}