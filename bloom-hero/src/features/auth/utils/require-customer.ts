import { getSession } from "@/features/auth/queries/getSession";

export async function requireCustomerSession() {
  const session = await getSession();
  if (!session.user) {
    return { ok: false as const, error: "You must be logged in." };
  }
  if (session.profile?.role !== "customer") {
    return { ok: false as const, error: "Only customers can perform this action." };
  }
  return { ok: true as const, session };
}
