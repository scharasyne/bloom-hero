"use client"

import { useMemo, useState } from "react"

type ProductCardImageCarouselProps = {
  imageUrls: string[]
  productName: string
  imageClassName?: string
  controlClassName?: string
  indicatorClassName?: string
}

export default function ProductCardImageCarousel({
  imageUrls,
  productName,
  imageClassName = "h-full w-full object-cover",
  controlClassName = "absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/55 text-white hover:bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
  indicatorClassName = "absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
}: ProductCardImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const normalizedUrls = useMemo(
    () => imageUrls.filter((url) => typeof url === "string" && url.trim().length > 0),
    [imageUrls]
  )

  const imageCount = normalizedUrls.length

  if (imageCount === 0) {
    return null
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageCount)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null)
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || imageCount <= 1) {
      return
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX
    const deltaX = touchEndX - touchStartX

    if (Math.abs(deltaX) < 40) {
      return
    }

    if (deltaX < 0) {
      goNext()
    } else {
      goPrev()
    }
  }

  return (
    <div className="group relative h-full w-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <img
        src={normalizedUrls[currentIndex]}
        alt={`${productName} image ${currentIndex + 1}`}
        className={imageClassName}
      />

      {imageCount > 1 ? (
        <>
          <button
            type="button"
            className={`${controlClassName} left-2`}
            onClick={goPrev}
            aria-label="Previous image"
          >
            <span aria-hidden="true">&#8249;</span>
          </button>

          <button
            type="button"
            className={`${controlClassName} right-2`}
            onClick={goNext}
            aria-label="Next image"
          >
            <span aria-hidden="true">&#8250;</span>
          </button>

          <div className={indicatorClassName}>
            {normalizedUrls.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={[
                    "h-2 w-2 rounded-full border border-white/70 transition-all",
                  index === currentIndex ? "bg-white" : "bg-white/40",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
