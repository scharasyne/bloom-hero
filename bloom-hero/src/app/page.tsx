import { redirect } from "next/navigation";
import DesktopClient from "./_components/DesktopClient";
import { getAuthCallbackRedirectPath } from "@/features/auth/utils/authCallbackRedirect";
import { getAuthErrorRedirectPath } from "@/features/auth/utils/authErrorRedirect";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Desktop({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }

  const queryString = query.toString();

  const callbackRedirect = getAuthCallbackRedirectPath(queryString);
  if (callbackRedirect) {
    redirect(callbackRedirect);
  }

  const authRedirect = getAuthErrorRedirectPath(`?${queryString}`);
  if (authRedirect) {
    redirect(authRedirect);
  }

  return <DesktopClient />;
}