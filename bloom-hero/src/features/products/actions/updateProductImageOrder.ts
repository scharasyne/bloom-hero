// Origin: src/lib/product-images.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function updateProductImageOrder(imageId: string, displayOrder: number) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_images")
    .update({ display_order: displayOrder })
    .eq("id", imageId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update product image order: ${error.message}`);
  }

  return data;
}