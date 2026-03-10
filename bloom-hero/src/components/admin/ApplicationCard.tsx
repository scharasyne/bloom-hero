"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { VendorApplication } from "@/typess";

type Props = {
  application: VendorApplication;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

const REJECT_REASONS = [
  "Incomplete documents",
  "Invalid permit",
  "Duplicate registration",
  "Other",
];

function getAgeChip(dateApplied: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateApplied).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return { label: "NEW",                              bg: "bg-[#f7e8d8]", text: "text-[#b86a2a]" };
  if (days <= 3)  return { label: `${days} DAY${days > 1 ? "S" : ""} AGO`, bg: "bg-[#fde4e1]", text: "text-[#c43c30]" };
  return null;
}

// ── Doc badge — green if passed, red if not ──────────────
function DocBadge({ label, passed }: { label: string; passed: boolean }) {
  return (
    <span className={`flex items-center gap-[4px] text-[14px] font-medium ${passed ? "text-[#2e7d5b]" : "text-[#cc3526]"}`}>
      <Icon
        icon={passed ? "mdi:check-circle" : "mdi:close-circle"}
        width={16}
        height={16}
      />
      {label}
    </span>
  );
}

export default function ApplicationCard({ application, onApprove, onReject, isSelected, onToggle }: Props) {
  const { id, vendorName, ownerName, type, dateApplied, email, phone, location, documents } = application;
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);

  const ageChip = getAgeChip(dateApplied);
  const hasDocuments = documents.businessPermit || documents.validId;

  const formattedDate = new Date(dateApplied).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const typeLabel = type === "stall" ? "Stall Vendor" : "Pop-up Vendor";

  return (
    <div
      className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* ── Card Top ──────────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px] items-center">

          {/* Checkbox */}
          <button
            onClick={() => onToggle(id)}
            className={`size-[20px] rounded-[6px] shrink-0 border-2 flex items-center justify-center transition-colors cursor-pointer
              ${isSelected
                ? "bg-[#2e7d5b] border-[#2e7d5b]"
                : "bg-white border-[#d9d4ce] hover:border-[#2e7d5b]"
              }`}
          >
            {isSelected && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Avatar */}
          <div className="bg-[#eaf3ef] rounded-[12px] size-[44px] shrink-0 flex items-center justify-center text-[#2e7d5b] font-bold text-[18px]">
            {vendorName.charAt(0)}
          </div>

          {/* Title stack */}
          <div className="flex flex-col gap-[2px]">
            <p className="font-semibold text-[24px] text-[#2c2a28] leading-[32px]">{vendorName}</p>
            <p className="text-[#7a746e] text-[16px] leading-[24px]">
              {typeLabel} • Applied {formattedDate}
            </p>
            {ownerName && (
              <p className="text-[#5f5a55] text-[13px] leading-[20px]">Owner: {ownerName}</p>
            )}
          </div>
        </div>

        {/* Age chip */}
        {ageChip && (
          <div className={`${ageChip.bg} px-[10px] h-[24px] flex items-center rounded-[999px]`}>
            <span className={`${ageChip.text} font-semibold text-[12px]`}>{ageChip.label}</span>
          </div>
        )}
      </div>

      {/* ── Divider ───────────────────────────────────── */}
      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Info Stack ────────────────────────────────── */}
      <div className="flex flex-col gap-[10px] w-full">

        {/* Location */}
        <div className="flex gap-[8px] items-center px-[12px]">
          <Icon icon="mdi:map-marker" width={18} height={18} className="text-[#cc3526] shrink-0" />
          <span className="text-[#2c2a28] text-[16px]">{location}</span>
        </div>

        {/* Contact pill */}
        <div className="bg-[#f3f2f0] flex gap-[8px] h-[40px] items-center px-[12px] rounded-[12px]">
          <Icon icon="mdi:email-outline" width={18} height={18} className="text-[#5f5a55] shrink-0" />
          <span className="text-[#2c2a28] text-[16px]">
            {email} • {phone}
          </span>
        </div>
      </div>

      {/* ── Documents Row ─────────────────────────────── */}
      {type === "popup" ? (
        // No docs required — popup warning
        <div className="bg-[#f7e8d8] border border-[#e6e2dd] flex gap-[8px] h-[40px] items-center justify-center px-[16px] rounded-[12px]">
          <Icon icon="mdi:alert-outline" width={18} height={18} className="text-[#b86a2a] shrink-0" />
          <span className="text-[#2c2a28] text-[16px] font-medium">NO DOCUMENTS REQUIRED (POP-UP)</span>
        </div>
      ) : hasDocuments ? (
        // Doc status + view button
        <div className="flex gap-[24px] items-center flex-wrap">
          <div className="flex items-center gap-[12px]">
            <DocBadge label="Business Permit" passed={documents.businessPermit} />
            <span className="text-[#b8b2ab]">•</span>
            <DocBadge label="Valid ID" passed={documents.validId} />
          </div>
          <button className="bg-white border border-[#e6e2dd] flex gap-[6px] h-[36px] items-center justify-center px-[16px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
            <Icon icon="mdi:file-document-outline" width={16} height={16} className="text-[#5f5a55]" />
            View Documents
            <Icon icon="mdi:arrow-top-right" width={14} height={14} className="text-[#5f5a55]" />
          </button>
        </div>
      ) : (
        <div className="flex gap-[6px] items-center">
          <Icon icon="mdi:alert-outline" width={16} height={16} className="text-[#b86a2a]" />
          <p className="text-[#b86a2a] text-[13px]">No documents submitted.</p>
        </div>
      )}

      {/* ── Reject Inline Panel ───────────────────────── */}
      {showRejectPanel && (
        <div className="bg-[#fff8f7] border border-[#f5c6c3] rounded-[12px] p-[14px] flex flex-col gap-[10px]">
          <p className="text-[13px] font-semibold text-[#cc3526]">Select a reason for rejection:</p>
          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="border border-[#e6e2dd] rounded-[8px] px-[12px] py-[8px] text-[14px] text-[#2c2a28] bg-white cursor-pointer"
          >
            {REJECT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex gap-[8px]">
            <button
              onClick={() => { onReject(id, rejectReason); setShowRejectPanel(false); }}
              className="bg-[#cc3526] text-white text-[13px] font-medium px-[16px] h-[36px] rounded-[8px] cursor-pointer hover:bg-[#b02d1e] transition-colors"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setShowRejectPanel(false)}
              className="bg-white border border-[#e6e2dd] text-[#7a746e] text-[13px] font-medium px-[16px] h-[36px] rounded-[8px] cursor-pointer hover:bg-[#f3f2f0] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Card Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px]">
          <button
            onClick={() => onApprove(id)}
            className="bg-[#2e7d5b] text-white text-[14px] font-medium h-[44px] px-[16px] rounded-[12px] flex items-center gap-[8px] cursor-pointer hover:bg-[#255f45] transition-colors"
          >
            <Icon icon="mdi:check" width={16} height={16} />
            Approve
          </button>
          <button
            onClick={() => setShowRejectPanel((prev) => !prev)}
            className="bg-[#cc3526] text-white text-[14px] font-medium h-[44px] px-[16px] rounded-[12px] flex items-center gap-[8px] cursor-pointer hover:bg-[#b02d1e] transition-colors"
          >
            <Icon icon="mdi:close" width={16} height={16} />
            Reject
          </button>
        </div>

        <button className="bg-white border border-[#e6e2dd] text-[#2c2a28] text-[14px] font-medium h-[44px] px-[16px] rounded-[12px] cursor-pointer hover:bg-[#f3f2f0] transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
