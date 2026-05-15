"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AdminActionResult } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import type { ActivityLog, DetailLine } from "@/types";

type ActivityLogRow = {
  id: string;
  admin_name: string | null;
  created_at: string;
  action_type: ActivityLog["actionType"];
  action_title: string;
  target_name: string;
  details: DetailLine[] | null;
  tags: string[] | null;
  quick_links: { label: string; href: string }[] | null;
  rating: { score: number; max: number } | null;
};

function mapRowToActivityLog(row: ActivityLogRow): ActivityLog {
  return {
    id: row.id,
    adminName: row.admin_name ?? "Admin",
    timestamp: row.created_at,
    actionType: row.action_type,
    actionTitle: row.action_title,
    targetName: row.target_name,
    details: row.details ?? [],
    tags: row.tags ?? [],
    quickLinks: row.quick_links ?? [],
    rating: row.rating ?? undefined,
  };
}

export async function getActivityLogs(): Promise<AdminActionResult<ActivityLog[]>> {
  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { ok: false, error: adminCheck.error };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("activity_logs")
      .select(
        "id, admin_name, created_at, action_type, action_title, target_name, details, tags, quick_links, rating"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: (rows ?? []).map(mapRowToActivityLog) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load activity logs.",
    };
  }
}
