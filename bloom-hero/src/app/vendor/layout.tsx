import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={quicksand.variable}>
      {children}
    </div>
  );
}