"use client"

import { useState } from "react"
import { ProductImage } from "@/lib/product-images"

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  primaryImageUrl?: string | null
}

/**
 * Product Gallery Component - Displays multiple product images with a main image and thumbnails
 */
export function ProductGallery({
  images,
  productName,
  primaryImageUrl,
}: ProductGalleryProps) {
  // Use product_images table data if available, otherwise fallback to primary image
  const allImages = images.length > 0 ? images : (primaryImageUrl ? [{ id: "primary", image_url: primaryImageUrl }] as any : [])

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const currentImage = allImages[selectedImageIndex]

  if (allImages.length === 0) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center h-80">
        <p className="text-muted-foreground">No product images available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="w-full bg-muted rounded-lg overflow-hidden">
        <img
          src={currentImage.image_url}
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-20 w-20 shrink-0 rounded border-2 overflow-hidden transition-all ${
                selectedImageIndex === index
                  ? "border-accent"
                  : "border-muted hover:border-muted-foreground"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <div className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded-br">
                  Primary
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {allImages.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Image {selectedImageIndex + 1} of {allImages.length}
        </p>
      )}
    </div>
  )
}

/**
 * Compact Product Gallery - Minimal version showing just thumbnails
 */
export function CompactProductGallery({
  images,
  productName,
  primaryImageUrl,
  maxDisplay = 4,
}: ProductGalleryProps & { maxDisplay?: number }) {
  const allImages = images.length > 0 ? images : (primaryImageUrl ? [{ id: "primary", image_url: primaryImageUrl }] as any : [])
  const displayImages = allImages.slice(0, maxDisplay)
  const moreCount = Math.max(0, allImages.length - maxDisplay)

  if (allImages.length === 0) {
    return null
  }

  return (
    <div className="flex gap-1">
      {displayImages.map((image, index) => (
        <div
          key={image.id}
        <div className="relative h-12 w-12 shrink-0 rounded border border-muted overflow-hidden">
        >
          <img
            src={image.image_url}
            alt={`${productName} thumbnail ${index + 1}`}
            className="h-full w-full object-cover"
          />
          {index === 0 && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded"></div>
          )}
        </div>
      ))}
      {moreCount > 0 && (
        <div className="h-12 w-12 rounded border border-muted bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{moreCount}
        </div>
      )}
    </div>
  )
}
