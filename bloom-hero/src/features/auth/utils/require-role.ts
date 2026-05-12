// Origin: src/lib/auth/require-role.ts

import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/queries/getSession";

type AppRole = "admin" | "vendor" | "customer";
type VendorRole = "pop-up" | "market";
type CombinedRole = AppRole | VendorRole;

export async function requireRole(allowedRoles: CombinedRole[]) {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  const appRole = session.profile?.role as AppRole | undefined;
  const vendorType = session.profile?.vendor_type as VendorRole | undefined;

  // If the caller allows any vendor, short-circuit allow any vendor
  if (appRole === "vendor" && allowedRoles.includes("vendor")) {
    return session;
  }

  // Allow specific vendor-type if requested
  if (vendorType && allowedRoles.includes(vendorType)) {
    return session;
  }

  // Allow other app roles (admin, customer)
  if (appRole && allowedRoles.includes(appRole)) {
    return session;
  }

  // Not allowed -> redirect to a stable destination (avoid sending to `/` which may re-redirect)
  if (appRole === "vendor") {
    if (vendorType === "pop-up") redirect("/pop-up/dashboard");
    if (vendorType === "market") redirect("/market/dashboard");
    // fallback for vendors without a vendor_type
    redirect("/");
  }

  // Non-vendor not allowed
  redirect("/");
}