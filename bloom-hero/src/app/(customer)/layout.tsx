import { requireRole } from "@/features/auth/utils/require-role";
import { getSession } from "@/features/auth/queries/getSession";
import NavBar from "@/components/navbar";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["customer"]);
  const session = await getSession();
  return (
    <>
      <NavBar session={session} />
      {children}
    </>
  );
}