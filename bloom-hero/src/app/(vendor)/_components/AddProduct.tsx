"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

type vendorType = 'market' | 'pop-up';

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function VendorAddProductPage({ type }: { type: vendorType }) {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [price, setPrice] = useState("0")
  const [stock, setStock] = useState("0")
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl)
      })
    }
  }, [imagePreviews])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const productName = String(formData.get("productName") ?? "").trim()
      const categoryName = String(formData.get("category") ?? "").trim()
      const description = String(formData.get("description") ?? "").trim()
      const rawPrice = Number(formData.get("price") ?? "0")
      const rawStock = Number(formData.get("stock") ?? "0")
      const productImages = formData.getAll("productImages") as File[]
      let insertedProductId: string | null = null

      if (!productName || !categoryName) {
        throw new Error("Product name and category are required.")
      }

      if (!Number.isFinite(rawPrice) || rawPrice < 0) {
        throw new Error("Price must be 0 or higher.")
      }

      if (!Number.isFinite(rawStock) || rawStock < 0) {
        throw new Error("Stock must be 0 or higher.")
      }

      if (!productImages || productImages.length === 0 || (productImages.length === 1 && productImages[0].size === 0)) {
        throw new Error("Please upload at least one product image.")
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("You need to log in first.")
      }

      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id")
        .eq("owner_id", user.id)
        .eq("vendor_type", type)
        .maybeSingle()

      if (vendorError || !vendor) {
        throw new Error("Vendor profile not found for this account.")
      }

      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .upsert({ category_name: categoryName }, { onConflict: "category_name" })
        .select("id")
        .single()

      if (categoryError || !category) {
        throw new Error(categoryError?.message || "Failed to save category.")
      }

      // Filter out empty files and upload all valid images
      const validImages = productImages.filter((img) => img instanceof File && img.size > 0)

      if (validImages.length === 0) {
        throw new Error("Please upload at least one valid product image.")
      }

      // Upload images and collect their URLs
      const uploadedImageUrls: string[] = []

      for (let i = 0; i < validImages.length; i++) {
        const productImage = validImages[i]
        const imageExtension = productImage.name.split(".").pop() || "jpg"
        const imagePath = `${vendor.id}/${crypto.randomUUID()}.${imageExtension}`

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(imagePath, productImage, {
            cacheControl: "3600",
            upsert: false,
            contentType: productImage.type,
          })

        if (uploadError) {
          throw new Error(
            `Image upload failed for image ${i + 1}. ${uploadError.message}`
          )
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(imagePath)

        uploadedImageUrls.push(publicUrl)
      }

      const baseInsertPayload = {
        vendor_id: vendor.id,
        category_id: category.id,
        product_name: productName,
        description: description || null,
        price: rawPrice,
        stocks: Math.floor(rawStock),
        product_image_url: uploadedImageUrls[0], // Set first image as primary
      }

      const { data: product, error: insertWithImageError } = await supabase
        .from("products")
        .insert(baseInsertPayload)
        .select("id")
        .single()

      if (insertWithImageError) {
        const missingImageColumn =
          /product_image_url|schema cache|column/i.test(insertWithImageError.message)

        if (!missingImageColumn) {
          throw new Error(insertWithImageError.message)
        }

        // Fallback: insert without product_image_url
        const { data: fallbackProduct, error: fallbackInsertError } = await supabase
          .from("products")
          .insert(baseInsertPayload)
          .select("id")
          .single()

        if (fallbackInsertError) {
          throw new Error(fallbackInsertError.message)
        }

        insertedProductId = fallbackProduct?.id ?? null
      } else {
        insertedProductId = product?.id ?? null
      }

      if (!insertedProductId) {
        throw new Error("Failed to create product.")
      }

      // Insert all images into product_images table
      const imagesToInsert = uploadedImageUrls.map((url, index) => ({
        product_id: insertedProductId,
        image_url: url,
        display_order: index,
      }))

      const { error: imagesInsertError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (imagesInsertError) {
        // Log but don't fail - main product is created
        console.warn("Warning: Some product images could not be saved to database:", imagesInsertError.message)
      }

      router.push(`/${type}/products`)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add product right now."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Add Product</h1>
          <p className="text-muted-foreground text-sm">
            Add a new product to your market inventory.
          </p>
        </div>

        <Link
          href={`/${type}/products`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Back to Product List
        </Link>
      </div>

      <section className="rounded-lg border p-5 bg-white shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productImages">Product Images Upload</Label>
            <p className="text-xs text-muted-foreground">Upload one or more product images (recommended: 3-5 images)</p>
            <Input
              id="productImages"
              name="productImages"
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files || [])

                if (files.length === 0) {
                  setImagePreviews([])
                  return
                }

                // Create previews for new files
                const newPreviews: ImagePreview[] = files.map((file) => ({
                  file,
                  previewUrl: URL.createObjectURL(file),
                }))

                // Revoke old URLs and set new previews
                imagePreviews.forEach((preview) => {
                  URL.revokeObjectURL(preview.previewUrl)
                })

                setImagePreviews(newPreviews)
              }}
            />
            {imagePreviews.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Selected images ({imagePreviews.length})</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-md border bg-muted/30 p-1"
                    >
                      <img
                        src={preview.previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded">
                        <button
                          type="button"
                          onClick={() => {
                            const newPreviews = imagePreviews.filter((_, i) => i !== index)
                            URL.revokeObjectURL(preview.previewUrl)
                            setImagePreviews(newPreviews)
                          }}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              placeholder="e.g., Classic White Bouquet"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)
                  if (!Number.isNaN(nextValue) && nextValue < 0) {
                    setPrice("0")
                    return
                  }
                  setPrice(event.target.value)
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                step="1"
                value={stock}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)
                  if (!Number.isNaN(nextValue) && nextValue < 0) {
                    setStock("0")
                    return
                  }
                  setStock(event.target.value)
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="e.g., Birthday" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g., Handcrafted bouquet with fresh roses and eucalyptus."
              rows={4}
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-40 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}
