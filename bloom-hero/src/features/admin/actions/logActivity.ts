"use server";

import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import type { ActivityLogInput } from "@/features/admin/types";

async function getAdminName(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server-client").createSupabaseServerClient>>,
  adminUserId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", adminUserId)
    .maybeSingle<{ name: string | null; email: string | null }>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.name?.trim() || data?.email?.trim() || "Admin";
}

export async function logActivity(input: ActivityLogInput) {
  const { supabase, adminId, error: authError } = await ensureAdmin();
  if (authError || !adminId) {
    throw new Error(authError ?? "Only admins can perform this action.");
  }

  const adminName = await getAdminName(supabase, adminId);

  const { error } = await supabase.from("activity_logs").insert({
    admin_user_id: adminId,
    admin_name: adminName,
    action_type: input.actionType,
    action_title: input.actionTitle,
    target_id: input.targetId ?? null,
    target_name: input.targetName,
    details: input.details ?? [],
    tags: input.tags ?? [],
    quick_links: input.quickLinks ?? [],
    rating: input.rating ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function logAdminLogin(adminUserId: string) {
  await logActivity({
    adminUserId,
    actionType: "login",
    actionTitle: "Admin Login",
    targetName: "Admin Portal",
    details: [{ type: "info", text: "Session started successfully" }],
    tags: ["login", "admin"],
  });
}

export async function logAdminLogout(adminUserId: string) {
  await logActivity({
    adminUserId,
    actionType: "logout",
    actionTitle: "Admin Logout",
    targetName: "Admin Portal",
    details: [{ type: "info", text: "Session ended successfully" }],
    tags: ["logout", "admin"],
  });
}
