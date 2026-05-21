import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getSecurityHeaders } from '@/lib/security/headers'
import {
  checkRateLimit,
  getClientIpFromRequest,
  resolveRateLimitBucket,
} from '@/lib/security/rate-limit'
import { getUserAppRole, roleHomePath } from '@/lib/security/proxy-role-guard'

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
  '/auth/confirm',
  '/auth/resolve',
]

const PROTECTED_PREFIXES = [
  '/admin',
  '/vendor',
  '/market',
  '/pop-up',
  '/dashboard',
  '/orders',
  '/review',
  '/profile',
  '/vendor-application',
  '/customer',
  '/cart',
]

function hasPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function withSecurityHeaders(response: NextResponse) {
  for (const { key, value } of getSecurityHeaders()) {
    response.headers.set(key, value)
  }
  return response
}

function redirectWithSecurityHeaders(url: URL) {
  return withSecurityHeaders(NextResponse.redirect(url))
}

function rateLimitResponse(request: NextRequest, retryAfterSeconds: number) {
  const response = withSecurityHeaders(
    NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    ),
  )
  response.headers.set('Retry-After', String(retryAfterSeconds))
  return response
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const rateLimitBucket = resolveRateLimitBucket(pathname)
  if (rateLimitBucket) {
    const ip = getClientIpFromRequest(request)
    const rateLimit = checkRateLimit(rateLimitBucket, ip)
    if (!rateLimit.allowed) {
      return rateLimitResponse(request, rateLimit.retryAfterSeconds)
    }
  }

  let response = withSecurityHeaders(
    NextResponse.next({
      request,
    }),
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = withSecurityHeaders(
            NextResponse.next({
              request,
            }),
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => hasPrefix(pathname, prefix))

  const isProtectedPath = PROTECTED_PREFIXES.some(prefix => hasPrefix(pathname, prefix))

  if (!user && isProtectedPath) {
    return redirectWithSecurityHeaders(new URL('/login', request.url))
  }

  let appRole: Awaited<ReturnType<typeof getUserAppRole>> = null
  if (user) {
    appRole = await getUserAppRole(supabase, user.id)
  }

  if (user && hasPrefix(pathname, '/admin') && appRole !== 'admin') {
    return redirectWithSecurityHeaders(new URL(roleHomePath(appRole), request.url))
  }

  if (user && hasPrefix(pathname, '/vendor') && appRole !== 'vendor' && appRole !== 'admin') {
    return redirectWithSecurityHeaders(new URL(roleHomePath(appRole), request.url))
  }

  if (user && hasPrefix(pathname, '/cart')) {
    if (appRole === 'vendor') {
      return redirectWithSecurityHeaders(new URL('/vendor/dashboard', request.url))
    }
  }

  if (isPublicPath) {
    return response
  }

  return response
}


export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}