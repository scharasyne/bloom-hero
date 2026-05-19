import type { NextRequest } from "next/server";

export type RateLimitBucket =
  | "auth-pages"
  | "auth-callback"
  | "upload-api"
  | "api-general";

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

const RULES: Record<RateLimitBucket, RateLimitRule> = {
  "auth-pages": { limit: 30, windowMs: 15 * 60 * 1000 },
  "auth-callback": { limit: 15, windowMs: 15 * 60 * 1000 },
  "upload-api": { limit: 20, windowMs: 60 * 60 * 1000 },
  "api-general": { limit: 120, windowMs: 60 * 1000 },
};

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const MAX_STORE_ENTRIES = 10_000;

function pruneStore(now: number) {
  if (store.size <= MAX_STORE_ENTRIES) return;

  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
    if (store.size <= MAX_STORE_ENTRIES * 0.9) break;
  }
}

export function getClientIpFromRequest(request: NextRequest | Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterSeconds: number };

export function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string,
): RateLimitResult {
  const rule = RULES[bucket];
  const key = `${bucket}:${identifier}`;
  const now = Date.now();

  pruneStore(now);

  const current = store.get(key);
  if (!current || now >= current.resetAt) {
    const resetAt = now + rule.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: rule.limit - 1, resetAt };
  }

  if (current.count >= rule.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetAt: current.resetAt, retryAfterSeconds };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: rule.limit - current.count,
    resetAt: current.resetAt,
  };
}

export function resolveRateLimitBucket(pathname: string): RateLimitBucket | null {
  if (pathname === "/login" || pathname === "/sign-up" || pathname === "/forgot-password") {
    return "auth-pages";
  }

  if (pathname.startsWith("/auth/callback")) {
    return "auth-callback";
  }

  if (pathname === "/api/profile-photo-upload") {
    return "upload-api";
  }

  if (pathname.startsWith("/api/")) {
    return "api-general";
  }

  return null;
}
