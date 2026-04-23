"use client";

import { useEffect, useState } from "react";
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel";
import { Star } from "lucide-react";
import PopUpLocationRequest from "./PopUpLocationRequest";

type VendorType = "market" | "pop-up";

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
  description?: string;
}

interface CustomerVendorProfileProps {
  vendorId: string;
  vendor: Vendor;
  products: Product[];
  reviews?: Review[];
  vendorType: VendorType;
  onRequestLocation?: (location: string) => void;
}

export default function CustomerVendorProfile({
  vendor,
  products,
  reviews = [],
  vendorType,
  onRequestLocation,
}: CustomerVendorProfileProps) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const shopInitial = (vendor.shop_name || "?").charAt(0).toUpperCase();

  const formatPeso = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const handleLocationSubmit = (location: string) => {
    setShowLocationModal(false);
    onRequestLocation?.(location);
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
                    <span>Open for orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f5ad2e]" />
                    <span>5.0 average rating</span>
                  </div>
                </div>
              </div>
            </div>

            {vendorType === "pop-up" && (
              <button
                onClick={() => setShowLocationModal(true)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f5d3a] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(25,118,72,0.28)] hover:bg-[#254a2f]"
              >
                Request location
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-[#ece4dc] pt-3">
            <nav className="flex flex-wrap gap-4 text-sm text-[#8b847c]">
              <a
                href="#bouquets"
                className="border-b-2 border-[#2f5d3a] pb-1 font-medium text-[#2f5d3a]"
              >
                Bouquets
              </a>
              <a
                href="#reviews"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                Reviews
              </a>
            </nav>
          </div>
        </div>

        {/* Bouquets */}
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

        {/* Reviews */}
        {reviews.length > 0 && (
          <section id="reviews" className="mt-14 scroll-mt-20">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
                Reviews
              </h2>
              <p className="mt-1 text-sm text-[#8d867d]">
                What customers are saying.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {reviews.map((review) => (
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
          </section>
        )}
      </div>

      {showLocationModal && (
        <PopUpLocationRequest
          vendorName={vendor.shop_name}
          onSubmit={handleLocationSubmit}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </>
  );
}
