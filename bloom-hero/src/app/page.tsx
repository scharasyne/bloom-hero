import Footer from "@/components/footer";
import BouquetCard from "@/components/BouquetCard";
import { Icon } from "@iconify/react";
import NavBar from "@/components/navbar";
import SearchBar from "@/components/SearchBar";
import { mockBouquets } from "@/lib/mockData";

const navLogo = "/icon.png";

function Headline() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center relative shrink-0 text-center w-full">
      <div className="flex flex-col font-bold justify-center leading-[1.1] relative shrink-0 text-[#1f1f1f] text-[32px] sm:text-[48px] lg:text-[64px] tracking-[-0.64px]">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-0 relative shrink-0 text-[#6f6a65] text-[18px] tracking-[-0.09px] w-full max-w-160">
        <p className="leading-normal whitespace-pre-wrap">Search bouquets, local florists, or special occasions—all in one place.</p>
      </div>
    </div>
  );
}


function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`content-stretch flex items-center justify-center px-3.5 py-2 relative rounded-[999px] shrink-0 ${active ? "bg-[#2f5d3a]" : "bg-[#efeae4]"}`}>
      <div className={`flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[14px] text-center tracking-[-0.07px] whitespace-nowrap ${active ? "text-white" : "text-[#1f1f1f]"}`}>
        <p className="leading-[1.45]">{label}</p>
      </div>
    </div>
  );
}

function CategoryChips() {
  return (
    <div className="content-stretch flex flex-wrap gap-3 items-center justify-center relative shrink-0">
      <Chip label="All" active={true} />
      <Chip label="Bouquets" />
      <Chip label="Plants" />
      <Chip label="Handcrafted" />
    </div>
  );
}

function DropdownPill({ label }: { label: string }) {
  return (
    <div className="bg-white content-stretch flex gap-1.5 items-center px-3.5 py-2 relative rounded-2xl shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-2xl" />
      <div className="flex flex-col font-normal justify-center leading-0 relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">{label}</p>
      </div>
      <Icon icon="mdi:chevron-down" width={12} height={12} color="#1f1f1f" />
    </div>
  );
}

function Filters() {
  return (
    <div className="bg-[#f7f4ef] content-stretch flex flex-wrap gap-3 items-center justify-center relative rounded-2xl shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-2xl" />
      <DropdownPill label="Price: Any" />
      <DropdownPill label="Sort by: Best Sellers" />
      <DropdownPill label="More Filters" />
    </div>
  );
}


function CategFilter() {
  return (
    <div className="content-stretch flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 lg:gap-27 items-center justify-center relative shrink-0 w-full">
      <CategoryChips />
      <Filters />
    </div>
  );
}

function Hero() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      <CategFilter />
      <div className="bg-[#edeae6] h-px shrink-0 w-40" />
      <div className="flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[#7a7a7a] text-[15px] text-center tracking-[0.3px]">
        <p className="tracking-[0.32px]">
          <span className="leading-normal">Are you a local florist? </span>
          <a className="cursor-pointer font-bold leading-normal text-[#2f5d3a]" href="/sign-up">
            <span className="leading-normal">Join BloomHero as a Vendor</span>
          </a>
        </p>
      </div>
    </div>
  );
}

function BouquetGrid({ bouquets }: { bouquets: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row gap-6 justify-center overflow-clip relative shrink-0 w-full">
      {bouquets.map((bouquet) => (
        <BouquetCard
          key={bouquet.id}
          image={bouquet.image_url}
          name={bouquet.name}
          price={bouquet.price}
          shop={bouquet.shop_name}
          distance={bouquet.distance}
          category={bouquet.category}
          rating={bouquet.rating}
          sold={bouquet.sold_count}
        />
      ))}
    </div>
  );
}

