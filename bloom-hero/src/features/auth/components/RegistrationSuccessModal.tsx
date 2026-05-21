"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";

const COUNTDOWN_SECONDS = 5;

type RegistrationSuccessModalProps = {
  isOpen: boolean;
  onDismissAction: () => void;
};

export function RegistrationSuccessModal({
  isOpen,
  onDismissAction,
}: RegistrationSuccessModalProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      return;
    }

    setSecondsLeft(COUNTDOWN_SECONDS);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          router.replace("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen, router]);

  function goToLogin() {
    router.replace("/login");
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onCloseAction={onDismissAction} maxWidthClass="max-w-md">
      <div className="text-center pt-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf3ef] text-[#2f5d3a] text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-[#1f1f1f]">Successfully registered!</h2>
        <p className="mt-2 text-sm text-[#6f6f6f] leading-relaxed">
          Your account was created. Please proceed to login to continue.
        </p>
        <p className="mt-4 text-sm font-medium text-[#2f5d3a]">
          Redirecting to sign in in {secondsLeft}s…
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={goToLogin}
            className="rounded-full bg-[#d24b46] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#b53d39] transition"
          >
            Go to login
          </button>
          <button
            type="button"
            onClick={onDismissAction}
            className="rounded-full border border-[#d7cdc6] px-6 py-2.5 text-sm font-semibold text-[#4f4f4f] hover:bg-[#f0e4df] transition"
          >
            Stay signed out
          </button>
        </div>
      </div>
    </Modal>
  );
}
