import type { MetadataRoute } from "next";

// Read the gate flag at request time, not build time (mirrors the proxy gate,
// so removing SITE_PREVIEW_TOKEN in Coolify lifts the noindex without a rebuild).
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://estuaire.fr";

	// While the "coming soon" gate is active, keep the whole site out of search
	// engines — neither the placeholder nor the gated real site should be indexed.
	if (process.env.SITE_PREVIEW_TOKEN) {
		return {
			rules: { userAgent: "*", disallow: "/" },
		};
	}

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/studio/", "/api/", "/lab/"],
		},
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
