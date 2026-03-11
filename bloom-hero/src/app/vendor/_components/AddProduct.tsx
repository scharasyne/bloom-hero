"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

export default function VendorAddProductPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [price, setPrice] = useState("0")
  const [stock, setStock] = useState("0")
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

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
      const productImage = formData.get("productImage")

      if (!productName || !categoryName) {
        throw new Error("Product name and category are required.")
      }

      if (!Number.isFinite(rawPrice) || rawPrice < 0) {
        throw new Error("Price must be 0 or higher.")
      }

      if (!Number.isFinite(rawStock) || rawStock < 0) {
        throw new Error("Stock must be 0 or higher.")
      }

      if (!(productImage instanceof File) || productImage.size === 0) {
        throw new Error("Please upload a product image.")
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
        .eq("vendor_type", "market")
        .maybeSingle()

      if (vendorError || !vendor) {
        throw new Error("Market vendor profile not found for this account.")
      }

      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .upsert({ category_name: categoryName }, { onConflict: "category_name" })
        .select("id")
        .single()

      if (categoryError || !category) {
        throw new Error(categoryError?.message || "Failed to save category.")
      }

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
          `Image upload failed. ${uploadError.message}`
        )
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(imagePath)

      const baseInsertPayload = {
        vendor_id: vendor.id,
        category_id: category.id,
        product_name: productName,
        description: description || null,
        price: rawPrice,
        stocks: Math.floor(rawStock),
      }

      const { error: insertWithImageError } = await supabase.from("products").insert({
        ...baseInsertPayload,
        product_image_url: publicUrl,
      })

      if (insertWithImageError) {
        const missingImageColumn =
          /product_image_url|schema cache|column/i.test(insertWithImageError.message)

        if (!missingImageColumn) {
          throw new Error(insertWithImageError.message)
        }

        const { error: fallbackInsertError } = await supabase
          .from("products")
          .insert(baseInsertPayload)

        if (fallbackInsertError) {
          throw new Error(fallbackInsertError.message)
        }
      }

      router.push("/vendor/market/list-product")
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
          href="/vendor/market/list-product"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Back to Product List
        </Link>
      </div>

      <section className="rounded-lg border p-5 bg-white shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productImage">Product Image Upload</Label>
            <Input
              id="productImage"
              name="productImage"
              type="file"
              accept="image/*"
              required
              onChange={(event) => {
                const file = event.target.files?.[0]

                if (!file) {
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl)
                  }
                  setImagePreviewUrl(null)
                  return
                }

                const nextPreviewUrl = URL.createObjectURL(file)
                if (imagePreviewUrl) {
                  URL.revokeObjectURL(imagePreviewUrl)
                }
                setImagePreviewUrl(nextPreviewUrl)
              }}
            />
            {imagePreviewUrl ? (
              <div className="mt-2 overflow-hidden rounded-md border bg-muted/30 p-2">
                <img
                  src={imagePreviewUrl}
                  alt="Selected product preview"
                  className="h-64 w-full object-contain"
                />
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
