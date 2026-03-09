// "use server";

// import { createSupabaseServerClient } from "@/lib/supabase/server-client";
// import { redirect } from "next/navigation";

// export async function selectRole(role: "customer" | "vendor", vendorType?: "pop-up" | "market") {
//   const supabase = await createSupabaseServerClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/login");

//   await supabase.from("users").update({
//     role,
//     vendor_type: role === "vendor" ? vendorType : null,
//   }).eq("id", user.id);

//   // redirect based on role
//   if (role === "vendor") redirect("/vendor/dashboard");
//   else redirect("/customer/shop");
// }