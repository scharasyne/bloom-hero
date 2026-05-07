import { requireRole } from "@/lib/auth/require-role";
import { getSession } from "@/lib/auth/getSession";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["customer"]);
  const session = await getSession();
  return (
    <>
      {children}
    </>
  );
}