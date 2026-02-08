import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function enforceRateLimit(
  request: NextRequest,
  scope: string,
  maxRequests: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const ip = getClientIp(request);
  const key = `${scope}:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((current.resetAt - now) / 1000).toString(),
        },
      }
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return null;
}
