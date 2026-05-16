import { loadReviewPage } from "@/features/reviews/queries/loadReviewPage";
import {
  CustomerReviewNoOrderView,
  CustomerReviewPageView,
  CustomerReviewUnauthenticatedView,
  CustomerReviewUnavailableView,
} from "@/features/reviews/components/CustomerReviewPageView";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CustomerReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;

  const rawOrderId = params.orderId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  if (!orderId) {
    return <CustomerReviewNoOrderView />;
  }

  const reviewState = await loadReviewPage(orderId);

  if (reviewState.status === "unauthenticated") {
    return <CustomerReviewUnauthenticatedView />;
  }

  if (reviewState.status !== "ready") {
    return <CustomerReviewUnavailableView />;
  }

  const { order, existingReview } = reviewState.data;

  return (
    <CustomerReviewPageView
      orderId={orderId}
      order={order}
      existingReview={existingReview}
    />
  );
}
