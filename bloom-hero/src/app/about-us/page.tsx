import { Icon } from "@iconify/react";
import Footer from "@/components/footer";

const imgSunstarImportUploadsImages20181031988101 = "/choose.png";
const imgRectangle25 = "/1local.jpg";
const imgRectangle26 = "/2local.jpg";
const imgRectangle27 = "/3local.jpg";

function AboutHero() {
  return (
    <div className="content-stretch flex flex-col gap-4 items-center justify-center py-12 md:py-24 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="content-stretch flex flex-col gap-8 md:gap-10 items-center relative shrink-0 w-full max-w-[720px] px-4">
        <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#1f1f1f] text-[32px] sm:text-[48px] lg:text-[64px] text-center tracking-[-0.64px] w-full max-w-xl">
          <h2 className="block leading-[1.1]">Flowers should be easy to give— and easy to trust.</h2>
        </div>
        <div className="bg-[#e6e2dd] h-px shrink-0 w-16" />
      </div>
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#6f6f6f] text-base sm:text-[18px] text-center tracking-[-0.09px] w-full max-w-xl px-4">
        <p className="leading-[1.4]">BloomHero was created to make buying flowers feel less confusing, more personal, and rooted in local communities.</p>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <div className="content-stretch flex flex-col gap-4 items-center justify-center py-10 md:py-16 relative shrink-0 w-full px-4">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#1f1f1f] text-lg sm:text-[20px] text-center tracking-[2px] w-full max-w-xl">
        <p className="leading-[1.6]">Buying flowers online wasn&apos;t simple.</p>
      </div>
      <div className="content-stretch flex flex-col md:flex-row gap-10 md:gap-16 items-start relative shrink-0 w-full max-w-4xl">
        <div className="content-stretch flex flex-col items-center md:items-end justify-center relative shrink-0 w-full md:flex-1">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[13px] text-center md:text-right tracking-[0.65px]">
            <p className="leading-[1.6]">FOR CUSTOMERS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#1f1f1f] text-[16px] text-center md:text-right tracking-[1.6px] w-full max-w-md">
            <p className="leading-[1.6]">Customers jumped between social media posts, messages, and comments just to compare prices or check if a seller was legit.</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center md:items-start justify-center relative shrink-0 w-full md:flex-1">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[13px] text-center md:text-left tracking-[0.65px]">
            <p className="leading-[1.6]">FOR FLORISTS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#1f1f1f] text-[16px] text-center md:text-left tracking-[1.6px] w-full max-w-md">
            <p className="leading-[1.6]">Florists were juggling inquiries across multiple platforms, repeating the same details, and missing potential orders because conversations got buried.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TheIdea() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-center justify-center py-10 md:py-16 relative shrink-0 w-full px-4">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-2xl sm:text-[36px] text-center tracking-[0.36px]">
        <p className="leading-[1.2]">Behind BloomHero</p>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[1.6px] w-full max-w-xl">
        <p className="leading-[1.6]">BloomHero began with a simple question:</p>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#2f5d3a] text-base sm:text-[18px] text-center tracking-[1.8px] w-full max-w-lg px-2">
        <p className="leading-[1.6]">What if finding flowers worked more like searching—and less like guessing?</p>
      </div>
      <div className="content-stretch flex flex-col gap-10 md:gap-16 items-center relative shrink-0 w-full max-w-[700px]">
        <div className="relative rounded-2xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-full aspect-[700/468]">
          <img alt="BloomHero Story" className="absolute inset-0 object-cover pointer-events-none rounded-2xl size-full" src={imgSunstarImportUploadsImages20181031988101} />
        </div>
        <div className="flex flex-col font-medium justify-center leading-[1.6] relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[1.6px] w-full max-w-xl">
          <p>We imagined a place where customers could search by occasion, flower type, or florist, and instantly see clear prices, real photos, and trusted sellers—all in one place.</p>
        </div>
      </div>
    </div>
  );
}

function MissionSection() {
  return (
    <div className="content-stretch flex flex-col gap-6 md:gap-8 items-center justify-center py-10 md:py-16 relative shrink-0 text-center w-full px-4">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-2xl sm:text-[38px] tracking-[0.38px]">
        <p className="leading-[1.2]">What We Are Building</p>
      </div>
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#4f4f4f] text-[14px] tracking-[1.4px] w-full max-w-xl">
        <p className="leading-[1.6]">BloomHero is a local flower marketplace designed around clarity, trust, and connection.</p>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#4f4f4f] text-[14px] tracking-[1.4px] w-full max-w-xl">
        <p className="leading-[1.6]">We help customers discover flowers confidently—and help local florists focus on what they do best: creating beautiful arrangements.</p>
      </div>
    </div>
  );
}

