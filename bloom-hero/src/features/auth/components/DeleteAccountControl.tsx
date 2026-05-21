"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { deleteMyAccount } from "@/features/auth/actions/deleteMyAccount";

type DeleteAccountControlProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

export function DeleteAccountControl({
  triggerClassName,
  triggerLabel = "Delete Account",
}: DeleteAccountControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setPassword("");
    setConfirmText("");
    setError(null);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    reset();
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount({ password, confirmText });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      handleClose();
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "rounded-md border border-[#c0392b]/30 bg-[#fdf2f1] px-4 py-2 text-sm font-semibold text-[#c0392b] hover:bg-[#fbe8e6]"
        }
      >
        {triggerLabel}
      </button>

      <Modal isOpen={open} onCloseAction={handleClose} maxWidthClass="max-w-md">
        <h2 className="text-lg font-bold text-[#2c2a28]">Delete account permanently?</h2>
        <p className="mt-2 text-sm text-[#7a746e] leading-relaxed">
          Your profile, orders history, and marketplace data will be removed. This cannot be undone.
        </p>
        <label className="mt-4 block text-sm font-medium text-[#363636]">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            autoComplete="current-password"
            disabled={isPending}
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-[#363636]">
          Type <span className="font-bold">DELETE</span> to confirm
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            disabled={isPending}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-[#c43c30]">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-full border border-[#e6e2dd] px-4 py-2 text-sm font-semibold text-[#4c4742] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full bg-[#cc3526] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </Modal>
    </>
  );
}
