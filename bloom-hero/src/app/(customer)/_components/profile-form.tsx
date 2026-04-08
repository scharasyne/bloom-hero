"use client";

import { useState, useTransition } from "react";
import { updateCustomerProfile } from "../profile/actions";

export function ProfileForm({
  defaultName,
  defaultPhone,
  email,
}: {
  defaultName: string;
  defaultPhone: string;
  email: string;
}) {
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateCustomerProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e6e2dd] px-6 sm:px-8 py-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-[#2f2f2f] uppercase tracking-widest">
          Personal Information
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-[#2f5d3a] hover:text-[#25492e] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-[#eef6ee] border border-[#b8d9b8] px-4 py-3 text-sm font-semibold text-[#2d5a2d]">
          Profile updated successfully.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-[#f8f4f4] border border-[#dcc8c8] px-4 py-3 text-sm font-semibold text-[#7a3535]">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Full Name
          </label>
          {editing ? (
            <input
              name="full_name"
              defaultValue={defaultName}
              className="w-full rounded-xl border border-[#e6e2dd] bg-[#faf8f5] px-4 py-2.5 text-sm font-medium text-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-[#2f5d3a]/30 focus:border-[#2f5d3a] transition-all"
              placeholder="Your full name"
            />
          ) : (
            <p className="text-sm font-medium text-[#2f2f2f]">
              {defaultName || <span className="text-gray-400 italic">Not set</span>}
            </p>
          )}
        </div>

        {/* Email — always read-only */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Email
          </label>
          <p className="text-sm font-medium text-[#2f2f2f]">{email}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Email cannot be changed here.</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Phone Number
          </label>
          {editing ? (
            <input
              name="phone"
              defaultValue={defaultPhone}
              type="tel"
              className="w-full rounded-xl border border-[#e6e2dd] bg-[#faf8f5] px-4 py-2.5 text-sm font-medium text-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-[#2f5d3a]/30 focus:border-[#2f5d3a] transition-all"
              placeholder="+63 9XX XXX XXXX"
            />
          ) : (
            <p className="text-sm font-medium text-[#2f2f2f]">
              {defaultPhone || <span className="text-gray-400 italic">Not set</span>}
            </p>
          )}
        </div>

        {editing && (
          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2f5d3a] px-5 py-2 text-xs font-bold text-white hover:bg-[#25492e] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e2dd] bg-white px-5 py-2 text-xs font-bold text-gray-400 hover:bg-[#faf8f5] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}