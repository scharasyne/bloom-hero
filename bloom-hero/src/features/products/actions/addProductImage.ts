// Origin: src/lib/product-images.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function addProductImage(productId: string, imageUrl: string, displayOrder: number = 0) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      display_order: displayOrder,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to add product image: ${error.message}`);
  }

  return data;
}