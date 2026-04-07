import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import NavBar from "@/components/navbar";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  const session = await getSession();

  console.log("PROTECTED LAYOUT RUNNING");
  
  if(!session.user)
        redirect("/login");

  return (
    <>
      <NavBar session={session} />
      {children}
    </>
  );
}