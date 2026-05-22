"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { setPasswordRecoveryCookieClient } from "@/features/auth/utils/passwordRecoverySession.client";
import Image from "next/image";

export function ConfirmRecoveryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("Verifying your reset link…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type");

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as "recovery" | "email",
        });
        if (cancelled) return;
        if (error) {
          router.replace(
            `/forgot-password?error=${encodeURIComponent(error.message)}`
          );
          return;
        }
        setPasswordRecoveryCookieClient();
        router.replace("/forgot-password");
        router.refresh();
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          router.replace(
            `/forgot-password?error=${encodeURIComponent(error.message)}`
          );
          return;
        }
        setPasswordRecoveryCookieClient();
        router.replace("/forgot-password");
        router.refresh();
        return;
      }

      router.replace(
        `/forgot-password?error=${encodeURIComponent("Invalid or expired reset link.")}`
      );
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="min-h-svh flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8 text-center">
        <Image
          src="/navbar-logo.png"
          alt="BloomHero Logo"
          width={200}
          height={64}
          className="mx-auto mb-6"
        />
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
}
