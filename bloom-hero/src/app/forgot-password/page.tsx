"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import Image from "next/image";

export default function ForgotPassword() {
    const router = useRouter();
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadSession() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!isMounted) {
                return;
            }

            setIsAuthenticated(Boolean(user));
            setIsLoadingSession(false);
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            loadSession();
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    async function getRedirectPathForCurrentUser() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return "/";
        }

        const { data: roleData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        const role = roleData?.role as string | undefined;

        if (role === "admin") {
            return "/admin/vendor-applications";
        }

        if (role === "vendor") {
            const { data: vendorData } = await supabase
                .from("vendors")
                .select("vendor_type")
                .eq("owner_id", user.id)
                .maybeSingle();

            return vendorData?.vendor_type === "pop-up"
                ? "/pop-up/dashboard"
                : "/market/dashboard";
        }

        return "/";
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("");
        setIsSubmitting(true);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/forgot-password`
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

        const redirectPath = await getRedirectPathForCurrentUser();

        setNewPassword("");
        setConfirmPassword("");
        router.replace(redirectPath);
        router.refresh();
    }

    if (isLoadingSession) {
        return (
            <div className="min-h-svh flex items-center justify-center">
                <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8">
                    <div className="h-12" />
                    <p className="text-sm text-center text-gray-600">Loading...</p>
                </div>
            </div>
        );
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

                        {status ? (
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

                        {status ? (
                            <p className="text-sm text-center text-gray-700">
                                {status}
                            </p>
                        ) : null}
                    </form>
                )}

                <p className="text-sm text-center text-gray-600 mt-6">
                    {isAuthenticated ? (
                        <>You'll be sent to your account once the password update is complete.</>
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
