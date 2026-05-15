"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CenteredScrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  maxWidthClass?: string;
};

export function CenteredScrollModal({
  isOpen,
  onClose,
  children,
  className,
  panelClassName,
  maxWidthClass = "max-w-3xl",
}: CenteredScrollModalProps) {
  if (!isOpen) return null;

  return (
    <div className={cn("modal-overlay", className)} onClick={onClose}>
      <div
        className={cn("modal-panel-scroll", maxWidthClass, panelClassName)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
