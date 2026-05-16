// Source: `src/app/(customer)/settings/page.tsx`

import CustomerSettingsForm from "@/features/customers/components/CustomerSettingsForm";
import type { CustomerSettingsPageData } from "@/features/customers/types";

export function CustomerSettingsPageView({
  initialName,
  initialEmail,
  initialContactNumber,
  initialShippingAddress,
  initialProfilePhotoUrl,
  initialNotificationPreferences,
}: CustomerSettingsPageData) {
  return (
    <main className="min-h-screen bg-[#fcf8f5] pb-12">
      <section className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold text-[#2f6b4f]">Account Settings</h1>
        <p className="mt-2 text-sm text-[#4f4f4f]">
          Manage your personal details, contact information, and security settings.
        </p>

        <CustomerSettingsForm
          initialName={initialName}
          initialEmail={initialEmail}
          initialContactNumber={initialContactNumber}
          initialShippingAddress={initialShippingAddress}
          initialProfilePhotoUrl={initialProfilePhotoUrl}
          initialNotificationPreferences={initialNotificationPreferences}
        />
      </section>
    </main>
  );
}
