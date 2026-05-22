export type ViewerRole = "admin" | "vendor" | "customer" | undefined;

/** Customer-facing public vendor pages and location requests. */
export function canViewPublicVendorProfiles(role: ViewerRole): boolean {
  return role === "customer" || role === "admin" || role === undefined;
}
