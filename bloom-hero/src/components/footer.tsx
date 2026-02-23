import Image from "next/image";

function Footer() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-8 py-10 text-center">
      <Image
        src="/navbar-logo.png"
        alt="Bloomhero"
        width={280}
        height={90}
        priority
      />
      <div className="space-y-1 text-[16px] text-foreground/50">
        <p className="uppercase tracking-wide">ALL RIGHTS RESERVED</p>
        <p>bloomhero © 2026</p>
      </div>
    </footer>
  );
}

export default Footer;