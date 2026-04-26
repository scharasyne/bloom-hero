import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type ProductImageRow = {
  image_url: string;
  display_order: number;
};

export type BestSellerFlowerRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description: string | null;
  created_at?: string;
  product_images?: ProductImageRow[] | null;
  categories?: string[];
  shop_name?: string | null;
  vendor_type?: string | null;
  average_rating?: number | null;
  sold_count: number;
};

export type BestSellerVendorRow = {
  id: string;
  shop_name: string | null;
  vendor_type: string | null;
  average_rating: number | null;
  sold_count: number;
};

type FlowerProductRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description: string | null;
  created_at?: string;
  product_images?: ProductImageRow[] | null;
};

type ProductCategoryRow = {
  product_id: string;
  category: { category_name: string } | null;
};

type VendorMetaRow = {
  id: string;
  shop_name: string | null;
  vendor_type: string | null;
  average_rating: number | null;
};

type OrderItemQuantityRow = {
  product_id: string;
  quantity: number;
};

function isMissingProductImagesRelation(errorMessage: string) {
  return /product_images|relationship|schema cache|does not exist/i.test(errorMessage);
}

function matchesPriceFilter(price: number, priceFilter: string) {
  if (priceFilter === "<500") return price < 500;
  if (priceFilter === "500-700") return price >= 500 && price <= 700;
  if (priceFilter === ">700") return price > 700;
  return true;
}

