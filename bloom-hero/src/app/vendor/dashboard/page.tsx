"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser-client";

export default function VendorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role = user?.user_metadata?.role as string | undefined;

      if (!user) {
        router.replace("/login");
        return;
      }

      if (role !== "vendor") {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    checkRole();
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ee] text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-gray-800 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm">
          <span>You are signed in as</span>
          <span className="font-semibold text-[#d24b46]">Bloom &amp; Co.</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-[#d24b46]">
            Home
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            Explore
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            Orders
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-4 rounded-full bg-[#d24b46] px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Sign out
          </button>
        </nav>
      </header>

      <main className="flex flex-1 px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-60 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/navbar-logo.png"
              alt="BloomHero Logo"
              width={40}
              height={40}
            />
            <div>
              <p className="text-xs text-gray-500">Vendor Dashboard</p>
              <p className="text-sm font-semibold">Bloom &amp; Co.</p>
            </div>
          </div>
          <nav className="space-y-1 text-sm">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-[#f5e4da] text-[#d24b46] font-medium">
              Dashboard
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              Products
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              Orders
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              Messages
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
              Profile
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Here&apos;s what&apos;s happening with your shop.
            </p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Revenue</p>
              <p className="text-xl font-semibold">₱ 72,355</p>
              <p className="text-xs text-green-600 mt-1">+12.4% vs last month</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Orders</p>
              <p className="text-xl font-semibold">123</p>
              <p className="text-xs text-green-600 mt-1">+8.1% vs last month</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Products listed</p>
              <p className="text-xl font-semibold">42</p>
              <p className="text-xs text-gray-400 mt-1">No change</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Orders to fulfill</p>
              <p className="text-xl font-semibold">8</p>
              <p className="text-xs text-red-500 mt-1">3 overdue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sales overview (placeholder chart) */}
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Sales Overview</p>
                <select className="text-xs border border-gray-200 rounded-full px-3 py-1 bg-white">
                  <option>Last 6 months</option>
                  <option>Last 30 days</option>
                  <option>This week</option>
                </select>
              </div>
              <div className="h-52 flex items-center justify-center text-xs text-gray-400 bg-[#faf5f0] rounded-xl border border-dashed border-gray-200">
                Sales chart placeholder
              </div>
            </div>

            {/* Upcoming orders */}
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Upcoming Orders</p>
                <p className="text-xs text-gray-500">February 2025</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#faf5f0]">
                  <span>3 orders</span>
                  <span className="text-xs text-gray-500">Today</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span>2 orders</span>
                  <span className="text-xs text-gray-500">Tomorrow</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span>5 orders</span>
                  <span className="text-xs text-gray-500">This week</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Recent Orders</p>
              <button className="text-xs text-[#d24b46] hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">Juan Dela Cruz</p>
                  <p className="text-xs text-gray-500">Bouquet - Classic Roses</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#d24b46]">₱ 1,899</p>
                  <p className="text-xs text-gray-500">Order #219</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">Anna Santos</p>
                  <p className="text-xs text-gray-500">Bouquet - Sunflower Joy</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#d24b46]">₱ 2,350</p>
                  <p className="text-xs text-gray-500">Order #218</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">Mark Reyes</p>
                  <p className="text-xs text-gray-500">Subscription - Weekly Blooms</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#d24b46]">₱ 3,499</p>
                  <p className="text-xs text-gray-500">Order #217</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-between px-8 py-4 text-xs text-gray-500 border-t border-gray-200 bg-white">
        <span>BloomHero © 2026</span>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-[#d24b46]">
            Features
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            How it Works
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            About
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            FAQs
          </Link>
        </div>
      </footer>
    </div>
  );
}

