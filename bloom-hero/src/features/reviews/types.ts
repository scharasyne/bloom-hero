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