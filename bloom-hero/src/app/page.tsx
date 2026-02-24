import Footer from "../components/footer";
import BouquetCard from "../components/BouquetCard";

const imgLogo = "https://placehold.co/36x48?text=Logo";
const imgFreeLocationIcon2952Thumb1 = "https://placehold.co/14x20";
const imgChevron = "https://placehold.co/8x8";
const imgSearchIcon = "https://placehold.co/28x28";
const imgUntitledDesign31 = "https://placehold.co/15x15";
const imgRectangle24 = "https://placehold.co/24x24";
const imgRectangle25 = "https://placehold.co/24x24";
const imgRectangle26 = "https://placehold.co/24x24";
const imgRectangle27 = "https://placehold.co/24x24";
const imgRectangle28 = "https://placehold.co/24x24";
const imgRectangle29 = "https://placehold.co/24x24";
const imgRectangle30 = "https://placehold.co/24x24";
const imgRectangle31 = "https://placehold.co/24x24";
const imgRectangle32 = "https://placehold.co/24x24";
const imgRectangle33 = "https://placehold.co/24x24";
const imgRectangle34 = "https://placehold.co/24x24";
const imgRectangle35 = "https://placehold.co/24x24";
const imgRectangle36 = "https://placehold.co/24x24";
const imgRectangle37 = "https://placehold.co/24x24";
const imgRectangle38 = "https://placehold.co/24x24";

const mockBouquets = [
  { id: 1, image_url: "https://placehold.co/280x260?text=Bouquet", name: "Classic Red Roses", price: 600, shop_name: "Econo Flowers", distance: "1.2 km", category: "All-occasion", rating: 4.9, sold_count: 67 },
  { id: 2, image_url: "https://placehold.co/280x260?text=Bouquet", name: "Sunflower Bliss", price: 450, shop_name: "Bloom Studio", distance: "0.8 km", category: "Birthday", rating: 4.8, sold_count: 43 },
  { id: 3, image_url: "https://placehold.co/280x260?text=Bouquet", name: "Pink Peonies", price: 750, shop_name: "Petal & Co.", distance: "2.1 km", category: "Anniversary", rating: 5.0, sold_count: 91 },
];

function SignInButton() {
  return (
    <div className="absolute bg-[#d24b46] bottom-0 content-stretch flex items-center justify-center px-[20px] py-[12px] right-0 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] top-0">
      <a className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[0.56px] whitespace-nowrap" href="/sign-in">
        <p className="cursor-pointer leading-[1.5]">Sign In</p>
      </a>
    </div>
  );
}

function NavItems() {
  return (
    <div className="h-[44px] relative shrink-0 w-[394px]">
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col font-semibold justify-center leading-[0] left-[39px] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/page-2">
        <p className="cursor-pointer leading-[1.45]">Home</p>
      </a>
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col font-semibold justify-center leading-[0] left-[calc(50%-83.5px)] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/browse-flowers">
        <p className="cursor-pointer leading-[1.45]">Flowers</p>
      </a>
      <a className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-semibold justify-center leading-[0] left-[calc(50%-9.5px)] text-[14px] text-black text-center top-1/2 tracking-[-0.07px] whitespace-nowrap" href="/browse-shops">
        <p className="cursor-pointer leading-[1.45]">Shops</p>
      </a>
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col font-semibold justify-center leading-[0] left-[257px] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/about-us">
        <p className="cursor-pointer leading-[1.45]">About</p>
      </a>
      <SignInButton />
    </div>
  );
}

function NavBar() {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="h-[48px] relative shrink-0 w-[36px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]" src={imgLogo} />
        </div>
      </div>
      <NavItems />
    </div>
  );
}

function Headline() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0 text-center w-full">
      <div className="flex flex-col font-bold justify-center leading-[1.1] relative shrink-0 text-[#1f1f1f] text-[64px] tracking-[-0.64px] whitespace-nowrap">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <div className="flex flex-col font-semibold h-[78px] justify-center leading-[0] relative shrink-0 text-[#6f6a65] text-[18px] tracking-[-0.09px] w-[640px]">
        <p className="leading-[1.5] whitespace-pre-wrap">Search bouquets, local florists, or special occasions—all in one place.</p>
      </div>
    </div>
  );
}

function Location() {
  return (
    <div className="bg-[#f6f2ee] content-stretch flex gap-[5px] items-center px-[14px] py-[10px] relative rounded-[14px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="h-[20px] relative shrink-0 w-[14px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[111.06%] left-[-29.63%] max-w-none top-[-5.93%] w-[159.26%]" src={imgFreeLocationIcon2952Thumb1} />
        </div>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[-0.08px] whitespace-nowrap">
        <p className="leading-[1.5]">Cebu City</p>
      </div>
    </div>
  );
}

function Query() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#9a948f] text-[16px] text-center tracking-[-0.08px] whitespace-nowrap">
        <p className="leading-[1.5]">Search flowers, vendors, or occasions…</p>
      </div>
    </div>
  );
}

function LocPlaceholder() {
  return (
    <div className="content-stretch flex gap-[18px] items-center relative shrink-0 w-[643.5px]">
      <Location />
      <Query />
    </div>
  );
}

function SearchButton() {
  return (
    <div className="bg-[#2f6b4f] content-stretch flex h-[55px] items-center justify-center px-[18px] py-[12px] relative rounded-br-[24px] rounded-tr-[24px] shrink-0 w-[84px]">
      <div className="relative shrink-0 size-[28px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-[-3.54%] max-w-none size-[198.7%] top-[-3.46%]" src={imgSearchIcon} />
        </div>
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="bg-white content-stretch flex h-[57px] items-center justify-between pl-[16px] py-[16px] relative rounded-[24px] shrink-0 w-[960px]">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.1)]" />
      <LocPlaceholder />
      <SearchButton />
    </div>
  );
}

