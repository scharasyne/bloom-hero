"use server";

import { revalidatePath } from "next/cache";

/** Refresh layout session (navbar) after login or profile edits. */
export async function revalidateUserCache(_userId: string) {
  revalidatePath("/", "layout");
}
