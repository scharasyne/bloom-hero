import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("name")
    .eq("id", session.user.id)
    .single();

  return (
    <main>
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
          href="/orders"
          className="inline-block bg-white text-[#2f6b4f] px-4 py-2 rounded border border-[#2f6b4f] hover:bg-[#f3faf6]"
        >
          View Order History
        </a>
        <a
          href="/settings"
          className="inline-block bg-[#d24b46] text-white px-4 py-2 rounded hover:bg-[#bb3f3a]"
        >
          Account Settings
        </a>
        <a
          href="/vendor-application"
          className="inline-block bg-[#d24b46] text-white px-4 py-2 rounded hover:bg-[#bb3f3a]"
        >
          Apply as Vendor
        </a>
      </div>
      <hr />
      <p>If you can see this page, routing is working correctly.</p>
    </main>
  );
}