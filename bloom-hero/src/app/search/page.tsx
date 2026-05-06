"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import BouquetCard from "@/components/BouquetCard";
import Footer from "@/components/footer";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SkeletonCard from "@/components/SkeletonCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type SearchScope = "all" | "flowers" | "vendors";

type ProductImageRow = {
  image_url: string;
  display_order: number;
};

type SearchFlowerRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  image_url?: string | null;
  price: number;
  description?: string | null;
  shop_name?: string | null;
  distance?: string | null;
  categories?: string[];
  rating?: number | null;
  sold_count?: number | null;
  vendor_type?: string | null;
  average_rating?: number | null;
  product_images?: ProductImageRow[] | null;
};

type SearchVendorRow = {
  id: string;
  shop_name: string | null;
  vendor_type: string | null;
  average_rating: number | null;
};

type SearchResults = {
  flowers: SearchFlowerRow[];
  vendors: SearchVendorRow[];
};

const CATEGORY_LABELS: Record<string, string> = {
  graduation: "Graduation Cheers",
  "in-loving-memory": "In Loving Memory",
  "new-beginnings": "New Beginnings",
  "love-notes": "Love Notes in Bloom",
  handcrafted: "Handcrafted",
  anniversary: "Anniversary Classics",
  "gentle-comfort": "Gentle Comfort",
  birthday: "Birthday Blooms",
  "just-because": "Just Because",
  "missing-you": "Missing You",
  "get-well": "Get Well Soon",
  "florists-picks": "Florists' Picks",
};

const CATEGORY_VALUES = new Set(Object.keys(CATEGORY_LABELS));

function normalizeScope(value: string | null): SearchScope {
  if (value === "flowers" || value === "vendors" || value === "all") {
    return value;
  }

  return "all";
}

function normalizeCategory(value: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  return CATEGORY_VALUES.has(normalized) ? normalized : null;
}

function scopeLabel(scope: SearchScope) {
  if (scope === "flowers") return "Flowers";
  if (scope === "vendors") return "Vendors";
  return "All";
}

function mapPriceFilter(value: string) {
  if (value === "Under P500") return "<500";
  if (value === "Over P500") return ">500";
  if (value === "Under P700") return "<700";
  if (value === "Under P1000") return "<1000";
  return "<1000";
}

