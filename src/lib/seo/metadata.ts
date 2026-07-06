import type { Metadata } from "next";
import type { ResolvedImage } from "@/lib/sanity/mapImage";
import {
	DEFAULT_DESCRIPTION,
	DEFAULT_OG_IMAGE,
	SITE_LOCALE,
	SITE_NAME,
} from "./config";

// Single builder every page's `generateMetadata` (and the static pages) goes through, so
// canonical + Open Graph + Twitter stay consistent and complete site-wide. Every page ALWAYS
// gets an image — the CMS `seoOgImage` when present, else the branded default served at
// `/opengraph-image`. We set it explicitly rather than relying on Next's file auto-injection,
// which is dropped as soon as a page defines its own `openGraph`. `metadataBase` (root layout)
// resolves the relative `canonical` / `openGraph.url` / default image path to absolute URLs.

type BuildMetadataInput = {
	/** Page title — rendered through the root `"%s | Estuaire"` template unless `absoluteTitle`. */
	title: string;
	/** Meta/OG/Twitter description. Falls back to the global default when omitted. */
	description?: string | null;
	/** Site-root-relative canonical path, e.g. `"/expertises"`. */
	path: string;
	/** CMS share image (already resolved). When absent, the default OG image applies. */
	image?: ResolvedImage;
	/** Open Graph type — `"website"` (default) or `"article"` for editorial/detail pages. */
	type?: "website" | "article";
	/** Home only: bypass the title template so the title stands alone. */
	absoluteTitle?: boolean;
};

export function buildMetadata({
	title,
	description,
	path,
	image,
	type = "website",
	absoluteTitle = false,
}: BuildMetadataInput): Metadata {
	const desc = description ?? DEFAULT_DESCRIPTION;
	const ogImage = image ? { url: image.src, alt: image.alt } : DEFAULT_OG_IMAGE;

	return {
		title: absoluteTitle ? { absolute: title } : title,
		description: desc,
		alternates: { canonical: path },
		openGraph: {
			title,
			description: desc,
			url: path,
			siteName: SITE_NAME,
			locale: SITE_LOCALE,
			type,
			images: [ogImage],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: desc,
			images: [ogImage.url],
		},
	};
}
