import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function uploadCustomerProfilePhoto(userId: string, file: File) {
  const supabase = await createSupabaseServerClient();
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Photo upload succeeded but no public URL was returned.");
  }

  return data.publicUrl;
}