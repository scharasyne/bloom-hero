"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { useRouter, usePathname } from "next/navigation"; //newly added for active link highlighting
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import SearchBar from "@/components/SearchBar"; //newly added for nav bar enhancement
import { Icon } from "@iconify/react";

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
        username?: string | null; //newly added for nav bar enhancement, allows displaying username in nav bar if available
      };
    };

type navTypes = 'market' | 'pop-up' | 'customer';

const navLinks = {
  'customer': [
    { href: "/",        label: "Home" },
    { href: "/orders",  label: "Orders" },
    { href: "/cart",    label: "Cart" },
    { href: "/profile", label: "Profile" },
  ],
  'default': [
    { href: "/",               label: "Home" },
    // { href: "/browse-flowers", label: "Flowers" },
    // { href: "/browse-shops",   label: "Shops" },
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
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname(); //newly added for active link highlighting
  
  const user = session?.user || null;
  const role = session?.profile?.role;
  const vendor_type = session?.profile?.vendor_type;
  const vendor_name = session?.profile?.vendor_shop_name;

  const displayName =
    session?.profile?.username ||
    session?.user?.email?.split("@")[0] ||
    "Customer"; //newly added for nav bar enhancement, falls back to email prefix or "Customer" if no name available

  const isVendor = role === "vendor";

  let resolvedType: navTypes | "default" = "default";
  if (role === "customer") resolvedType = "customer";

  // if (role === "vendor") resolvedType = vendor_type as navTypes;

  const items = navLinks[resolvedType]
  const showSearchBar = pathname !== "/" && !pathname.startsWith("/search") && !!user && !isVendor;

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login');
    router.refresh();
  }

  const handleNavSearch = (e: React.FormEvent) => { // 👈 add this
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
    else router.push("/search");
  };
  
  return (
  <nav className="relative w-full bg-[#FBF7F4] border-b border-[#edeae6]">
    {/* ── Desktop row ─────────────────────────────────────────── */}
    <div className="hidden md:flex items-center gap-6 px-8 py-3 relative">

      {/* LEFT: logo + signed-in */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="relative h-11 w-8 shrink-0 overflow-hidden">
          <img
            alt="BloomHero Logo"
            className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
            src="/icon.png"
          />
        </Link>

        {user && (
          <>
            <span className="w-px h-5 bg-[#ddd9d4] shrink-0" />
            <p className="text-[14px] text-[#7a7a7a] whitespace-nowrap">
              {isVendor ? (
                <>
                  You're{" "}
                  <span className="font-semibold text-[#1f1f1f]">blooming</span>
                  {" "}as{" "}
                  <span className="font-semibold text-[#3f6f52]">{vendor_name ?? "Your Store"}</span>
                </>
              ) : (
                <>
                  You are{" "}
                  <span className="font-semibold text-[#1f1f1f]">signed in</span>
                  {" "}as{" "}
                  <span className="font-semibold text-[#3f6f52]">{displayName}</span>
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* CENTER: search bar (only for non-vendors) */}
      {showVendorSearchBar && (
        <form role="search" onSubmit={handleNavSearch} className="absolute left-1/2 -translate-x-1/2 w-[340px]">
          <label htmlFor="navbar-search" className="sr-only">Search</label>
          <div className="flex items-center gap-2 bg-white border border-[#edeae6] rounded-full px-4 py-2 hover:border-[#c8c4bf] transition-colors">
            <Icon icon="mdi:magnify" width={16} height={16} className="shrink-0 text-[#b0aba5]" />
            <input
              id="navbar-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flowers, vendors"
              className="w-full bg-transparent text-[14px] text-[#1f1f1f] placeholder:text-[#b0aba5] outline-none"
            />
          </div>
        </form>
      )}

      {/* RIGHT: nav links + auth */}
      <div className="flex items-center gap-7 ml-auto shrink-0">
        {!isVendor && (
          items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative text-[14px] font-semibold transition-colors pb-0.5
                ${pathname === href
                  ? "text-[#d24b46] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#d24b46] after:rounded-full"
                  : "text-[#1f1f1f] hover:text-[#d24b46]"
                }`}
            >
              {label}
            </Link>
          ))
        )}

        {user ? (
          <button
            onClick={handleSignOut}
            className="text-[14px] font-semibold text-[#d24b46] border border-[#d24b46] px-4 py-1.5 rounded-full hover:bg-[#d24b46] hover:text-white transition-colors"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className="text-[14px] font-semibold text-white bg-[#d24b46] px-4 py-1.5 rounded-full hover:bg-[#bb3f3a] transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>

    {/* ── Mobile row ──────────────────────────────────────────── */}
    <div className="flex md:hidden items-center justify-between px-5 py-3">
      <Link href="/" className="relative h-11 w-8 shrink-0 overflow-hidden">
        <img
          alt="BloomHero Logo"
          className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
          src="/icon.png"
        />
      </Link>

      <button
        className="flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`block h-0.5 w-6 bg-[#1f1f1f] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block h-0.5 w-6 bg-[#1f1f1f] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-6 bg-[#1f1f1f] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>
    </div>

    {/* ── Mobile dropdown ─────────────────────────────────────── */}
    {menuOpen && (
      <div className="md:hidden border-t border-[#edeae6] bg-white shadow-lg flex flex-col py-3">

        {/* Greeting */}
        {user && (
          <div className="px-5 py-3 border-b border-[#f0ece8] mb-1">
            <p className="text-[13px] text-[#7a7a7a]">
              {isVendor ? (
                <>
                  Blooming as{" "}
                  <span className="font-semibold text-[#3f6f52]">{vendor_name ?? "Your Store"}</span>
                </>
              ) : (
                <>
                  Signed in as{" "}
                  <span className="font-semibold text-[#3f6f52]">{displayName}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Search */}
        {showVendorSearchBar && (
          <form onSubmit={handleNavSearch} className="px-5 py-2">
            <div className="flex items-center gap-2 bg-[#f7f4f1] border border-[#edeae6] rounded-full px-4 py-2">
              <Icon icon="mdi:magnify" width={16} height={16} className="shrink-0 text-[#b0aba5]" />
              <input
                id="navbar-search-mobile"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search flowers, vendors"
                className="w-full bg-transparent text-[14px] text-[#1f1f1f] placeholder:text-[#b0aba5] outline-none"
              />
            </div>
          </form>
        )}

        {/* Links */}
        {!isVendor && (
          items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-5 py-3 text-[15px] font-semibold transition-colors
                ${pathname === href
                  ? "text-[#d24b46] bg-[#fdf4f4]"
                  : "text-[#1f1f1f] hover:bg-[#fdf8f4]"
                }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))
        )}

        {/* Auth */}
        <div className="px-5 pt-3 mt-1 border-t border-[#f0ece8]">
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full text-[14px] font-semibold text-[#d24b46] border border-[#d24b46] px-4 py-2 rounded-full hover:bg-[#d24b46] hover:text-white transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="block text-center text-[14px] font-semibold text-white bg-[#d24b46] px-4 py-2 rounded-full hover:bg-[#bb3f3a] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    )}
  </nav>
);
}

