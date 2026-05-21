import { createClient } from "@supabase/supabase-js";

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

function getRecoveryStorage() {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage;
}

export function createSupabaseRecoveryClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: getRecoveryStorage(),
      storageKey: "bh-recovery",
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
