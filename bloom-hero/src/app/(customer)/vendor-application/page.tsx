import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getUserBasicProfileById } from "@/features/users/queries/getUserBasicProfile";
import { redirect } from "next/navigation";
import VendorApplicationForm from "@/features/vendors/components/VendorApplicationForm";

export default async function VendorApplicationPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userProfile = await getUserBasicProfileById(session.user.id);

  return (
    <main className="min-h-screen bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <VendorApplicationForm
          initialEmail={userProfile?.email ?? session.user.email ?? ""}
          initialPhoneNumber={userProfile?.contact_number ?? ""}
        />
      </div>
    </main>
  );
}
