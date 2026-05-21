import { createBrowserClient } from "@supabase/ssr";

function getEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function parseDocumentCookies(): { name: string; value: string }[] {
  if (typeof document === "undefined" || !document.cookie) {
    return [];
  }

  return document.cookie.split(";").flatMap((part) => {
    const trimmed = part.trim();
    if (!trimmed) return [];
    const eq = trimmed.indexOf("=");
    if (eq === -1) return [{ name: trimmed, value: "" }];
    return [
      {
        name: trimmed.slice(0, eq),
        value: trimmed.slice(eq + 1),
      },
    ];
  });
}

/** Browser client with explicit cookie storage so PKCE verifiers match @supabase/ssr server clients. */
export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseDocumentCookies();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const segments = [`${name}=${value}`, `path=${options?.path ?? "/"}`];
          if (options?.maxAge != null) {
            segments.push(`max-age=${options.maxAge}`);
          }
          if (options?.sameSite) {
            segments.push(`SameSite=${options.sameSite}`);
          }
          if (options?.secure) {
            segments.push("Secure");
          }
          document.cookie = segments.join("; ");
        });
      },
    },
  });
}
