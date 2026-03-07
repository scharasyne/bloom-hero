import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role as string | undefined;

    if (role === "vendor") {
      return NextResponse.redirect(`${origin}/vendor/dashboard`);
    } else if (role === "customer") {
      return NextResponse.redirect(`${origin}/customer/dashboard`);
    } else {
      return NextResponse.redirect(`${origin}/select-role`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}