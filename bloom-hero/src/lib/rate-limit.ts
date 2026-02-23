import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number
  /**
   * Time window in milliseconds
   */
  windowMs: number
  /**
   * Custom message to return when rate limit is exceeded
   */
  message?: string
}

/**
 * Represents a single rate limit entry
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory store for rate limiting
 * Key format: `${identifier}:${endpoint}`
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Get client identifier from request (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for reverse proxy scenarios)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  // Use the first available IP
  const ip = forwarded?.split(',')[0].trim() ||
             realIp ||
             cfConnectingIp ||
             'unknown'

  return ip
}

/**
 * Apply rate limiting to a request
 *
 * @param request - The Next.js request object
 * @param config - Rate limiting configuration
 * @param identifier - Optional custom identifier (defaults to IP address)
 * @returns NextResponse with 429 status if rate limit exceeded, null otherwise
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const clientId = identifier || getClientIdentifier(request)
  const endpoint = request.nextUrl.pathname
  const key = `${clientId}:${endpoint}`

  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now >= entry.resetTime) {
    // No entry exists or the window has expired, create a new one
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return null
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

    return NextResponse.json(
      {
        error: config.message || 'Too many requests, please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        },
      }
    )
  }

  // Increment the counter
  entry.count++

  return null
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * - 5 requests per 15 minutes
   */
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please try again after 15 minutes.',
  } as RateLimitConfig,

  /**
   * Moderate rate limiter for resource-intensive operations
   * - 10 requests per 5 minutes
   */
  resourceIntensive: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many requests. Please try again in a few minutes.',
  } as RateLimitConfig,

  /**
   * Lenient rate limiter for standard API operations
   * - 100 requests per minute
   */
  standard: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Rate limit exceeded. Please slow down your requests.',
  } as RateLimitConfig,
}
