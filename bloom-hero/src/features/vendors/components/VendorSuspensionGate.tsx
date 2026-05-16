"use client";

import type { VendorSuspensionState } from "@/features/vendors/types";
import { VendorSuspensionOverlay } from "@/features/vendors/components/VendorSuspensionOverlay";

type VendorSuspensionGateProps = {
  suspension: VendorSuspensionState | null;
  children: React.ReactNode;
};

export function VendorSuspensionGate({ suspension, children }: VendorSuspensionGateProps) {
  if (suspension?.isSuspended) {
    return (
      <>
        <div className="min-h-0" aria-hidden />
        <VendorSuspensionOverlay suspension={suspension} />
      </>
    );
  }

  return <>{children}</>;
}
