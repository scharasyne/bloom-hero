"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import BouquetCard from "@/components/BouquetCard";
import SkeletonCard from "@/components/SkeletonCard";

type ProductImageRow = {
  image_url: string;
  display_order: number;
};

type BestSellerFlowerRow = {
  id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  shop_name: string | null;
  vendor_type: string | null;
  average_rating: number | null;
  sold_count: number | null;
  categories?: string[];
  product_images?: ProductImageRow[] | null;
};

type BestSellersResponse = {
  flowers?: BestSellerFlowerRow[];
  errors?: string[];
  message?: string;
};

const MAX_VISIBLE = 6;

function getPrimaryImage(row: BestSellerFlowerRow) {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.image_url)
    .filter((url) => typeof url === "string" && url.trim().length > 0);

  return {
    image: images[0] ?? row.product_image_url ?? null,
    images,
  };
}

export default function BestSellersSection() {
  const [flowers, setFlowers] = React.useState<BestSellerFlowerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadBestSellers() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const response = await fetch(`/api/best-sellers?limit=${MAX_VISIBLE}`, {
          signal: controller.signal,
        });

        const payload = (await response.json()) as BestSellersResponse;

        if (!response.ok && response.status !== 207) {
          throw new Error(payload.message ?? payload.errors?.[0] ?? "Failed to load best sellers.");
        }

        setFlowers((payload.flowers ?? []).slice(0, MAX_VISIBLE));
        const messages = payload.errors?.filter(Boolean) ?? [];
        setErrorMsg(messages.length > 0 ? messages.join(" • ") : null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("fetch best sellers:", error);
        setFlowers([]);
        setErrorMsg(error instanceof Error ? error.message : "Failed to load best sellers.");
      } finally {
        setLoading(false);
      }
    }

    loadBestSellers();
    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <p className="font-medium text-[#8f8f8f] text-[12px] text-center tracking-[1.2px]">BEST SELLERS</p>
      <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[32px] text-center tracking-[1.28px] leading-[1.2]">
        Customer favorites, loved for any moment
      </p>
      <p className="font-normal text-[#7a7a7a] text-[16px] text-center max-w-lg">
        Popular flowers from the most purchased products.
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {Array.from({ length: MAX_VISIBLE }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : flowers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {flowers.map((flower) => {
            const { image, images } = getPrimaryImage(flower);

            return (
              <BouquetCard
                key={flower.id}
                image={image}
                images={images}
                name={flower.product_name}
                price={Number(flower.price) || 0}
                shop={flower.shop_name ?? "Untitled shop"}
                distance=""
                category={flower.categories?.[0] ?? flower.vendor_type ?? "Best Seller"}
                rating={typeof flower.average_rating === "number" ? flower.average_rating : undefined}
                sold={typeof flower.sold_count === "number" ? flower.sold_count : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#ded7cf] px-6 py-10 text-center text-[#7a7a7a] max-w-xl w-full">
          {errorMsg ?? "No best-selling products are available yet."}
        </div>
      )}

      {/* <div className="flex items-center gap-2 text-sm text-[#7a7a7a]">
        <Icon icon="mdi:database-outline" width={16} height={16} />
        <span>Synced from completed orders in the products table</span>
      </div> */}

      <div>
      <Link
        href="/search"
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#2f5d3a] text-[#2f5d3a] font-semibold text-[14px] hover:bg-[#eef4f0] transition-colors"
      >
        See More
        <Icon icon="mdi:arrow-right" width={16} height={16} />
      </Link>
      </div>
      
    </div>
  );
}