// Per-IP rate limit for the contact endpoint (ADR 0030, finding CODE-CONTACT-ABUSE).
//
// Fixed window, in memory, no dependency: the site runs as a single standalone Next
// container on one VPS, so a shared store (Redis) would add an operational dependency
// for no gain at this scale. Two limitations that come with that choice, and that must
// be revisited if either changes:
//   - counters reset on redeploy;
//   - a second replica would double the effective allowance.
//
// This is an APPLICATION-level limit we own, deliberately independent of whatever the
// edge (Cloudflare) may or may not enforce. An edge rule can complement it; it does not
// replace it.

/** Window length. */
const WINDOW_MS = 10 * 60 * 1000;
/** Accepted submissions per IP per window. Generous for a human, useless for a script. */
const MAX_PER_WINDOW = 5;
/** Bound the map so a spray of unique IPs cannot grow it without limit. */
const MAX_TRACKED = 10_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Resolve the client IP. Cloudflare fronts the site, so `cf-connecting-ip` is the
 * authoritative value for traffic that came through it; the others are fallbacks.
 *
 * These headers are only trustworthy because a proxy sets them. A client reaching the
 * origin directly could forge them and get its own bucket, which caps the damage at
 * "the limit is bypassed", never "another visitor is locked out" — a forged value only
 * ever creates a new bucket, it cannot poison someone else's.
 */
function clientIp(headers: Headers): string {
	const cf = headers.get("cf-connecting-ip");
	if (cf) return cf.trim();
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) return (forwarded.split(",")[0] ?? "").trim() || "unknown";
	return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Drop expired buckets; called only when the map grows past its bound. */
function sweep(now: number) {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
	// Still over budget (a genuine flood of distinct live IPs): start over rather than
	// grow unbounded. Losing counters is preferable to losing the process.
	if (buckets.size > MAX_TRACKED) buckets.clear();
}

export type RateLimitResult =
	| { ok: true }
	| { ok: false; retryAfterSeconds: number };

/**
 * Count one attempt for this request's IP and report whether it is allowed.
 * Call BEFORE reading the request body: that is what keeps a 10 MB attachment from
 * being buffered on every shot of a flood.
 */
export function checkContactRateLimit(headers: Headers): RateLimitResult {
	const now = Date.now();
	const key = clientIp(headers);

	if (buckets.size > MAX_TRACKED) sweep(now);

	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return { ok: true };
	}

	bucket.count += 1;
	if (bucket.count > MAX_PER_WINDOW) {
		return {
			ok: false,
			retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
		};
	}
	return { ok: true };
}

/** Test seam: drop all counters. Not used by the request path. */
export function __resetContactRateLimit() {
	buckets.clear();
}
