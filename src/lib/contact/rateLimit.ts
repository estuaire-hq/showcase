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
//
// Two tiers, because they fail differently:
//   - PER IP (`checkContactRateLimit`), keyed on a proxy header. Good ergonomics for
//     real traffic, but only as trustworthy as the header, so it is bypassable while the
//     origin answers outside Cloudflare (CODE-ORIGIN-EXPOSURE, confirmed 2026-09-12).
//   - GLOBAL SEND QUOTA (`checkContactSendQuota`), keyed on nothing at all. It cannot be
//     bypassed by forging anything, and it bounds the damage of the tier above failing.
// The per-IP tier is the one that gives good visitors a precise limit; the global tier
// is the one that holds when the first is defeated. Neither replaces the other.

/** Window length. */
const WINDOW_MS = 10 * 60 * 1000;
/** Accepted submissions per IP per window. Generous for a human, useless for a script. */
const MAX_PER_WINDOW = 5;
/** Bound the map so a spray of unique IPs cannot grow it without limit. */
const MAX_TRACKED = 10_000;
/**
 * Emails actually sent per window, ALL callers combined. This tier keys on nothing the
 * caller controls, so it is the one that still holds when `cf-connecting-ip` is forged.
 * 20 is roughly a hundred times the real volume of a showcase form, so it never fires on
 * genuine traffic, and it turns "unbounded mail relay" into "at most 20 mails per 10
 * minutes" for whoever bypasses the per-IP tier.
 */
const MAX_SENDS_PER_WINDOW = 20;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Resolve the client IP. Cloudflare fronts the site, so `cf-connecting-ip` is the
 * authoritative value for traffic that came through it; the others are fallbacks.
 *
 * None of these headers can be trusted on their own: they are only as good as the proxy
 * that sets them. The origin was measured to answer outside Cloudflare on 2026-09-12
 * (CODE-ORIGIN-EXPOSURE), so a caller reaching it directly picks its own key and mints a
 * fresh bucket on every request. A forged value still cannot poison another visitor's
 * bucket, but it does make THIS tier bypassable, which is why the send quota below
 * exists. Restoring the per-IP tier means making the header verifiable again, by
 * restricting the origin to Cloudflare's ranges or by having Cloudflare add a shared
 * secret header the origin checks.
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

/** Global send window, shared by every caller. */
let sendWindow = { count: 0, resetAt: 0 };

/**
 * Count one email about to be sent and report whether it is allowed.
 *
 * Call this LATE, just before handing the message to the transport, not at the top of
 * the handler like the per-IP tier. The difference is deliberate: this quota exists to
 * bound how much MAIL leaves, so only requests that survived the honeypot and the field
 * validation may consume it. Counting attempts here instead would let a flood of junk
 * POSTs exhaust the window and lock the form for genuine visitors, trading a mail-relay
 * problem for a denial-of-service one.
 */
export function checkContactSendQuota(): RateLimitResult {
	const now = Date.now();
	if (sendWindow.resetAt <= now) {
		sendWindow = { count: 0, resetAt: now + WINDOW_MS };
	}

	sendWindow.count += 1;
	if (sendWindow.count > MAX_SENDS_PER_WINDOW) {
		return {
			ok: false,
			retryAfterSeconds: Math.max(
				1,
				Math.ceil((sendWindow.resetAt - now) / 1000),
			),
		};
	}
	return { ok: true };
}

/** Test seam: drop all counters. Not used by the request path. */
export function __resetContactRateLimit() {
	buckets.clear();
	sendWindow = { count: 0, resetAt: 0 };
}