function matchesQuery(value: string | null | undefined, query: string) {
  if (!query) return true;
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

export async function getFlowerBestSellers(
  supabase: ServerClient,
  options?: { query?: string; price?: string; limit?: number }
) {
  const query = options?.query?.trim() ?? "";
  const priceFilter = options?.price ?? "Any";
  const limit = options?.limit ?? 50;

  const buildProductsQuery = (includeProductImages: boolean) => {
    const selectColumns = includeProductImages
      ? "id, vendor_id, product_name, product_image_url, price, description, created_at, product_images(image_url, display_order)"
      : "id, vendor_id, product_name, product_image_url, price, description, created_at";

    let builder = supabase.from("products").select(selectColumns);

    if (query) {
      const pattern = `%${query}%`;
      builder = builder.or(`product_name.ilike.${pattern},description.ilike.${pattern}`);
    }

    if (priceFilter !== "Any") {
      if (priceFilter === "<500") builder = builder.lt("price", 500);
      else if (priceFilter === "500-700") builder = builder.gte("price", 500).lte("price", 700);
      else if (priceFilter === ">700") builder = builder.gt("price", 700);
    }

    return builder;
  };

  let { data: productRows, error: productsError } = await buildProductsQuery(true);

  if (productsError && isMissingProductImagesRelation(productsError.message)) {
    const fallback = await buildProductsQuery(false);
    productRows = fallback.data;
    productsError = fallback.error;
  }

  if (productsError) {
    return { data: [] as BestSellerFlowerRow[], error: productsError };
  }

  const products = (productRows ?? []) as FlowerProductRow[];
  if (products.length === 0) {
    return { data: [] as BestSellerFlowerRow[], error: null };
  }

  const productIds = products.map((product) => product.id);

  const { data: soldRows, error: soldError } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status)")
    .eq("orders.status", "completed")
    .in("product_id", productIds);

  if (soldError) {
    return { data: [] as BestSellerFlowerRow[], error: soldError };
  }

  const soldCountByProductId = new Map<string, number>();
  for (const row of (soldRows ?? []) as unknown as OrderItemQuantityRow[]) {
    const currentCount = soldCountByProductId.get(row.product_id) ?? 0;
    soldCountByProductId.set(row.product_id, currentCount + (Number(row.quantity) || 0));
  }

  const vendorIds = [...new Set(products.map((product) => product.vendor_id).filter(Boolean))];
  const vendorMap = new Map<string, VendorMetaRow>();

  const { data: categoryRows, error: categoryError } = await supabase
    .from("product_categories")
    .select("product_id, category:categories(category_name)")
    .in("product_id", productIds);

  if (categoryError) {
    return { data: [] as BestSellerFlowerRow[], error: categoryError };
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

  if (vendorIds.length > 0) {
    const { data: vendorRows } = await supabase
      .from("vendors")
      .select("id, shop_name, vendor_type, average_rating")
      .in("id", vendorIds);

    for (const vendor of (vendorRows ?? []) as VendorMetaRow[]) {
      vendorMap.set(vendor.id, vendor);
    }
  }

  const rankedFlowers = products
    .map((product) => {
      const soldCount = soldCountByProductId.get(product.id) ?? 0;
      const vendor = vendorMap.get(product.vendor_id);

      return {
        ...product,
        categories: categoriesByProductId.get(product.id) ?? [],
        shop_name: vendor?.shop_name ?? null,
        vendor_type: vendor?.vendor_type ?? null,
        average_rating: vendor?.average_rating ?? null,
        sold_count: soldCount,
      } satisfies BestSellerFlowerRow;
    })
    .sort((a, b) => {
      if (b.sold_count !== a.sold_count) return b.sold_count - a.sold_count;
      return (a.product_name ?? "").localeCompare(b.product_name ?? "");
    })
    .slice(0, Math.max(1, limit));

  return { data: rankedFlowers, error: null };
}

export async function getVendorBestSellers(
  supabase: ServerClient,
  options?: { query?: string; limit?: number }
) {
  const query = options?.query?.trim() ?? "";
  const limit = options?.limit ?? 50;

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("id, vendor_id");

  if (productsError) {
    return { data: [] as BestSellerVendorRow[], error: productsError };
  }

  const products = (productRows ?? []) as { id: string; vendor_id: string }[];
  if (products.length === 0) {
    return { data: [] as BestSellerVendorRow[], error: null };
  }

  const productIds = products.map((product) => product.id);
  const vendorIdByProductId = new Map<string, string>(
    products.map((product) => [product.id, product.vendor_id])
  );

  const { data: soldRows, error: soldError } = await supabase
    .from("order_items")
    .select("product_id, quantity, orders!inner(status)")
    .eq("orders.status", "completed")
    .in("product_id", productIds);

  if (soldError) {
    return { data: [] as BestSellerVendorRow[], error: soldError };
  }

  const soldCountByVendorId = new Map<string, number>();
  for (const row of (soldRows ?? []) as unknown as OrderItemQuantityRow[]) {
    const vendorId = vendorIdByProductId.get(row.product_id);
    if (!vendorId) continue;

    const currentCount = soldCountByVendorId.get(vendorId) ?? 0;
    soldCountByVendorId.set(vendorId, currentCount + (Number(row.quantity) || 0));
  }

  let vendorQuery = supabase.from("vendors").select("id, shop_name, vendor_type, average_rating");
  if (query) {
    vendorQuery = vendorQuery.ilike("shop_name", `%${query}%`);
  }

  const { data: vendorRows, error: vendorError } = await vendorQuery;

  if (vendorError) {
    return { data: [] as BestSellerVendorRow[], error: vendorError };
  }

  const rankedVendors = ((vendorRows ?? []) as VendorMetaRow[])
    .map((vendor) => ({
      ...vendor,
      sold_count: soldCountByVendorId.get(vendor.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.sold_count !== a.sold_count) return b.sold_count - a.sold_count;
      return (a.shop_name ?? "").localeCompare(b.shop_name ?? "");
    })
    .slice(0, Math.max(1, limit));

  return { data: rankedVendors, error: null };
}

export function sortFlowersByPrice(rows: BestSellerFlowerRow[], sort: string) {
  if (sort === "Price: Low to High") {
    return rows.slice().sort((a, b) => a.price - b.price);
  }

  if (sort === "Price: High to Low") {
    return rows.slice().sort((a, b) => b.price - a.price);
  }

  return rows;
}

export function filterFlowersByQueryAndPrice(
  rows: BestSellerFlowerRow[],
  query: string,
  priceFilter: string
) {
  return rows.filter((row) => {
    const matchesText =
      !query ||
      matchesQuery(row.product_name, query) ||
      matchesQuery(row.description ?? "", query);

    return matchesText && matchesPriceFilter(Number(row.price) || 0, priceFilter);
  });
}