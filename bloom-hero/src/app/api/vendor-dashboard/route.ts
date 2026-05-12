import { NextResponse } from "next/server";

import { getVendorDashboardData } from "@/features/vendors/queries/getVendorDashboardData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const vendorType = type === "pop-up" ? "pop-up" : "market";

  const result = await getVendorDashboardData(vendorType);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, data: result.data });
}
