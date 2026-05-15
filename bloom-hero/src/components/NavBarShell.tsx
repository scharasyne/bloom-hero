"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/navbar";

type NavBarShellProps = {
  session: Parameters<typeof NavBar>[0]["session"];
};

export default function NavBarShell({ session }: NavBarShellProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <NavBar session={session} />;
}
