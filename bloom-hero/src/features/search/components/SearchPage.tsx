"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import BouquetCard from "@/components/BouquetCard";
import Footer from "@/components/footer";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import PopUpSearchFilters from "@/features/search/components/PopUpSearchFilters";
import { PopUpResultCard } from "@/features/search/components/PopUpResultCard";
import {
  normalizePopUpCity,
  normalizePopUpSort,
  normalizePopUpTiming,
  type PopUpSort,
  type PopUpTiming,
} from "@/features/search/utils/popupFilters";
import SkeletonCard from "@/components/SkeletonCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { addToCart as addToCartAction } from "@/features/orders/actions/addToCart";
import { publicVendorProfilePath } from "@/features/vendors/utils/publicVendorPaths";
import { CATEGORY_LABELS, normalizeCategory } from "@/features/search/utils/categories";
import type { SearchFlowerRow, SearchVendorRow } from "@/features/search/types";
import { normalizeSearchScope, type SearchScope } from "@/features/search/utils/scope";
import { useSearchResults } from "@/hooks/useSearchResults";
import {
  canViewPublicVendorProfiles,
  type ViewerRole,
} from "@/features/vendors/utils/publicVendorAccess";
import { VendorOfferingBadges } from "@/components/VendorOfferingBadges";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import {
  getVendorOfferingBadges,
  getVendorOfferings,
} from "@/features/vendors/utils/vendorOfferings";

function scopeLabel(scope: SearchScope) {
  if (scope === "flowers") return "Flowers";
  if (scope === "vendors") return "Vendors";
  return "All";
}

