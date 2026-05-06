import {
  getExistingReviewByCustomerAndVendor,
  getOrderForReviewByCustomer,
} from "@/lib/services/reviews";

export type OrderForReview = {
  id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: Date;
  customerId: string;
  vendor: {
    id: string;
    shopName: string;
  };
  items: Array<{
    quantity: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    };
  }>;
};

export async function getOrderForReview(
  orderId: string,
  userId: string
): Promise<OrderForReview | null> {
  const data = await getOrderForReviewByCustomer(orderId, userId);

  if (!data) {
    return null;
  }

  // Transform to strongly typed structure
  return {
    id: data.id,
    status: data.status as "pending" | "processing" | "completed" | "cancelled",
    orderDate: new Date(data.order_date),
    customerId: data.customer_id,
    vendor: {
      id: data.vendors?.[0]?.id || "",
      shopName: data.vendors?.[0]?.shop_name || "Vendor",
    },
    items: (data.order_items || []).map((item: any) => ({
      quantity: item.quantity,
      subtotal: item.subtotal,
      product: {
        id: item.products?.id || "",
        name: item.products?.product_name || "Product",
        price: item.products?.price || 0,
        imageUrl: item.products?.product_image_url || null,
      },
    })),
  };
}

export async function getExistingReview(customerId: string, vendorId: string) {
  return getExistingReviewByCustomerAndVendor(customerId, vendorId);
}
