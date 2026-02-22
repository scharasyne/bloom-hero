// Image placeholders (replace with real images later)
import Footer from "../components/footer";

const imgLogo = "https://placehold.co/36x48?text=Logo";
const imgFreeLocationIcon2952Thumb1 = "https://placehold.co/14x20";
const imgChevron = "https://placehold.co/8x8";
const imgSearchIcon = "https://placehold.co/28x28";
const imgUntitledDesign31 = "https://placehold.co/15x15";
const imgRectangle18 = "https://placehold.co/280x260?text=Bouquet";
const imgRectangle19 = "https://placehold.co/280x260?text=Bouquet";
const imgRectangle20 = "https://placehold.co/280x260?text=Bouquet";
const imgRectangle21 = "https://placehold.co/280x260?text=Bouquet";
const imgRectangle22 = "https://placehold.co/280x260?text=Bouquet";
const imgRectangle23 = "https://placehold.co/280x260?text=Bouquet";
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

function SignInButton() {
  return (
    <div className="absolute bg-[#d24b46] bottom-0 content-stretch flex items-center justify-center px-[20px] py-[12px] right-0 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] top-0" data-name="Sign In Button">
      <a className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[0.56px] whitespace-nowrap" href="/sign-in">
        <p className="cursor-pointer leading-[1.5]">Sign In</p>
      </a>
    </div>
  );
}

function NavItems() {
  return (
    <div className="h-[44px] relative shrink-0 w-[394px]" data-name="Nav Items">
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col  font-semibold justify-center leading-[0] left-[39px] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/page-2">
        <p className="cursor-pointer leading-[1.45]">Home</p>
      </a>
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col  font-semibold justify-center leading-[0] left-[calc(50%-83.5px)] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/browse-flowers">
        <p className="cursor-pointer leading-[1.45]">Flowers</p>
      </a>
      <a className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col  font-semibold justify-center leading-[0] left-[calc(50%-9.5px)] text-[14px] text-black text-center top-1/2 tracking-[-0.07px] whitespace-nowrap" href="/browse-shops">
        <p className="cursor-pointer leading-[1.45]">Shops</p>
      </a>
      <a className="-translate-x-1/2 absolute bottom-[12px] flex flex-col  font-semibold justify-center leading-[0] left-[257px] text-[14px] text-black text-center top-[12px] tracking-[-0.07px] whitespace-nowrap" href="/about-us">
        <p className="cursor-pointer leading-[1.45]">About</p>
      </a>
      <SignInButton />
    </div>
  );
}

function NavBar() {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-full" data-name="Nav Bar">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="h-[48px] relative shrink-0 w-[36px]" data-name="logo">
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
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0 text-center w-full" data-name="Headline">
      <div className="flex flex-col  font-bold justify-center leading-[1.1] relative shrink-0 text-[#1f1f1f] text-[64px] tracking-[-0.64px] whitespace-nowrap">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <div className="flex flex-col  font-semibold h-[78px] justify-center leading-[0] relative shrink-0 text-[#6f6a65] text-[18px] tracking-[-0.09px] w-[640px]">
        <p className="leading-[1.5] whitespace-pre-wrap">Search bouquets, local florists, or special occasions—all in one place.</p>
      </div>
    </div>
  );
}

function Location() {
  return (
    <div className="bg-[#f6f2ee] content-stretch flex gap-[5px] items-center px-[14px] py-[10px] relative rounded-[14px] shrink-0" data-name="Location">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="h-[20px] relative shrink-0 w-[14px]" data-name="free-location-icon-2952-thumb 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[111.06%] left-[-29.63%] max-w-none top-[-5.93%] w-[159.26%]" src={imgFreeLocationIcon2952Thumb1} />
        </div>
      </div>
      <div className="flex flex-col  font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[-0.08px] whitespace-nowrap">
        <p className="leading-[1.5]">Cebu City</p>
      </div>
      <div className="flex items-center justify-center relative shrink-0 size-[8px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18.875" } as React.CSSProperties}>
        <div className="-rotate-90 -scale-y-100 flex-none">
          <div className="relative size-[8px]" data-name="chevron">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[209.59%] left-[154.79%] max-w-none top-[-54.79%] w-[-209.59%]" src={imgChevron} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Query() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Query">
      <div className="flex flex-col  font-semibold justify-center leading-[0] relative shrink-0 text-[#9a948f] text-[16px] text-center tracking-[-0.08px] whitespace-nowrap">
        <p className="leading-[1.5]">Search flowers, vendors, or occasions…</p>
      </div>
    </div>
  );
}

