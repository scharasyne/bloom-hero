import React from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductDetailLayout } from "@/app/(customer)/_components/product-detail-layout";

type Props = {
  params: any; // params may be a Promise<{ id: string }>
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params; // unwrap promise-style params

  try {
    const { data: product, error } = await getProductById(id);

    if (error) {
      console.error("getProductById error:", error);
      // If product not found, show 404
      if (!product) return notFound();
    }

    if (!product) return notFound();

    return <ProductDetailLayout product={product} />;
  } catch (err) {
    console.error(err);
    return notFound();
  }
}
 