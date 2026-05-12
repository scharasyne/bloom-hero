/*
        FIND OUT THE DIFFERENCE OF THIS AND THE OTHER ONE
*/
export async function getPopUpGalleryPhotosByVendor(
  vendorId: string
): Promise<PopUpGalleryPhoto[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("popup_gallery_photos")
    .select("id, image_url, caption, location, event_name, display_order, created_at")
    .eq("vendor_id", vendorId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pop-up gallery:", error);
    return [];
  }

  return (data as PopUpGalleryPhoto[]) || [];
}