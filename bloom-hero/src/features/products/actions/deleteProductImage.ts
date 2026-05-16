// Origin: src/lib/product-images.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function deleteProductImage(imageId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    throw new Error(`Failed to delete product image: ${error.message}`);
  }
}