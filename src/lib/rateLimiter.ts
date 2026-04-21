// src/lib/rateLimiter.ts
// In-memory rate limiter for API routes (FIX-FRONT-P1-02)
// For beta — no Redis dependency. Resets on server restart.

const requestCounts = new Map<string, { count: number; resetAt: number }>()

// Periodic cleanup to prevent memory leak from stale entries
const CLEANUP_INTERVAL = 5 * 60_000 // 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts) {
    if (now > record.resetAt) {
      requestCounts.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetAt - now,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetIn: record.resetAt - now,
  }
}
