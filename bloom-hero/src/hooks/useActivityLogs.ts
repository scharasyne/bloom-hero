import { useState, useEffect } from "react";
import { ActivityLog } from "@/typess";
import { mockActivityLogs } from "@/lib/mockData";

export function useActivityLogs() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockActivityLogs);
      setIsLoading(false);
    }, 800);
  }, []);

  return { data, isLoading };
}
