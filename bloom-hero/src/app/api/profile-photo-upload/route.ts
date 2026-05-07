import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "File is required." }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name || `profile.${ext}`)}`;
  const upload = await supabase.storage.from("profile-photos").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (upload.error) {
    return NextResponse.json({ success: false, error: upload.error.message }, { status: 400 });
  }

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
  return NextResponse.json({ success: true, url: data.publicUrl });
}
