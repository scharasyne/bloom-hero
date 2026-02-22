"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser-client";
import Image from "next/image";

type Role = "client" | "vendor";

export default function SignUp() {
    const router = useRouter();
    const [role, setRole] = useState<Role>("client");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("");

        if (password !== confirmPassword) {
            setStatus("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setStatus(error.message);
            setIsSubmitting(false);
            return;
        }

        setStatus("Check your email to confirm your account.");
        setPassword("");
        setConfirmPassword("");
        setIsSubmitting(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md bg-[#f8ece7] rounded-2xl shadow-xl p-8 relative">
                <button
                    type="button"
                    onClick={() => router.push("/")}
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

                <div className="flex bg-gray-200 rounded-full p-1 mb-6 border border-gray-300">
                    <button
                        type="button"
                        onClick={() => setRole("client")}
                        className={`flex-1 py-2 rounded-full text-sm font-medium transition ${role === "client" ? "bg-[#d24b46] text-white shadow" : "text-gray-700 hover:bg-[#d8cbc4]"}`}
                    >
                        I am a Client
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("vendor")}
                        className={`flex-1 py-2 mx-2 rounded-full text-sm font-medium transition ${role === "vendor" ? "bg-[#d24b46] text-white shadow" : "text-gray-700 hover:bg-[#d8cbc4]"}`}
                    >
                        I am a Vendor
                    </button>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#f0e4df] focus:outline-none focus:ring-2 focus:ring-red-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            Password
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
                            Confirm Password
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
                            {isSubmitting ? "Creating account..." : "Create Account"}
                        </button>
                    </div>

                    {status ? (
                        <p className="text-sm text-center text-gray-700">{status}</p>
                    ) : null}
                </form>

                <p className="text-sm text-center text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-gray-800 cursor-pointer hover:underline"
                    >
                        Sign in.
                    </Link>
                </p>
            </div>
        </div>
    );
}