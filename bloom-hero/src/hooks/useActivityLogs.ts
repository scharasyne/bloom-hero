import { useCallback, useEffect, useState } from "react";
import { getActivityLogs } from "@/features/admin/queries/getActivityLogs";
import type { ActivityLog } from "@/types";

export function useActivityLogs() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivityLogs = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await getActivityLogs();
      if (!result.ok) {
        console.error("Failed to load activity logs:", result.error);
        setData([]);
        return;
      }
      setData(result.data ?? []);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivityLogs();
  }, [loadActivityLogs]);

  return { data, isLoading, reload: loadActivityLogs };
}
