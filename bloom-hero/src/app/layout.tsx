import { Quicksand } from "next/font/google";
import { getSession } from "@/features/auth/queries/getSession";
import NavBar from "@/components/navbar";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-quicksand`}>
        <NavBar session={session} />
        {children}
      </body>
    </html>
  );
}
