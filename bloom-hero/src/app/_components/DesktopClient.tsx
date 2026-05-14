"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
// import Link from "next/link";
import BestSellersSection from "@/components/BestSellersSection";
import Footer from "@/components/footer";
import SearchBar from "@/components/SearchBar";
import PopUpMap from "@/features/pop-up/components/PopUpMap";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getPopUpMapVendors } from "@/app/map/actions";
// import { mockBouquets } from "@/lib/mockData";
import { PopUpMapVendor } from "@/types";

// const ALL_BOUQUETS = [...mockBouquets].sort((a, b) => b.sold_count - a.sold_count);
// const MAX_VISIBLE = 6;

// type Category = "All" | "Bouquets" | "Plants" | "Handcrafted";
// const CATEGORIES: Category[] = ["All", "Bouquets", "Plants", "Handcrafted"];

function useVendorNavigation() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return user;
}

function Headline() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center text-center w-full">
      <div className="flex flex-col font-bold leading-[1.1] text-[#1f1f1f] text-[32px] sm:text-[48px] lg:text-[64px] tracking-[-0.64px]">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <p className="font-semibold text-[#6f6a65] text-[16px] tracking-[-0.09px] max-w-xl leading-normal">
        Search bouquets, local florists, or special occasions—all in one place.
      </p>
    </div>
  );
}

// function DropdownPill({ label }: { label: string }) {
//   return (
//     <div className="flex gap-1.5 items-center px-2.5 py-1 cursor-pointer hover:bg-[#ede9e3] rounded-xl transition-colors">
//       <p className="font-normal text-[#1f1f1f] text-[12px] whitespace-nowrap">{label}</p>
//       <Icon icon="mdi:chevron-down" width={10} height={10} color="#1f1f1f" />
//     </div>
//   );
// }

// function Filters() {
//   return (
//     <div className="flex flex-wrap gap-1 items-center justify-center bg-[#f0ece6] rounded-2xl px-2 py-1.5">
//       <DropdownPill label="Price: Any" />
//       <div className="w-px h-4 bg-[#ddd8d0]" />
//       <DropdownPill label="Sort by: Best Sellers" />
//       <div className="w-px h-4 bg-[#ddd8d0]" />
//       <DropdownPill label="More Filters" />
//     </div>
//   );
// }

function Hero() {
  const router = useRouter();
  const user = useVendorNavigation();

  const handleVendorClick = () => {
    if (user) {
      router.push("/vendor-application");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      {/* <Filters /> */}
      <div className="bg-[#edeae6] h-px w-40" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-medium text-[#7a7a7a] text-[15px] tracking-[0.3px]">
          <span>Are you a local florist? </span>
          <button 
            onClick={handleVendorClick}
            className="cursor-pointer font-bold text-[#2f5d3a] bg-none border-none p-0 hover:underline"
          >
            Join BloomHero as a Vendor
          </button>
        </p>
      </div>
    </div>
  );
}

function PopUpMapSection() {
  const [vendors, setVendors] = useState<PopUpMapVendor[] | null>(null);

  useEffect(() => {
    getPopUpMapVendors().then(setVendors);
  }, []);

  if (vendors === null) return null; // wait until loaded

  return <PopUpMap initialVendors={vendors} />;
}

const categoryGroups = [
  {
    title: "CELEBRATIONS & MILESTONES",
    items: [
      { icon: "mdi:cake-variant-outline", label: "Birthday Blooms", href: "/search?scope=flowers&category=birthday" },
      { icon: "mdi:school-outline", label: "Graduation Cheers", href: "/search?scope=flowers&category=graduation" },
      { icon: "mdi:star-shooting-outline", label: "New Beginnings", href: "/search?scope=flowers&category=new-beginnings" },
    ],
  },
  {
    title: "LOVE & RELATIONSHIPS",
    items: [
      { icon: "mdi:heart-outline", label: "Love Notes in Bloom", href: "/search?scope=flowers&category=love-notes" },
      { icon: "mdi:ring", label: "Anniversary Classics", href: "/search?scope=flowers&category=anniversary" },
      { icon: "mdi:emoticon-sad-outline", label: "Missing You", href: "/search?scope=flowers&category=missing-you" },
    ],
  },
  {
    title: "CARE & SUPPORT",
    items: [
      { icon: "mdi:medical-bag", label: "Get Well Soon", href: "/search?scope=flowers&category=get-well" },
      { icon: "mdi:hand-okay", label: "Gentle Comfort", href: "/search?scope=flowers&category=gentle-comfort" },
      { icon: "mdi:flower-outline", label: "In Loving Memory", href: "/search?scope=flowers&category=in-loving-memory" },
    ],
  },
  {
    title: "EVERYDAY & SPECIALTY",
    items: [
      { icon: "mdi:scissors-cutting", label: "Handcrafted", href: "/search?scope=flowers&category=handcrafted" },
      { icon: "mdi:gift-outline", label: "Just Because", href: "/search?scope=flowers&category=just-because" },
      { icon: "mdi:storefront-outline", label: "Florists' Picks", href: "/search?scope=flowers&category=florists-picks" },
    ],
  },
];

function CategoryItem({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex gap-3 items-center group">
      <Icon icon={icon} width={24} height={24} color="#d24b46" />
      <span className="font-normal text-[#2f5d3a] text-[16px] tracking-[1.28px] leading-5.5 group-hover:underline group-hover:text-[#1f3d26] transition-colors whitespace-nowrap">
        {label}
      </span>
    </a>
  );
}

function CategoryGroup({ title, items }: { title: string; items: { icon: string; label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="font-medium text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">{title}</p>
      <div className="flex flex-col gap-3 items-center">
        {items.map((item) => (
          <CategoryItem key={item.label} icon={item.icon} label={item.label} href={item.href} />
        ))}
      </div>
    </div>
  );
}

function ShopByCategory() {
  return (
    <div className="relative shrink-0 w-full">
      <div
        aria-hidden="true"
        className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none"
      />
      <div className="flex flex-col gap-5 md:gap-8 items-center justify-center p-6 md:p-16 w-full max-w-6xl mx-auto">
        <p className="font-medium text-[#7a7a7a] text-[14px] text-center tracking-[0.96px]">
          SHOP BY CATEGORY
        </p>
        <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[36px] text-center tracking-[0.36px] leading-[1.2]">
          Pick a vibe. We&apos;ll handle the flowers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 w-full max-w-6xl mx-auto">
          {categoryGroups.map((group) => (
            <CategoryGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DesktopClient() {
  return (
    <div className="content-stretch flex flex-col items-start px-4 sm:px-8 lg:px-16 relative size-full">
      <Hero />
      <BestSellersSection />
      <PopUpMapSection />
      <ShopByCategory />
      <Footer />
    </div>
  );
}