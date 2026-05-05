import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getUserNameById } from "@/lib/services/users";

export default async function CustomerDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userName = await getUserNameById(session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-bold text-[#2D2926]">BloomHero</h1>
      <p className="mt-2 text-[#6D6863]">
        Welcome {userName || session.user.email}!
      </p>
      <p className="mt-1 text-[#6D6863]">This is your customer dashboard.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/cart"
          className="inline-block rounded bg-[#2f6b4f] px-4 py-2 text-white hover:bg-[#254e3f]"
        >
          View Cart
        </a>
        <a
          href="/orders"
          className="inline-block rounded border border-[#2f6b4f] bg-white px-4 py-2 text-[#2f6b4f] hover:bg-[#f3faf6]"
        >
          View Order History
        </a>
        <a
          href="/settings"
          className="inline-block rounded bg-[#d24b46] px-4 py-2 text-white hover:bg-[#bb3f3a]"
        >
          Account Settings
        </a>
        <a
          href="/vendor-application"
          className="inline-block rounded border border-[#d24b46] bg-white px-4 py-2 text-[#d24b46] hover:bg-[#fff4f3]"
        >
          Apply as Vendor
        </a>
      </div>
    </main>
  );
}