// function Chip() {
//   return (
//     <div className="bg-[#2f5d3a] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0">
//       <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[-0.07px] whitespace-nowrap">
//         <p className="leading-[1.45]">All</p>
//       </div>
//     </div>
//   );
// }

// function Chip1() {
//   return (
//     <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0">
//       <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
//         <p className="leading-[1.45]">Bouquets</p>
//       </div>
//     </div>
//   );
// }

// function Chip2() {
//   return (
//     <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0">
//       <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
//         <p className="leading-[1.45]">Plants</p>
//       </div>
//     </div>
//   );
// }

// function Chip3() {
//   return (
//     <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0">
//       <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
//         <p className="leading-[1.45]">Handcrafted</p>
//       </div>
//     </div>
//   );
// }

function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0 ${active ? "bg-[#2f5d3a]" : "bg-[#efeae4]"}`}>
      <div className={`flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center tracking-[-0.07px] whitespace-nowrap ${active ? "text-white" : "text-[#1f1f1f]"}`}>
        <p className="leading-[1.45]">{label}</p>
      </div>
    </div>
  );
}


function CategoryChips() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0">
      <Chip label="All" active={true} />
      <Chip label="Bouquets" />
      <Chip label="Plants" />
      <Chip label="Handcrafted" />
    </div>
  );
}

function DropdownPill({ label }: { label: string }) {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-start px-[14px] py-[8px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">{label}</p>
      </div>
    </div>
  );
}


function Filters() {
  return (
    <div className="bg-[#f7f4ef] content-stretch flex gap-[12px] items-center justify-center relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <DropdownPill label="Price: Any" />
      <DropdownPill label="Sort by: Best Sellers" />
      <DropdownPill label="More Filters" />
    </div>
  );
}


function CategFilter() {
  return (
    <div className="content-stretch flex gap-[108px] items-center justify-center relative shrink-0">
      <CategoryChips />
      <Filters />
    </div>
  );
}

function Hero() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center py-[64px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      <CategFilter />
      <div className="bg-[#edeae6] h-px shrink-0 w-[160px]" />
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[15px] text-center tracking-[0.3px] whitespace-nowrap">
        <p className="tracking-[0.32px]">
          <span className="leading-[1.5]">Are you a local florist? </span>
          <a className="cursor-pointer font-bold leading-[1.5] text-[#2f5d3a]" href="/register-as-vendor">
            <span className="leading-[1.5]">Join BloomHero as a Vendor</span>
          </a>
        </p>
      </div>
    </div>
  );
}

function BouquetGrid({ bouquets }: { bouquets: any[] }) {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center overflow-clip relative shrink-0 w-full">
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
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center py-[64px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#8f8f8f] text-[12px] text-center tracking-[1.2px] whitespace-nowrap">
        <p><span className="leading-[22px]">BEST SELLERS</span></p>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[32px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[1.2]">Customer favorites, loved for any moment</p>
      </div>
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[16px] text-center tracking-[0.64px] w-[520px]">
        <p className="leading-[1.5] whitespace-pre-wrap">Popular flowers from trusted local florists.</p>
      </div>
      <BouquetGrid bouquets={mockBouquets} />
    </div>
  );
}

function CategoryItem({ src, label }: { src: string; label: string }) {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={src} />
      </div>
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">{label}</p>
      </div>
    </div>
  );
}

function CategoryGroup({ title, items }: { title: string; items: { src: string; label: string }[] }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0">
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{title}</p>
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0">
        {items.map((item) => (
          <CategoryItem key={item.label} src={item.src} label={item.label} />
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
        <div className="content-stretch flex flex-col gap-[48px] items-center justify-center p-[64px] relative w-full">
          <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[12px] text-center tracking-[0.96px] whitespace-nowrap">
            <p className="leading-[1.5]">SHOP BY CATEGORY</p>
          </div>
          <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[36px] text-center tracking-[0.36px] whitespace-nowrap">
            <p className="leading-[1.2]">Pick a vibe. We&apos;ll handle the flowers.</p>
          </div>
          <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full">
              <CategoryGroup title="CELEBRATIONS & MILESTONES" items={[
                { src: imgRectangle24, label: "Birthday Blooms" },
                { src: imgRectangle25, label: "Graduation Cheers" },
                { src: imgRectangle26, label: "New Beginnings" },
                { src: imgRectangle27, label: "Just Because" },
              ]} />
              <CategoryGroup title="LOVE & RELATIONSHIPS" items={[
                { src: imgRectangle28, label: "Love Notes in Bloom" },
                { src: imgRectangle29, label: "Anniversary Classics" },
                { src: imgRectangle30, label: `Say "I Miss You"` },
              ]} />
              <CategoryGroup title="CARE & SUPPORT" items={[
                { src: imgRectangle31, label: "Get Well Soon" },
                { src: imgRectangle32, label: "Thinking of You" },
                { src: imgRectangle33, label: "Gentle Comfort" },
              ]} />
            </div>
            <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full">
              <CategoryGroup title="EVERYDAY & SPECIALTY" items={[
                { src: imgRectangle34, label: "Plants That Last" },
                { src: imgRectangle35, label: "Handcrafted" },
                { src: imgRectangle36, label: "Florist's Picks" },
              ]} />
              <CategoryGroup title="CUSTOM & FLEXIBLE" items={[
                { src: imgRectangle37, label: "Build Your Own Bouquet" },
                { src: imgRectangle38, label: "Made Just for You" },
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
    <div className="content-stretch flex flex-col items-start px-[64px] relative size-full">
      <NavBar />
      <Hero />
      <BestSellers />
      <ShopByCategory />
      <Footer />
    </div>
  );
}
