import { requireRole } from "@/features/auth/utils/require-role";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["customer"]);
  return <>{children}</>;
}
