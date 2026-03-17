import { Icon } from "@iconify/react";
import Footer from "@/components/footer";
// import NavBar from "@/components/navbar";

const imgLogo = "/navbar-logo.png";
const imgSunstarImportUploadsImages20181031988101 = "/choose.png";
const imgRectangle25 = "/1local.jpg";
const imgRectangle26 = "/2local.jpg";
const imgRectangle27 = "/3local.jpg";
const imgRectangle28 = "https://placehold.co/32x32?text=C";
const imgRectangle29 = "https://placehold.co/32x32?text=F";

function AboutHero() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center py-[96px] relative shrink-0 w-full">
     <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0 w-[720px]">
        <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[64px] text-center tracking-[-0.64px] w-[560px]">
          <h2 className="block leading-[1.1] whitespace-pre-wrap">Flowers should be easy to give— and easy to trust.</h2>
        </div>
        <div className="bg-[#e6e2dd] h-px shrink-0 w-[64px]" />
      </div>
      <div className="flex flex-col font-semibold h-[78px] justify-center leading-[0] relative shrink-0 text-[#6f6f6f] text-[18px] text-center tracking-[-0.09px] w-[640px]">
        <p className="leading-[1.4] whitespace-pre-wrap">BloomHero was created to make buying flowers feel less confusing, more personal, and rooted in local communities.</p>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center leading-[0] py-[64px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#1f1f1f] text-[20px] text-center tracking-[2px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">Buying flowers online wasn't simple.</p>
      </div>
      <div className="content-stretch flex gap-[64px] items-start relative shrink-0">
        <div className="content-stretch flex flex-col items-end justify-center relative shrink-0">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[13px] text-center tracking-[0.65px] whitespace-nowrap">
            <p className="leading-[1.6]">FOR CUSTOMERS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#1f1f1f] text-[16px] text-right tracking-[1.6px] w-[360px]">
            <p className="leading-[1.6] whitespace-pre-wrap">Customers jumped between social media posts, messages, and comments just to compare prices or check if a seller was legit.</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#2f5d3a] text-[13px] text-center tracking-[0.65px] whitespace-nowrap">
            <p className="leading-[1.6]">FOR FLORISTS</p>
          </div>
          <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#1f1f1f] text-[16px] tracking-[1.6px] w-[360px]">
            <p className="leading-[1.6] whitespace-pre-wrap">Florists were juggling inquiries across multiple platforms, repeating the same details, and missing potential orders because conversations got buried.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TheIdea() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center py-[64px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[36px] text-center tracking-[0.36px] whitespace-nowrap">
        <p className="leading-[1.2]">Behind BloomHero</p>
      </div>
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[1.6px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">BloomHero began with a simple question:</p>
      </div>
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[18px] text-center tracking-[1.8px] w-[560px]">
        <p className="leading-[1.6] whitespace-pre-wrap">What if finding flowers worked more like searching—and less like guessing?</p>
      </div>
      <div className="content-stretch flex flex-col gap-[64px] items-center relative shrink-0">
        <div className="h-[468px] relative rounded-[16px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-[700px]">
          <img alt="BloomHero Story" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgSunstarImportUploadsImages20181031988101} />
        </div>
        <div className="flex flex-col font-medium justify-center leading-[1.6] relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[1.6px] w-[640px] whitespace-pre-wrap">
          <p>We imagined a place where customers could search by occasion, flower type, or florist, and instantly see clear prices, real photos, and trusted sellers—all in one place.</p>
        </div>
      </div>
    </div>
  );
}

function MissionSection() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center justify-center leading-[0] py-[64px] relative shrink-0 text-center w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[38px] tracking-[0.38px] whitespace-nowrap">
        <p className="leading-[1.2]">What We Are Building</p>
      </div>
      <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#4f4f4f] text-[14px] tracking-[1.4px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">BloomHero is a local flower marketplace designed around clarity, trust, and connection.</p>
      </div>
      <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#4f4f4f] text-[14px] tracking-[1.4px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">We help customers discover flowers confidently—and help local florists focus on what they do best: creating beautiful arrangements.</p>
      </div>
    </div>
  );
}

function LocalFirst() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full py-[96px]">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[36px] text-center tracking-[0.36px] whitespace-nowrap">
        <p className="leading-[1.2]">Rooted in local communities</p>
      </div>
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#4f4f4f] text-[14px] text-center tracking-[1.4px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">BloomHero is not about replacing local florists—it's about supporting them.</p>
      </div>
      {/* Gallery */}
      <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-[760px]">
        <div className="h-[180px] relative rounded-[16px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.25)] shrink-0 w-[240px]">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgRectangle25} />
        </div>
        <div className="h-[180px] relative rounded-[16px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-[240px]">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgRectangle26} />
        </div>
        <div className="h-[180px] relative rounded-[16px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] shrink-0 w-[240px]">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgRectangle27} />
        </div>
      </div>
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#4f4f4f] text-[14px] text-center tracking-[1.4px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">By bringing verified sellers into one organized platform, we make it easier for small and pop-up florists to be discovered, trusted, and chosen—without needing a massive social media following.</p>
      </div>
      {/* Two Column Benefits */}
      <div className="bg-[#f5f1ec] content-stretch flex gap-[32px] items-center justify-center py-[64px] relative rounded-[16px] shrink-0 w-[793px] mt-[48px]">
        <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-[-0.5px] pointer-events-none rounded-[16.5px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
        <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative rounded-[24px] shrink-0">
          <Icon icon="mdi:magnify" width={32} height={32} color="#2f5d3a" />
          <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[14px] text-center tracking-[1.4px] whitespace-nowrap">
            <p className="leading-[1.6]">FOR CUSTOMERS</p>
          </div>
          <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] w-[300px]">
            <p className="leading-[1.5] whitespace-pre-wrap">Search by occasion, compare clearly, and buy with confidence—without the back-and-forth.</p>
          </div>
        </div>
        <div className="bg-[#e6e2dd] h-[95px] shrink-0 w-px" />
        <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative rounded-[24px] shrink-0">
          <Icon icon="mdi:storefront-outline" width={32} height={32} color="#2f5d3a" />
          <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#2f5d3a] text-[14px] text-center tracking-[1.4px] whitespace-nowrap">
            <p className="leading-[1.6]">FOR FLORISTS</p>
          </div>
          <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] w-[300px]">
            <p className="leading-[1.5] whitespace-pre-wrap">Manage listings, receive inquiries in one place, and focus on crafting flowers instead of chasing messages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClosingSection() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center justify-center py-[96px] relative shrink-0">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#7a7a7a] text-[14px] text-center tracking-[1.4px] whitespace-nowrap">
        <p className="leading-[1.6]">Flowers are about moments—celebrations, comfort, love, and connection.</p>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-[0] relative shrink-0 text-[#1f1f1f] text-[18px] text-center tracking-[1.8px] w-[640px]">
        <p className="leading-[1.6] whitespace-pre-wrap">BloomHero exists to make those moments easier to create, for both the people giving flowers and the florists behind them.</p>
      </div>
      <a href="/" className="bg-[#d24b46] content-stretch flex h-[44px] items-center justify-center px-[20px] py-[12px] relative rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] shrink-0">
        <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white tracking-[0.56px] whitespace-nowrap">
          <p className="leading-[1.5]">Find Flowers Near You</p>
        </div>
      </a>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full">
      {/* <NavBar /> */}
      <div className="content-stretch flex flex-col gap-[16px] items-center justify-center py-[96px] relative shrink-0 w-full">
        <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#5f6b61] text-[12px] text-center tracking-[2.4px] whitespace-nowrap">
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
