import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import PopUpMap from "@/components/PopUpMap";

export const metadata = {
  title: "Pop-up Map | Bloom Hero",
  description: "Find scheduled pop-up flower shops near you.",
};

export default function PopUpMapPage() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full">
      <NavBar />
      <PopUpMap />
      <Footer />
    </div>
  );
}