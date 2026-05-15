import Footer from "@/components/footer";
import { getSession } from "@/features/auth/queries/getSession";
import PopUpMap from "@/features/pop-up/components/PopUpMap";
import { getPopUpMapVendors } from "@/features/pop-up/queries/getPopUpMapVendors";
import { canViewPublicVendorProfiles } from "@/features/vendors/utils/publicVendorAccess";

export const metadata = {
  title: "Pop-up Map | Bloom Hero",
  description: "Find scheduled pop-up flower shops near you.",
};

export default async function PopUpMapPage() {
  const [vendors, session] = await Promise.all([getPopUpMapVendors(), getSession()]);
  const showProfileLink = canViewPublicVendorProfiles(
    session.profile?.role as "admin" | "vendor" | "customer" | undefined
  );

  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full">
      <PopUpMap initialVendors={vendors} showProfileLink={showProfileLink} />
      <Footer />
    </div>
  );
}
