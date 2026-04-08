import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/getSession";

type AppRole = "admin" | "vendor" | "customer";

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  const role = session.profile?.role as AppRole | null | undefined;

  if (!role) {
    redirect("/");
  }

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  return session;
}
