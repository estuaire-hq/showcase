import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Standalone output for Docker deployment (see Dockerfile)
	output: "standalone",
	// Don't advertise the framework in every response (ADR 0030, CODE-XPOWEREDBY).
	poweredByHeader: false,
	// Baseline security headers (ADR 0030, CODE-HEADERS-BASE). Verified absent in
	// production before this was added: neither Next nor Cloudflare emitted any of them.
	// A Content-Security-Policy is deliberately NOT here: it needs the Sanity image CDN,
	// Umami and OSM tiles enumerated plus the inline styles GSAP and styled-components
	// inject, so it is its own chantier (CODE-HEADERS-CSP), to run in report-only first.
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					// One year, apex only. `includeSubDomains` and `preload` are deliberate
					// escalations (hard to walk back, and they bind subdomains we have not
					// inventoried), so decide them separately.
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000",
					},
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					// SAMEORIGIN, not DENY: the Studio's Presentation tool frames the site
					// from the same origin.
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
				],
			},
		];
	},
	// Per-worktree dev origins served by portless (http://[<branch>.]estuaire.localhost:1355).
	// Lets Next's dev server accept their cross-origin HMR/asset requests. See ADR 0013.
	allowedDevOrigins: ["estuaire.localhost", "*.estuaire.localhost"],
	images: {
		// Sanity's image CDN is the optimizer (see src/lib/sanity/imageLoader.ts):
		// next/image builds its srcset from that loader and the browser fetches
		// cdn.sanity.io directly, so heroes are served at the width they actually
		// need (up to 4K) in one pass — no /_next/image re-encode on the VPS.
		loader: "custom",
		loaderFile: "./src/lib/sanity/imageLoader.ts",
		// srcset candidate widths. Default set + 2560 so a QHD (1440p) full-bleed
		// hero gets a right-sized 2560 candidate instead of jumping to 3840; 3840
		// stays the ceiling (4K DPR1 / QHD DPR2). "net sans gâcher la bande passante".
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
		// Kept for reference/fallback; the custom loader bypasses this validation.
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				pathname: "/images/**",
			},
		],
	},
};

export default nextConfig;
