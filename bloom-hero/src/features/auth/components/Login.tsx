"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { signInWithPasswordAction } from "@/features/auth/actions/actions";

export default function Login() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const message = params.get("message");
    if (message) {
      setStatus(decodeURIComponent(message));
      setStatusIsError(false);
    } else if (err) {
      setStatus(decodeURIComponent(err));
      setStatusIsError(true);
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setStatusIsError(false);
    setIsSubmitting(true);

    const destination = await signInWithPasswordAction(email, password);
    if (!destination.ok) {
      setStatus(destination.message);
      setStatusIsError(true);
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("Unable to load your account. Please try again.");
      setStatusIsError(true);
      setIsSubmitting(false);
      return;
    }

    const userMetadata = (user.user_metadata as Record<string, unknown> | undefined) ?? {};

    if (userMetadata.must_change_password) {
      router.replace("/forgot-password");
      router.refresh();
      setIsSubmitting(false);
      return;
    }

    router.push(destination.path);
    router.refresh();
    setIsSubmitting(false);
  }

  // -------------------------------------------------------------
  // social login
  async function handleGoogleLogin() {
    setStatus("");
    setStatusIsError(false);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus(error.message);
      setStatusIsError(true);
      setIsSubmitting(false);
      return;
    }

    router.refresh();

  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-8 pb-8 bg-primary">
      <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8 relative">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Go back"
          className="absolute cursor-pointer top-6 left-6 text-gray-500 hover:text-gray-700"
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

        <div className="h-12" />

        <div className="flex justify-center mb-6">
          <Image
            src="/navbar-logo.png"
            alt="BloomHero Logo"
            width={280}
            height={90}
          />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center mb-1">
              <label className="block text-sm text-gray-700">Password</label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-xs text-gray-700 underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="h-2" />
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#d24b46] text-white py-2 rounded-full font-medium hover:bg-red-400 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-[white] border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Login with Google
            </button>
          </div>

          {status ? (
            <p
              role={statusIsError ? "alert" : "status"}
              className={`text-sm text-center mt-2 ${
                statusIsError ? "text-[#8b2e26]" : "text-[#2f5d3a]"
              }`}
            >
              {status}
            </p>
          ) : null}
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-gray-800 cursor-pointer hover:underline"
          >
            Sign up.
          </Link>
        </p>
      </div>
    </div>
  );
}

