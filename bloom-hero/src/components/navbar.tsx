import Link from "next/link";

function SignInButton() {
  return (
    <div className="absolute bg-[#d24b46] bottom-0 content-stretch flex items-center justify-center px-5 py-3 right-0 rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] top-0">
      <Link className="flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[16px] text-center text-white tracking-[0.56px] whitespace-nowrap" href="/login">
        <p className="cursor-pointer leading-normal">Sign In</p>
      </Link>
    </div>
  );
}

export default function NavBar() {
  return (
    <div className="content-stretch flex h-22 items-center justify-between relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="h-12 relative shrink-0 w-9">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="BloomHero Logo" className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]" src="/icon.png" />
        </div>
      </div>
      <div className="h-11 relative shrink-0 w-98.5">
        <Link className="-translate-x-1/2 absolute bottom-3 flex flex-col font-semibold justify-center leading-0 left-9.75 text-[16px] text-black text-center top-3 tracking-[-0.07px] whitespace-nowrap" href="/">
          <p className="cursor-pointer leading-[1.45]">Home</p>
        </Link>
        <Link className="-translate-x-1/2 absolute bottom-3 flex flex-col font-semibold justify-center leading-0 left-[calc(50%-83.5px)] text-[16px] text-black text-center top-3 tracking-[-0.07px] whitespace-nowrap" href="/browse-flowers">
          <p className="cursor-pointer leading-[1.45]">Flowers</p>
        </Link>
        <Link className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-semibold justify-center leading-0 left-[calc(50%-9.5px)] text-[16px] text-black text-center top-1/2 tracking-[-0.07px] whitespace-nowrap" href="/browse-shops">
          <p className="cursor-pointer leading-[1.45]">Shops</p>
        </Link>
        <Link className="-translate-x-1/2 absolute bottom-3 flex flex-col font-semibold justify-center leading-0 left-64.25 text-[16px] text-black text-center top-3 tracking-[-0.07px] whitespace-nowrap" href="/about-us">
          <p className="cursor-pointer leading-[1.45]">About</p>
        </Link>
        <SignInButton />
      </div>
    </div>
  );
}
