/** Supabase PKCE links sometimes land on Site URL (/) with ?code= instead of /auth/callback. */
export function getAuthCallbackRedirectPath(
  search: string,
  defaultNext = "/forgot-password"
): string | null {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const code = params.get("code");
  const token_hash = params.get("token_hash");
  const type = params.get("type");

  if (!code && !(token_hash && type)) {
    return null;
  }

  const next = params.get("next") ?? defaultNext;
  const callback = new URLSearchParams();
  if (code) callback.set("code", code);
  if (token_hash) callback.set("token_hash", token_hash);
  if (type) callback.set("type", type);
  callback.set("next", next.startsWith("/") ? next : defaultNext);

  return `/auth/callback?${callback.toString()}`;
}
