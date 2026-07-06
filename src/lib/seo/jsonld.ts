import {
	absoluteUrl,
	BUSINESS,
	DEFAULT_DESCRIPTION,
	GEO,
	LOGO_PATH,
	POSTAL_ADDRESS,
	SAME_AS,
	SITE_NAME,
	SITE_URL,
	TELEPHONE_E164,
} from "./config";

// schema.org JSON-LD builders — plain data (Principle VIII: data lives outside the DS). The
// RSC/connector calls a builder and hands the object to `<JsonLd>`. Nodes are linked by `@id`
// so search engines merge them into one entity graph.

/** A JSON-LD node (loose by design — schema.org shapes are heterogeneous). */
export type JsonLdObject = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function postalAddress(): JsonLdObject {
	return { "@type": "PostalAddress", ...POSTAL_ADDRESS };
}

/**
 * The company as a SINGLE entity typed both `Organization` and `LocalBusiness` (ADR 0025):
 * MOSAIQUE PRODUCTION has one registered seat / atelier, so one node carries identity + logo
 * + full NAP + geo. Emitted globally (root layout) → present on every page for the knowledge
 * panel and local signals. `sameAs` is omitted until the social profiles are known.
 */
export function organizationJsonLd(): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": ["Organization", "LocalBusiness"],
		"@id": ORG_ID,
		name: BUSINESS.legalName,
		alternateName: BUSINESS.brand,
		legalName: BUSINESS.legalName,
		url: SITE_URL,
		logo: absoluteUrl(LOGO_PATH),
		image: absoluteUrl(LOGO_PATH),
		description: DEFAULT_DESCRIPTION,
		email: BUSINESS.email,
		telephone: TELEPHONE_E164,
		vatID: BUSINESS.vatID,
		address: postalAddress(),
		geo: {
			"@type": "GeoCoordinates",
			latitude: GEO.latitude,
			longitude: GEO.longitude,
		},
		...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
	};
}

/** The site itself, attributed to the organization as publisher. */
export function websiteJsonLd(): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": WEBSITE_ID,
		url: SITE_URL,
		name: SITE_NAME,
		inLanguage: "fr-FR",
		publisher: { "@id": ORG_ID },
	};
}

/** Breadcrumb trail for a detail page. `path` is site-root-relative; resolved to absolute. */
export function breadcrumbJsonLd(
	items: { name: string; path: string }[],
): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((it, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: it.name,
			item: absoluteUrl(it.path),
		})),
	};
}

/** A réalisation (case study) as a `CreativeWork`, created by the organization. */
export function realisationJsonLd(input: {
	slug: string;
	title: string;
	description?: string | null;
	image?: string;
	client?: string | null;
	year?: string;
}): JsonLdObject {
	const url = absoluteUrl(`/realisations/${input.slug}`);
	return {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		"@id": `${url}#creativework`,
		name: input.title,
		url,
		inLanguage: "fr-FR",
		creator: { "@id": ORG_ID },
		...(input.description ? { description: input.description } : {}),
		...(input.image ? { image: input.image } : {}),
		...(input.year ? { datePublished: input.year } : {}),
		...(input.client
			? { about: { "@type": "Organization", name: input.client } }
			: {}),
	};
}
