"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser-client";

export default function ResetPassword() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(error.message);
      setIsSubmitting(false);
      return;
    }

    setStatus("Password updated. You can now log in.");
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8 relative">
        <button
          type="button"
          onClick={() => router.push("/login")}
          aria-label="Go back"
          className="absolute top-6 left-6 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m-.47-13.53a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72H16a.75.75 0 0 0 0-1.5H9.81l1.72-1.72a.75.75 0 0 0 0-1.06"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex justify-center mb-6">
          <Image
            src="/navbar-logo.png"
            alt="BloomHero Logo"
            width={280}
            height={90}
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          Reset password
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#d24b46] text-white py-2 rounded-full font-medium hover:bg-red-700 transition"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </div>

          {status ? (
            <p className="text-sm text-center text-gray-700">{status}</p>
          ) : null}
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-800 cursor-pointer hover:underline"
          >
            Sign In.
          </Link>
        </p>
      </div>
    </div>
  );
}

