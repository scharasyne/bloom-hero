// Cut from the top of your page.tsx

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
  orderDate: string;
  total: number;
  receiptProofUrl: string | null;
  receiptSubmittedAt: string | null;
  items: OrderItemRow[];
  hasReview: boolean;
};