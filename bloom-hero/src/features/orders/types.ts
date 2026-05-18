// Source: `src/app/(customer)/orders/_lib/types.ts`

import type { TabKey } from "@/features/orders/constants";

export type OrderItemRow = {
  order_id: string;
  quantity: number;
  subtotal: number;
  products: {
    product_name: string;
    price: number;
    product_image_url: string | null;
  } | null;
  orders: {
    id: string;
    order_date: string;
    status: string;
    payment_method: "online" | "cod" | null;
    total_amount: number;
    receipt_proof_url: string | null;
    receipt_submitted_at: string | null;
    vendors: {
      id: string | null;
      shop_name: string | null;
    } | null;
  } | null;
};

export type OrderGroup = {
  id: string;
  vendorId: string | null;
  vendorName: string;
  status: string;
  paymentMethod: "online" | "cod" | null;
  orderDate: string;
  total: number;
  receiptProofUrl: string | null;
  receiptSubmittedAt: string | null;
  items: OrderItemRow[];
  hasReview: boolean;
};

// Source: `src/app/(customer)/orders/page.tsx`

export type CustomerOrdersPageResult =
  | { authenticated: false }
  | { authenticated: true; activeTab: TabKey; orders: OrderGroup[] };

// Source: `src/app/actions/order-status.ts`

export type CustomerPayPageResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | {
      status: "ready";
      order: {
        id: string;
        status: string;
        paymentMethod: string | null;
        receiptProofUrl: string | null;
        receiptSubmittedAt: string | null;
      };
    };

export type VendorScopedOrder = {
  id: string;
  vendor_id: string;
  status: string;
  payment_method?: "online" | "cod" | null;
  receipt_proof_url?: string | null;
  vendors: { owner_id: string; business_type: string } | null;
};
