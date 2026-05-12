import React from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/queries/getProductById";
import { getProductReviewsByProductId } from "@/features/reviews/queries/getProductReviewsByProductId";
import { ProductDetailLayout } from "@/features/products/components/ProductDetailLayout";

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

    const { data: reviews, error: reviewsError } = await getProductReviewsByProductId(
      product.id
    );

    if (reviewsError) {
      console.error("getProductReviewsByProductId error:", reviewsError.message || JSON.stringify(reviewsError));
    }

    return <ProductDetailLayout product={product} reviews={reviews ?? []} />;
  } catch (err) {
    console.error(err);
    return notFound();
  }
}
 