function LocPlaceholder() {
  return (
    <div className="content-stretch flex gap-[18px] items-center relative shrink-0 w-[643.5px]" data-name="Loc + Placeholder">
      <Location />
      <Query />
    </div>
  );
}

function SearchButton() {
  return (
    <div className="bg-[#2f6b4f] content-stretch flex h-[55px] items-center justify-center px-[18px] py-[12px] relative rounded-br-[24px] rounded-tr-[24px] shrink-0 w-[84px]" data-name="Search Button">
      <div className="relative shrink-0 size-[28px]" data-name="Search Icon">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-[-3.54%] max-w-none size-[198.7%] top-[-3.46%]" src={imgSearchIcon} />
        </div>
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="bg-white content-stretch flex h-[57px] items-center justify-between pl-[16px] py-[16px] relative rounded-[24px] shrink-0 w-[960px]" data-name="Search Bar">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.1)]" />
      <LocPlaceholder />
      <SearchButton />
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-[#2f5d3a] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0" data-name="Chip">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">All</p>
      </div>
    </div>
  );
}

function Chip1() {
  return (
    <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0" data-name="Chip">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">Bouquets</p>
      </div>
    </div>
  );
}

function Chip2() {
  return (
    <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0" data-name="Chip">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">Plants</p>
      </div>
    </div>
  );
}

function Chip3() {
  return (
    <div className="bg-[#efeae4] content-stretch flex items-center justify-center px-[14px] py-[8px] relative rounded-[999px] shrink-0" data-name="Chip">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">Handcrafted</p>
      </div>
    </div>
  );
}

function CategoryChips() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Chips">
      <Chip />
      <Chip1 />
      <Chip2 />
      <Chip3 />
    </div>
  );
}

function DropdownPill() {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-start px-[14px] py-[8px] relative rounded-[12px] shrink-0" data-name="Dropdown Pill">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">Price: Any</p>
      </div>
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18.875" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[12px] relative w-[15px]" data-name="Untitled design (2) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[198.22%] left-[-7.37%] max-w-none top-[-46.27%] w-[161.19%]" src={imgChevron} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropdownPill1() {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-start px-[14px] py-[8px] relative rounded-[12px] shrink-0" data-name="Dropdown Pill">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">Sort by: Best Sellers</p>
      </div>
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18.875" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[12px] relative w-[15px]" data-name="Untitled design (2) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[198.22%] left-[-7.37%] max-w-none top-[-46.27%] w-[161.19%]" src={imgChevron} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropdownPill2() {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-start px-[14px] py-[8px] relative rounded-[12px] shrink-0" data-name="Dropdown Pill">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">More Filters</p>
      </div>
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18.875" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[12px] relative w-[15px]" data-name="Untitled design (2) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[198.22%] left-[-7.37%] max-w-none top-[-46.27%] w-[161.19%]" src={imgChevron} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Filters() {
  return (
    <div className="bg-[#f7f4ef] content-stretch flex gap-[12px] items-center justify-center relative rounded-[12px] shrink-0" data-name="Filters">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <DropdownPill />
      <DropdownPill1 />
      <DropdownPill2 />
    </div>
  );
}

function FilterRow() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Filter Row">
      <Filters />
    </div>
  );
}

function CategFilter() {
  return (
    <div className="content-stretch flex gap-[108px] items-center justify-center relative shrink-0" data-name="Categ + Filter">
      <CategoryChips />
      <FilterRow />
    </div>
  );
}

function Hero() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center py-[64px] relative shrink-0 w-full" data-name="Hero">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      <CategFilter />
      <div className="bg-[#edeae6] h-px shrink-0 w-[160px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[15px] text-center tracking-[0.3px] whitespace-nowrap">
        <p className="tracking-[0.32px]">
          <span className="leading-[1.5]">{`Are you a local florist? `}</span>
          <a className="cursor-pointer  font-bold leading-[1.5] text-[#2f5d3a]" href="/register-as-vendor">
            <span className="leading-[1.5]">Join BloomHero as a Vendor</span>
          </a>
        </p>
      </div>
    </div>
  );
}

