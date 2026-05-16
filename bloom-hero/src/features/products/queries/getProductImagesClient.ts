// Origin: src/lib/product-images.ts

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function getProductImagesClient(supabase: ReturnType<typeof createSupabaseBrowserClient>, productId: string) {
  return supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });
}