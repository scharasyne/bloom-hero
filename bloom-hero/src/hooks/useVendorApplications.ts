import { useState } from "react";
import { mockVendorApplications } from "@/lib/mockData";
import { VendorApplication } from "@/types";

export function useVendorApplications() {
  const [data, setData] = useState<VendorApplication[]>(
    mockVendorApplications
  );
  const isLoading = false;
  const error = null;

  const approveApplication = (id: string) => {
    setData((prev) => prev.filter((app) => app.id !== id));
  };

  const rejectApplication = (id: string) => {
    setData((prev) => prev.filter((app) => app.id !== id));
  };

  return { data, isLoading, error, approveApplication, rejectApplication };
}
