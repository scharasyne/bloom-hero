import { requireRole } from "@/lib/auth/require-role";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["customer"]);
  return <>{children}</>;
}
