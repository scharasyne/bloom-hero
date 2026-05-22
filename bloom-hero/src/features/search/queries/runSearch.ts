import { getFlowerBestSellers, getVendorBestSellers, sortFlowersByPrice } from "@/features/search/queries/bestSellers";
import { normalizeCategory } from "@/features/search/utils/categories";
import { normalizeSearchPrice } from "@/features/search/utils/filters";
import { createSearchSupabaseClient } from "@/features/search/utils/searchSupabase";
import { fetchPopUpResults } from "@/features/search/queries/fetchPopUpResults";
import { normalizeSearchScope } from "@/features/search/utils/scope";
import {
  normalizePopUpCity,
  normalizePopUpSort,
  normalizePopUpTiming,
} from "@/features/search/utils/popupFilters";
import type { SearchFlowerRow, SearchPopUpRow, SearchVendorRow } from "@/features/search/types";

type ProductCategoryRow = {
  product_id: string;
  category: { category_name: string } | null;
};

type SearchClient = Awaited<ReturnType<typeof createSearchSupabaseClient>>;

function isMissingProductImagesRelation(errorMessage: string) {
  return /product_images|relationship|schema cache|does not exist/i.test(errorMessage);
}

async function fetchFlowerResults(
  supabase: SearchClient,
  query: string,
  price: string,
  sort: string,
  category: string | null
) {
  let categoryProductIds: string[] | null = null;

  if (category) {
    const { data: categoryRows, error: categoryError } = await supabase
      .from("product_categories")
      .select("product_id, categories!inner(category_name)")
      .eq("categories.category_name", category);

    if (categoryError) {
      return { data: [] as SearchFlowerRow[], error: categoryError };
    }

    categoryProductIds = Array.from(
      new Set((categoryRows ?? []).map((row) => row.product_id).filter(Boolean))
    );

    if (categoryProductIds.length === 0) {
      return { data: [] as SearchFlowerRow[], error: null };
    }
  }

  if (sort === "Best Sellers") {
    const rankedResult = await getFlowerBestSellers(supabase, { query, price, limit: 200 });

    if (!rankedResult.error && rankedResult.data.length > 0) {
      const filteredRows = category
        ? rankedResult.data.filter((row) => (row.categories ?? []).includes(category))
        : rankedResult.data;

      return { data: sortFlowersByPrice(filteredRows, sort), error: null };
    }
  }

  const buildQuery = (includeProductImages: boolean) => {
    const selectColumns = includeProductImages
      ? "id, vendor_id, product_name, product_image_url, price, description, product_images(image_url, display_order)"
      : "id, vendor_id, product_name, product_image_url, price, description";

    let builder = supabase.from("products").select(selectColumns);

    if (query) {
      const pattern = `%${query}%`;
      builder = builder.or(`product_name.ilike.${pattern},description.ilike.${pattern}`);
    }

    if (price !== "Any") {
      if (price === "<500") builder = builder.lt("price", 500);
      else if (price === "500-700") builder = builder.gte("price", 500).lte("price", 700);
      else if (price === ">700") builder = builder.gt("price", 700);
    }

    if (categoryProductIds) {
      builder = builder.in("id", categoryProductIds);
    }

    if (sort === "Price: Low to High") {
      builder = builder.order("price", { ascending: true });
    } else if (sort === "Price: High to Low") {
      builder = builder.order("price", { ascending: false });
    } else {
      builder = builder.order("created_at", { ascending: false });
    }

    return builder;
  };

  let { data, error } = await buildQuery(true);

  if (error && isMissingProductImagesRelation(error.message)) {
    const fallback = await buildQuery(false);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return { data: [] as SearchFlowerRow[], error };
  }

  const flowers = (data ?? []) as unknown as SearchFlowerRow[];
  const vendorIds = [...new Set(flowers.map((flower) => flower.vendor_id).filter(Boolean))];

  const productIds = [...new Set(flowers.map((flower) => flower.id).filter(Boolean))];
  if (productIds.length > 0) {
    const { data: categoryRows, error: categoryError } = await supabase
      .from("product_categories")
      .select("product_id, category:categories(category_name)")
      .in("product_id", productIds);

    if (categoryError) {
      return { data: flowers, error: categoryError };
    }

    const categoriesByProductId = new Map<string, string[]>();
    for (const row of (categoryRows ?? []) as unknown as ProductCategoryRow[]) {
      const categoryName = row.category?.category_name?.trim();

      if (!categoryName) {
        continue;
      }

      const currentCategories = categoriesByProductId.get(row.product_id) ?? [];
      currentCategories.push(categoryName);
      categoriesByProductId.set(row.product_id, currentCategories);
    }

    for (const flower of flowers) {
      flower.categories = categoriesByProductId.get(flower.id) ?? [];
    }
  }

  if (vendorIds.length === 0) {
    return { data: flowers, error: null };
  }

  const { data: vendors, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name, business_type")
    .in("id", vendorIds);

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("vendor_id, rating")
    .in("vendor_id", vendorIds);

  const ratingsByVendorId = new Map<string, number[]>();
  if (!reviewError && reviewRows) {
    for (const row of (reviewRows ?? []) as { vendor_id: string; rating: number }[]) {
      const current = ratingsByVendorId.get(row.vendor_id) ?? [];
      current.push(row.rating);
      ratingsByVendorId.set(row.vendor_id, current);
    }
  }

  if (!vendorError && vendors) {
    const vendorMap = new Map(
      (vendors as Omit<SearchVendorRow, "average_rating">[]).map((vendor) => [vendor.id, vendor])
    );

    return {
      data: flowers.map((flower) => {
        const vendor = vendorMap.get(flower.vendor_id);
        const vendorRatings = ratingsByVendorId.get(flower.vendor_id) ?? [];
        const averageRating =
          vendorRatings.length > 0 ? vendorRatings.reduce((a, b) => a + b, 0) / vendorRatings.length : null;

        return {
          ...flower,
          shop_name: vendor?.shop_name ?? null,
          business_type: vendor?.business_type ?? null,
          average_rating: averageRating,
        };
      }),
      error: null,
    };
  }

  return { data: flowers, error: null };
}

async function fetchVendorResults(supabase: SearchClient, query: string, sort: string) {
  if (sort === "Best Sellers") {
    const rankedResult = await getVendorBestSellers(supabase, { query, limit: 200 });

    if (!rankedResult.error && rankedResult.data.length > 0) {
      return { data: rankedResult.data as SearchVendorRow[], error: null };
    }
  }

  let builder = supabase
    .from("vendors")
    .select("id, shop_name, business_type, holds_popups, average_rating");

  if (query) {
    builder = builder.ilike("shop_name", `%${query}%`);
  }

  if (sort === "Best Sellers") {
    builder = builder.order("average_rating", { ascending: false });
  } else {
    builder = builder.order("shop_name", { ascending: true });
  }

  const { data, error } = await builder;

  if (error) {
    return { data: [] as SearchVendorRow[], error };
  }

  return { data: (data ?? []) as SearchVendorRow[], error: null };
}

export type RunSearchParams = {
  q?: string | null;
  scope?: string | null;
  price?: string | null;
  sort?: string | null;
  category?: string | null;
  city?: string | null;
  popupTiming?: string | null;
  popupSort?: string | null;
};

export async function runSearch(params: RunSearchParams) {
  const query = (params.q ?? "").trim();
  const scope = normalizeSearchScope(params.scope ?? null);
  const price = normalizeSearchPrice(params.price);
  const sort = params.sort ?? "Best Sellers";
  const category = normalizeCategory(params.category ?? null);
  const city = normalizePopUpCity(params.city ?? null);
  const popupTiming = normalizePopUpTiming(params.popupTiming ?? null);
  const popupSort = normalizePopUpSort(params.popupSort ?? params.sort ?? null);

  const hasQuery = query.length > 0;
  const hasCategory = Boolean(category);

  if (!hasQuery && !hasCategory && scope !== "popups") {
    return {
      flowers: [] as SearchFlowerRow[],
      vendors: [] as SearchVendorRow[],
      popups: [] as SearchPopUpRow[],
      errors: [] as string[],
    };
  }

  const supabase = await createSearchSupabaseClient();
  const wantsFlowers = (scope === "all" || scope === "flowers") && (hasQuery || hasCategory);
  const wantsVendors = (scope === "all" || scope === "vendors") && hasQuery;
  const wantsPopups = scope === "all" || scope === "popups";

  const [flowerResult, vendorResult, popupResult] = await Promise.all([
    wantsFlowers
      ? fetchFlowerResults(supabase, query, price, sort, category)
      : Promise.resolve({ data: [] as SearchFlowerRow[], error: null }),
    wantsVendors
      ? fetchVendorResults(supabase, query, sort)
      : Promise.resolve({ data: [] as SearchVendorRow[], error: null }),
    wantsPopups
      ? fetchPopUpResults(supabase, query, city, popupTiming, popupSort)
      : Promise.resolve({ data: [] as SearchPopUpRow[], error: null }),
  ]);

  return {
    flowers: flowerResult.data,
    vendors: vendorResult.data,
    popups: popupResult.data,
    errors: [flowerResult.error?.message, vendorResult.error?.message, popupResult.error?.message].filter(
      (message): message is string => Boolean(message)
    ),
  };
}
