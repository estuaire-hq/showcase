import { footerContent } from "@/content/footer";
import type { Footer } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared footer.content (single source — no duplication with
// the front fallback). The seed adds the `_type: "link"` discriminator the schema
// expects; the runner injects each `_key`.
//
// CTA images live in seed-assets/ (committed, outside public/ → never served, never
// in the build; see ADR 0006). They are maquette images for now — swap for the curated
// set when ready. The runner uploads them to Sanity; the app reads them from Sanity.
const { navLinks, legalLinks, ...text } = footerContent;

export default defineSeed<Footer>({
	_id: "footer",
	_type: "footer",
	...text,
	ctaImages: [
		image("seed-assets/footer/atelier.jpg", "L'atelier Estuaire"),
		image("seed-assets/footer/realisation.jpg", "Réalisation Estuaire"),
		image("seed-assets/footer/agencement.jpg", "Agencement Estuaire"),
	],
	navLinks: navLinks.map((l) => ({ ...l, _type: "link" as const })),
	legalLinks: legalLinks.map((l) => ({ ...l, _type: "link" as const })),
});
