import type { SanityImageSource } from "@sanity/image-url";
import { footerContent } from "@/content/footer";
import type { FOOTER_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "./image";
import { sanityFetch } from "./live";
import { FOOTER_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). FOOTER_QUERY_RESULT is a union of the "document
// absent" / partial / populated shapes; narrow to the populated branch's members.
type FooterData = NonNullable<FOOTER_QUERY_RESULT>;
type CtaImage = NonNullable<FooterData["ctaImages"]>[number];
type FooterLink = NonNullable<FooterData["navLinks"]>[number];
type Link = { label: string; href: string };

// Maquette fallback — the footer renders with the real design copy even before the
// Sanity `footer` singleton is filled (see ADR 0004). Text comes from the shared
// footer.content (single source with the seed — Principle IX), plus the two
// front-only fallbacks (resolved plaquette href + LinkedIn). Sanity overrides each
// value when present. CTA images come ONLY from Sanity (no code default).
const DEFAULTS = {
	...footerContent,
	linkedInHref: footerContent.linkedInUrl,
	plaquetteHref: "#",
};

/** Fetch the footer singleton and map it to `<SiteFooter>` props (Sanity → src). */
export async function getFooterProps() {
	const { data: f } = await sanityFetch({ query: FOOTER_QUERY });

	const images = (f?.ctaImages ?? [])
		.filter((img): img is CtaImage & { asset: object } => Boolean(img.asset))
		.map((img) => ({
			src: urlFor(img as SanityImageSource)
				.width(1600)
				.fit("crop")
				.auto("format")
				.url(),
			alt: img.alt ?? "",
			blurDataURL: img.lqip ?? undefined,
		}));

	const navLinks = (f?.navLinks ?? []).filter((l): l is FooterLink & Link =>
		Boolean(l.label && l.href),
	);
	const legalLinks = (f?.legalLinks ?? []).filter((l): l is FooterLink & Link =>
		Boolean(l.label && l.href),
	);

	return {
		cta: {
			titleOutline: f?.ctaTitleOutline ?? DEFAULTS.ctaTitleOutline,
			titleFill: f?.ctaTitleFill ?? DEFAULTS.ctaTitleFill,
			label: f?.ctaButtonLabel ?? DEFAULTS.ctaButtonLabel,
			href: f?.ctaButtonHref ?? DEFAULTS.ctaButtonHref,
			images,
		},
		tagline: f?.tagline ?? DEFAULTS.tagline,
		address: f?.address ?? DEFAULTS.address,
		contactHref: f?.contactHref ?? DEFAULTS.contactHref,
		plaquetteLabel: f?.plaquetteLabel ?? DEFAULTS.plaquetteLabel,
		plaquetteHref: f?.plaquetteUrl ?? DEFAULTS.plaquetteHref,
		linkedInHref: f?.linkedInUrl ?? DEFAULTS.linkedInHref,
		navLinks: navLinks.length ? navLinks : DEFAULTS.navLinks,
		legalLinks: legalLinks.length ? legalLinks : DEFAULTS.legalLinks,
	};
}
