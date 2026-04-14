import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest){
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            }
        },
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {//still to be reviewed
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // if(!user)
    //     return NextResponse.redirect(new URL('/login', request.url))

    // const requestHeaders = new Headers(request.headers)
    
    // requestHeaders.set('x-user-role', role)

    return response
    // return NextResponse.next({
    //     request: { headers: requestHeaders },
    // })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

