// import { redirect } from "next/navigation";
// import { getSession } from "@/lib/auth/getSession";
import DesktopClient from "./_components/DesktopClient";

export default async function Desktop() {

  /*
    REMOVED THE CODE BELOW BECAUSE IT'S REDUNDANT
  */
  // const session = await getSession();

  // if (session?.profile?.role === "admin") {
  //   redirect("/vendor-applications");
  // }

  // if (session?.profile?.role === "vendor") {
  //   if(session?.profile?.vendor_type === "market")
  //       redirect("/market/dashboard");
  //   else if (session?.profile?.vendor_type === "pop-up")
  //       redirect("/pop-up/dashboard");
  // }

  return <DesktopClient />;
}