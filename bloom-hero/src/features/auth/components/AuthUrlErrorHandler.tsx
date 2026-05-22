"use client";

import { useEffect } from "react";
import { getAuthCallbackRedirectPath } from "@/features/auth/utils/authCallbackRedirect";
import { getAuthErrorRedirectPath } from "@/features/auth/utils/authErrorRedirect";
import { getAuthRecoveryRedirectPath } from "@/features/auth/utils/authRecoveryRedirect";
import { setPasswordRecoveryCookieClient } from "@/features/auth/utils/passwordRecoverySession.client";

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

    const recoveryRedirect = getAuthRecoveryRedirectPath(search, hash);
    if (recoveryRedirect) {
      setPasswordRecoveryCookieClient();
      window.location.replace(recoveryRedirect);
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
