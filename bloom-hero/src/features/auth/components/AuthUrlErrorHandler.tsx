"use client";

import { useEffect } from "react";
import { getAuthCallbackRedirectPath } from "@/features/auth/utils/authCallbackRedirect";
import { getAuthErrorRedirectPath } from "@/features/auth/utils/authErrorRedirect";

/**
 * Handles auth query/hash on any page (server cannot read #fragment).
 */
export function AuthUrlErrorHandler() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (
      pathname === "/auth/callback" ||
      pathname === "/auth/confirm" ||
      pathname === "/forgot-password" ||
      pathname === "/login"
    ) {
      return;
    }

    const callbackRedirect = getAuthCallbackRedirectPath(search);
    if (callbackRedirect) {
      window.location.replace(callbackRedirect);
      return;
    }

    const authRedirect = getAuthErrorRedirectPath(search, hash);
    if (authRedirect) {
      window.location.replace(authRedirect);
    }
  }, []);

  return null;
}
