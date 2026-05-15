"use client";

import { useEffect, useState } from "react";
import { mapPriceFilter } from "@/features/search/utils/filters";
import type { SearchResults } from "@/features/search/types";
import type { SearchScope } from "@/features/search/utils/scope";
import type { PopUpSort, PopUpTiming } from "@/features/search/utils/popupFilters";

type UseSearchResultsParams = {
  q: string;
  scope: SearchScope;
  category: string | null;
  price: string;
  sort: string;
  city: string;
  popupTiming: PopUpTiming;
  popupSort: PopUpSort;
  enabled: boolean;
};

export function useSearchResults({
  q,
  scope,
  category,
  price,
  sort,
  city,
  popupTiming,
  popupSort,
  enabled,
}: UseSearchResultsParams) {
  const [results, setResults] = useState<SearchResults>({ flowers: [], vendors: [], popups: [] });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!enabled) {
        setResults({ flowers: [], vendors: [], popups: [] });
        setErrorMsg(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({
          scope,
          price: mapPriceFilter(price),
          sort,
          city,
          popupTiming,
          popupSort,
        });
        if (q.trim()) {
          params.set("q", q);
        }
        if (category) {
          params.set("category", category);
        }

        const response = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });

        const payload = (await response.json()) as {
          flowers?: SearchResults["flowers"];
          vendors?: SearchResults["vendors"];
          popups?: SearchResults["popups"];
          errors?: string[];
          message?: string;
        };

        if (!response.ok && response.status !== 207) {
          throw new Error(payload.message ?? payload.errors?.[0] ?? "Failed to fetch search results.");
        }

        setResults({
          flowers: payload.flowers ?? [],
          vendors: payload.vendors ?? [],
          popups: payload.popups ?? [],
        });
        const messages = payload.errors?.filter(Boolean) ?? [];
        setErrorMsg(messages.length > 0 ? messages.join(" • ") : null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("fetch search results:", error);
        setErrorMsg(error instanceof Error ? error.message : "Failed to fetch search results.");
        setResults({ flowers: [], vendors: [], popups: [] });
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [q, price, sort, scope, category, city, popupTiming, popupSort, enabled]);

  return { results, loading, errorMsg };
}
