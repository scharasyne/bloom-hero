"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { Modal } from "@/components/Modal";
import { reviewVendorSuspensionAppeal } from "@/features/admin/actions/reviewVendorSuspensionAppeal";
import type { AdminVendorRecord as VendorRecord } from "@/features/admin/types";

type AdminVendorProfileModalProps = {
  vendor: VendorRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminVendorProfileModal({
  vendor,
  isOpen,
  onClose,
  onUpdated,
}: AdminVendorProfileModalProps) {
  const [adminResponse, setAdminResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setAdminResponse("");
      setError(null);
    }
  }, [isOpen, vendor?.id]);

  if (!vendor) return null;

  const isSuspended = vendor.status === "suspended";
  const isRegistered = vendor.businessType === "registered";
  const pendingAppeal = vendor.pendingAppeal;

  const handleReview = (decision: "approved" | "rejected") => {
    if (!pendingAppeal) return;
    setError(null);

    startTransition(async () => {
      const result = await reviewVendorSuspensionAppeal(
        pendingAppeal.id,
        decision,
        adminResponse || undefined
      );
      if (!result.ok) {
        setError(result.error ?? "Failed to review appeal.");
        return;
      }
      setAdminResponse("");
      onUpdated?.();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onCloseAction={onClose}>
      <div className="max-h-[80vh] overflow-y-auto pr-1 -mt-2">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#2c2a28]">{vendor.storeName}</h2>
            <p className="text-sm text-[#7a746e] mt-0.5">
              {isRegistered ? "Registered business" : "Unregistered business"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
              isSuspended ? "bg-[#fde4e1] text-[#c43c30]" : "bg-[#eaf3ef] text-[#2e7d5b]"
            }`}
          >
            <Icon
              icon={isSuspended ? "mdi:account-cancel-outline" : "mdi:account-check-outline"}
              width={14}
              height={14}
            />
            {isSuspended ? "Suspended" : "Active"}
          </span>
        </div>

        <div className="space-y-4 text-sm">
          <section className="rounded-xl border border-[#e6e2dd] bg-[#fbf7f4] px-4 py-3 space-y-2">
            <p className="text-xs font-semibold uppercase text-[#7a746e]">Contact</p>
            <p className="text-[#2c2a28]">
              <span className="font-medium">{vendor.ownerName}</span>
              <span className="text-[#b8b2ab]"> · </span>
              {vendor.email}
            </p>
            {vendor.phoneNumber ? (
              <p className="text-[#4c4742]">{vendor.phoneNumber}</p>
            ) : null}
            <p className="text-[#7a746e] flex items-center gap-1.5">
              <Icon icon="mdi:map-marker-outline" width={16} height={16} />
              {vendor.location}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e6e2dd] px-3 py-2.5">
              <p className="text-xs text-[#7a746e]">Joined</p>
              <p className="font-medium text-[#2c2a28] mt-0.5">{vendor.joinedAt}</p>
            </div>
            <div className="rounded-xl border border-[#e6e2dd] px-3 py-2.5">
              <p className="text-xs text-[#7a746e]">Orders</p>
              <p className="font-medium text-[#2c2a28] mt-0.5">{vendor.totalOrders}</p>
            </div>
          </section>

          {vendor.about ? (
            <section>
              <p className="text-xs font-semibold uppercase text-[#7a746e] mb-1">About</p>
              <p className="text-[#4c4742] leading-relaxed">{vendor.about}</p>
            </section>
          ) : null}

          {isSuspended ? (
            <section className="rounded-xl border border-[#fde4e1] bg-[#fff7f6] px-4 py-3">
              <p className="text-xs font-semibold uppercase text-[#c43c30]">Suspension</p>
              <p className="mt-1 text-[#4c4742]">
                {vendor.suspensionReason?.trim() || "No reason recorded."}
              </p>
              <p className="mt-2 text-xs text-[#7a746e]">
                Suspended {formatDate(vendor.suspendedAt)}
              </p>
            </section>
          ) : null}

          {vendor.appeals.length > 0 ? (
            <section>
              <p className="text-xs font-semibold uppercase text-[#7a746e] mb-2">Appeals</p>
              <div className="space-y-2">
                {vendor.appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="rounded-xl border border-[#e6e2dd] bg-white px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold capitalize text-[#2c2a28]">
                        {appeal.status}
                      </span>
                      <span className="text-xs text-[#9a9289]">{formatDate(appeal.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[#4c4742] leading-relaxed">{appeal.appealMessage}</p>
                    {appeal.adminResponse ? (
                      <p className="mt-2 text-xs text-[#7a746e]">
                        Admin: {appeal.adminResponse}
                      </p>
                    ) : null}
                    {appeal.reviewedAt ? (
                      <p className="mt-1 text-xs text-[#9a9289]">
                        Reviewed {formatDate(appeal.reviewedAt)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-[#7a746e] text-sm">No appeals submitted.</p>
          )}

          {pendingAppeal ? (
            <section className="rounded-xl border border-[#d6e8dd] bg-[#f2faf5] px-4 py-3 space-y-3">
              <p className="text-sm font-semibold text-[#235640]">Pending appeal</p>
              <p className="text-[#4c4742] leading-relaxed">{pendingAppeal.appealMessage}</p>
              <div>
                <label className="text-sm font-semibold text-[#2c2a28]">
                  Admin response (optional)
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(event) => setAdminResponse(event.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-[#e6e2dd] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]"
                  placeholder="Message to the vendor..."
                  disabled={isPending}
                />
              </div>
              {error ? <p className="text-sm text-[#c43c30]">{error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReview("approved")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2e7d5b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Icon icon="mdi:check" width={16} height={16} />
                  Approve & restore
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReview("rejected")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#cc3526] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Icon icon="mdi:close" width={16} height={16} />
                  Reject appeal
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
