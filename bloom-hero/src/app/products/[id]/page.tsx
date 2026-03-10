"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProduct";
import { StockBadge } from "@/components/stockBadge";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, loading } = useProduct(id);
  const [quantity, setQuantity] = useState(1);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-8 lg:py-16 w-full bg-[#f6f2ee] flex-1">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full max-w-7xl">
          
          {/* Gallery */}
          <div className="flex flex-col gap-3 items-center w-full lg:w-1/2">
            <div className="rounded-2xl overflow-hidden w-full h-64 sm:h-96 lg:h-[500px]">
              <img
                src={product.imageUrl[0]}
                alt={product.productName}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {product.imageUrl.map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-xl w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`${product.productName} ${idx}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Text Section */}
          <div className="flex flex-col gap-8 w-full lg:w-1/2 px-2 sm:px-4 py-6">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900">
              {product.productName}
            </h1>
            <div className="flex items-center gap-1 text-base sm:text-lg text-gray-600">
              <Icon icon="mdi:star" className="text-yellow-500" />
              <span>4.9 (67 sold)</span>
            </div>


            <div className="flex flex-col gap-2">
              <div className="text-base sm:text-lg text-gray-600">
                {product.vendorName} · 0.5 km
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-[#efeae4] px-3 py-1 rounded-full text-sm">Wedding</span>
                <span className="bg-[#efeae4] px-3 py-1 rounded-full text-sm">Romantic</span>
                <span className="bg-[#efeae4] px-3 py-1 rounded-full text-sm">Budget-friendly</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-2xl sm:text-3xl font-bold text-[#2f6b4f]">
                <Icon icon="tabler:currency-peso" className="stroke-[2.5]" />
                <span>{product.price}</span>
              </div>
              <StockBadge stock={product.qty} />
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 bg-white">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="text-lg font-bold text-gray-600 w-6 h-6 flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    –
                  </button>
                  <span className="text-sm font-medium text-gray-900 min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.qty, prev + 1))}
                    className="text-lg font-bold text-gray-600 w-6 h-6 flex items-center justify-center"
                    disabled={quantity >= product.qty}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={product.qty === 0}
                  className={`flex items-center justify-center gap-2 rounded-full h-[52px] w-full sm:w-[200px] border ${
                    product.qty === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-red-600 border-gray-300"
                  }`}
                >
                  <Icon icon="mdi:cart-outline" className="text-lg" />
                  <span>Add to Cart</span>
                </button>
                <button className="flex items-center justify-center gap-2 rounded-full h-[52px] w-full sm:w-[200px] bg-[#d24b46] text-white">
                  <Icon icon="mdi:shopping-outline" className="text-lg" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reviews Section */}
        <section className="w-full bg-[#f6f2ee] py-12">
          <div className="flex flex-col gap-8 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1f1f1f]">
                Customer Reviews
              </h2>
              <a href="#" className="underline text-base sm:text-lg text-[#2f5d3a] mt-2 sm:mt-0">
                View all reviews
              </a>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="bg-[#f6f1ee] p-6 rounded-2xl w-full sm:w-[280px] lg:w-[317px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]">
                <div className="flex gap-3 items-center">
                  <img src="/images/avatar.png" alt="Reviewer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full" />
                  <div>
                    <p className="font-bold text-[#1f1f1f]">Rock Dela Rosa</p>
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon key={i} icon="mdi:star" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-800">
                  Absolutely gorgeous arrangements! My go-to florist for any occasion.
                </p>
                <p className="mt-2 text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </section>


      <Footer />
    </div>
  );
}
