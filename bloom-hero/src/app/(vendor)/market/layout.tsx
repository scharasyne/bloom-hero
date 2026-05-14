import { requireRole } from "@/lib/auth/require-role";

export default async function MarketVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["vendor"]);
  return <>{children}</>;
}
