import { NextResponse } from "next/server";

import { getVendorDashboardData } from "@/features/vendors/queries/getVendorDashboardData";

export async function GET() {
  const result = await getVendorDashboardData();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, data: result.data });
}
