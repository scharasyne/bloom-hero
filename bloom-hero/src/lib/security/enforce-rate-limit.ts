import { headers } from "next/headers";

import {
  checkRateLimit,
  getClientIpFromHeaders,
  type RateLimitBucket,
} from "@/lib/security/rate-limit";

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests. Please try again later.");
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function enforceRateLimit(
  bucket: RateLimitBucket,
  userId?: string | null,
): Promise<void> {
  const headerStore = await headers();
  const ip = getClientIpFromHeaders(headerStore);
  const identifier = userId ? `${userId}:${ip}` : ip;
  const result = checkRateLimit(bucket, identifier);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }
}
