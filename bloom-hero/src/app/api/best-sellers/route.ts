import { NextRequest, NextResponse } from "next/server";

import { getFlowerBestSellers, getVendorBestSellers } from "@/lib/best-sellers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { normalizeSearchScope } from "@/lib/utils/search";

function normalizeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 24;
  return Math.min(100, Math.floor(parsed));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const scope = normalizeSearchScope(searchParams.get("scope"));
  const query = (searchParams.get("q") ?? "").trim();
  const price = searchParams.get("price") ?? "Any";
  const limit = normalizeLimit(searchParams.get("limit"));

  const supabase = await createSupabaseServerClient();
  const wantsFlowers = scope === "all" || scope === "flowers";
  const wantsVendors = scope === "all" || scope === "vendors";

  const [flowerResult, vendorResult] = await Promise.all([
    wantsFlowers
      ? getFlowerBestSellers(supabase, { query, price, limit })
      : Promise.resolve({ data: [], error: null }),
    wantsVendors
      ? getVendorBestSellers(supabase, { query, limit })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const responseStatus = flowerResult.error || vendorResult.error ? 207 : 200;

  return NextResponse.json(
    {
      flowers: flowerResult.data,
      vendors: vendorResult.data,
      metric: "completed_order_quantity",
      errors: [flowerResult.error?.message, vendorResult.error?.message].filter(Boolean),
    },
    { status: responseStatus }
  );
}