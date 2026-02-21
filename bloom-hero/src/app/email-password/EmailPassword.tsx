"use client";

import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react"; //find what this is for

type EmailPasswordProps = {
    user: User | null;
};

type Mode = "signup" | "signin"


export default function EmailPassword({ user }: EmailPasswordProps){
    const [mode, setMode] = useState("signup");
    const [email, setEmail] = useState(""); //should be empty first
    const [password, setPassword] = useState(""); //again, blank first
    const [status, setStatus] = useState("");
    // const supabase = getSupabaseBrowserClient();
}