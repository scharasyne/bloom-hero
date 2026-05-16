// Origin: src/lib/auth/require-role.ts

import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/queries/getSession";

type AppRole = "admin" | "vendor" | "customer";

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  const appRole = session.profile?.role as AppRole | undefined;

  if (appRole && allowedRoles.includes(appRole)) {
    return session;
  }

  if (appRole === "admin") {
    redirect("/admin/dashboard");
  }

  if (appRole === "vendor") {
    redirect("/vendor/dashboard");
  }

  redirect("/");
}
