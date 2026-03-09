import Link from "next/link";

function SignInButton() {
  return (
    <div className="bg-[#d24b46] flex items-center justify-center px-[20px] py-[12px] rounded-[999px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)]">
      <Link
        className="font-medium text-[16px] text-center text-white tracking-[0.56px] whitespace-nowrap cursor-pointer leading-[1.5]"
        href="/sign-in"
      >
        Sign In
      </Link>
    </div>
  );
}

export default function NavBar() {
  return (
    <nav className="w-full h-[88px] flex items-center justify-between px-[64px] border-b border-[#edeae6] shrink-0">
      
      {/* Logo */}
      <Link href="/">
        <div className="h-[48px] w-[36px] relative overflow-hidden">
          <img
            alt="BloomHero Logo"
            className="absolute h-[137.5%] left-[-64.58%] max-w-none top-[-18.75%] w-[229.17%]"
            src="/icon.png"
          />
        </div>
      </Link>

      {/* Nav links + Sign In */}
      <div className="flex items-center gap-[32px]">
        <Link className="font-semibold text-[16px] text-black tracking-[-0.07px] whitespace-nowrap cursor-pointer" href="/">
          Home
        </Link>
        <Link className="font-semibold text-[16px] text-black tracking-[-0.07px] whitespace-nowrap cursor-pointer" href="/browse-flowers">
          Flowers
        </Link>
        <Link className="font-semibold text-[16px] text-black tracking-[-0.07px] whitespace-nowrap cursor-pointer" href="/browse-shops">
          Shops
        </Link>
        <Link className="font-semibold text-[16px] text-black tracking-[-0.07px] whitespace-nowrap cursor-pointer" href="/about-us">
          About
        </Link>
        <SignInButton />
      </div>

    </nav>
  );
}
