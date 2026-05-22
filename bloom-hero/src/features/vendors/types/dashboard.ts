export type VendorDashboardKPIItem = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  href: string;
};

export type VendorDashboardRecentOrder = {
  id: string;
  customerName: string;
  item: string;
  status: "Pending" | "Completed" | "Cancelled";
  amount: string;
  date: string;
};

export type VendorDashboardLowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export type VendorDashboardUpcomingOrder = {
  date: string;
  day: string;
  count: number;
  isToday?: boolean;
};

export type VendorDashboardTrendPoint = {
  label: string;
  value: number;
};