function VendorResultCard({
  vendor,
  showProfileLink,
}: {
  vendor: SearchVendorRow;
  showProfileLink: boolean;
}) {
  const rating =
    typeof vendor.average_rating === "number" ? vendor.average_rating.toFixed(1) : null;
  const businessType = normalizeBusinessType(vendor.business_type) ?? "unregistered";
  const offeringBadges = getVendorOfferingBadges(
    getVendorOfferings({
      businessType,
      holdsPopups: vendor.holds_popups,
    }),
  );
  const offersOnlineOrders = businessType === "registered";
  const profileHref = vendor.id
    ? publicVendorProfilePath(vendor.id)
    : `/search?scope=vendors&q=${encodeURIComponent(vendor.shop_name ?? "")}`;

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-[22px] border border-[#edeae6] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_12px_30px_0px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3 px-5 py-5">
        <div className="flex flex-col gap-2">
          <VendorOfferingBadges badges={offeringBadges} />
          <h3 className="text-[20px] font-semibold leading-tight text-[#1f1f1f]">
            {vendor.shop_name ?? "Untitled vendor"}
          </h3>
          <p className="max-w-[34rem] text-[14px] leading-6 text-[#7a7a7a]">
            Browse this shop’s flower listings and discover what they offer at Carbon Market.
          </p>
        </div>

        {rating ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-[#f8f3e8] px-3 py-1 text-[13px] font-semibold text-[#f4b400] shrink-0">
            <span>★</span>
            <span>{rating}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pb-4">
        <div className="aspect-square rounded-[14px] bg-[#f3eee8]" />
        <div className="aspect-square rounded-[14px] bg-[#f3eee8]" />
        <div className="aspect-square rounded-[14px] bg-[#f3eee8]" />
      </div>

      <div className="flex gap-3 px-5 pb-5">
        {showProfileLink ? (
          <Link
            href={profileHref}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#e1dbd4] px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4]"
          >
            View vendor
          </Link>
        ) : null}
        {offersOnlineOrders ? (
          <Link
            href={`/search?scope=flowers&q=${encodeURIComponent(vendor.shop_name ?? "")}`}
            className={`inline-flex items-center justify-center rounded-full border border-[#e1dbd4] px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4] ${showProfileLink ? "" : "flex-1"}`}
          >
            View products
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPageView() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const scope = normalizeSearchScope(searchParams.get("scope"));
  const category = normalizeCategory(searchParams.get("category"));
  const hasQuery = q.trim().length > 0;
  const hasCategory = Boolean(category);

  const [price, setPrice] = React.useState("Default");
  const [sort, setSort] = React.useState("Best Sellers");
  const [moreFilter, setMoreFilter] = React.useState("All");
  const [city, setCity] = React.useState("Any");
  const [popupTiming, setPopupTiming] = React.useState<PopUpTiming>("upcoming");
  const [popupSort, setPopupSort] = React.useState<PopUpSort>("Earliest");
  const { results, loading, errorMsg } = useSearchResults({
    q,
    scope,
    category,
    price,
    sort,
    city,
    popupTiming,
    popupSort,
    enabled: hasQuery || hasCategory || scope === "popups",
  });
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [buyingId, setBuyingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 9;

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [showProfileLink, setShowProfileLink] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setShowProfileLink(true);
        return;
      }
      const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
      setShowProfileLink(canViewPublicVendorProfiles(data?.role as ViewerRole));
    })();
  }, [supabase]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [q, scope, category, city, popupTiming, popupSort]);

  React.useEffect(() => {
    setCity(normalizePopUpCity(searchParams.get("city")));
    setPopupTiming(normalizePopUpTiming(searchParams.get("popupTiming")));
    setPopupSort(normalizePopUpSort(searchParams.get("popupSort")));
  }, [searchParams]);

  const handleAddToCart = React.useCallback(async (product: SearchFlowerRow) => {
    try {
      setAddingId(product.id);
      const result = await addToCartAction(product.id, product.vendor_id, product.price, 1);
      if (!result.success) {
        alert(result.error ?? "Failed to add to cart. Please try again.");
        return;
      }
      alert("Added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingId(null);
    }
  }, []);

  const handleBuyNow = React.useCallback(
    async (product: SearchFlowerRow) => {
      try {
        setBuyingId(product.id);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
        if (profile?.role !== "customer") {
          alert("Only customers can purchase from search.");
          return;
        }

        const result = await addToCartAction(product.id, product.vendor_id, product.price, 1);

        if (!result.success) {
          console.error("buy now - add to cart error:", result.error);
          alert(result.error ?? "Unable to add to cart right now.");
          return;
        }

        window.location.href = "/cart";
      } catch (err) {
        console.error("Buy now failed:", err);
        alert("Failed to add to cart. Please try again.");
      } finally {
        setBuyingId(null);
      }
    },
    [supabase]
  );

  const flowerResults = results.flowers;
  const vendorResults = results.vendors;
  const popupResults = results.popups;
  const showFlowers = scope !== "vendors" && scope !== "popups";
  const showVendors = scope !== "flowers" && scope !== "popups";
  const showPopups = scope === "popups" || scope === "all";
  const showPopUpFilters = scope === "popups" || scope === "all";
  const flowerPageCount = Math.max(1, Math.ceil(flowerResults.length / ITEMS_PER_PAGE));
  const paginatedFlowers = showFlowers
    ? flowerResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  return (
    <>
      <main className="page-shell min-h-screen">
        <div className="max-w-240 mx-auto">
          <div className="mb-6">
            <SearchBar
              initialQuery={q}
              scope={scope}
              category={category ?? undefined}
              onSearch={() => setCurrentPage(1)}
            />
          </div>
          {showPopUpFilters ? (
            <div className="mb-4">
              <PopUpSearchFilters
                city={city}
                onCityChange={setCity}
                timing={popupTiming}
                onTimingChange={setPopupTiming}
                sort={popupSort}
                onSortChange={setPopupSort}
              />
            </div>
          ) : null}
          {showFlowers || showVendors ? (
            <div className="mb-6">
              <SearchFilters
                price={price}
                onPriceChange={setPrice}
                sort={sort}
                onSortChange={setSort}
                moreFilter={moreFilter}
                onMoreFilterChange={setMoreFilter}
              />
            </div>
          ) : null}

          <section>
            {(q || category || scope === "popups") && (
              <p className="mb-4 text-[#7a7a7a]">
                Showing {scopeLabel(scope)} results
                {q ? (
                  <>
                    {" "}
                    for <strong>&quot;{q}&quot;</strong>
                  </>
                ) : category ? (
                  <>
                    {" "}
                    for <strong>{CATEGORY_LABELS[category ?? ""] ?? category}</strong>
                  </>
                ) : scope === "popups" ? (
                  <> — upcoming pop-ups near you</>
                ) : null}
                {q && category ? ` • ${CATEGORY_LABELS[category] ?? category}` : null}
              </p>
            )}

            {errorMsg && <p className="mb-4 text-red-500">{errorMsg}</p>}

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : flowerResults.length > 0 || vendorResults.length > 0 || popupResults.length > 0 ? (
              <div className="space-y-12">
              {showFlowers ? (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-[#1f1f1f]">Flowers</h2>
                    <p className="text-sm text-[#7a7a7a]">{flowerResults.length} results</p>
                  </div>

                  {paginatedFlowers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {paginatedFlowers.map((flower, index) => {
                          const imageUrls = (flower.product_images ?? [])
                            .slice()
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((image) => image.image_url)
                            .filter((url) => typeof url === "string" && url.trim().length > 0);
                          const primaryImageUrl = imageUrls[0] ?? flower.product_image_url ?? flower.image_url ?? null;

                          return (
                            <BouquetCard
                              key={flower.id}
                              href={`/products/${flower.id}`}
                              image={primaryImageUrl}
                              images={imageUrls}
                              name={flower.product_name}
                              price={flower.price}
                              shop={flower.shop_name || ""}
                              distance={flower.distance || ""}
                              categories={flower.categories || []}
                              rating={
                                typeof flower.average_rating === "number" && flower.average_rating > 0
                                  ? flower.average_rating
                                  : undefined
                              }
                              sold={flower.sold_count ?? undefined}
                              onAddToCart={() => handleAddToCart(flower)}
                              adding={addingId === flower.id}
                              onBuyNow={() => handleBuyNow(flower)}
                              buying={buyingId === flower.id}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-10 flex items-center justify-end gap-3">
                        <p className="text-sm font-medium text-[#7a7a7a]">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                          {Math.min(currentPage * ITEMS_PER_PAGE, flowerResults.length)} of {flowerResults.length} results
                        </p>
                        <button
                          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-1 text-lg text-[#7a7a7a] hover:text-[#1f1f1f] disabled:opacity-30"
                        >
                          {"<"}
                        </button>
                        {Array.from({ length: flowerPageCount }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                              page === currentPage ? "bg-[#e8f3ed] text-[#2f5d3a]" : "text-[#7a7a7a] hover:text-[#1f1f1f]"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((page) => Math.min(page + 1, flowerPageCount))}
                          disabled={currentPage === flowerPageCount}
                          className="px-1 text-lg text-[#7a7a7a] hover:text-[#1f1f1f] disabled:opacity-30"
                        >
                          {">"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#ded7cf] px-6 py-10 text-center text-[#7a7a7a]">
                      No flowers matched this search.
                    </div>
                  )}
                </section>
              ) : null}

              {showVendors ? (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-[#1f1f1f]">Vendors</h2>
                    <p className="text-sm text-[#7a7a7a]">{vendorResults.length} results</p>
                  </div>

                  {vendorResults.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {vendorResults.map((vendor) => (
                        <VendorResultCard
                          key={vendor.id}
                          vendor={vendor}
                          showProfileLink={showProfileLink}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#ded7cf] px-6 py-10 text-center text-[#7a7a7a]">
                      No vendors matched this search.
                    </div>
                  )}
                </section>
              ) : null}

              {showPopups ? (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-[#1f1f1f]">Pop Ups</h2>
                    <p className="text-sm text-[#7a7a7a]">{popupResults.length} results</p>
                  </div>

                  {popupResults.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {popupResults.map((popup) => (
                        <PopUpResultCard
                          key={popup.id}
                          popup={popup}
                          showProfileLink={showProfileLink}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#ded7cf] px-6 py-10 text-center text-[#7a7a7a]">
                      No upcoming pop-ups matched this search.
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            ) : (
              <div className="mt-8 text-center text-gray-500">
                {hasQuery || hasCategory || scope === "popups"
                  ? "No results to display"
                  : "Use the search bar above to start a query."}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}