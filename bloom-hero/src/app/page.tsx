import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { getPopUpMapVendors } from "@/app/map/actions";
import DesktopClient from "./_components/DesktopClient";

export default async function Desktop() {
  const session = await getSession();

  if (session?.profile?.role === "admin") {
    redirect("/admin/vendor-applications");
  }

  if (session?.profile?.role === "vendor") {
    redirect("/market/dashboard");
  }

  const vendors = await getPopUpMapVendors();

  return <DesktopClient vendors={vendors} />;
}