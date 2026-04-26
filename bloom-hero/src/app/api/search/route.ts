import { NextRequest, NextResponse } from "next/server";

import { getFlowerBestSellers, getVendorBestSellers, sortFlowersByPrice } from "@/lib/best-sellers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SearchScope = "all" | "flowers" | "vendors";

type ProductImageRow = {
  image_url: string;
  display_order: number;
};

type ProductCategoryRow = {
  product_id: string;
  category: { category_name: string } | null;
};

type FlowerSearchRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description: string | null;
  product_images?: ProductImageRow[] | null;
  categories?: string[];
  shop_name?: string | null;
  vendor_type?: string | null;
  average_rating?: number | null;
  sold_count?: number;
};

type VendorSearchRow = {
  id: string;
  shop_name: string | null;
  vendor_type: string | null;
  average_rating: number | null;
};

function normalizeScope(value: string | null): SearchScope {
  if (value === "flowers" || value === "vendors" || value === "all") {
    return value;
  }

  return "all";
}

function isMissingProductImagesRelation(errorMessage: string) {
  return /product_images|relationship|schema cache|does not exist/i.test(errorMessage);
}

async function fetchFlowerResults(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  query: string,
  price: string,
  sort: string
) {
  if (sort === "Best Sellers") {
    const rankedResult = await getFlowerBestSellers(supabase, { query, price, limit: 200 });

    if (rankedResult.error) {
      return { data: [] as FlowerSearchRow[], error: rankedResult.error };
    }

    return { data: sortFlowersByPrice(rankedResult.data, sort), error: null };
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
    return { data: [] as FlowerSearchRow[], error };
  }

  const flowers = (data ?? []) as FlowerSearchRow[];
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
    for (const row of (categoryRows ?? []) as ProductCategoryRow[]) {
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
    .select("id, shop_name, vendor_type, average_rating")
    .in("id", vendorIds);

  if (!vendorError && vendors) {
    const vendorMap = new Map(
      (vendors as VendorSearchRow[]).map((vendor) => [vendor.id, vendor])
    );

    return {
      data: flowers.map((flower) => {
        const vendor = vendorMap.get(flower.vendor_id);

        return {
          ...flower,
          shop_name: vendor?.shop_name ?? null,
          vendor_type: vendor?.vendor_type ?? null,
          average_rating: vendor?.average_rating ?? null,
        };
      }),
      error: null,
    };
  }

  return { data: flowers, error: null };
}

async function fetchVendorResults(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  query: string,
  sort: string
) {
  if (sort === "Best Sellers") {
    const rankedResult = await getVendorBestSellers(supabase, { query, limit: 200 });

    if (rankedResult.error) {
      return { data: [] as VendorSearchRow[], error: rankedResult.error };
    }

    return { data: rankedResult.data as VendorSearchRow[], error: null };
  }

  let builder = supabase.from("vendors").select("id, shop_name, vendor_type, average_rating");

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
    return { data: [] as VendorSearchRow[], error };
  }

  return { data: (data ?? []) as VendorSearchRow[], error: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const scope = normalizeScope(searchParams.get("scope"));
  const price = searchParams.get("price") ?? "Any";
  const sort = searchParams.get("sort") ?? "Best Sellers";

  if (!query) {
    return NextResponse.json({ flowers: [], vendors: [] });
  }

  const supabase = await createSupabaseServerClient();
  const wantsFlowers = scope === "all" || scope === "flowers";
  const wantsVendors = scope === "all" || scope === "vendors";

  const [flowerResult, vendorResult] = await Promise.all([
    wantsFlowers
      ? fetchFlowerResults(supabase, query, price, sort)
      : Promise.resolve({ data: [] as FlowerSearchRow[], error: null }),
    wantsVendors
      ? fetchVendorResults(supabase, query, sort)
      : Promise.resolve({ data: [] as VendorSearchRow[], error: null }),
  ]);

  const responseStatus = flowerResult.error || vendorResult.error ? 207 : 200;

  return NextResponse.json(
    {
      flowers: flowerResult.data,
      vendors: vendorResult.data,
      errors: [flowerResult.error?.message, vendorResult.error?.message].filter(Boolean),
    },
    { status: responseStatus }
  );
}