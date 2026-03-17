// Simple in-memory sliding window rate limiter.
// Resets on server restart. Good enough for single-instance deploys.

const hits = new Map<string, number[]>();

/**
 * Check if a request should be rate-limited.
 * @param key   Unique identifier (e.g. IP + route)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds (default 60s)
 * @returns true if the request is allowed, false if rate-limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const timestamps = hits.get(key);

  // Inline cleanup: filter stale timestamps for this key only
  const recent = timestamps
    ? timestamps.filter((t) => now - t < windowMs)
    : [];

  if (recent.length >= limit) {
    // Update the map with the cleaned-up list before returning
    hits.set(key, recent);
    return false; // rate limited
  }

  recent.push(now);
  hits.set(key, recent);
  return true; // allowed
}
