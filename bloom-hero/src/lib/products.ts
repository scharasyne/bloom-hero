import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type ProductImageRow = {
  image_url: string;
  display_order: number;
};

export type ProductDetailRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description?: string | null;
  created_at?: string;
  product_images?: ProductImageRow[] | null;
  categories?: string[];
  shop_name?: string | null;
  vendor_type?: string | null;
  average_rating?: number | null;
  sold_count?: number;
};

export type ProductReviewRow = {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string | null;
  reviewDate: string;
  status?: "pending" | "approved" | "rejected" | null;
};

type ProductCategoryRow = { product_id: string; category: { category_name: string } | null };

export async function getProductById(id: string) {
  const supabase = await createSupabaseServerClient();

  // Try to include product_images relation if it exists
  const selectWithImages = "id, vendor_id, product_name, product_image_url, price, description, created_at, product_images(image_url, display_order)";
  const { data: productRowsWithImages, error: productsError } = await supabase
    .from("products")
    .select(selectWithImages)
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  let productRows: ProductDetailRow | null = productRowsWithImages as ProductDetailRow | null;

  if (productsError) {
    // Attempt fallback without images relation
    const { data: productRowsNoImages, error: fallbackError } = await supabase
      .from("products")
      .select("id, vendor_id, product_name, product_image_url, price, description, created_at")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      return { data: null as ProductDetailRow | null, error: fallbackError };
    }

    productRows = productRowsNoImages as ProductDetailRow | null;
  }

  if (!productRows) return { data: null as ProductDetailRow | null, error: null };

  const product = productRows as ProductDetailRow;

  // Categories
  const { data: categoryRows, error: categoryError } = await supabase
    .from("product_categories")
    .select("product_id, category:categories(category_name)")
    .eq("product_id", id);

  if (categoryError) {
    return { data: null as ProductDetailRow | null, error: categoryError };
  }

  const categories: string[] = [];
  for (const row of (categoryRows ?? []) as unknown as ProductCategoryRow[]) {
    const name = row.category?.category_name?.trim();
    if (name) categories.push(name);
  }

  // Vendor metadata
  let shop_name: string | null = null;
  let vendor_type: string | null = null;
  let average_rating: number | null = null;

  if (product.vendor_id) {
    const { data: vendorRows } = await supabase
      .from("vendors")
      .select("shop_name, vendor_type, average_rating")
      .eq("id", product.vendor_id)
      .limit(1)
      .maybeSingle();

    if (vendorRows) {
      shop_name = vendorRows.shop_name ?? null;
      vendor_type = vendorRows.vendor_type ?? null;
      average_rating = vendorRows.average_rating ?? null;
    }
  }

  // Sold count (completed orders only)
  const { data: soldRows } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status)")
    .eq("orders.status", "completed")
    .eq("product_id", id);

  let sold_count = 0;
  for (const r of soldRows ?? []) {
    sold_count += Number((r as any).quantity) || 0;
  }

  const result: ProductDetailRow = {
    ...product,
    categories,
    shop_name,
    vendor_type,
    average_rating,
    sold_count,
  };

  return { data: result, error: null };
}

export async function getProductReviewsByProductId(productId: string) {
  const supabase = await createSupabaseServerClient();

  if (!productId || productId.trim() === "") {
    console.warn("getProductReviewsByProductId: productId is empty or missing");
    return { data: [] as ProductReviewRow[], error: null };
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date, status")
    .eq("product_id", productId)
    .or("status.is.null,status.neq.rejected")
    .order("review_date", { ascending: false });

  if (reviewError) {
    console.error("getProductReviewsByProductId Supabase error:", reviewError.message || JSON.stringify(reviewError));
    return { data: [] as ProductReviewRow[], error: reviewError };
  }

  const customerIds = Array.from(
    new Set((reviewRows ?? []).map((review) => review.customer_id).filter(Boolean))
  );

  let customerNames = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name")
      .in("id", customerIds);

    if (usersError) {
      return { data: [] as ProductReviewRow[], error: usersError };
    }

    customerNames = new Map(
      (users ?? []).map((user) => [user.id, user.name ?? "Customer"])
    );
  }

  const reviews = (reviewRows ?? []).map((review) => ({
    id: review.id,
    customerId: review.customer_id,
    customerName: customerNames.get(review.customer_id) ?? "Customer",
    rating: Number(review.rating) || 0,
    comment: review.comment ?? null,
    reviewDate: review.review_date,
    status: (review as { status?: ProductReviewRow["status"] }).status ?? null,
  }));

  return { data: reviews, error: null };
}
