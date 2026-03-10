import { useState, useMemo } from "react";
import { mockActivityLogs } from "@/lib/mockData";
import { ActivityLog, ActionType } from "@/types";

export function useActivityLogs(filter: ActionType | "all" = "all") {
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = false;
  const error = null;

  const data = useMemo(() => {
    return mockActivityLogs.filter((log) => {
      const matchesFilter =
        filter === "all" || log.actionType === filter;

      const matchesSearch =
        searchQuery === "" ||
        log.actionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  return { data, isLoading, error, searchQuery, setSearchQuery };
}
