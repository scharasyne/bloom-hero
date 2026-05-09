import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ActivityLog, DetailLine } from "@/types";

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

export function useActivityLogs() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadActivityLogs() {
      setIsLoading(true);

      const supabase = createSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("activity_logs")
        .select("id, admin_name, created_at, action_type, action_title, target_name, details, tags, quick_links, rating")
        .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to load activity logs:", error.message);
        setData([]);
        setIsLoading(false);
        return;
      }

      setData((rows ?? []).map(mapRowToActivityLog));
      setIsLoading(false);
    }

    loadActivityLogs();

    return () => {
      isActive = false;
    };
  }, []);

  return { data, isLoading };
}
