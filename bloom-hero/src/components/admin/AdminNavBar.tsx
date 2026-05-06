import Link from "next/link";
import { logAdminLogout } from "@/app/admin/actions/activity-log";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

async function handleSignOut() {
  "use server";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logAdminLogout(user.id).catch((error) => {
      console.error("Failed to write admin logout activity log:", error);
    });
  }

  await supabase.auth.signOut();
  redirect("/admin-log-in");
}

function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="flex items-center justify-center px-[20px] py-[12px] rounded-[999px] border border-[#d9d4ce] text-[#5f5a55] font-medium text-[16px] tracking-[0.56px] whitespace-nowrap cursor-pointer hover:bg-[#edeae6] transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
}

export default function AdminNavBar() {
  return (
    <nav
      className="w-full h-[88px] flex items-center justify-between px-[64px] border-b border-[#edeae6] shrink-0 bg-[#f7f4ef]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Left: Logo + Admin label */}
      <Link href="/admin-dashboard" className="flex gap-[16px] items-center cursor-pointer">
        <div className="h-[48px] w-[36px] relative overflow-hidden">
          <img
            alt="BloomHero Logo"
            className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
            src="/icon.png"
          />
        </div>
        <span className="text-[#7a746e] text-[16px]">Admin</span>
      </Link>

      {/* Right: Avatar + Name + Sign Out */}
      <div className="flex items-center gap-[32px]">
        {/* Avatar + Name */}
        <div className="flex gap-[8px] items-center">
          <div className="size-[40px] rounded-full bg-[#eaf3ef] overflow-hidden shrink-0">
            <div className="size-full flex items-center justify-center text-[#2e7d5b] font-bold text-[16px]">
              A
            </div>
          </div>
          <span className="font-semibold text-[16px] text-[#2c2a28] tracking-[-0.07px]">
            Ari Rufila
          </span>
        </div>

        <SignOutButton />
      </div>
    </nav>
  );
}
