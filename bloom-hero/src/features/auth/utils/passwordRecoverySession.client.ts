import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
} from "@/features/auth/utils/passwordRecoveryCookie";

export function setPasswordRecoveryCookieClient() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=1; path=/; max-age=${PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearPasswordRecoveryCookieClient() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function hasPasswordRecoveryCookieClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim() === `${PASSWORD_RECOVERY_COOKIE}=1`);
}
