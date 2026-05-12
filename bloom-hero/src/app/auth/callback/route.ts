import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { logAdminLogin } from "@/app/admin/actions/activity-log";
import { createSupabaseOAuthCallbackClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { supabase, applyAuthCookies } = createSupabaseOAuthCallbackClient(request);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirect = NextResponse.redirect(`${origin}/login`);
    applyAuthCookies(redirect);
    return redirect;
  }

  const { data: row } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  let role = row?.role as string | undefined;
  if (!role) {
    const { error: upsertUserError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        role: "customer",
      },
      { onConflict: "id" }
    );
    if (upsertUserError) {
      const redirect = NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(upsertUserError.message)}`
      );
      applyAuthCookies(redirect);
      return redirect;
    }
    const { error: customerError } = await supabase
      .from("customers")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });
    if (customerError) {
      const redirect = NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(customerError.message)}`
      );
      applyAuthCookies(redirect);
      return redirect;
    }
    role = "customer";
  }

  let path = "/";
  if (role === "admin") {
    path = "/admin/vendor-applications";
  } else if (role === "vendor") {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("vendor_type")
      .eq("owner_id", user.id)
      .maybeSingle();
    const vendorType = vendor?.vendor_type as string | undefined;
    if (!vendorType) {
      const msg = encodeURIComponent(
        "Your account is not registered as a vendor. Please contact support or sign up as a vendor."
      );
      const redirect = NextResponse.redirect(`${origin}/login?error=${msg}`);
      applyAuthCookies(redirect);
      return redirect;
    }
    path = vendorType === "market" ? "/market/dashboard" : "/pop-up/dashboard";
  }

  const redirect = NextResponse.redirect(`${origin}${path}`);
  applyAuthCookies(redirect);
  return redirect;
}
