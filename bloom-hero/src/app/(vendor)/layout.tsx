import { requireRole } from "@/features/auth/utils/require-role";
import { VendorSuspensionGate } from "@/features/vendors/components/VendorSuspensionGate";
import { getVendorSuspensionByOwner } from "@/features/vendors/queries/getVendorSuspensionByOwner";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["vendor"]);
  const suspension = await getVendorSuspensionByOwner();

  return <VendorSuspensionGate suspension={suspension}>{children}</VendorSuspensionGate>;
}
