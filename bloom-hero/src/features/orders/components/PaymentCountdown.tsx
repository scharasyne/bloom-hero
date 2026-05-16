// Source: `src/app/(customer)/_components/PaymentCountdown.tsx`

"use client";

import { useEffect, useState } from "react";
import { paymentCountdown } from "@/features/orders/utils";

function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconXCircle({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function PaymentCountdown({ orderDate }: { orderDate: string }) {
  const [countdown, setCountdown] = useState(() => paymentCountdown(orderDate));

  useEffect(() => {
    setCountdown(paymentCountdown(orderDate));
    const interval = setInterval(() => {
      setCountdown(paymentCountdown(orderDate));
    }, 60_000);
    return () => clearInterval(interval);
  }, [orderDate]);

  if (countdown.expired) {
    return (
      /*
        FIX 7: Expired state left-aligned with the footer "X products" label.
        Muted neutral — not alarming since the order is already being cancelled by backend.
      */
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f2ed] border border-[#e0dbd5] px-4 py-1.5 text-xs font-semibold text-[#9a9188] w-fit">
        <IconXCircle className="text-[#9a9188]" />
        Payment window expired — order will be cancelled
      </span>
    );
  }

  return (
    /*
      FIX 7: Countdown pill left-aligned (w-fit), consistent with footer left column.
      Amber stays — urgency is appropriate here.
    */
    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 w-fit bg-amber-50 border border-amber-200 text-amber-700">
      <IconClock />
      {countdown.label}
    </div>
  );
}
