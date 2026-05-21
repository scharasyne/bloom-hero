export type AuthUrlError = {
  error: string | null;
  errorCode: string | null;
  errorDescription: string | null;
};

export function parseAuthUrlErrors(
  search: string,
  hash: string
): AuthUrlError | null {
  const fromQuery = new URLSearchParams(search);
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""));

  const error = fromQuery.get("error") ?? fromHash.get("error");
  const errorCode = fromQuery.get("error_code") ?? fromHash.get("error_code");
  const errorDescription =
    fromQuery.get("error_description") ?? fromHash.get("error_description");

  if (!error && !errorCode && !errorDescription) {
    return null;
  }

  return {
    error,
    errorCode,
    errorDescription,
  };
}

export function formatAuthUrlErrorMessage(authError: AuthUrlError): string {
  if (authError.errorCode === "otp_expired") {
    return "This reset link has expired. Please request a new password reset email.";
  }

  if (authError.errorDescription) {
    return decodeURIComponent(authError.errorDescription.replace(/\+/g, " "));
  }

  if (authError.error === "access_denied") {
    return "This link is invalid or has expired. Please request a new password reset email.";
  }

  return authError.error ?? "Authentication link failed. Please try again.";
}

export function isPasswordRecoveryContext(search: string, hash: string): boolean {
  const fromQuery = new URLSearchParams(search);
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""));
  return (
    fromQuery.get("type") === "recovery" ||
    fromHash.get("type") === "recovery" ||
    fromQuery.get("next") === "/forgot-password"
  );
}
