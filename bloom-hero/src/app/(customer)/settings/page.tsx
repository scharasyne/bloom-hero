import { redirect } from "next/navigation";
import NavBar from "@/components/navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import CustomerSettingsForm from "@/app/(customer)/settings/CustomerSettingsForm";

type CustomerRow = {
  shipping_address: string | null;
  profile_photo_url: string | null;
  notification_preferences: {
    order_updates?: boolean;
    promotions?: boolean;
  } | null;
};

type UserRow = {
  name: string | null;
  email: string;
  contact_number: string | null;
};

export default async function CustomerSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const [{ data: userProfile }, { data: customerProfile }] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, contact_number")
      .eq("id", session.user.id)
      .single<UserRow>(),
    supabase
      .from("customers")
      .select("shipping_address, profile_photo_url, notification_preferences")
      .eq("user_id", session.user.id)
      .maybeSingle<CustomerRow>(),
  ]);

  return (
    <main className="min-h-screen bg-[#fcf8f5] pb-12">
      {/* <NavBar type="customer" /> */}
      <section className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold text-[#2f6b4f]">Account Settings</h1>
        <p className="mt-2 text-sm text-[#4f4f4f]">
          Manage your personal details, contact information, and security settings.
        </p>

        <CustomerSettingsForm
          initialName={userProfile?.name ?? ""}
          initialEmail={session.user.email ?? userProfile?.email ?? ""}
          initialContactNumber={userProfile?.contact_number ?? ""}
          initialShippingAddress={customerProfile?.shipping_address ?? ""}
          initialProfilePhotoUrl={customerProfile?.profile_photo_url ?? ""}
          initialNotificationPreferences={{
            order_updates:
              customerProfile?.notification_preferences?.order_updates ?? true,
            promotions:
              customerProfile?.notification_preferences?.promotions ?? false,
          }}
        />
      </section>
    </main>
  );
}
