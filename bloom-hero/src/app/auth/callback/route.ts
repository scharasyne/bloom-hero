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

    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    let userRole = roleData?.role;

    if (!userRole) {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email ?? "",
          role: "customer",
        },
        { onConflict: "id" }
      );

      await supabase
        .from("customers")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });

      userRole = "customer";
    }

    if (userRole === "customer") {
      await supabase
        .from("customers")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });
    }

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
    }

    return NextResponse.redirect(`${origin}/customer/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login`);
}