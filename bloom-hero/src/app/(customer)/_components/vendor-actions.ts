"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface Product {
  id: string;
  product_name: string;
  product_image_url: string | null;
  product_images?: { image_url: string; display_order: number }[] | null;
  description: string | null;
  price: number;
}

interface PopUpSchedule {
  id: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
}

interface Vendor {
  id: string;
  shop_name: string;
  description?: string;
}

export async function getVendorProfile(vendorId: string): Promise<Vendor | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("id, shop_name")
    .eq("id", vendorId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }

  return data || null;
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, product_name, product_image_url, description, price, product_images(image_url, display_order)"
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as Product[]) || [];
}

export async function getPopUpSchedule(vendorId: string): Promise<PopUpSchedule[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("popup_locations")
    .select("id, scheduled_date, start_time, end_time")
    .eq("vendor_id", vendorId)
    .gte("scheduled_date", new Date().toISOString())
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching pop-up schedule:", error);
    return [];
  }

  return (data as PopUpSchedule[]) || [];
}

export async function submitPopUpLocationRequest(
  vendorId: string,
  location: string,
  latitude?: number,
  longitude?: number
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("popup_location_requests")
    .insert({
      vendor_id: vendorId,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error submitting location request:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
