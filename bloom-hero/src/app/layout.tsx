import { Quicksand } from "next/font/google";
// import NavBar from "@/components/navbar";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("ROOT LAYOUT");
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-quicksand`}>
        {children}
      </body>
    </html>
  );
}
