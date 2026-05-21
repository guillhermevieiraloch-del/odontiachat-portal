/**
 * In-memory token-bucket rate limiter.
 *
 * Scoped per-namespace so unrelated endpoints don't share buckets.
 * Good enough for a single Vercel function instance; on multi-instance
 * the effective limit is per-instance — swap for Upstash/Redis if abuse
 * becomes a real problem at scale.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, Bucket>>();

/**
 * @returns true if the call is allowed, false if the limit is exceeded.
 */
export function rateLimit(
  namespace: string,
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }

  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (store.size > 5000) {
    for (const k of Array.from(store.keys())) {
      const b = store.get(k);
      if (b && b.resetAt < now) store.delete(k);
    }
  }

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
