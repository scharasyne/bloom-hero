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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [price, setPrice] = React.useState("Any");
  const [sort, setSort] = React.useState("Best Sellers");

  const [results, setResults] = React.useState<any[]>([]);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

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
      <NavBar />

      <main className="px-4 py-8 min-h-screen max-w-7xl mx-auto">
        <div className="mb-6 px-10">
          <SearchBar initialQuery={q} />
        </div>

        {/* filters copied from landing page */}
        <div className="mb-8 px-10">
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

        {loading && <p className="text-center">Loading…</p>}
        {errorMsg && <p className="text-center text-red-500">{errorMsg}</p>}

        {results.length > 0 ? (
          <div className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((bouquet) => (
                <BouquetCard
                  key={bouquet.id}
                  image={bouquet.image_url || ""}
                  name={bouquet.product_name}
                  price={bouquet.price}
                  shop={bouquet.shop_name || ""}
                  distance={bouquet.distance || ""}
                  category={bouquet.category || ""}
                  rating={bouquet.rating || 0}
                  sold={bouquet.stocks}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 text-center text-gray-500 mt-8">
            {q
              ? "No results to display"
              : "Use the search bar above to start a query."}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
