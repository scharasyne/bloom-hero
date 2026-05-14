"use client";

import { useState } from "react";
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel";
import { Star } from "lucide-react";
import PopUpLocationRequest from "@/features/pop-up/components/PopUpLocationRequest";
import type { BusinessType } from "@/features/vendors/types";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";
import { formatBusinessTypeLabel } from "@/features/vendors/utils/normalizeBusinessType";

interface Product {
  id: string;
  product_name: string;
  product_image_url: string | null;
  product_images?: { image_url: string; display_order: number }[] | null;
  description: string | null;
  price: number;
}

interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number;
  daysAgo: number;
}

interface Vendor {
  id: string;
  shop_name: string;
  about?: string | null;
  location_text?: string | null;
  phone_number?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
}

interface CustomerVendorProfileProps {
  vendorId: string;
  vendor: Vendor;
  products: Product[];
  reviews?: Review[];
  businessType: BusinessType;
  galleryPhotos?: {
    id: string;
    image_url: string;
    caption: string | null;
    location: string | null;
    event_name: string | null;
  }[];
}

export default function CustomerVendorProfile({
  vendorId,
  vendor,
  products,
  reviews = [],
  businessType,
  galleryPhotos = [],
}: CustomerVendorProfileProps) {
  const canListProducts = canManageCatalog(businessType);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [selectedGalleryPhotoId, setSelectedGalleryPhotoId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const shopInitial = (vendor.shop_name || "?").charAt(0).toUpperCase();
  const scheduleLabel =
    vendor.opens_at && vendor.closes_at
      ? `${vendor.opens_at.slice(0, 5)} - ${vendor.closes_at.slice(0, 5)}`
      : "Schedule not set";

  const formatPeso = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const selectedGalleryPhoto =
    galleryPhotos.find((photo) => photo.id === selectedGalleryPhotoId) ?? null;

  const handleLocationSubmit = async (payload: {
    location: string;
    latitude: number;
    longitude: number;
    requestedDate: string;
    startTime: string;
    endTime: string;
  }) => {
    const response = await fetch("/api/pop-up-location-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId,
        location: payload.location,
        latitude: payload.latitude,
        longitude: payload.longitude,
        requestedDate: payload.requestedDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result?.success) {
      setRequestMessage(result?.error || "Failed to submit location request.");
      return;
    }
    setRequestMessage("Location request sent.");
    setShowLocationModal(false);
  };

  return (
    <>
      <div className="w-full">
        <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#d9e7da] text-3xl font-bold text-[#2f5d3a] sm:h-24 sm:w-24 sm:text-4xl">
                {shopInitial}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2c2825] sm:text-[26px]">
                  {vendor.shop_name}
                </h1>
                <p className="mt-1 text-sm text-[#8a847d]">
                  Handcrafted blooms, made to order.
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#8a847d] sm:text-[13px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2f5d3a]" />
                    <span>{vendor.location_text?.trim() || "Location not set"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f5ad2e]" />
                    <span>{vendor.phone_number?.trim() || "Phone not set"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8b847c]" />
                    <span>{scheduleLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f5d3a] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(25,118,72,0.28)] hover:bg-[#254a2f]"
            >
              Request location
            </button>
          </div>

          <div className="mt-6 border-t border-[#ece4dc] pt-3">
            <nav className="flex flex-wrap gap-4 text-sm text-[#8b847c]">
              {canListProducts ? (
                <a
                  href="#bouquets"
                  className="border-b-2 border-[#2f5d3a] pb-1 font-medium text-[#2f5d3a]"
                >
                  Bouquets
                </a>
              ) : null}
              <a
                href="#gallery"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                Gallery
              </a>
              <a
                href="#reviews"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                Reviews
              </a>
              <a
                href="#about"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                About
              </a>
            </nav>
          </div>
        </div>

        <section id="gallery" className="mt-8 scroll-mt-20">
            <h2 className="text-lg font-semibold tracking-tight text-[#262321]">Gallery</h2>
            {galleryPhotos.length === 0 ? (
              <p className="mt-1 text-sm text-[#8d867d]">No gallery photos yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {galleryPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedGalleryPhotoId(photo.id)}
                    className="overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#fbf9f6]"
                  >
                    <div className="h-44 w-full overflow-hidden bg-[#e8dfd5]">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Pop-up gallery photo"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 px-4 py-3">
                      <p className="text-sm font-semibold text-[#2a2724]">
                        {photo.caption?.trim() || "Pop-up moment"}
                      </p>
                      {photo.location?.trim() ? (
                        <p className="text-xs text-[#80786f]">{photo.location}</p>
                      ) : null}
                      {photo.event_name?.trim() ? (
                        <p className="text-xs text-[#9a9289]">{photo.event_name}</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

        {/* Bouquets */}
        {canListProducts ? (
          <section id="bouquets" className="mt-10 scroll-mt-20">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
              Bouquets
            </h2>
            <p className="mt-1 text-sm text-[#8d867d]">
              Ready-to-go arrangements available now.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
              <p className="font-medium text-[#4a453f]">No bouquets available.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[#e8dfd5] sm:h-48">
                    {(() => {
                      const imageUrls = (product.product_images ?? [])
                        .slice()
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((img) => img.image_url)
                        .filter((url) => typeof url === "string" && url.trim());
                      const primaryImageUrl = imageUrls[0] ?? product.product_image_url;

                      return primaryImageUrl ? (
                        <ProductCardImageCarousel
                          imageUrls={imageUrls.length > 0 ? imageUrls : [primaryImageUrl]}
                          productName={product.product_name}
                          imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#998f84]">
                          {shopInitial}
                        </div>
                      );
                    })()}

                    <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#2f5d3a] shadow-[0_6px_16px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                      {formatPeso(Number(product.price) || 0)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-[#2a2724]">
                      {product.product_name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[#80786f]">
                      {product.description || "Freshly arranged bouquet."}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#9a9289]">
                      <span>Made to order</span>
                      <span>1–2 day lead time</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          </section>
        ) : null}

        {/* Reviews */}
        <section id="reviews" className="mt-14 scroll-mt-20">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
              Reviews
            </h2>
            <p className="mt-1 text-sm text-[#8d867d]">
              What customers are saying.
            </p>
          </div>

          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-[#8d867d]">Reviews not found yet.</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                {reviews.slice(0, 3).map((review) => (
                  <article
                    key={review.id}
                    className="flex h-full flex-col rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-5 py-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-xs font-semibold text-[#2f5d3a]">
                        {review.name[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#2a2724]">
                          {review.name}
                        </h3>
                        <p className="text-[11px] text-[#9a9289]">
                          {review.daysAgo} days ago
                        </p>
                      </div>
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-[#4c4742]">
                      {review.comment}
                    </p>

                    <div className="mt-4 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < review.rating
                              ? "fill-[#f5ad2e] text-[#f5ad2e]"
                              : "text-[#d8d0c7]"
                          }`}
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              {reviews.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setShowAllReviewsModal(true)}
                  className="mt-4 inline-flex rounded-full border border-[#e0d8cf] px-4 py-2 text-xs font-semibold text-[#4a453f] hover:bg-[#f3eee8]"
                >
                  See more
                </button>
              ) : null}
            </>
          )}
        </section>

        <section id="about" className="mt-14 scroll-mt-20">
          <h2 className="text-lg font-semibold tracking-tight text-[#262321]">About</h2>
          <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-6 py-5">
            <p className="text-sm leading-relaxed text-[#4c4742]">
              {vendor.about?.trim() || "No about information yet."}
            </p>
          </div>
        </section>
      </div>
      {requestMessage ? (
        <p className="mt-3 text-xs text-[#6f6a65]">{requestMessage}</p>
      ) : null}

      {showLocationModal && (
        <PopUpLocationRequest
          vendorName={vendor.shop_name}
          onSubmit={handleLocationSubmit}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {showAllReviewsModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setShowAllReviewsModal(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.35)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAllReviewsModal(false)}
              className="absolute right-4 top-4 rounded-full border border-[#e7dfd7] px-2.5 py-1 text-xs font-semibold text-[#6f6a65] hover:bg-[#f3eee8]"
            >
              Close
            </button>
            <h3 className="text-lg font-semibold tracking-tight text-[#262321]">All Reviews</h3>
            <div className="mt-5 grid grid-cols-1 gap-4">
              {reviews.map((review) => (
                <article
                  key={`modal-${review.id}`}
                  className="rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-5 py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-xs font-semibold text-[#2f5d3a]">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#2a2724]">{review.name}</h4>
                      <p className="text-[11px] text-[#9a9289]">{review.daysAgo} days ago</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#4c4742]">{review.comment}</p>
                  <div className="mt-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`${review.id}-modal-star-${i}`}
                        size={12}
                        className={`${
                          i < review.rating
                            ? "fill-[#f5ad2e] text-[#f5ad2e]"
                            : "text-[#d8d0c7]"
                        }`}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {selectedGalleryPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setSelectedGalleryPhotoId(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.35)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedGalleryPhotoId(null)}
              className="absolute right-4 top-4 rounded-full border border-[#e7dfd7] px-2.5 py-1 text-xs font-semibold text-[#6f6a65] hover:bg-[#f3eee8]"
            >
              Close
            </button>

            <div className="overflow-hidden rounded-2xl bg-[#e8dfd5]">
              <img
                src={selectedGalleryPhoto.image_url}
                alt={selectedGalleryPhoto.caption || "Pop-up gallery photo"}
                className="max-h-[60vh] w-full object-cover"
              />
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-base font-semibold text-[#2a2724]">
                {selectedGalleryPhoto.caption?.trim() || "Pop-up moment"}
              </h3>
              <p className="text-sm text-[#6f6a65]">
                {selectedGalleryPhoto.location?.trim() || "Location not set"}
              </p>
              <p className="text-sm text-[#8b847c]">
                {selectedGalleryPhoto.event_name?.trim() || "Event not set"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}