import NavBar from "@/components/navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function CustomerDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  const { data: userProfile } = await supabase
    .from("users")
    .select("name")
    .eq("id", session.user.id)
    .single();

  return (
    <main>
      <NavBar type="customer" />
      <h1>BloomHero</h1>
      <p>Welcome {userProfile?.name || session.user.email}!</p>
      <p>This is your customer dashboard.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/cart"
          className="inline-block bg-[#2f6b4f] text-white px-4 py-2 rounded hover:bg-[#254e3f]"
        >
          View Cart
        </a>
        <a
          href="/customer/orders"
          className="inline-block bg-white text-[#2f6b4f] px-4 py-2 rounded border border-[#2f6b4f] hover:bg-[#f3faf6]"
        >
          View Order History
        </a>
        <a
          href="/customer/settings"
          className="inline-block bg-[#d24b46] text-white px-4 py-2 rounded hover:bg-[#bb3f3a]"
        >
          Account Settings
        </a>
        <a
          href="/customer/vendor-application"
          className="inline-block bg-[#d24b46] text-white px-4 py-2 rounded hover:bg-[#bb3f3a]"
        >
          Apply as Vendor
        </a>
      </div>
      <hr />
      <p>If you can see this page, routing is working correctly.</p>
      {profile?.shipping_address ? (
        <p className="mt-3">Saved shipping address: {profile.shipping_address}</p>
      ) : null}
    </main>
  );
}