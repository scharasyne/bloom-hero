"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { VendorApplicationRecord } from "@/types";
import { formatBusinessTypeLabel } from "@/features/vendors/utils/normalizeBusinessType";

type Props = {
  application: VendorApplicationRecord;
  onApprove: (application: VendorApplicationRecord) => void | Promise<void>;
  onReject: (application: VendorApplicationRecord, reason: string) => void | Promise<void>;
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
    <span className={`flex items-center gap-1 text-[14px] font-medium ${passed ? "text-[#2e7d5b]" : "text-[#cc3526]"}`}>
      <Icon
        icon={passed ? "mdi:check-circle" : "mdi:close-circle"}
        width={16}
        height={16}
      />
      {label}
    </span>
  );
}

function formatBusinessType(value: VendorApplicationRecord["business_type"]) {
  return formatBusinessTypeLabel(value);
}

function formatTiming(value: VendorApplicationRecord["business_submission_timing"]) {
  if (value === "now") return "Ready now";
  if (value === "later") return "Will submit later";
  return "Not specified";
}

function formatVatStatus(value: VendorApplicationRecord["vat_registration_status"]) {
  if (value === "vat-registered") return "VAT registered";
  if (value === "non-vat-registered") return "Non-VAT registered";
  return "Not specified";
}

