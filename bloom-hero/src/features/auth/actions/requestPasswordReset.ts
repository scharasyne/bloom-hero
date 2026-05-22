"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function getRequestOrigin(headerStore: Headers): string {
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function requestPasswordReset(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter your email address." };
  }

  const headerStore = await headers();
  const origin = getRequestOrigin(headerStore);
  const redirectTo = `${origin}/auth/confirm?type=recovery`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
