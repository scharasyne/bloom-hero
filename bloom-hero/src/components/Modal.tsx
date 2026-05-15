"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  maxWidthClass?: string;
};

export function Modal({
  isOpen,
  onCloseAction,
  children,
  className,
  panelClassName,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={cn("modal-overlay", className)} onClick={onCloseAction}>
      <div
        className={cn(
          "scrollbar-thin-oval relative w-full max-h-[85dvh] overflow-y-auto overscroll-contain rounded-xl bg-white p-4 pt-10 shadow-xl sm:p-6 sm:pt-12",
          maxWidthClass,
          panelClassName
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onCloseAction}
          className="absolute right-3 top-3 rounded-lg p-1 text-[#8a847d] hover:bg-[#f3eee8] hover:text-[#4a453f]"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