function Headline1() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline1 />
      <Location1 />
      <Descriptioon />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle18} />
      </div>
      <Text />
    </div>
  );
}

function Headline2() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill1() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill1 />
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline2 />
      <Location2 />
      <Descriptioon1 />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard1() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle18} />
      </div>
      <Text1 />
    </div>
  );
}

function Headline3() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill2() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill2 />
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline3 />
      <Location3 />
      <Descriptioon2 />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard2() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle18} />
      </div>
      <Text2 />
    </div>
  );
}

function BouquetGrid() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center overflow-clip relative shrink-0 w-full" data-name="Bouquet Grid">
      <BouquetCard />
      <BouquetCard1 />
      <BouquetCard2 />
    </div>
  );
}

function Headline4() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill3() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill3 />
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline4 />
      <Location4 />
      <Descriptioon3 />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard3() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle21} />
      </div>
      <Text3 />
    </div>
  );
}

function Headline5() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill4() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill4 />
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline5 />
      <Location5 />
      <Descriptioon4 />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard4() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle22} />
      </div>
      <Text4 />
    </div>
  );
}

function Headline6() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Headline">
      <div className="flex flex-col  font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[18px] tracking-[-0.09px]">
        <p className="leading-[1.45]">Classic Red Roses</p>
      </div>
      <div className="flex flex-col  font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[20px] tracking-[-0.1px]">
        <p className="leading-[22px]">₱ 600</p>
      </div>
    </div>
  );
}

function Location6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Location">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[15px]" data-name="Untitled design (3) 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUntitledDesign31} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[13px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[22px]">Econo Flowers · 1.2 km</p>
      </div>
    </div>
  );
}

function Pill5() {
  return (
    <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0" data-name="Pill">
      <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[13px] tracking-[-0.065px] whitespace-nowrap">
        <p className="leading-[16px]">All-occasion</p>
      </div>
    </div>
  );
}

function Descriptioon5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Descriptioon">
      <Pill5 />
    </div>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-[280px]" data-name="Text">
      <Headline6 />
      <Location6 />
      <Descriptioon5 />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#f4b400] text-[0px] text-center tracking-[-0.065px] whitespace-nowrap">
        <p className="text-[13px]">
          <span className="leading-[22px]">{`★ `}</span>
          <span className="leading-[22px] text-[#7a7a7a]">4.9 (67 sold)</span>
        </p>
      </div>
    </div>
  );
}

function BouquetCard5() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={imgRectangle23} />
      </div>
      <Text5 />
    </div>
  );
}

function BouquetGrid1() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center overflow-clip relative shrink-0 w-full" data-name="Bouquet Grid">
      <BouquetCard3 />
      <BouquetCard4 />
      <BouquetCard5 />
    </div>
  );
}

function BestSellers() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center py-[64px] relative shrink-0 w-full" data-name="Best Sellers">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#8f8f8f] text-[12px] text-center tracking-[1.2px] whitespace-nowrap">
        <p><span className="leading-[22px]">BEST SE</span><span className="leading-[22px] tracking-[1.28px]">L</span><span className="leading-[22px]">LERS</span></p>
      </div>
      <div className="flex flex-col  font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[32px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[1.2]">Customer favorites, loved for any moment</p>
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[16px] text-center tracking-[0.64px] w-[520px]">
        <p className="leading-[1.5] whitespace-pre-wrap">Popular flowers from trusted local florists.</p>
      </div>
      <BouquetGrid />
      <BouquetGrid1 />
    </div>
  );
}

function CategoryItem() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle24} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Birthday Blooms</p>
      </div>
    </div>
  );
}

function CategoryItem1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle25} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Graduation Cheers</p>
      </div>
    </div>
  );
}

function CategoryItem2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle26} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">New Beginnings</p>
      </div>
    </div>
  );
}

function CategoryItem3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle27} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Just Because</p>
      </div>
    </div>
  );
}

function CategoryItems() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0" data-name="Category Items">
      <CategoryItem />
      <CategoryItem1 />
      <CategoryItem2 />
      <CategoryItem3 />
    </div>
  );
}

