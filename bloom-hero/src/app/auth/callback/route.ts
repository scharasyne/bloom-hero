import type { EmailOtpType } from "@supabase/supabase-js";
import { revalidateUserCache } from "@/features/auth/utils/revalidateUserCache";
import {
  formatAuthUrlErrorMessage,
  parseAuthUrlErrors,
} from "@/features/auth/utils/parseAuthUrlErrors";
import { createSupabaseOAuthCallbackClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

function redirectWithCookies(
  url: string,
  applyAuthCookies: (response: NextResponse) => void
) {
  const redirect = NextResponse.redirect(url);
  applyAuthCookies(redirect);
  return redirect;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const isRecovery = next === "/forgot-password" || type === "recovery";
  const errorRedirectBase = isRecovery ? "/forgot-password" : "/login";

  const authUrlError = parseAuthUrlErrors(
    `?${searchParams.toString()}`,
    ""
  );
  if (authUrlError) {
    const message = formatAuthUrlErrorMessage(authUrlError);
    return NextResponse.redirect(
      `${origin}${errorRedirectBase}?error=${encodeURIComponent(message)}`
    );
  }

  if (isRecovery) {
    const confirm = new URLSearchParams(searchParams);
    confirm.delete("next");
    const qs = confirm.toString();
    return NextResponse.redirect(`${origin}/auth/confirm${qs ? `?${qs}` : ""}`);
  }

  const { supabase, applyAuthCookies } = createSupabaseOAuthCallbackClient(request);

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return redirectWithCookies(
        `${origin}${errorRedirectBase}?error=${encodeURIComponent(exchangeError.message)}`,
        applyAuthCookies
      );
    }
  } else if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (verifyError) {
      return redirectWithCookies(
        `${origin}${errorRedirectBase}?error=${encodeURIComponent(verifyError.message)}`,
        applyAuthCookies
      );
    }
  } else {
    return redirectWithCookies(
      `${origin}${errorRedirectBase}?error=${encodeURIComponent("Invalid or expired reset link.")}`,
      applyAuthCookies
    );
  }

  if (isRecovery) {
    return redirectWithCookies(`${origin}/forgot-password`, applyAuthCookies);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(`${origin}/login`, applyAuthCookies);
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
      return redirectWithCookies(
        `${origin}/login?error=${encodeURIComponent(upsertUserError.message)}`,
        applyAuthCookies
      );
    }
    const { error: customerError } = await supabase
      .from("customers")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });
    if (customerError) {
      return redirectWithCookies(
        `${origin}/login?error=${encodeURIComponent(customerError.message)}`,
        applyAuthCookies
      );
    }
    role = "customer";
  }

  let path = next === "/" ? "/" : next;
  if (next === "/") {
    if (role === "admin") {
      path = "/admin/dashboard";
    } else if (role === "vendor") {
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!vendor) {
        const msg = encodeURIComponent(
          "Your account is not registered as a vendor. Please contact support or sign up as a vendor."
        );
        return redirectWithCookies(`${origin}/login?error=${msg}`, applyAuthCookies);
      }
      path = "/vendor/dashboard";
    }
  }

  await revalidateUserCache(user.id);

  return redirectWithCookies(`${origin}${path}`, applyAuthCookies);
}
