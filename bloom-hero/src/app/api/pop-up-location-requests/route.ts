import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/features/auth/utils/require-customer";
import { submitPopUpLocationRequest } from "@/features/pop-up/actions/submitPopupLocationRequest";

export async function POST(request: Request) {
  const auth = await requireCustomerSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      vendorId?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      requestedDate?: string;
      startTime?: string;
      endTime?: string;
    };

    const vendorId = body.vendorId?.trim();
    const location = body.location?.trim();
    if (!vendorId || !location || !body.requestedDate || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, error: "Location, date, and time range are required." },
        { status: 400 }
      );
    }

    const result = await submitPopUpLocationRequest(
      vendorId,
      location,
      body.latitude,
      body.longitude,
      body.requestedDate,
      body.startTime,
      body.endTime
    );
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Request failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}
