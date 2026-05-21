import {
  formatAuthUrlErrorMessage,
  isPasswordRecoveryContext,
  parseAuthUrlErrors,
} from "@/features/auth/utils/parseAuthUrlErrors";

export function getAuthErrorRedirectPath(
  search: string,
  hash = ""
): string | null {
  const authError = parseAuthUrlErrors(search, hash);
  if (!authError) return null;

  const message = formatAuthUrlErrorMessage(authError);
  const isRecovery =
    isPasswordRecoveryContext(search, hash) ||
    authError.errorCode === "otp_expired" ||
    authError.error === "access_denied";

  const target = isRecovery ? "/forgot-password" : "/login";
  return `${target}?error=${encodeURIComponent(message)}`;
}
