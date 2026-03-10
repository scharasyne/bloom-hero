import { useState } from "react";
import { mockVendorApplications } from "@/lib/mockData";
import { VendorApplication } from "@/typess";

export function useVendorApplications() {
  const [data, setData] = useState<VendorApplication[]>(mockVendorApplications);

  const approve = (id: string) => {
    setData((prev) => prev.filter((app) => app.id !== id));
  };

  const reject = (id: string) => {
    setData((prev) => prev.filter((app) => app.id !== id));
  };

  return { data, approve, reject };
}
