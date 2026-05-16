import { SupabaseLikeError } from "../types";

/*
  IDK WHERE TO PUT THIS
*/

export function describeSupabaseError(error: SupabaseLikeError | null): string {
  if (!error) return "Unknown error";
  return [error.message, error.details, error.hint].filter(Boolean).join(" | ") || "Unknown error";
}