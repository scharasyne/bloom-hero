import { Suspense } from "react";
import SearchPageView from "@/features/search/components/SearchPage";
import SkeletonCard from "@/components/SkeletonCard";

function SearchPageFallback() {
  return (
    <main className="page-shell min-h-screen">
      <div className="max-w-240 mx-auto grid grid-cols-2 gap-4 md:grid-cols-3 mt-8">
        {Array.from({ length: 9 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageView />
    </Suspense>
  );
}