function VendorResultCard({ vendor }: { vendor: SearchVendorRow }) {
  const rating = typeof vendor.average_rating === "number" ? vendor.average_rating.toFixed(1) : null;

  return (
    <div className="bg-white content-stretch flex flex-col gap-3 items-start p-5 relative rounded-[18px] shrink-0 w-full border border-[#edeae6] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-4 w-full">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
            {vendor.vendor_type ?? "Vendor"}
          </p>
          <h3 className="mt-1 text-[18px] font-semibold text-[#1f1f1f]">
            {vendor.shop_name ?? "Untitled vendor"}
          </h3>
        </div>

        {rating ? (
          <div className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-semibold text-[#2f5d3a]">
            ★ {rating}
          </div>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-[#7a7a7a]">
        Browse this vendor&apos;s listings or narrow the search using the shop name.
      </p>

      <a
        href={`/search?scope=vendors&q=${encodeURIComponent(vendor.shop_name ?? "")}`}
        className="inline-flex items-center justify-center rounded-full bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#275940]"
      >
        View vendor
      </a>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const scope = normalizeScope(searchParams.get("scope"));
  const category = normalizeCategory(searchParams.get("category"));
  const hasQuery = q.trim().length > 0;
  const hasCategory = Boolean(category);

  const [price, setPrice] = React.useState("Under P1000");
  const [sort, setSort] = React.useState("Best Sellers");
  const [moreFilter, setMoreFilter] = React.useState("All");
  const [results, setResults] = React.useState<SearchResults>({ flowers: [], vendors: [] });
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [buyingId, setBuyingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 9;

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [q, scope, category]);

  const handleAddToCart = React.useCallback(
    async (product: SearchFlowerRow) => {
      try {
        setAddingId(product.id);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/login";
          return;
        }

        await supabase.from("customers").upsert({ user_id: user.id }, { onConflict: "user_id" });

        const { data: existingOrder, error: orderError } = await supabase
          .from("orders")
          .select("id, total_amount")
          .eq("customer_id", user.id)
          .eq("vendor_id", product.vendor_id)
          .eq("status", "pending")
          .maybeSingle();

        if (orderError && orderError.code !== "PGRST116") {
          console.error("find order error:", orderError);
        }

        let orderId: string;
        let currentTotal = 0;

        if (existingOrder) {
          orderId = existingOrder.id;
          currentTotal = Number(existingOrder.total_amount) || 0;
        } else {
          const { data: newOrder, error: insertOrderError } = await supabase
            .from("orders")
            .insert({
              customer_id: user.id,
              vendor_id: product.vendor_id,
              total_amount: 0,
            })
            .select("id, total_amount")
            .single();

          if (insertOrderError || !newOrder) {
            console.error("create order error:", insertOrderError);
            return;
          }

          orderId = newOrder.id;
          currentTotal = Number(newOrder.total_amount) || 0;
        }

        const { data: existingItem, error: itemError } = await supabase
          .from("order_items")
          .select("id, quantity, subtotal")
          .eq("order_id", orderId)
          .eq("product_id", product.id)
          .maybeSingle();

        if (itemError && itemError.code !== "PGRST116") {
          console.error("find order item error:", itemError);
        }

        const priceValue = Number(product.price) || 0;

        if (existingItem) {
          const newQty = (existingItem.quantity || 0) + 1;
          const newSubtotal = priceValue * newQty;

          await supabase
            .from("order_items")
            .update({ quantity: newQty, subtotal: newSubtotal })
            .eq("id", existingItem.id);
        } else {
          await supabase.from("order_items").insert({
            order_id: orderId,
            product_id: product.id,
            quantity: 1,
            subtotal: priceValue,
          });
        }

        await supabase.from("orders").update({ total_amount: currentTotal + priceValue }).eq("id", orderId);
        alert("Added to cart!");
      } catch (err) {
        console.error("Add to cart failed:", err);
        alert("Failed to add to cart. Please try again.");
      } finally {
        setAddingId(null);
      }
    },
    [supabase]
  );

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

        await supabase.from("customers").upsert({ user_id: user.id }, { onConflict: "user_id" });

        const priceValue = Number(product.price) || 0;

        const { data: newOrder, error: insertOrderError } = await supabase
          .from("orders")
          .insert({
            customer_id: user.id,
            vendor_id: product.vendor_id,
            total_amount: priceValue,
            status: "completed",
          })
          .select("id")
          .single();

        if (insertOrderError || !newOrder) {
          console.error("buy now - create order error:", insertOrderError);
          alert("Unable to place order right now.");
          return;
        }

        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: newOrder.id,
          product_id: product.id,
          quantity: 1,
          subtotal: priceValue,
        });

        if (itemError) {
          console.error("buy now - create order item error:", itemError);
          alert("Unable to place order right now.");
          return;
        }

        window.location.href = "/customer/orders";
      } catch (err) {
        console.error("Buy now failed:", err);
        alert("Failed to place order. Please try again.");
      } finally {
        setBuyingId(null);
      }
    },
    [supabase]
  );

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!hasQuery && !hasCategory) {
        setResults({ flowers: [], vendors: [] });
        setErrorMsg(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({ scope, price: mapPriceFilter(price), sort });
        if (hasQuery) {
          params.set("q", q);
        }
        if (category) {
          params.set("category", category);
        }
        const response = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });

        const payload = (await response.json()) as {
          flowers?: SearchFlowerRow[];
          vendors?: SearchVendorRow[];
          errors?: string[];
          message?: string;
        };

        if (!response.ok && response.status !== 207) {
          throw new Error(payload.message ?? payload.errors?.[0] ?? "Failed to fetch search results.");
        }

        setResults({ flowers: payload.flowers ?? [], vendors: payload.vendors ?? [] });
        const messages = payload.errors?.filter(Boolean) ?? [];
        setErrorMsg(messages.length > 0 ? messages.join(" • ") : null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("fetch search results:", error);
        setErrorMsg(error instanceof Error ? error.message : "Failed to fetch search results.");
        setResults({ flowers: [], vendors: [] });
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [q, price, sort, scope, category]);

  const flowerResults = results.flowers;
  const vendorResults = results.vendors;
  const showFlowers = scope !== "vendors";
  const showVendors = scope !== "flowers";
  const flowerPageCount = Math.max(1, Math.ceil(flowerResults.length / ITEMS_PER_PAGE));
  const paginatedFlowers = showFlowers
    ? flowerResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  return (
    <>
      <main className="py-8 min-h-screen max-w-7xl mx-auto px-10">
        <div className="max-w-240 mx-auto">
          <div className="mb-6">
            <SearchBar
              initialQuery={q}
              scope={scope}
              category={category ?? undefined}
              onSearch={() => setCurrentPage(1)}
            />
          </div>
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

          <section>
            {(q || category) && (
              <p className="mb-4 text-[#7a7a7a]">
                Showing {scopeLabel(scope)} results for{" "}
                <strong>
                  {q ? `"${q}"` : CATEGORY_LABELS[category ?? ""] ?? category}
                </strong>
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
            ) : flowerResults.length > 0 || vendorResults.length > 0 ? (
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
                            <div key={flower.id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                              <BouquetCard
                                image={primaryImageUrl}
                                images={imageUrls}
                                name={flower.product_name}
                                price={flower.price}
                                shop={flower.shop_name || ""}
                                distance={flower.distance || ""}
                                categories={flower.categories || []}
                                rating={
                                  typeof flower.rating === "number" && flower.rating > 0
                                    ? flower.rating
                                    : flower.average_rating ?? undefined
                                }
                                sold={flower.sold_count ?? undefined}
                                onAddToCart={() => handleAddToCart(flower)}
                                adding={addingId === flower.id}
                                onBuyNow={() => handleBuyNow(flower)}
                                buying={buyingId === flower.id}
                              />
                            </div>
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
                        <VendorResultCard key={vendor.id} vendor={vendor} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#ded7cf] px-6 py-10 text-center text-[#7a7a7a]">
                      No vendors matched this search.
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            ) : (
              <div className="mt-8 text-center text-gray-500">
                {hasQuery || hasCategory
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