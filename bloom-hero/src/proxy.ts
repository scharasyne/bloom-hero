import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/about-us',
  '/login',
  '/sign-up',
  '/forgot-password',
  '/search',
]

const PUBLIC_PREFIXES = [
  '/auth/callback',
  '/auth/resolve',
]

const PROTECTED_PREFIXES = [
  '/admin',
  '/market',
  '/pop-up',
  '/dashboard',
  '/orders',
  '/review',
  '/profile',
  '/vendor-application',
]

function hasPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => hasPrefix(pathname, prefix))

  const isProtectedPath = PROTECTED_PREFIXES.some(prefix => hasPrefix(pathname, prefix))

  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicPath) {
    return response
  }

  return response
}


export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}