import { requireRole } from "@/lib/auth/require-role";

export default async function PopUpVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["pop-up"]);
  return <>{children}</>;
}