function LocalFirst() {
  return (
    <div className="content-stretch flex flex-col gap-4 items-center relative shrink-0 w-full py-12 md:py-24 px-4">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-2xl sm:text-[36px] text-center tracking-[0.36px]">
        <p className="leading-[1.2]">Rooted in local communities</p>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#4f4f4f] text-[14px] text-center tracking-[1.4px] w-full max-w-xl">
        <p className="leading-[1.6]">BloomHero is not about replacing local florists—it&apos;s about supporting them.</p>
      </div>
      <div className="content-stretch grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-center relative shrink-0 w-full max-w-[760px]">
        <div className="relative rounded-2xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.25)] shrink-0 w-full aspect-[4/3] sm:aspect-auto sm:h-[180px]">
          <img alt="Local florist community" className="absolute inset-0 object-cover pointer-events-none rounded-2xl size-full" src={imgRectangle25} />
        </div>
        <div className="relative rounded-2xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-full aspect-[4/3] sm:aspect-auto sm:h-[180px]">
          <img alt="Local florist shop" className="absolute inset-0 object-cover pointer-events-none rounded-2xl size-full" src={imgRectangle26} />
        </div>
        <div className="relative rounded-2xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-full aspect-[4/3] sm:aspect-auto sm:h-[180px]">
          <img alt="Local flower arrangement" className="absolute inset-0 object-cover pointer-events-none rounded-2xl size-full" src={imgRectangle27} />
        </div>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#4f4f4f] text-[14px] text-center tracking-[1.4px] w-full max-w-xl mt-2">
        <p className="leading-[1.6]">By bringing verified sellers into one organized platform, we make it easier for small and pop-up florists to be discovered, trusted, and chosen—without needing a massive social media following.</p>
      </div>
      <div className="bg-[#f5f1ec] content-stretch flex flex-col md:flex-row gap-8 md:gap-8 items-center justify-center py-10 md:py-16 relative rounded-2xl shrink-0 w-full max-w-[793px] mt-8 md:mt-12 px-6">
        <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-[-0.5px] pointer-events-none rounded-[16.5px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
        <div className="content-stretch flex flex-col gap-3 items-center justify-center relative rounded-3xl shrink-0 w-full md:flex-1">
          <Icon icon="mdi:magnify" width={32} height={32} color="#2f5d3a" />
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[14px] text-center tracking-[1.4px]">
            <p className="leading-[1.6]">FOR CUSTOMERS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] w-full max-w-xs">
            <p className="leading-[1.5]">Search by occasion, compare clearly, and buy with confidence—without the back-and-forth.</p>
          </div>
        </div>
        <div className="bg-[#e6e2dd] h-px w-full md:h-[95px] md:w-px shrink-0" />
        <div className="content-stretch flex flex-col gap-3 items-center justify-center relative rounded-3xl shrink-0 w-full md:flex-1">
          <Icon icon="mdi:storefront-outline" width={32} height={32} color="#2f5d3a" />
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[14px] text-center tracking-[1.4px]">
            <p className="leading-[1.6]">FOR FLORISTS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] w-full max-w-xs">
            <p className="leading-[1.5]">Manage listings, receive inquiries in one place, and focus on crafting flowers instead of chasing messages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClosingSection() {
  return (
    <div className="content-stretch flex flex-col gap-5 items-center justify-center py-12 md:py-24 relative shrink-0 w-full px-4">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] w-full max-w-xl">
        <p className="leading-[1.6]">Flowers are about moments—celebrations, comfort, love, and connection.</p>
      </div>
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-base sm:text-[18px] text-center tracking-[1.8px] w-full max-w-xl">
        <p className="leading-[1.6]">BloomHero exists to make those moments easier to create, for both the people giving flowers and the florists behind them.</p>
      </div>
      <a href="/" className="bg-[#d24b46] content-stretch flex h-11 items-center justify-center px-5 py-3 relative rounded-full shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] shrink-0 hover:opacity-90 transition-opacity">
        <div className="flex flex-col font-medium justify-center relative shrink-0 text-[14px] text-center text-white tracking-[0.56px]">
          <p className="leading-[1.5]">Find Flowers Near You</p>
        </div>
      </a>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative w-full min-h-full overflow-x-hidden">
      <div className="content-stretch flex flex-col gap-4 items-center justify-center py-12 md:py-24 relative shrink-0 w-full max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#5f6b61] text-[12px] text-center tracking-[2.4px]">
          <p className="leading-[22px]">OUR STORY</p>
        </div>
        <AboutHero />
        <ProblemSection />
        <TheIdea />
        <MissionSection />
        <LocalFirst />
        <ClosingSection />
      </div>
      <Footer />
    </div>
  );
}
