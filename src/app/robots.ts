import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://estuaire.fr";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/studio/", "/api/"],
		},
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
