// Origin: src/lib/product-images.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ProductImage } from "../types";

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching product images:", error);
    return [];
  }

  return data || [];
}