import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

/**
 * Fetch all images for a product (server-side)
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching product images:", error)
    return []
  }

  return data || []
}

/**
 * Fetch all images for a product (client-side)
 */
export function getProductImagesClient(supabase: ReturnType<typeof createSupabaseBrowserClient>, productId: string) {
  return supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true })
}

/**
 * Add a new image to a product
 */
export async function addProductImage(productId: string, imageUrl: string, displayOrder: number = 0) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      display_order: displayOrder,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to add product image: ${error.message}`)
  }

  return data
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)

  if (error) {
    throw new Error(`Failed to delete product image: ${error.message}`)
  }
}

/**
 * Update image display order
 */
export async function updateProductImageOrder(imageId: string, displayOrder: number) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("product_images")
    .update({ display_order: displayOrder })
    .eq("id", imageId)
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to update product image order: ${error.message}`)
  }

  return data
}
