import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Product } from "../types";

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, product_name, product_image_url, description, price, product_images(image_url, display_order)"
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as Product[]) || [];
}