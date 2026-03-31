import NavBar from "@/components/navbar";

export default function MarketVendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar type="market" />
      {children}
    </>
  );
}