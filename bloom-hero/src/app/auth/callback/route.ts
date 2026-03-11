import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if(!user)
        return NextResponse.redirect(`${origin}/sign-up`);

    const { data: roleData } = await supabase.from("users").select("role").eq("id",user.id).single();
    const userRole = roleData?.role;

    const { data: vendorData } = await supabase
      .from("vendors")
      .select("vendor_type")
      .eq("owner_id", user.id)
      .single();
    const vendorType = vendorData?.vendor_type;

    if (userRole === "vendor") {
      if(vendorType === "market")
        return NextResponse.redirect(`${origin}/vendor/market/dashboard`);
      else if(vendorType === "pop-up"){
        return NextResponse.redirect(`${origin}/vendor/pop-up/dashboard`);
        // return NextResponse.redirect(`${origin}/vendor/pop-up/dashboard`);        
      }

    } else if (userRole === "customer") {
      return NextResponse.redirect(`${origin}/customer/dashboard`);
    } else if (!userRole) {
      return NextResponse.redirect(`${origin}/select-role`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}