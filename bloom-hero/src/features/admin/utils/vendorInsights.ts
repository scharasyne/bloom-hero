export const NEWLY_ADDED_VENDOR_DAYS = 30;

export function isNewlyAddedVendor(createdAtIso: string, days = NEWLY_ADDED_VENDOR_DAYS) {
  const created = new Date(createdAtIso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}
