import type { SupabaseClient } from "@supabase/supabase-js";

type ResolveResult =
  | { ok: true; price: number }
  | { ok: false; error: string };

export async function resolveCartProductPrice(
  supabase: SupabaseClient,
  productId: string,
  vendorId: string,
): Promise<ResolveResult> {
  const { data: product, error } = await supabase
    .from("products")
    .select("price, vendor_id")
    .eq("id", productId)
    .maybeSingle<{ price: number | string | null; vendor_id: string }>();

  if (error || !product) {
    return { ok: false, error: "Product not found." };
  }

  if (product.vendor_id !== vendorId) {
    return { ok: false, error: "Product does not belong to this vendor." };
  }

  const price = Number(product.price);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Product price is invalid." };
  }

  return { ok: true, price };
}
