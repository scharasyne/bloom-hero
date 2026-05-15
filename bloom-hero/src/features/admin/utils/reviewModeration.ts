import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export function getAdminClient(): {
  client: ReturnType<typeof createSupabaseAdminClient> | null;
  error?: string;
} {
  try {
    return { client: createSupabaseAdminClient() };
  } catch (error) {
    console.error("Failed to initialize Supabase admin client:", error);
    return {
      client: null,
      error:
        "Review moderation requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set.",
    };
  }
}

export function pickSingle<T extends Record<string, unknown>>(
  value: T | T[] | null | undefined
): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
