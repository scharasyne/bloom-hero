// Origin: src/lib/products.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ProductDetailRow } from "../types";

type ProductCategoryRow = { product_id: string; category: { category_name: string } | null };

export async function getProductById(id: string) {
  const supabase = await createSupabaseServerClient();

  // Try to include product_images relation if it exists
  const selectWithImages = "id, vendor_id, product_name, product_image_url, price, description, created_at, stocks, product_images(image_url, display_order)";
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
      .select("id, vendor_id, product_name, product_image_url, price, description, created_at, stocks")
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