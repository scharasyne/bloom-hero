import { requireCustomerSession } from "@/features/auth/utils/require-customer";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function submitPopUpLocationRequest(
  vendorId: string,
  location: string,
  latitude?: number,
  longitude?: number,
  requestedDate?: string,
  startTime?: string,
  endTime?: string
) {
  const auth = await requireCustomerSession();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const supabase = await createSupabaseServerClient();
  const user = auth.session.user;

  const customerEnsure = await supabase
    .from("customers")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });
  if (customerEnsure.error) {
    return { success: false, error: customerEnsure.error.message };
  }

  const dateValue = requestedDate || new Date().toISOString().slice(0, 10);

  const firstTry = await supabase
    .from("popup_location_requests")
    .insert({
      customer_id: user.id,
      vendor_id: vendorId,
      location,
      requested_location: location,
      requested_date: dateValue,
      requested_start_time: startTime || null,
      requested_end_time: endTime || null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  let data = firstTry.data;
  let error = firstTry.error;

  if (error) {
    const fallback = await supabase
      .from("popup_location_requests")
      .insert({
        customer_id: user.id,
        vendor_id: vendorId,
        requested_location: location,
        requested_date: dateValue,
        status: "pending",
      });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error submitting location request:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}