// Source: `src/app/(customer)/vendor-application/page.tsx`

import VendorApplicationForm from "@/features/vendors/components/VendorApplicationForm";
import type { CustomerVendorApplicationPageData } from "@/features/vendors/types";

export function CustomerVendorApplicationPageView({
  initialEmail,
  initialPhoneNumber,
}: CustomerVendorApplicationPageData) {
  return (
    <main className="min-h-screen bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <VendorApplicationForm
          initialEmail={initialEmail}
          initialPhoneNumber={initialPhoneNumber}
        />
      </div>
    </main>
  );
}
