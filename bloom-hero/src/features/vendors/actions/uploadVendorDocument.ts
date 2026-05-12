import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function uploadVendorDocument(ownerId: string, file: File, documentType: string) {
  const supabase = await createSupabaseServerClient();
  const extension = file.name.split(".").pop() ?? "dat";
  const filePath = `${ownerId}/vendor-application/${documentType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("vendor-documents").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("vendor-documents").getPublicUrl(filePath);
  return data.publicUrl;
}
