import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSession } from "@/lib/auth/getSession";
import { logAdminLogin } from "@/app/admin/actions/activity-log";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const session = await getSession();
    const user = session.user;

    if (!user)
      return NextResponse.redirect(`${origin}/login`); // ← was /sign-up, changed to /login

    let userRole = session.profile?.role;

    if (!userRole) {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email ?? "",
          role: "customer",
        },
        { onConflict: "id" }
      );

      await supabase
        .from("customers")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });

      userRole = "customer";
    }

    if (userRole === "customer") {
      await supabase
        .from("customers")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });
    }

    const { data: vendorData } = await supabase
      .from("vendors")
      .select("vendor_type")
      .eq("owner_id", user.id)
      .single();
    const vendorType = vendorData?.vendor_type;

    if (userRole === "admin") {
      await logAdminLogin(user.id).catch((error) => {
        console.error("Failed to write admin login activity log:", error);
      });

      return NextResponse.redirect(`${origin}/admin/vendor-applications`);
    }

    if (userRole === "vendor") {
      const vendorType = session.profile?.vendor_type;

      if (vendorType === "market")
        return NextResponse.redirect(`${origin}/market/dashboard`);
      else if (vendorType === "pop-up")
        return NextResponse.redirect(`${origin}/pop-up/dashboard`);
    } else if (userRole === "customer") {
      return NextResponse.redirect(`${origin}`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login`);
}