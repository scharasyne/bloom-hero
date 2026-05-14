import { redirect } from "next/navigation";

export default function LegacyVendorRouteRedirect() {
  redirect("/vendor/products");
}
