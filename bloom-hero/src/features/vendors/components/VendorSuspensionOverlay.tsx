"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitVendorSuspensionAppeal } from "@/features/vendors/actions/submitVendorSuspensionAppeal";
import type { VendorSuspensionState } from "@/features/vendors/types";

type VendorSuspensionOverlayProps = {
  suspension: VendorSuspensionState;
};

export function VendorSuspensionOverlay({ suspension }: VendorSuspensionOverlayProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitVendorSuspensionAppeal(message);
      if (!result.ok) {
        setError(result.error ?? "Failed to submit appeal.");
        return;
      }
      setMessage("");
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[var(--app-navbar-height,4.5rem)] z-40 flex items-center justify-center overflow-y-auto bg-[#fbf7f4] px-4 py-8"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="vendor-suspension-title"
    >
      <div className="w-full max-w-md rounded-[28px] border border-[#edeae6] bg-white px-6 py-8 text-center shadow-[0px_20px_60px_rgba(15,23,42,0.12)] sm:px-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <Image
            src="/navbar-logo.png"
            alt="Bloom Hero"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            priority
          />
        </div>

        <h1 id="vendor-suspension-title" className="text-2xl font-semibold text-[#1f1f1f]">
          Your account is suspended!
        </h1>
        <p className="mt-2 text-sm text-[#7a7a7a]">{suspension.shopName}</p>

        <div className="mt-6 rounded-2xl border border-[#fde4e1] bg-[#fff7f6] px-4 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c43c30]">
            Reason for suspension
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#4c4742]">
            {suspension.suspensionReason}
          </p>
        </div>

        {suspension.pendingAppeal ? (
          <div className="mt-6 rounded-2xl border border-[#d6e8dd] bg-[#f2faf5] px-4 py-4 text-left">
            <p className="text-sm font-semibold text-[#235640]">Appeal submitted</p>
            <p className="mt-2 text-sm leading-relaxed text-[#4c4742]">
              {suspension.pendingAppeal.message}
            </p>
            <p className="mt-3 text-xs text-[#7a7a7a]">
              An admin will review your appeal. You cannot use vendor tools until a decision is made.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
            <label htmlFor="appeal-message" className="block text-sm font-semibold text-[#1f1f1f]">
              Submit an appeal
            </label>
            <textarea
              id="appeal-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Explain why your account should be restored..."
              className="w-full resize-none rounded-2xl border border-[#e6e2dd] bg-[#fbf7f4] px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#2f5d3a]"
              disabled={isPending}
            />
            {error ? <p className="text-sm text-[#c43c30]">{error}</p> : null}
            <button
              type="submit"
              disabled={isPending || message.trim().length < 10}
              className="w-full rounded-full bg-[#2f5d3a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#254a2f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit appeal"}
            </button>
          </form>
        )}

        {suspension.lastResolvedAppeal && !suspension.pendingAppeal ? (
          <div className="mt-4 rounded-2xl border border-[#edeae6] bg-[#fbf7f4] px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7a7a]">
              Last appeal: {suspension.lastResolvedAppeal.status}
            </p>
            {suspension.lastResolvedAppeal.adminResponse ? (
              <p className="mt-1 text-sm text-[#4c4742]">
                {suspension.lastResolvedAppeal.adminResponse}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
