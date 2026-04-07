"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  user: any | null;
  profile: {
    role?: string;
    vendor_type?: string;
  } | null;
};

export default function NavBar({ session }: { session: Session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  console.log("SESSION:", session);
  // console.log(session)

  const handleSignOut = async () => {
    await fetch("/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const role = session.profile?.role;
  const vendorType = session.profile?.vendor_type;

  const navLinks = {
    default: [
      { href: "/", label: "Home" },
      { href: "/browse-flowers", label: "Flowers" },
      { href: "/browse-shops", label: "Shops" },
      { href: "/about-us", label: "About" },
    ],
    customer: [
      { href: "/", label: "Home" },
      { href: "/orders", label: "Orders" },
      { href: "/cart", label: "Cart" },
      { href: "/profile", label: "Profile" },
    ],
    vendor_market: [
      { href: "/market/dashboard", label: "Dashboard" },
      { href: "/market/products", label: "Products" },
      { href: "/market/orders", label: "Orders" },
      { href: "/market/profile", label: "Profile" },
    ],
    vendor_popup: [
      { href: "/pop-up/dashboard", label: "Dashboard" },
      { href: "/pop-up/products", label: "Products" },
      { href: "/pop-up/schedule", label: "Schedule" },
      { href: "/pop-up/profile", label: "Profile" },
    ],
    admin: [
      { href: "/admin/vendor-applications", label: "Applications" },
      { href: "/admin/users", label: "Users" },
    ],
  };

  let items = navLinks.default;


  if (session.user && session.profile) {

    const role = session.profile.role;

    if (role === "admin") {
      items = navLinks.admin;
    } else if (role === "customer") {
      items = navLinks.customer;
    } else if (role === "vendor") {
      if (session.profile.vendor_type === "market") {
        items = navLinks.vendor_market;
      } else if (session.profile.vendor_type === "pop-up") {
        items = navLinks.vendor_popup;
      } else {
        items = navLinks.default; // fallback
      }
    }
  }

  return (
    
    <nav className="relative w-full border-b border-[#edeae6] bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="relative h-12 w-9 shrink-0 overflow-hidden">
          <img
            alt="BloomHero Logo"
            className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
            src="/icon.png"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
        {/* <div className="flex items-center gap-8"> */}
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[16px] font-semibold hover:text-[#d24b46] transition-colors"
            >
              {label}
            </Link>
          ))}

          {session.user ? (
            <button
              onClick={handleSignOut}
              className="bg-[#d24b46] text-white px-5 py-3 rounded-full hover:bg-[#bb3f3a]"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-[#d24b46] text-white px-5 py-3 rounded-full hover:bg-[#bb3f3a]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block h-0.5 w-6 bg-black ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-black ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-black ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-md flex flex-col py-4">
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 font-semibold hover:bg-[#fdf8f4]"
            >
              {label}
            </Link>
          ))}

          <div className="px-6 pt-3">
            {session.user ? (
              <button
                onClick={handleSignOut}
                className="w-full bg-[#d24b46] text-white py-3 rounded-full"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center bg-[#d24b46] text-white py-3 rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}