function CategoryGroup() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0" data-name="Category Group">
      <div className="flex flex-col  font-semibold justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{`CELEBRATIONS & MILESTONES`}</p>
      </div>
      <CategoryItems />
    </div>
  );
}

function CategoryItem4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle28} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Love Notes in Bloom</p>
      </div>
    </div>
  );
}

function CategoryItem5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle29} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Anniversary Classics</p>
      </div>
    </div>
  );
}

function CategoryItem6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle30} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Say "I Miss You"</p>
      </div>
    </div>
  );
}

function CategoryItems1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0" data-name="Category Items">
      <CategoryItem4 />
      <CategoryItem5 />
      <CategoryItem6 />
    </div>
  );
}

function CategoryGroup1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0" data-name="Category Group">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{`LOVE & RELATIONSHIPS`}</p>
      </div>
      <CategoryItems1 />
    </div>
  );
}

function CategoryItem7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle31} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Get Well Soon</p>
      </div>
    </div>
  );
}

function CategoryItem8() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle32} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Thinking of You</p>
      </div>
    </div>
  );
}

function CategoryItem9() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle33} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Gentle Comfort</p>
      </div>
    </div>
  );
}

function CategoryItems2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Category Items">
      <CategoryItem7 />
      <CategoryItem8 />
      <CategoryItem9 />
    </div>
  );
}

function CategoryGroup2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0" data-name="Category Group">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{`CARE & SUPPORT`}</p>
      </div>
      <CategoryItems2 />
    </div>
  );
}

function CategoryGrid() {
  return (
    <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full" data-name="Category Grid">
      <CategoryGroup />
      <CategoryGroup1 />
      <CategoryGroup2 />
    </div>
  );
}

function CategoryItem10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle34} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Plants That Last</p>
      </div>
    </div>
  );
}

function CategoryItem11() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle35} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Handcrafted</p>
      </div>
    </div>
  );
}

function CategoryItem12() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle36} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Florist's Picks</p>
      </div>
    </div>
  );
}

function CategoryItems3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Category Items">
      <CategoryItem10 />
      <CategoryItem11 />
      <CategoryItem12 />
    </div>
  );
}

function CategoryGroup3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0" data-name="Category Group">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{`EVERYDAY & SPECIALTY`}</p>
      </div>
      <CategoryItems3 />
    </div>
  );
}

function CategoryItem13() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle37} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Build Your Own Bouquet</p>
      </div>
    </div>
  );
}

function CategoryItem14() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Category Item">
      <div className="relative rounded-[6px] shrink-0 size-[24px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle38} />
      </div>
      <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
        <p className="leading-[22px]">Made Just for You</p>
      </div>
    </div>
  );
}

function CategoryItems4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Category Items">
      <CategoryItem13 />
      <CategoryItem14 />
    </div>
  );
}

function CategoryGroup4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0" data-name="Category Group">
      <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">
        <p className="leading-[22px]">{`CUSTOM & FLEXIBLE `}</p>
      </div>
      <CategoryItems4 />
    </div>
  );
}

function CategoryGrid1() {
  return (
    <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full" data-name="Category Grid">
      <CategoryGroup3 />
      <CategoryGroup4 />
    </div>
  );
}

function CategoriesContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Categories Container">
      <CategoryGrid />
      <CategoryGrid1 />
    </div>
  );
}

function ShopByCategory() {
  return (
    <div className="relative shrink-0 w-full" data-name="Shop By Category">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[48px] items-center justify-center p-[64px] relative w-full">
          <div className="flex flex-col  font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[12px] text-center tracking-[0.96px] whitespace-nowrap">
            <p className="leading-[1.5]">SHOP BY CATEGORY</p>
          </div>
          <div className="flex flex-col  font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[36px] text-center tracking-[0.36px] whitespace-nowrap">
            <p className="leading-[1.2]">Pick a vibe. We'll handle the flowers.</p>
          </div>
          <div className="flex flex-col  font-normal justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[16px] text-center tracking-[1.28px] whitespace-nowrap">
            <p className="leading-[24px]">Explore flowers curated for life's moments.</p>
          </div>
          <CategoriesContainer />
        </div>
      </div>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="content-stretch flex flex-col items-start px-[64px] relative size-full" data-name="Desktop">
      <NavBar />
      <Hero />
      <BestSellers />
      <ShopByCategory />
      <Footer />
    </div>
  );
}
