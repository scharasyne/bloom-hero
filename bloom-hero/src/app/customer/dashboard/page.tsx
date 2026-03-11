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

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>BloomHero</h1>
      <p>Welcome {profile?.name || session.user.email}!</p>
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
      </div>
      <hr />
      <p>If you can see this page, routing is working correctly.</p>
    </main>
  );
}