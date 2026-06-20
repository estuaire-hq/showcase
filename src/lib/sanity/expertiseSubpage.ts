import {
	type ExpertiseSubpageContent,
	expertiseSubpagesContent,
} from "@/content/expertiseSubpages";
import { sanityFetch } from "./live";
import { mapImage, type ResolvedImage } from "./mapImage";
import { EXPERTISE_SUBPAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `expertisesPage.ts`, but parameterised by `slug`: the
// dynamic route `(site)/expertises/[expertise]` calls this with the segment. Returns `null` if
// the slug has neither a Sanity document nor a maquette default → the page calls `notFound()`.
// Expertise sub-pages are page-specific content → fetched by the route connector, not a global
// `src/components/` wrapper (Principle VIII).

/** Parent of every sub-page breadcrumb — the « Expertises » landing (established by feature 008). */
const BREADCRUMB_PARENT_HREF = "/expertises";

export type BreadcrumbItem = { label: string; href?: string };

/** Parse a « a / b / c » breadcrumb label into items: the FIRST segment links to the parent
 *  « Expertises » page (research §5); the rest are plain (the last = current page). */
function breadcrumbItems(label: string | null | undefined): BreadcrumbItem[] {
	const segments = (label ?? "")
		.split("/")
		.map((s) => s.trim())
		.filter(Boolean);
	return segments.map((seg, i) => ({
		label: seg,
		href: i === 0 ? BREADCRUMB_PARENT_HREF : undefined,
	}));
}

/** Fetch an expertiseSubpage by slug and map it to the page's section props (Sanity → src),
 *  or `null` when the slug is unknown (no document, no maquette default). */
export async function getExpertiseSubpageProps(slug: string) {
	const def: ExpertiseSubpageContent | undefined =
		expertiseSubpagesContent[slug];
	const { data: e } = await sanityFetch({
		query: EXPERTISE_SUBPAGE_QUERY,
		params: { slug },
	});

	// Unknown slug: nothing in Sanity AND no maquette default → 404.
	if (!e && !def) return null;

	const title = e?.heroTitleFill ?? def?.heroTitleFill ?? "";
	const expertiseAlt = `Estuaire — ${(title || slug).replace(/\n/g, " ")}`;

	// Engagements: Sanity list when present, else the maquette list. Each carries only its
	// title; the « 01/ »…« 06/ » numbering is derived from the order at render.
	const engagements =
		e?.engagements && e.engagements.length > 0
			? e.engagements.map((g) => g.title ?? "")
			: (def?.engagements ?? []);

	const responsableImages = (e?.responsableImages ?? [])
		.map((img) => mapImage(img, 900, expertiseAlt))
		.filter((img): img is ResolvedImage => Boolean(img));

	return {
		slug,
		breadcrumb: { items: breadcrumbItems(e?.breadcrumb ?? def?.breadcrumb) },
		hero: {
			eyebrow: e?.heroEyebrow ?? def?.heroEyebrow ?? "",
			titleOutline: e?.heroTitleOutline ?? def?.heroTitleOutline ?? "",
			titleFill: title,
			image: mapImage(e?.heroImage, 1920, expertiseAlt),
		},
		intro: {
			statement: e?.introStatement ?? def?.introStatement ?? "",
			text: e?.introText ?? def?.introText ?? "",
			image: mapImage(e?.introImage, 1100, expertiseAlt),
			blueHalf: def?.introBlueHalf ?? false,
		},
		responsable: {
			titleOutline:
				e?.responsableTitleOutline ?? def?.responsableTitleOutline ?? "",
			titleFill: e?.responsableTitleFill ?? def?.responsableTitleFill ?? "",
			text: e?.responsableText ?? def?.responsableText ?? "",
			images: responsableImages,
		},
		engagements: {
			titleOutline:
				e?.engagementsTitleOutline ?? def?.engagementsTitleOutline ?? "",
			titleFill: e?.engagementsTitleFill ?? def?.engagementsTitleFill ?? "",
			items: engagements,
		},
		caseStudy: {
			titleOutline:
				e?.caseStudyTitleOutline ?? def?.caseStudyTitleOutline ?? "",
			titleFill: e?.caseStudyTitleFill ?? def?.caseStudyTitleFill ?? "",
			image: mapImage(e?.caseStudyImage, 1640, expertiseAlt),
			projectTitle:
				e?.caseStudyProjectTitle ?? def?.caseStudyProjectTitle ?? "",
			meta: e?.caseStudyMeta ?? def?.caseStudyMeta ?? [],
			ctaLabel:
				e?.caseStudyCtaLabel ??
				def?.caseStudyCtaLabel ??
				"découvrir nos réalisations",
			ctaHref: e?.caseStudyCtaHref ?? def?.caseStudyCtaHref ?? "/realisations",
		},
		seo: {
			metaTitle:
				e?.seoMetaTitle ?? def?.seoMetaTitle ?? title.replace(/\n/g, " "),
			metaDescription: e?.seoMetaDescription ?? def?.seoMetaDescription ?? "",
			ogImage: mapImage(e?.seoOgImage, 1200, expertiseAlt),
		},
	};
}

export type ExpertiseSubpageProps = NonNullable<
	Awaited<ReturnType<typeof getExpertiseSubpageProps>>
>;
