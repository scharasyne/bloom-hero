import { useState } from "react";
import { mockOrders } from "@/lib/mockData";

export function useOrders() {
  const [orders, setOrders] = useState(mockOrders);
  return { data: orders, setOrders };
}
