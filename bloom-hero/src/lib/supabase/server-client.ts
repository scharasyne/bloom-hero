import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

function getEnvironmentVariables(){
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if(!supabaseUrl || !supabaseAnonKey){//if any of these values are missing, we throw an error
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    } 
    return { supabaseUrl, supabaseAnonKey }
}

export async function createSupabaseServerClient() {
    const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            }, 
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({name, value, options }) => 
                    cookieStore.set(name, value, options)
                    );
                } catch(error) {
                    console.error("Supabase cookie set failed:", error);
                }
            }
        }
    })
}

/**
 * OAuth PKCE callback: capture Set-Cookie options from Supabase, then apply them to the final redirect Response.
 * (Reading `cookies()` in the same handler would not see the new session yet.)
 */
export function createSupabaseOAuthCallbackClient(request: NextRequest) {
    const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
    const outbound: { name: string; value: string; options: CookieOptions }[] = [];
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    outbound.push({ name, value, options });
                });
            },
        },
    });
    const applyAuthCookies = (response: NextResponse) => {
        outbound.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });
    };
    return { supabase, applyAuthCookies };
}