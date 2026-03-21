"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type VendorType = "pop-up" | "market";

export default function ApplyVendorModal() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("market");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus(userError?.message ?? "You need to log in again.");
      setIsSubmitting(false);
      return;
    }

    const { error: roleError } = await supabase
      .from("users")
      .update({ role: "vendor" })
      .eq("id", user.id);

    if (roleError) {
      setStatus(roleError.message);
      setIsSubmitting(false);
      return;
    }

    const { error: vendorError } = await supabase.from("vendors").upsert(
      {
        owner_id: user.id,
        vendor_type: vendorType,
      },
      { onConflict: "owner_id" }
    );

    if (vendorError) {
      setStatus(vendorError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsOpen(false);

    if (vendorType === "market") {
      router.push("/vendor/market/dashboard");
    } else {
      router.push("/vendor/pop-up/dashboard");
    }

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-block bg-[#d24b46] text-white px-4 py-2 rounded hover:bg-[#bb3f3a]"
      >
        Apply as Vendor
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#2f2f2f]">Vendor Application</h2>
            <p className="mt-2 text-sm text-[#575757]">
              Full application fields will be added next. For now, select your vendor type.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="flex items-center gap-3 rounded-md border border-[#d8d8d8] p-3">
                <input
                  type="radio"
                  name="vendorType"
                  value="market"
                  checked={vendorType === "market"}
                  onChange={() => setVendorType("market")}
                />
                <span className="text-sm text-[#2f2f2f]">Market Vendor</span>
              </label>

              <label className="flex items-center gap-3 rounded-md border border-[#d8d8d8] p-3">
                <input
                  type="radio"
                  name="vendorType"
                  value="pop-up"
                  checked={vendorType === "pop-up"}
                  onChange={() => setVendorType("pop-up")}
                />
                <span className="text-sm text-[#2f2f2f]">Pop-up Vendor</span>
              </label>

              {status ? <p className="text-sm text-[#b33a35]">{status}</p> : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="rounded border border-[#bdbdbd] px-4 py-2 text-sm text-[#505050] hover:bg-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-[#2f6b4f] px-4 py-2 text-sm text-white hover:bg-[#285943] disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
