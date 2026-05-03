import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import PopUpMap from "@/components/PopUpMap";
import { getPopUpMapVendors } from "./actions";

export const metadata = {
  title: "Pop-up Map | Bloom Hero",
  description: "Find scheduled pop-up flower shops near you.",
};

export default async function PopUpMapPage() {
  const vendors = await getPopUpMapVendors();

  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full">
      <PopUpMap initialVendors={vendors} />
      <Footer />
    </div>
  );
}