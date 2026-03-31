"use client";

'use client';

import React from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import SearchBar from "../../components/SearchBar";
import SearchFilters from "../../components/SearchFilters";
import BouquetCard from "@/components/BouquetCard";
import { mockBouquets } from "@/lib/mockData";
import SkeletonCard from "@/components/SkeletonCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [price, setPrice] = React.useState("Any");
  const [sort, setSort] = React.useState("Best Sellers");
  const [results, setResults] = React.useState<any[]>([]);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [buyingId, setBuyingId] = React.useState<string | null>(null);
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [q, price, sort]);

  const handleAddToCart = React.useCallback(
    async (product: any) => {
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

        // Ensure customer row exists
        await supabase
          .from("customers")
          .upsert({ user_id: user.id }, { onConflict: "user_id" });

        // Find or create a pending order for this vendor
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

        // Check if item already in cart
        const { data: existingItem, error: itemError } = await supabase
          .from("order_items")
          .select("id, quantity, subtotal")
          .eq("order_id", orderId)
          .eq("product_id", product.id)
          .maybeSingle();

        if (itemError && itemError.code !== "PGRST116") {
          console.error("find order item error:", itemError);
        }

        const price = Number(product.price) || 0;

        if (existingItem) {
          const newQty = (existingItem.quantity || 0) + 1;
          const newSubtotal = price * newQty;

          await supabase
            .from("order_items")
            .update({ quantity: newQty, subtotal: newSubtotal })
            .eq("id", existingItem.id);
        } else {
          await supabase.from("order_items").insert({
            order_id: orderId,
            product_id: product.id,
            quantity: 1,
            subtotal: price,
          });
        }

        const newTotal = currentTotal + price;
        await supabase
          .from("orders")
          .update({ total_amount: newTotal })
          .eq("id", orderId);

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
    async (product: any) => {
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

        // Ensure customer row exists
        await supabase
          .from("customers")
          .upsert({ user_id: user.id }, { onConflict: "user_id" });

        const price = Number(product.price) || 0;

        // Create a new completed order immediately for this single item
        const { data: newOrder, error: insertOrderError } = await supabase
          .from("orders")
          .insert({
            customer_id: user.id,
            vendor_id: product.vendor_id,
            total_amount: price,
            status: "completed",
          })
          .select("id")
          .single();

        if (insertOrderError || !newOrder) {
          console.error("buy now - create order error:", insertOrderError);
          alert("Unable to place order right now.");
          return;
        }

        // Create the single order item
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: newOrder.id,
          product_id: product.id,
          quantity: 1,
          subtotal: price,
        });

        if (itemError) {
          console.error("buy now - create order item error:", itemError);
          alert("Unable to place order right now.");
          return;
        }

        // Go straight to purchase history
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
    async function load() {
      setLoading(true);
      setErrorMsg(null);

      let builder = supabase.from("products").select("*");

      if (q) {
        const pat = `%${q}%`;
        builder = builder.or(
          `product_name.ilike.${pat},description.ilike.${pat}`
        );
      }

      if (price !== "Any") {
        if (price === "<500") builder = builder.lt("price", 500);
        else if (price === "500-700")
          builder = builder.gte("price", 500).lte("price", 700);
        else if (price === ">700") builder = builder.gt("price", 700);
      }

      if (sort === "Price: Low to High") {
        builder = builder.order("price", { ascending: true });
      } else if (sort === "Price: High to Low") {
        builder = builder.order("price", { ascending: false });
      }

      const { data, error } = await builder;
      console.log("supabase query result", { q, price, sort, data, error });
      if (error) {
        console.error("fetch products:", error);
        setErrorMsg(error.message);
        setResults([]);
      } else {
        setResults(data ?? []);
      }
      setLoading(false);
    }

    load();
  }, [q, price, sort, supabase]);

  return (
    <>
      <NavBar type = "customer"/>

      <main className="py-8 min-h-screen max-w-7xl mx-auto px-10">
        <div className="max-w-240 mx-auto">
          
          <div className="mb-6">
            <SearchBar 
              initialQuery={q} 
              onSearch={() => setCurrentPage(1)} 
            />
          </div>

          <div className="mb-8">
            <SearchFilters
              price={price}
              onPriceChange={setPrice}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {q && (
            <p className="mt-6 mb-4">
              Showing results for <strong>{q}</strong>
            </p>
          )}

          {errorMsg && <p className="text-center text-red-500">{errorMsg}</p>}

          {loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: 9 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : results.length > 0 ? (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {results
        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
        .map((bouquet, i) => (
          <div
            key={bouquet.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <BouquetCard
              image={bouquet.product_image_url ?? bouquet.image_url ?? null}
              name={bouquet.product_name}
              price={bouquet.price}
              shop={bouquet.shop_name || ""}
              distance={bouquet.distance || ""}
              category={bouquet.category || ""}
              rating={bouquet.rating > 0 ? bouquet.rating : undefined}
              sold={bouquet.sold_count ?? undefined}
              onAddToCart={() => handleAddToCart(bouquet)}
              adding={addingId === bouquet.id}
              onBuyNow={() => handleBuyNow(bouquet)}
              buying={buyingId === bouquet.id}
            />
          </div>
        ))}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-end gap-3 mt-10">
      <p className="text-[#7a7a7a] text-sm font-medium">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, results.length)} of {results.length} results
      </p>
      <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="text-[#7a7a7a] hover:text-[#1f1f1f] disabled:opacity-30 text-lg px-1">{"<"}</button>
      {Array.from({ length: Math.ceil(results.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
        <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${page === currentPage ? "bg-[#e8f3ed] text-[#2f5d3a]" : "text-[#7a7a7a] hover:text-[#1f1f1f]"}`}>{page}</button>
      ))}
      <button onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(results.length / ITEMS_PER_PAGE)))} disabled={currentPage === Math.ceil(results.length / ITEMS_PER_PAGE)} className="text-[#7a7a7a] hover:text-[#1f1f1f] disabled:opacity-30 text-lg px-1">{">"}</button>
    </div>
  </div>
) : (
  <div className="text-center text-gray-500 mt-8">
    {q ? "No results to display" : "Use the search bar above to start a query."}
  </div>
)}


        </div>
      </main>


      <Footer />
    </>
  );
}
