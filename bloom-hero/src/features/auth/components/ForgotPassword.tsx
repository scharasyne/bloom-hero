"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import Image from "next/image";

import { resolvePostLoginDestination } from "@/features/auth/actions/actions";

export default function ForgotPassword() {
    const router = useRouter();
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isErrorStatus =
        /expired|invalid|denied|failed/i.test(status);

    useEffect(() => {
        const err = new URLSearchParams(window.location.search).get("error");
        if (err) {
            setStatus(decodeURIComponent(err));
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        function applySession(session: { user: unknown } | null) {
            if (isMounted) {
                setIsAuthenticated(Boolean(session?.user));
            }
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            router.replace(
                `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/forgot-password")}`
            );
            return;
        }

        const hash = window.location.hash.substring(1);
        if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                applySession(session);
                if (session?.user) {
                    window.history.replaceState(null, "", window.location.pathname);
                }
            });
        } else {
            supabase.auth.getSession().then(({ data: { session } }) => {
                applySession(session);
            });
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                if (isMounted) {
                    setIsAuthenticated(true);
                }
            }
            applySession(session);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("");
        setIsSubmitting(true);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/forgot-password")}`
                : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setStatus(error.message);
            setIsSubmitting(false);
            return;
        }

        setStatus("Check your email for the password reset link.");
        setEmail("");
        setIsSubmitting(false);
    }

    async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("");

        if (!newPassword || !confirmPassword) {
            setStatus("Enter and confirm your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
            data: {
                must_change_password: false,
            },
        });

        if (error) {
            setStatus(error.message);
            setIsSubmitting(false);
            return;
        }

        const destination = await resolvePostLoginDestination();
        const redirectPath = destination.ok ? destination.path : "/";

        setNewPassword("");
        setConfirmPassword("");
        router.replace(redirectPath);
        router.refresh();
    }

    return (
        <div className="min-h-svh flex items-center justify-center">
            <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8 relative">
                <button
                    type="button"
                    onClick={() => router.push(isAuthenticated ? "/" : "/login")}
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

                <div className="h-10" />

                <div className="flex justify-center mb-6">
                    <Image
                        src="/navbar-logo.png"
                        alt="BloomHero Logo"
                        width={280}
                        height={90}
                        priority
                    />
                </div>

                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                    {isAuthenticated ? "Change password" : "Forgot password"}
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                    {isAuthenticated
                        ? "Set a new password for your account right away."
                        : "Enter your email and we'll send you a link to reset your password."}
                </p>

                {status && !isAuthenticated && isErrorStatus ? (
                    <div
                        role="alert"
                        className="mb-4 rounded-lg border border-[#f0c4c0] bg-[#fff5f4] px-4 py-3 text-sm text-[#8b2e26] text-center"
                    >
                        {status}
                    </div>
                ) : null}

                {isAuthenticated ? (
                    <form onSubmit={handlePasswordUpdate} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                New password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Confirm password
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

                        {status && isAuthenticated ? (
                            <p className="text-sm text-center text-gray-700">
                                {status}
                            </p>
                        ) : null}
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="h-4" />
                            <input
                                type="email"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="h-2" />

                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#d24b46] text-white py-2 rounded-full font-medium hover:bg-red-700 transition"
                            >
                                {isSubmitting ? "Sending..." : "Send reset link"}
                            </button>
                        </div>

                        {status && !isErrorStatus ? (
                            <p className="text-sm text-center text-[#2f5d3a]">{status}</p>
                        ) : null}
                    </form>
                )}

                <p className="text-sm text-center text-gray-600 mt-6">
                    {isAuthenticated ? (
                        <>You&apos;ll be sent to your account once the password update is complete.</>
                    ) : (
                        <>
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-gray-800 cursor-pointer hover:underline"
                            >
                                Sign in.
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
