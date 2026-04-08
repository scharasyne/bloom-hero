import NavBar from "@/components/navbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <NavBar type="customer" />
        {children}
    </>
  );
}
