/**
 * Recovery links sometimes land on Site URL (/) with hash tokens.
 * Route them to forgot-password or auth/confirm before the app treats the user as logged in.
 */
export function getAuthRecoveryRedirectPath(
  search: string,
  hash: string
): string | null {
  const query = new URLSearchParams(search.replace(/^\?/, ""));
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const type = query.get("type") ?? hashParams.get("type");

  if (type !== "recovery") {
    return null;
  }

  if (hashParams.has("access_token") || hashParams.has("refresh_token")) {
    return `/forgot-password${hash}`;
  }

  if (query.has("code") || query.has("token_hash")) {
    const confirm = new URLSearchParams();
    if (query.has("code")) confirm.set("code", query.get("code")!);
    if (query.has("token_hash")) {
      confirm.set("token_hash", query.get("token_hash")!);
    }
    if (query.has("type")) confirm.set("type", query.get("type")!);
    const qs = confirm.toString();
    return `/auth/confirm${qs ? `?${qs}` : ""}`;
  }

  return "/forgot-password";
}
