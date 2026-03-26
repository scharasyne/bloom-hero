import NavBar from "@/components/navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import VendorApplicationForm from "./VendorApplicationForm";

export default async function VendorApplicationPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("email, contact_number")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-primary">
      <NavBar type="customer" />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <VendorApplicationForm
          initialEmail={userProfile?.email ?? session.user.email ?? ""}
          initialPhoneNumber={userProfile?.contact_number ?? ""}
        />
      </div>
    </main>
  );
}