function BestSellers() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[#8f8f8f] text-[12px] text-center tracking-[1.2px] whitespace-nowrap">
        <p><span className="leading-5.5">BEST SELLERS</span></p>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-0 relative shrink-0 text-[#1f1f1f] text-[24px] md:text-[32px] text-center tracking-[1.28px]">
        <p className="leading-[1.2]">Customer favorites, loved for any moment</p>
      </div>
      <div className="flex flex-col font-normal justify-center leading-0 relative shrink-0 text-[#7a7a7a] text-[16px] text-center tracking-[0.64px] w-full max-w-130">
        <p className="leading-normal whitespace-pre-wrap">Popular flowers from trusted local florists.</p>
      </div>
      <BouquetGrid bouquets={mockBouquets} />
    </div>
  );
}

function CategoryItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0">
      <Icon icon={icon} width={24} height={24} color="#E05850" />
      <div className="flex flex-col font-normal justify-center leading-0 relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-5.5">{label}</p>
      </div>
    </div>
  );
}

function CategoryGroup({ title, items }: { title: string; items: { icon: string; label: string }[] }) {
  return (
    <div className="content-stretch flex flex-col gap-4 items-center justify-center relative shrink-0">
      <div className="flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px]">
        <p className="leading-5.5">{title}</p>
      </div>
      <div className="content-stretch flex flex-col gap-3 items-start justify-center relative shrink-0">
        {items.map((item) => (
          <CategoryItem key={item.label} icon={item.icon} label={item.label} />
        ))}
      </div>
    </div>
  );
}


function ShopByCategory() {
  return (
    <div className="relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-8 md:gap-12 items-center justify-center p-6 md:p-16 relative w-full">
          <div className="flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[#7a7a7a] text-[12px] text-center tracking-[0.96px] whitespace-nowrap">
            <p className="leading-normal">SHOP BY CATEGORY</p>
          </div>
          <div className="flex flex-col font-semibold justify-center leading-0 relative shrink-0 text-[#1f1f1f] text-[24px] md:text-[36px] text-center tracking-[0.36px]">
            <p className="leading-[1.2]">Pick a vibe. We&apos;ll handle the flowers.</p>
          </div>
          <div className="content-stretch flex flex-col gap-8 items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-wrap gap-8 md:gap-12 items-start justify-center relative shrink-0 w-full">
              <CategoryGroup title="CELEBRATIONS & MILESTONES" items={[
                { icon: "mdi:cake-variant-outline", label: "Birthday Blooms" },
                { icon: "mdi:school-outline", label: "Graduation Cheers" },
                { icon: "mdi:star-shooting-outline", label: "New Beginnings" },
                { icon: "mdi:flower-outline", label: "Just Because" },
              ]} />

              <CategoryGroup title="LOVE & RELATIONSHIPS" items={[
                { icon: "mdi:heart-outline", label: "Love Notes in Bloom" },
                { icon: "mdi:ring", label: "Anniversary Classics" },
                { icon: "mdi:emoticon-sad-outline", label: `Say "I Miss You"` },
              ]} />

              <CategoryGroup title="CARE & SUPPORT" items={[
                { icon: "mdi:medical-bag", label: "Get Well Soon" },
                { icon: "mdi:hand-heart-outline", label: "Thinking of You" },
                { icon: "mdi:hand-okay", label: "Gentle Comfort" },
              ]} />

              <CategoryGroup title="EVERYDAY & SPECIALTY" items={[
                { icon: "mdi:leaf", label: "Plants That Last" },
                { icon: "mdi:scissors-cutting", label: "Handcrafted" },
                { icon: "mdi:storefront-outline", label: "Florist's Picks" },
              ]} />

              <CategoryGroup title="CUSTOM & FLEXIBLE" items={[
                { icon: "mdi:pencil-ruler-outline", label: "Build Your Own Bouquet" },
                { icon: "mdi:gift-outline", label: "Made Just for You" },
              ]} />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="content-stretch flex flex-col items-start px-4 sm:px-8 lg:px-16 relative size-full">
      <NavBar type="default"/>
      <Hero />
      <BestSellers />
      <ShopByCategory />
      <Footer />
    </div>
  );
}
