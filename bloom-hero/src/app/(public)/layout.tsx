import NavBar from "@/components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    console.log("PUBLIC LAYOUT");
  return (
    <>
      {/* No session passed → treated as logged out */}
      <NavBar session={{ user: null, profile: null }} />
      {children}
    </>
  );
}