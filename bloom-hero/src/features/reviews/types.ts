export type ActionResult = {
  ok: boolean;
  error?: string;
};

export type VendorReviewData = {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string | null;
};

/** Source: `src/app/(customer)/review/actions.ts` */
export type ReviewOrder = {
  id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: string;
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

/** Source: `src/app/(customer)/review/actions.ts` */
export type ReviewPageData = {
  order: ReviewOrder;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

/** Source: `src/app/(customer)/review/actions.ts` */
export type ReviewPageResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "ready"; data: ReviewPageData };