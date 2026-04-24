"use client"

import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

type ProductImageRow = {
  id: string | null
  image_url: string
  display_order: number
}

type EditableProduct = {
  id: string
  product_name: string
  description: string | null
  price: number
  stocks: number
  product_image_url: string | null
  product_images?: { id: string; image_url: string; display_order: number }[] | null
}

type EditProductModalTriggerProps = {
  product: EditableProduct
}

const MAX_IMAGES = 5
const BUCKET_NAME = "product-images"

function extractStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
  const markerIndex = url.indexOf(marker)

  if (markerIndex < 0) {
    return null
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

function getInitialImages(product: EditableProduct): ProductImageRow[] {
  const relationImages = (product.product_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      image_url: img.image_url,
      display_order: img.display_order,
    }))

  if (relationImages.length > 0) {
    return relationImages
  }

  if (product.product_image_url) {
    return [
      {
        id: null,
        image_url: product.product_image_url,
        display_order: 0,
      },
    ]
  }

  return []
}

export default function EditProductModalTrigger({ product }: EditProductModalTriggerProps) {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [productName, setProductName] = useState(product.product_name)
  const [description, setDescription] = useState(product.description ?? "")
  const [price, setPrice] = useState(String(product.price ?? 0))
  const [stock, setStock] = useState(String(product.stocks ?? 0))
  const [images, setImages] = useState<ProductImageRow[]>(() => getInitialImages(product))
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resetState = () => {
    setProductName(product.product_name)
    setDescription(product.description ?? "")
    setPrice(String(product.price ?? 0))
    setStock(String(product.stocks ?? 0))
    setImages(getInitialImages(product))
    setErrorMessage(null)
  }

  const closeModal = () => {
    if (isSaving || isDeletingProduct) {
      return
    }

    setIsOpen(false)
    resetState()
  }

  const syncPrimaryImage = async (nextImages: ProductImageRow[]) => {
    const nextPrimaryUrl = nextImages[0]?.image_url ?? null

    const { error } = await supabase
      .from("products")
      .update({ product_image_url: nextPrimaryUrl })
      .eq("id", product.id)

    if (error) {
      throw new Error(error.message)
    }
  }

  const reorderImages = async (nextImages: ProductImageRow[]) => {
    const rowsToUpdate = nextImages
      .map((img, index) => ({ id: img.id, display_order: index }))
      .filter((img): img is { id: string; display_order: number } => Boolean(img.id))

    if (rowsToUpdate.length === 0) {
      return
    }

    const results = await Promise.all(
      rowsToUpdate.map((row) =>
        supabase
          .from("product_images")
          .update({ display_order: row.display_order })
          .eq("id", row.id)
      )
    )

    const failed = results.find((result) => result.error)
    if (failed?.error) {
      throw new Error(failed.error.message)
    }
  }

  const handleAddImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    setErrorMessage(null)

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setErrorMessage(`You can upload up to ${MAX_IMAGES} images per product.`)
      event.target.value = ""
      return
    }

    setIsSaving(true)

    try {
      const currentCount = images.length
      const newlyInsertedRows: ProductImageRow[] = []

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index]
        const extension = file.name.split(".").pop() || "jpg"
        const filePath = `${product.id}/${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) {
          throw new Error(`Image upload failed. ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

        const displayOrder = currentCount + index

        const { data: insertedRow, error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            image_url: publicUrl,
            display_order: displayOrder,
          })
          .select("id, image_url, display_order")
          .single()

        if (insertError) {
          throw new Error(`Failed to save image in database. ${insertError.message}`)
        }

        newlyInsertedRows.push({
          id: insertedRow.id,
          image_url: insertedRow.image_url,
          display_order: insertedRow.display_order,
        })
      }

      const nextImages = [...images, ...newlyInsertedRows].sort(
        (a, b) => a.display_order - b.display_order
      )

      setImages(nextImages)
      await syncPrimaryImage(nextImages)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload images right now."
      )
    } finally {
      setIsSaving(false)
      event.target.value = ""
    }
  }

  const handleDeleteImage = async (image: ProductImageRow) => {
    if (isSaving || isDeletingProduct) {
      return
    }

    if (images.length <= 1) {
      setErrorMessage("A product must have at least one image.")
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      if (image.id) {
        const { error: deleteRowError } = await supabase
          .from("product_images")
          .delete()
          .eq("id", image.id)

        if (deleteRowError) {
          throw new Error(`Failed to remove image from database. ${deleteRowError.message}`)
        }
      }

      const storagePath = extractStoragePathFromPublicUrl(image.image_url)
      if (storagePath) {
        const { error: storageDeleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([storagePath])

        if (storageDeleteError) {
          throw new Error(`Failed to remove image from storage. ${storageDeleteError.message}`)
        }
      }

      const nextImages = images
        .filter((item) => item.image_url !== image.image_url || item.id !== image.id)
        .map((item, index) => ({ ...item, display_order: index }))

      await reorderImages(nextImages)
      await syncPrimaryImage(nextImages)

      setImages(nextImages)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete image right now."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorderImages = async (fromIndex: number, toIndex: number) => {
    if (isSaving || isDeletingProduct) {
      return
    }

    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= images.length ||
      toIndex >= images.length
    ) {
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    const reordered = [...images]
    const [movedItem] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, movedItem)

    const nextImages = reordered.map((item, index) => ({
      ...item,
      display_order: index,
    }))

    try {
      await reorderImages(nextImages)
      await syncPrimaryImage(nextImages)
      setImages(nextImages)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to reorder images right now."
      )
    } finally {
      setIsSaving(false)
      setDraggedIndex(null)
    }
  }

  const handleSaveProduct = async () => {
    const parsedPrice = Number(price)
    const parsedStock = Number(stock)

    if (!productName.trim()) {
      setErrorMessage("Product name is required.")
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setErrorMessage("Price must be 0 or higher.")
      return
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setErrorMessage("Stock must be 0 or higher.")
      return
    }

    setErrorMessage(null)
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("products")
        .update({
          product_name: productName.trim(),
          description: description.trim() || null,
          price: parsedPrice,
          stocks: Math.floor(parsedStock),
        })
        .eq("id", product.id)

      if (error) {
        throw new Error(error.message)
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update product right now."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    const shouldDelete = window.confirm(
      "Delete this product permanently? This will also remove all product details including images."
    )

    if (!shouldDelete) {
      return
    }

    setErrorMessage(null)
    setIsDeletingProduct(true)

    try {
      const allImageUrls = Array.from(
        new Set(
          [product.product_image_url, ...images.map((img) => img.image_url)].filter(
            (url): url is string => Boolean(url)
          )
        )
      )

      const storagePaths = allImageUrls
        .map((url) => extractStoragePathFromPublicUrl(url))
        .filter((path): path is string => Boolean(path))

      const { error: deleteProductError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)

      if (deleteProductError) {
        throw new Error(deleteProductError.message)
      }

      if (storagePaths.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(storagePaths)

        if (storageDeleteError) {
          throw new Error(storageDeleteError.message)
        }
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete this product right now."
      )
    } finally {
      setIsDeletingProduct(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setErrorMessage(null)
        }}
        className="h-8 w-full rounded-lg bg-[#2f5d3a] text-white hover:bg-[#26492f] cursor-pointer transition-colors"
      >
        Edit Product
      </Button>

      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1816]/40 backdrop-blur-[2px] p-4 transition-opacity duration-200 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-[#ebe7e3] bg-[#fcfbf9] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-200 ${
              isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-[0.98] opacity-0 translate-y-2"
            }`}
          >
            <div className="mb-6 flex items-start justify-between border-b border-[#ece7e2] pb-4">
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-[#1e1c1a]">Edit Product</h2>
                <p className="mt-1 text-sm text-[#8a847d]">
                  Update product details, stock, and images.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving || isDeletingProduct}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-[#8a847d] transition-colors hover:bg-[#f3f0ec] hover:text-[#1e1c1a] cursor-pointer disabled:cursor-not-allowed"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
              <label className="text-[13px] font-semibold uppercase tracking-wide text-[#6f6a64]">
                Product Name
              </label>
              <Input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                disabled={isSaving || isDeletingProduct}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                disabled={isSaving || isDeletingProduct}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  disabled={isSaving || isDeletingProduct}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  disabled={isSaving || isDeletingProduct}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[#6f6a64]">
                  Images ({images.length}/{MAX_IMAGES})
                  <span className="ml-2 text-[11px] font-medium normal-case tracking-normal text-[#9a948d]">
                    Drag to reorder
                  </span>
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isSaving || isDeletingProduct || images.length >= MAX_IMAGES}
                  onChange={handleAddImages}
                  className="max-w-xs"
                />
              </div>

              {images.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#ddd8d2] bg-[#faf9f7] p-5 text-sm text-[#8a847d]">
                  No images available for this product.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((img, index) => (
                    <div
                      key={`${img.id ?? "legacy"}-${img.image_url}`}
                      className="space-y-2"
                      draggable={!isSaving && !isDeletingProduct}
                      onDragStart={(event) => {
                        setDraggedIndex(index)
                        event.dataTransfer.effectAllowed = "move"
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = "move"
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (draggedIndex !== null) {
                          void handleReorderImages(draggedIndex, index)
                        }
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null)
                      }}
                    >
                      <div
                        className={[
                          "relative overflow-hidden rounded-2xl border border-[#ebe7e3] bg-[#f5f2ef] cursor-grab shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                          draggedIndex === index ? "opacity-60 scale-[0.98]" : "opacity-100",
                        ].join(" ")}
                      >
                        <img
                          src={img.image_url}
                          alt={`${productName} ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img)}
                          disabled={isSaving || isDeletingProduct}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#6f6a64] backdrop-blur-sm transition hover:bg-white hover:text-[#1e1c1a] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete image"
                          title={images.length <= 1 ? "A product must have at least one image." : "Delete image"}
                        >
                          <Icon icon="mdi:trash-can-outline" width={14} height={14} />
                        </button>
                        {index === 0 ? (
                          <span className="absolute left-2 top-2 rounded-full bg-[#2f5d3a] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            Primary
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage ? (
              <p className="rounded-xl border border-[#eadfd6] bg-[#faf6f2] px-4 py-3 text-sm text-[#8a5a3b]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#ece7e2] pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteProduct}
                disabled={isSaving || isDeletingProduct}
                className="rounded-xl border border-[#ddd3ca] bg-[#f6f2ee] text-[#7a5c47] shadow-none transition-colors hover:bg-[#efe7e0] hover:text-[#5f4635] hover:border-[#cdbfb2] cursor-pointer disabled:cursor-not-allowed"
              >
                {isDeletingProduct ? "Deleting..." : "Delete Product"}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSaving || isDeletingProduct}
                  className="rounded-xl border border-[#ddd8d2] bg-white text-[#6f6a64] shadow-none transition-colors hover:bg-[#f5f2ef] hover:text-[#1e1c1a] hover:border-[#cfc7bf] cursor-pointer disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSaving || isDeletingProduct}
                  className="rounded-xl bg-[#2f5d3a] text-white shadow-none transition-colors hover:bg-[#26492f] active:bg-[#1f3b26] cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* //mobile responsive buttons */}
            {/* <div className="mt-2 flex flex-col-reverse gap-3 border-t border-[#ece7e2] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteProduct}
                disabled={isSaving || isDeletingProduct}
                className="w-full rounded-xl border border-[#ddd3ca] bg-[#f6f2ee] text-[#7a5c47] shadow-none transition-colors hover:bg-[#efe7e0] hover:text-[#5f4635] hover:border-[#cdbfb2] cursor-pointer disabled:cursor-not-allowed sm:w-auto"
              >
                {isDeletingProduct ? "Deleting..." : "Delete Product"}
              </Button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSaving || isDeletingProduct}
                  className="w-full rounded-xl border border-[#ddd8d2] bg-white text-[#6f6a64] shadow-none transition-colors hover:bg-[#f5f2ef] hover:text-[#1e1c1a] hover:border-[#cfc7bf] cursor-pointer disabled:cursor-not-allowed sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSaving || isDeletingProduct}
                  className="w-full rounded-xl bg-[#2f5d3a] text-white shadow-none transition-colors hover:bg-[#26492f] active:bg-[#1f3b26] cursor-pointer disabled:cursor-not-allowed sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div> */}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* ) : null} */}
    </>
  )
}
