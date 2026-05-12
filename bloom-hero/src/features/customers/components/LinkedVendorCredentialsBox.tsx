// Source: `src/app/(customer)/_components/LinkedVendorCredentialsBox.tsx`

"use client";

import { useState } from "react";

type LinkedVendorCredentials = {
  email: string;
  password: string;
  issuedAt: string;
};

type Props = {
  credentials: LinkedVendorCredentials;
};

function formatIssuedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently issued";
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LinkedVendorCredentialsBox({ credentials }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-white rounded-2xl border border-[#e6e2dd] px-6 sm:px-8 py-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#2f2f2f] uppercase tracking-widest">Linked Vendor Account</h2>
          <p className="mt-1 text-sm text-[#7a746e]">
            Your vendor account credentials are available below. Please change this temporary password after your first login.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center rounded-full border border-[#d7d0c8] px-4 py-1.5 text-xs font-semibold text-[#2f5d3a] hover:bg-[#f7f3ef] transition-colors"
        >
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 rounded-xl border border-[#e6e2dd] bg-[#faf8f5] px-4 py-4 space-y-2">
          <p className="text-sm text-[#2f2f2f]"><span className="font-semibold">Email:</span> {credentials.email}</p>
          <p className="text-sm text-[#2f2f2f]"><span className="font-semibold">Temporary Password:</span> {credentials.password}</p>
          <p className="text-xs text-[#8b847c]">Issued: {formatIssuedAt(credentials.issuedAt)}</p>
        </div>
      )}
    </section>
  );
}
