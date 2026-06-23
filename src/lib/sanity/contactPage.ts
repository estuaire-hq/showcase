import { contactPageContent } from "@/content/contactPage";
import type { CONTACT_PAGE_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "./live";
import { mapImage } from "./mapImage";
import { CONTACT_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (Principle IX). Mirror of `aboutPage.ts`:
// fetch the `contactPage` singleton, apply the maquette defaults (`contactPageContent`,
// single source with the seed) and resolve images via `mapImage`. Contact content is
// page-specific (Principle VIII) → fetched by the page connector, not a global wrapper.

const DEFAULTS = contactPageContent;

/** Routing entry: a form label paired with the recipient mailbox it routes to. */
export type RequestTypeRouting = { label: string; recipient: string };

type RawRequestTypes = NonNullable<CONTACT_PAGE_QUERY_RESULT>["requestTypes"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolve the request-type routing from Sanity, falling back to the maquette list.
 * Drops entries with a missing label or a malformed recipient (defensive — a bad CMS
 * value must not break routing); if nothing valid remains, uses the defaults.
 */
function resolveRequestTypes(
	raw: RawRequestTypes | undefined,
): RequestTypeRouting[] {
	const valid = (raw ?? []).flatMap((rt) =>
		rt?.label && rt.recipient && EMAIL_RE.test(rt.recipient)
			? [{ label: rt.label, recipient: rt.recipient }]
			: [],
	);
	return valid.length ? valid : DEFAULTS.requestTypes;
}

/**
 * Server-side routing map for `POST /api/contact`. The client only sends the chosen
 * LABEL; the recipient is resolved here from the CMS (never trusted from the client).
 */
export async function getContactRequestTypes(): Promise<RequestTypeRouting[]> {
	const { data: c } = await sanityFetch({ query: CONTACT_PAGE_QUERY });
	return resolveRequestTypes(c?.requestTypes);
}

/** Fetch the contactPage singleton and map it to the page's section props. */
export async function getContactPageProps() {
	const { data: c } = await sanityFetch({ query: CONTACT_PAGE_QUERY });

	return {
		hero: {
			titleOutline: c?.heroTitleOutline ?? DEFAULTS.heroTitleOutline,
			titleFill: c?.heroTitleFill ?? DEFAULTS.heroTitleFill,
		},
		form: {
			image: mapImage(c?.formImage, 900, "Estuaire — nous contacter"),
			titleOutline: c?.formTitleOutline ?? DEFAULTS.formTitleOutline,
			titleFill: c?.formTitleFill ?? DEFAULTS.formTitleFill,
			requestTypes: resolveRequestTypes(c?.requestTypes),
		},
		coordinates: {
			find: {
				titleOutline: c?.findTitleOutline ?? DEFAULTS.findTitleOutline,
				titleFill: c?.findTitleFill ?? DEFAULTS.findTitleFill,
			},
			address: c?.address ?? DEFAULTS.address,
			contact: {
				titleOutline: c?.contactTitleOutline ?? DEFAULTS.contactTitleOutline,
				titleFill: c?.contactTitleFill ?? DEFAULTS.contactTitleFill,
			},
			email: c?.email ?? DEFAULTS.email,
			map: {
				lat: c?.mapLocation?.lat ?? DEFAULTS.mapLocation.lat,
				lng: c?.mapLocation?.lng ?? DEFAULTS.mapLocation.lng,
				zoom: c?.mapZoom ?? DEFAULTS.mapZoom,
				markerLabel: "Estuaire",
			},
		},
		seo: {
			metaTitle: c?.seoMetaTitle ?? DEFAULTS.seoMetaTitle,
			metaDescription: c?.seoMetaDescription ?? DEFAULTS.seoMetaDescription,
			ogImage: mapImage(c?.seoOgImage, 1200, "Estuaire — Contact"),
		},
	};
}

export type ContactPageProps = Awaited<ReturnType<typeof getContactPageProps>>;
