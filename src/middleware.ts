import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * "Coming soon" gate.
 *
 * While `SITE_PREVIEW_TOKEN` is set, the public sees a static placeholder on
 * every route. The real site is reachable by visiting the permanent unlock link
 * `/v/<token>` once: it drops a long-lived cookie and redirects to a clean `/`.
 * The link is shareable and works on any device/browser — it re-sets the cookie
 * on every visit, so it never "expires" the way a one-shot link would.
 *
 * Runs in the Node.js runtime (stable since Next 15.5) so the token is read at
 * REQUEST time, not inlined at build time — set / rotate / remove it in Coolify
 * without a rebuild. Removing the variable opens the site publicly (the gate is
 * a no-op); `robots.ts` keys off the same variable to lift the noindex.
 */

const COOKIE_NAME = "estuaire_preview";
const GATE_PREFIX = "/v/"; // permanent unlock link: /v/<token>
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Constant-time comparison over fixed-length SHA-256 digests. Hashing first
// keeps the comparison length-independent (no leak of the token length) and
// satisfies timingSafeEqual's equal-length requirement.
function tokensMatch(a: string, b: string): boolean {
	const da = createHash("sha256").update(a).digest();
	const db = createHash("sha256").update(b).digest();
	return timingSafeEqual(da, db);
}

// Rewrite (not redirect): the requested URL stays in the address bar, so the
// real site's routes never leak — every public path shows the placeholder.
function placeholder(request: NextRequest): NextResponse {
	return NextResponse.rewrite(new URL("/coming-soon", request.url));
}

export function middleware(request: NextRequest): NextResponse {
	const token = process.env.SITE_PREVIEW_TOKEN;

	// No token configured → gate disabled, site open (post-launch state).
	if (!token) return NextResponse.next();

	const { pathname } = request.nextUrl;

	// Unlock link: /v/<token> → set the cookie, then redirect to a clean URL.
	if (pathname.startsWith(GATE_PREFIX)) {
		const provided = decodeURIComponent(
			pathname.slice(GATE_PREFIX.length).replace(/\/+$/, ""),
		);
		if (provided && tokensMatch(provided, token)) {
			const response = NextResponse.redirect(new URL("/", request.url));
			response.cookies.set(COOKIE_NAME, token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: COOKIE_MAX_AGE,
			});
			return response;
		}
		// Wrong token → placeholder; never confirm the path exists.
		return placeholder(request);
	}

	// Valid cookie → let the real site through.
	const cookie = request.cookies.get(COOKIE_NAME)?.value;
	if (cookie && tokensMatch(cookie, token)) {
		return NextResponse.next();
	}

	// Everyone else → placeholder.
	return placeholder(request);
}

export const config = {
	runtime: "nodejs",
	matcher: [
		/*
		 * Run on everything EXCEPT:
		 * - api            route handlers (revalidate webhook, contact, draft-mode)
		 * - studio         embedded Sanity Studio (has its own auth)
		 * - coming-soon    the placeholder page itself
		 * - _next/static, _next/image   build assets
		 * - common metadata files
		 */
		"/((?!api|studio|coming-soon|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
	],
};
