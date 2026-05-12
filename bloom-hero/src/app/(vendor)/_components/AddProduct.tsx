"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { addVendorProductAction, getVendorApplicationStatusAction } from "@/features/vendors/actions/actions"
import { CategoryPillSelector } from "@/app/(vendor)/_components/CategoryPillSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import { fetchCategories } from "@/features/categories/queries/fetch-categories"

type vendorType = 'market' | 'pop-up';

type CategoryOption = {
  id: string
  category_name: string
}

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
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [vendorStatus, setVendorStatus] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    async function fetchVendorStatus() {
      try {
        const result = await getVendorApplicationStatusAction(type)

        if (result.message) {
          console.error("Failed to fetch vendor status:", result.message)
          setVendorStatus(null)
          return
        }

        setVendorStatus(result.status ?? null)
      } finally {
        setStatusLoading(false)
      }
    }
    fetchVendorStatus()
  }, [type])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await fetchCategories()
        setCategories(data as CategoryOption[])
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load categories right now."
        )
      } finally {
        setCategoriesLoading(false)
      }
    }

    void fetchCategories()
  }, [supabase])

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

    if (vendorStatus === "pending") {
      setErrorMessage("Your vendor application is still pending. You cannot add products yet.")
      return
    }

    if (selectedCategoryIds.length < 1 || selectedCategoryIds.length > 3) {
      setErrorMessage("Select between 1 and 3 categories.")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)

      const result = await addVendorProductAction(type, formData)

      if (!result.ok) {
        setErrorMessage(result.message ?? "Unable to add product right now.")
        return
      }

      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
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
        {vendorStatus === "pending" ? (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-amber-900">Application pending</p>
            <p className="mt-1 text-sm text-amber-800">
              Your vendor application is still pending. You are unable to add products yet.
            </p>
          </div>
        ) : null}

        {statusLoading ? (
          <div className="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Checking vendor application status...
          </div>
        ) : null}

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
            <Label>Categories</Label>
            {categoriesLoading ? (
              <p className="rounded-2xl border border-dashed border-[#ddd8d2] bg-[#faf9f7] px-4 py-3 text-sm text-[#8a847d]">
                Loading categories...
              </p>
            ) : (
              <CategoryPillSelector
                categories={categories}
                selectedIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                disabled={isSubmitting || vendorStatus === "pending"}
                maxSelected={3}
              />
            )}
            {selectedCategoryIds.map((categoryId) => (
              <input key={categoryId} type="hidden" name="categoryIds" value={categoryId} />
            ))}
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
              disabled={isSubmitting || vendorStatus === "pending" || categoriesLoading}
              className="min-w-40 bg-accent text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:hover:bg-slate-300"
            >
              {vendorStatus === "pending"
                ? "Unavailable while pending"
                : categoriesLoading
                  ? "Loading categories..."
                : isSubmitting
                  ? "Adding..."
                  : "Add Product"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}
