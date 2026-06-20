import { type SectorSlug, sectorDetailContent } from "@/content/sectorDetail";
import type { SectorDetail } from "@/sanity.types";
import { defineSeed, image, type SeedImage } from "../define";

/**
 * Shared builder for the four sector detail seeds — text comes from the single source
 * `sectorDetailContent` (Principle IX, no duplication), images from
 * `seed-assets/sectorDetail/<slug>/` (committed, outside public/ — ADR 0006). The runner
 * uploads each image and injects its asset reference + `_key`; the array members declare
 * the `_type` discriminator the schema expects. NOT a registered seed (no `*.seed.ts`
 * name) — a helper imported by the per-sector seed files.
 */

export type SectorSeedImages = {
	hero: string;
	introMain: string;
	introPortrait: string;
	introSquare: string;
	citation1: string;
	citation2: string;
};

export function buildSectorSeed(slug: SectorSlug, files: SectorSeedImages) {
	const c = sectorDetailContent[slug];
	const base = `seed-assets/sectorDetail/${slug}`;
	const img = (file: string, alt: string): SeedImage =>
		image(`${base}/${file}`, alt);
	const citationFiles = [files.citation1, files.citation2];

	return defineSeed<SectorDetail>({
		_id: `sectorDetail-${slug}`,
		_type: "sectorDetail",

		// — Identity —
		title: c.title,
		slug: { _type: "slug", current: slug },

		// — Hero —
		heroEyebrow: c.heroEyebrow,
		heroTitleOutline: c.heroTitleOutline,
		heroTitleFill: c.heroTitleFill,
		heroImage: img(files.hero, `Estuaire — ${c.title}`),

		// — Intro —
		introStatement: c.introStatement,
		introText: c.introText,
		introImageMain: img(files.introMain, `Estuaire — ${c.title}`),
		introImagePortrait: img(files.introPortrait, `Estuaire — ${c.title}`),
		introImageSquare: img(files.introSquare, `Estuaire — ${c.title}`),

		// — Enjeux —
		enjeuxTitleOutline: c.enjeuxTitleOutline,
		enjeuxTitleFill: c.enjeuxTitleFill,
		enjeux: c.enjeux,

		// — Contraintes —
		contraintesTitleOutline: c.contraintesTitleOutline,
		contraintesTitleFill: c.contraintesTitleFill,
		contraintes: c.contraintes.map((chip) => ({
			_type: "constraintChip" as const,
			label: chip.label,
			emphasis: chip.emphasis,
		})),

		// — Argument —
		argument: c.argument,

		// — Citations —
		citations: c.citations.map((q, i) => ({
			_type: "testimonial" as const,
			quote: q.quote,
			...(q.attribution ? { attribution: q.attribution } : {}),
			image: img(citationFiles[i] ?? files.citation1, `Estuaire — ${c.title}`),
		})),

		// — SEO — (no dedicated OG asset in the maquette → reuse the hero visual)
		seoMetaTitle: c.seoMetaTitle,
		seoMetaDescription: c.seoMetaDescription,
		seoOgImage: img(files.hero, `Estuaire — ${c.title}`),
	});
}
