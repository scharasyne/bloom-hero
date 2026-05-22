import { NextRequest, NextResponse } from "next/server";

import { runSearch } from "@/features/search/queries/runSearch";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const { flowers, vendors, popups, errors } = await runSearch({
    q: searchParams.get("q"),
    scope: searchParams.get("scope"),
    price: searchParams.get("price"),
    sort: searchParams.get("sort"),
    category: searchParams.get("category"),
    city: searchParams.get("city"),
    popupTiming: searchParams.get("popupTiming"),
    popupSort: searchParams.get("popupSort"),
  });

  const responseStatus = errors.length > 0 ? 207 : 200;

  return NextResponse.json(
    {
      flowers,
      vendors,
      popups,
      errors,
    },
    { status: responseStatus }
  );
}
