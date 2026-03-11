import { Quicksand } from "next/font/google";
import NavBar from "@/components/navbar";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <NavBar type="default"/>
      {children}    
    </>
  )
}