export default function ApplicationCard({ application, onApprove, onReject, isSelected, onToggle }: Props) {
  const {
    id,
    shop_name,
    shop_address,
    email,
    phone_number,
    business_type,
    business_submission_timing,
    primary_business_document_type,
    primary_business_document_url,
    government_id_type,
    government_id_document_url,
    taxpayer_identification_number,
    vat_registration_status,
    bir_certificate_url,
    submitted_at,
    created_at,
  } = application;
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [showDocuments, setShowDocuments] = useState(false);

  const referenceDate = submitted_at ?? created_at;
  const ageChip = getAgeChip(referenceDate);
  const isUnregisteredBusiness = business_type === "unregistered";
  const hasDocuments = Boolean(primary_business_document_url || government_id_document_url || bir_certificate_url);

  const formattedDate = new Date(referenceDate).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const documentItems = [
    {
      label: primary_business_document_type ?? "Primary Business Document",
      url: primary_business_document_url,
      required: !isUnregisteredBusiness,
    },
    {
      label: government_id_type ?? "Government ID",
      url: government_id_document_url,
      required: true,
    },
    {
      label: "BIR Certificate",
      url: bir_certificate_url,
      required: !isUnregisteredBusiness,
    },
  ];

  return (
    <div
      className="bg-white rounded-3xl w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-3.5 p-5"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* ── Card Top ──────────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3 items-center">

          {/* Checkbox */}
          <button
            onClick={() => onToggle(id)}
            className={`size-5 rounded-md shrink-0 border-2 flex items-center justify-center transition-colors cursor-pointer
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
          <div className="bg-[#eaf3ef] rounded-2xl size-11 shrink-0 flex items-center justify-center text-[#2e7d5b] font-bold text-[18px]">
            {(shop_name ?? "V").charAt(0)}
          </div>

          {/* Title stack */}
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-[24px] text-[#2c2a28] leading-8">{shop_name ?? "Untitled application"}</p>
            <p className="text-[#7a746e] text-[16px] leading-6">
              {formatBusinessType(business_type)} • Submitted {formattedDate}
            </p>
          </div>
        </div>

        {/* Age chip */}
        {ageChip && (
          <div className={`${ageChip.bg} px-2.5 h-6 flex items-center rounded-full`}>
            <span className={`${ageChip.text} font-semibold text-[12px]`}>{ageChip.label}</span>
          </div>
        )}
      </div>

      {/* ── Divider ───────────────────────────────────── */}
      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Info Stack ────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 w-full">

        {/* Location */}
        <div className="flex gap-2 items-center px-3">
          <Icon icon="mdi:map-marker" width={18} height={18} className="text-[#cc3526] shrink-0" />
          <span className="text-[#2c2a28] text-[16px]">{shop_address ?? formatTiming(business_submission_timing)}</span>
        </div>

        {/* Contact pill */}
        <div className="bg-[#f3f2f0] flex gap-2 h-10 items-center px-3 rounded-2xl">
          <Icon icon="mdi:email-outline" width={18} height={18} className="text-[#5f5a55] shrink-0" />
          <span className="text-[#2c2a28] text-[16px]">
            {email ?? "No email provided"} • {phone_number ?? "No phone provided"}
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 px-3 pt-0.5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a746e]">Business document</p>
            <p className="text-[#2c2a28] text-[14px] mt-1">{primary_business_document_type ?? "Not specified"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a746e]">Government ID</p>
            <p className="text-[#2c2a28] text-[14px] mt-1">{government_id_type ?? "Not specified"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a746e]">TIN</p>
            <p className="text-[#2c2a28] text-[14px] mt-1">{taxpayer_identification_number ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a746e]">VAT status</p>
            <p className="text-[#2c2a28] text-[14px] mt-1">{formatVatStatus(vat_registration_status)}</p>
          </div>
        </div>
      </div>

      {/* ── Documents Row ─────────────────────────────── */}
      {hasDocuments ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex gap-6 items-center flex-wrap">
            {documentItems.map((documentItem) => (
              <DocBadge
                key={documentItem.label}
                label={documentItem.label}
                passed={Boolean(documentItem.url) || !documentItem.required}
              />
            ))}
          </div>
          <button
            onClick={() => setShowDocuments((prev) => !prev)}
            className="bg-white border border-[#e6e2dd] inline-flex gap-1.5 h-9 items-center justify-center px-4 rounded-2xl text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors w-fit"
          >
            <Icon icon="mdi:file-document-outline" width={16} height={16} className="text-[#5f5a55]" />
            {showDocuments ? "Hide Documents" : "View Documents"}
          </button>

          {showDocuments && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {documentItems.map((documentItem) => (
                documentItem.url ? (
                  <button
                    key={documentItem.label}
                    type="button"
                    onClick={() => window.open(documentItem.url ?? "", "_blank", "noopener,noreferrer")}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#e6e2dd] bg-[#f8f6f3] px-4 py-3 text-left text-[#2c2a28] hover:bg-[#f0ece7] transition-colors"
                  >
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a746e]">Open</p>
                      <p className="text-[14px] font-medium">{documentItem.label}</p>
                    </div>
                    <Icon icon="mdi:open-in-new" width={18} height={18} className="text-[#5f5a55] shrink-0" />
                  </button>
                ) : null
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-1.5 items-center">
          <Icon icon="mdi:alert-outline" width={16} height={16} className="text-[#b86a2a]" />
          <p className="text-[#b86a2a] text-[13px]">No documents submitted.</p>
        </div>
      )}

      {/* ── Reject Inline Panel ───────────────────────── */}
      {showRejectPanel && (
        <div className="bg-[#fff8f7] border border-[#f5c6c3] rounded-2xl p-3.5 flex flex-col gap-2.5">
          <p className="text-[13px] font-semibold text-[#cc3526]">Select a reason for rejection:</p>
          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="border border-[#e6e2dd] rounded-xl px-3 py-2 text-[14px] text-[#2c2a28] bg-white cursor-pointer"
          >
            {REJECT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => { onReject(application, rejectReason); setShowRejectPanel(false); }}
              className="bg-[#cc3526] text-white text-[13px] font-medium px-4 h-9 rounded-xl cursor-pointer hover:bg-[#b02d1e] transition-colors"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setShowRejectPanel(false)}
              className="bg-white border border-[#e6e2dd] text-[#7a746e] text-[13px] font-medium px-4 h-9 rounded-xl cursor-pointer hover:bg-[#f3f2f0] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Card Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(application)}
            className="bg-[#2e7d5b] text-white text-[14px] font-medium h-11 px-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-[#255f45] transition-colors"
          >
            <Icon icon="mdi:check" width={16} height={16} />
            Approve
          </button>
          <button
            onClick={() => setShowRejectPanel((prev) => !prev)}
            className="bg-[#cc3526] text-white text-[14px] font-medium h-11 px-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-[#b02d1e] transition-colors"
          >
            <Icon icon="mdi:close" width={16} height={16} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
