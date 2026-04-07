import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { VendorApplicationRecord } from "@/typess";

function formatVendorType(value: VendorApplicationRecord["vendor_type"]) {
  if (value === "market") return "Market Stall";
  if (value === "pop-up") return "Pop-up Vendor";
  return "Unknown";
}

function formatDate(value: string | null) {
  if (!value) return "Not submitted";
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDocumentKind(url: string) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (/\.(png|jpe?g|webp|gif)$/.test(pathname)) return "Image";
    if (/\.pdf$/.test(pathname)) return "PDF";
    return "File";
  } catch {
    return "File";
  }
}

function DocumentPreview({ label, url }: { label: string; url: string }) {
  const documentKind = getDocumentKind(url);

  return (
    <div className="rounded-[20px] border border-[#e6e2dd] bg-white p-[18px] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[14px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">{documentKind}</p>
          <h2 className="mt-[4px] text-[18px] font-semibold text-[#2c2a28]">{label}</h2>
        </div>
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-[38px] items-center justify-center rounded-[12px] border border-[#e6e2dd] bg-[#f8f6f3] px-[14px] text-[14px] font-medium text-[#2c2a28] hover:bg-[#f0ece7] transition-colors"
        >
          Open file
        </Link>
      </div>
      {documentKind === "Image" ? (
        <img src={url} alt={label} className="w-full rounded-[16px] border border-[#e6e2dd] object-cover" />
      ) : documentKind === "PDF" ? (
        <iframe
          src={url}
          title={label}
          className="h-[560px] w-full rounded-[16px] border border-[#e6e2dd] bg-[#f8f6f3]"
        />
      ) : (
        <div className="flex min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-[#d9d4ce] bg-[#faf8f6] text-[#7a746e]">
          Preview unavailable for this file type.
        </div>
      )}
    </div>
  );
}

export default async function VendorApplicationDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: application } = await supabase
    .from("vendor_applications")
    .select(
      "id, owner_id, shop_name, shop_address, email, phone_number, vendor_type, business_submission_timing, primary_business_document_type, primary_business_document_url, government_id_type, government_id_document_url, taxpayer_identification_number, vat_registration_status, bir_certificate_url, submission_status, submitted_at, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle<VendorApplicationRecord>();

  if (!application || application.submission_status !== "submitted") {
    notFound();
  }

  const documents = [
    {
      label: application.primary_business_document_type ?? "Primary Business Document",
      url: application.primary_business_document_url,
    },
    {
      label: application.government_id_type ?? "Government ID",
      url: application.government_id_document_url,
    },
    {
      label: "BIR Certificate",
      url: application.bir_certificate_url,
    },
  ].filter((document) => Boolean(document.url));

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-[24px]">
        <header className="rounded-[24px] border border-[#e6e2dd] bg-white px-[24px] py-[22px] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-[12px] sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">Vendor application documents</p>
              <h1 className="mt-[6px] text-[30px] font-semibold text-[#2c2a28]">{application.shop_name ?? "Untitled application"}</h1>
              <p className="mt-[8px] text-[14px] text-[#7a746e]">
                {formatVendorType(application.vendor_type)} • Submitted {formatDate(application.submitted_at ?? application.created_at)}
              </p>
            </div>
            <Link
              href="/admin/vendor-applications"
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#e6e2dd] bg-[#f8f6f3] px-[16px] text-[14px] font-medium text-[#2c2a28] hover:bg-[#f0ece7] transition-colors"
            >
              Back to queue
            </Link>
          </div>
        </header>

        {documents.length > 0 ? (
          <section className="grid gap-[20px] xl:grid-cols-2">
            {documents.map((document) => (
              <DocumentPreview key={document.label} label={document.label} url={document.url as string} />
            ))}
          </section>
        ) : (
          <div className="rounded-[20px] border border-[#e6e2dd] bg-white px-[24px] py-[40px] text-center text-[#7a746e] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05)]">
            No submitted documents were attached to this application.
          </div>
        )}

        <section className="grid gap-[16px] rounded-[24px] border border-[#e6e2dd] bg-white px-[24px] py-[22px] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05)] sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">Email</p>
            <p className="mt-[6px] text-[15px] text-[#2c2a28]">{application.email ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">Phone</p>
            <p className="mt-[6px] text-[15px] text-[#2c2a28]">{application.phone_number ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">TIN</p>
            <p className="mt-[6px] text-[15px] text-[#2c2a28]">{application.taxpayer_identification_number ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">VAT status</p>
            <p className="mt-[6px] text-[15px] text-[#2c2a28]">{application.vat_registration_status ?? "Not provided"}</p>
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a746e]">Shop address</p>
            <p className="mt-[6px] text-[15px] text-[#2c2a28]">{application.shop_address ?? "Not provided"}</p>
          </div>
        </section>

        <div className="flex items-center gap-[8px] text-[#7a746e] text-[14px]">
          <Icon icon="mdi:open-in-new" width={16} height={16} />
          The document links above open the original file in a new tab.
        </div>
      </div>
    </main>
  );
}