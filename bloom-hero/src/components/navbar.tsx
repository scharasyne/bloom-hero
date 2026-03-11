"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/browse-flowers", label: "Flowers" },
  { href: "/browse-shops", label: "Shops" },
  { href: "/about-us", label: "About" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[16px] font-semibold text-black tracking-[-0.07px] hover:text-[#d24b46] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="bg-[#d24b46] text-white text-[16px] font-medium tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
          >
            Sign In
          </Link>
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
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-6 py-3 text-[16px] font-semibold text-black tracking-[-0.07px] hover:bg-[#fdf8f4] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="px-6 pt-3">
            <Link
              href="/login"
              className="block bg-[#d24b46] text-white text-[16px] font-medium text-center tracking-[0.56px] px-5 py-3 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:bg-[#bb3f3a] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
