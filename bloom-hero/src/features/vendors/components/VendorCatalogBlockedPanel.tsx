import Link from "next/link";

type VendorCatalogBlockedPanelProps = {
  title: string;
  description: string;
};

export function VendorCatalogBlockedPanel({ title, description }: VendorCatalogBlockedPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white">
      <div aria-hidden className="pointer-events-none select-none space-y-4 p-6 blur-sm opacity-50">
        <div className="h-8 w-48 rounded-lg bg-[#f0ece8]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-36 rounded-xl bg-[#f7f5f2]" />
          <div className="h-36 rounded-xl bg-[#f7f5f2]" />
        </div>
        <div className="h-24 rounded-xl bg-[#f7f5f2]" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/55 p-6">
        <div className="max-w-md rounded-2xl border border-[#ebe7e3] bg-white px-6 py-5 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold text-[#1e1c1a]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5f5a55]">{description}</p>
          <Link
            href="/vendor-application"
            className="mt-4 inline-flex rounded-full bg-[#2f5d3a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#244a2e]"
          >
            Register your business
          </Link>
        </div>
      </div>
    </div>
  );
}
