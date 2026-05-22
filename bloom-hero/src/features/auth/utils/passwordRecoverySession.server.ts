import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
} from "@/features/auth/utils/passwordRecoveryCookie";

function cookieBaseOptions() {
  return {
    path: "/",
    maxAge: PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function setPasswordRecoveryCookieOnResponse(response: NextResponse) {
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", cookieBaseOptions());
}

export function clearPasswordRecoveryCookieOnResponse(response: NextResponse) {
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "", {
    ...cookieBaseOptions(),
    maxAge: 0,
  });
}

export async function isPasswordRecoveryCookieActive(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value === "1";
}
