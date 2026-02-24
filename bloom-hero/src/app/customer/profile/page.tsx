"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser-client";

interface PurchaseItem {
  id: string;
  vendor: string;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  vendor: string;
  items: PurchaseItem[];
  total_amount: number;
  status: "to_pay" | "to_ship" | "to_receive" | "completed";
  created_at: string;
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"to_pay" | "to_ship" | "to_receive" | "completed">("to_pay");

  // Sample purchase data
  const mockOrders: Order[] = [
    {
      id: "1",
      vendor: "Bloom & Co.",
      items: [
        {
          id: "1a",
          vendor: "Bloom & Co.",
          product_name: "Roses",
          quantity: 1,
          price: 360,
          image: "/product-image-1.jpg",
        },
        {
          id: "1b",
          vendor: "Bloom & Co.",
          product_name: "Tulips",
          quantity: 2,
          price: 120,
          image: "/product-image-2.jpg",
        },
      ],
      total_amount: 480,
      status: "to_pay",
      created_at: "2024-02-20",
    },
    {
      id: "2",
      vendor: "Petrol & Stem",
      items: [
        {
          id: "2a",
          vendor: "Petrol & Stem",
          product_name: "Tulips",
          quantity: 2,
          price: 100,
          image: "/product-image-3.jpg",
        },
      ],
      total_amount: 200,
      status: "to_ship",
      created_at: "2024-02-18",
    },
    {
      id: "3",
      vendor: "Flor",
      items: [
        {
          id: "3a",
          vendor: "Flor",
          product_name: "Daisies",
          quantity: 3,
          price: 60,
          image: "/product-image-4.jpg",
        },
      ],
      total_amount: 180,
      status: "to_receive",
      created_at: "2024-02-15",
    },
  ];

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.replace("/login");
        return;
      }

      const role = authUser?.user_metadata?.role as string | undefined;

      if (role === "vendor") {
        router.replace("/vendor/dashboard");
        return;
      }

      setUser(authUser);
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
        Loading profile...
      </div>
    );
  }

  const filteredOrders = mockOrders.filter((order) => order.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-gray-800 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Image
            src="/navbar-logo.png"
            alt="BloomHero Logo"
            width={32}
            height={32}
          />
          <span className="font-semibold text-[#d24b46]">BloomHero</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-[#d24b46]">
            Home
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            Explore
          </Link>
          <Link href="#" className="hover:text-[#d24b46]">
            Cart
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-4 rounded-full bg-[#d24b46] px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Sign out
          </button>
        </nav>
      </header>

      <main className="flex flex-1 px-8 py-8 flex-col items-center">
        {/* Profile section */}
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {user?.user_metadata?.full_name || "Customer Profile"}
            </h1>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Purchase History</h2>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200">
              {["to_pay", "to_ship", "to_receive", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab as "to_pay" | "to_ship" | "to_receive" | "completed")
                  }
                  className={`pb-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? "text-[#d24b46] border-b-2 border-[#d24b46]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "to_pay"
                    ? "To Pay"
                    : tab === "to_ship"
                      ? "To Ship"
                      : tab === "to_receive"
                        ? "To Receive"
                        : "Completed"}
                </button>
              ))}
            </div>

            {/* Orders */}
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No orders in this category
                </p>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    {/* Vendor info */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">
                        {order.vendor}
                      </h3>
                      {activeTab === "to_pay" && (
                        <button className="text-sm text-[#d24b46] font-medium hover:underline">
                          To Pay
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 mb-3"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.product_name}
                              width={64}
                              height={64}
                              className="rounded-lg"
                            />
                          ) : (
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₱ {item.price} each
                          </p>
                        </div>
                        <p className="font-medium text-gray-800">
                          {item.quantity}x
                        </p>
                        <p className="font-semibold text-gray-800 w-20 text-right">
                          ₱ {item.quantity * item.price}
                        </p>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="font-semibold text-gray-800">
                        ₱ {order.total_amount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
