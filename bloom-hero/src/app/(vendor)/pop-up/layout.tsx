import NavBar from "@/components/navbar";

export default function PopUpVendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar type="pop-up" />
      {children}
    </>
  );
}