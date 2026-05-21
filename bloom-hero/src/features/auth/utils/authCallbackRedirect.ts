/** Routes Supabase auth params when they land on the wrong page (e.g. Site URL /). */
export function getAuthCallbackRedirectPath(search: string): string | null {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const code = params.get("code");
  const token_hash = params.get("token_hash");
  const type = params.get("type");

  if (!code && !(token_hash && type)) {
    return null;
  }

  const confirm = new URLSearchParams();
  if (code) confirm.set("code", code);
  if (token_hash) confirm.set("token_hash", token_hash);
  if (type) confirm.set("type", type);

  return `/auth/confirm?${confirm.toString()}`;
}
