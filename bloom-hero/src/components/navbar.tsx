"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";

type SessionData =
  | {
      user: null;
      profile: null;
    }
  | {
      user: User;
      profile: {
        role?: string;
        vendor_type?: string | null;
        vendor_shop_name?: string | null;
      };
    };

type navTypes = 'market' | 'pop-up' | 'customer';

const navLinks = {
  // 'pop-up': [
  //   { href: "/pop-up/dashboard", label: "Dashboard" },
  //   { href: "/pop-up/products",  label: "My Products" },
  //   { href: "/pop-up/schedule",  label: "Schedule" },
  //   { href: "/pop-up/profile",   label: "Profile" },
  // ],
  // 'market': [
  //   { href: "/market/dashboard", label: "Dashboard" },
  //   { href: "/market/products",  label: "My Products" },
  //   { href: "/market/orders",    label: "Orders" },
  //   { href: "/market/profile",   label: "Profile" },
  // ],
  'customer': [
    { href: "/dashboard",        label: "Home" },
    { href: "/orders",  label: "Orders" },
    { href: "/cart",    label: "Cart" },
    { href: "/profile", label: "Profile" },
  ],
  'default': [
    { href: "/",               label: "Home" },
    { href: "/browse-flowers", label: "Flowers" },
    { href: "/browse-shops",   label: "Shops" },
    { href: "/about-us",       label: "About" },
  ],
};

// export default function NavBar({ type = "default" }: { type: navTypes | "default" }) {
export default function NavBar({
  session,
}: {
  session: SessionData;
}) {
  // const [user, setUser] = useState< any|null >(null);
  // const [resolvedType, setResolvedType] = useState<navTypes | "default">(type)
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  
  const user = session?.user || null;
  const role = session?.profile?.role;
  const vendor_type = session?.profile?.vendor_type;
  const vendor_name = session?.profile?.vendor_shop_name;

  const isVendor = role === "vendor";

  let resolvedType: navTypes | "default" = "default";
  if (role === "customer") resolvedType = "customer";

  // if (role === "vendor") resolvedType = vendor_type as navTypes;

  const items = navLinks[resolvedType]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh();
    router.push('/login');
  }

  return (
    <nav className="relative w-full border-b border-[#edeae6]">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="relative h-12 w-9 shrink-0 overflow-hidden">
          <img
            alt="BloomHero Logo"
            className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
            src="/icon.png"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {/* {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[16px] font-semibold text-black tracking-[-0.07px] hover:text-[#d24b46] transition-colors"
            >
              {label}
            </Link>
          ))} */}
          {/* <Link
            href="/login"
            className="bg-[#d24b46] text-white text-[16px] font-medium tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
          >
            Sign In
          </Link> */}

          {isVendor ? (
            <Link
              href={`/${vendor_type}/dashboard`}
              className="text-[18px] font-semibold text-black hover:text-[#d24b46] transition-colors"
            >
              {vendor_name ?? "Your Shop"}
            </Link>
          ) : (
            items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[16px] font-semibold text-black tracking-[-0.07px] hover:text-[#d24b46] transition-colors"
              >
                {label}
              </Link>
            ))
          )}

          {
            user ? (
              <button onClick={handleSignOut} className="bg-[#d24b46] text-white text-[16px] font-medium tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors">
                Sign Out
              </button>              
            ) : (
              <Link
                href="/login"
                className="bg-[#d24b46] text-white text-[16px] font-medium tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
              >
                Sign In
              </Link>
            )
          }
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block h-0.5 w-6 bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#edeae6] bg-white shadow-md flex flex-col py-4">
          {isVendor ? (
            <Link
              href={`/${vendor_type}/dashboard`}
              className="px-6 py-3 text-[16px] font-semibold text-black"
              onClick={() => setMenuOpen(false)}
            >
              {vendor_name ?? "Your Shop"}
            </Link>
          ) : (
            items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-6 py-3 text-[16px] font-semibold text-black hover:bg-[#fdf8f4]"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))
          )}
          <div className="px-6 pt-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full bg-[#d24b46] text-white text-[16px] font-medium text-center tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="block bg-[#d24b46] text-white text-[16px] font-medium text-center tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
                onClick={() => setMenuOpen(false)}
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
