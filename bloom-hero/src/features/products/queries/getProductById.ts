// Origin: src/lib/products.ts

import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";
import type { ProductDetailRow } from "../types";

type ProductCategoryRow = { product_id: string; category: { category_name: string } | null };
type ProductRowWithCategoryId = ProductDetailRow & { category_id?: string | null };

export async function getProductById(id: string) {
  const supabase = await createPublicCatalogSupabaseClient();

  const selectWithImages =
    "id, vendor_id, category_id, product_name, product_image_url, price, description, created_at, stocks, product_images(image_url, display_order)";
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
      .select(
        "id, vendor_id, category_id, product_name, product_image_url, price, description, created_at, stocks"
      )
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      return { data: null as ProductDetailRow | null, error: fallbackError };
    }

    productRows = productRowsNoImages as ProductDetailRow | null;
  }

  if (!productRows) return { data: null as ProductDetailRow | null, error: null };

  const product = productRows as ProductRowWithCategoryId;

  const categories: string[] = [];
  const { data: categoryRows, error: categoryError } = await supabase
    .from("product_categories")
    .select("product_id, category:categories(category_name)")
    .eq("product_id", id);

  if (categoryError) {
    console.warn("getProductById: product_categories lookup failed:", categoryError.message);
  } else {
    for (const row of (categoryRows ?? []) as unknown as ProductCategoryRow[]) {
      const name = row.category?.category_name?.trim();
      if (name) categories.push(name);
    }
  }

  if (categories.length === 0 && product.category_id) {
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("category_name")
      .eq("id", product.category_id)
      .maybeSingle();
    const name = categoryRow?.category_name?.trim();
    if (name) categories.push(name);
  }

  // Vendor metadata
  let shop_name: string | null = null;
  let business_type: string | null = null;
  let average_rating: number | null = null;

  if (product.vendor_id) {
    const { data: vendorRows } = await supabase
      .from("vendors")
      .select("shop_name, business_type, average_rating")
      .eq("id", product.vendor_id)
      .limit(1)
      .maybeSingle();

    if (vendorRows) {
      shop_name = vendorRows.shop_name ?? null;
      business_type = vendorRows.business_type ?? null;
      average_rating = vendorRows.average_rating ?? null;
    }
  }

  let sold_count = 0;
  const { data: soldRows, error: soldError } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status)")
    .eq("orders.status", "completed")
    .eq("product_id", id);

  if (soldError) {
    console.warn("getProductById: sold count unavailable:", soldError.message);
  } else {
    for (const r of soldRows ?? []) {
      sold_count += Number((r as { quantity?: number }).quantity) || 0;
    }
  }

  const { category_id: _categoryId, ...productFields } = product;
  const result: ProductDetailRow = {
    ...productFields,
    categories,
    shop_name,
    business_type,
    average_rating,
    sold_count,
  };

  return { data: result, error: null };
}