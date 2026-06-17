import type { SanityImageSource } from "@sanity/image-url";
import type { SanityImageAssetReference } from "@/sanity.types";
import { urlFor } from "./image";

// Shared image mapping for every page connector (home, about, …). Extracted so the
// `Sanity image → { src, alt, blurDataURL }` resolution has ONE definition
// (constitution Principle IV — reuse before duplicate; content-model contract §4).

/** The accessor shape `mapImage` needs across every projected image: full content
 *  images carry `lqip`, the OG image omits it (no blur placeholder needed). `asset` is
 *  the generated reference type — not `unknown` — so this is the canonical shape, not a
 *  loose duplicate of the schema. */
export type QueryImage =
	| {
			asset: SanityImageAssetReference | null;
			alt?: string | null;
			lqip?: string | null;
	  }
	| null
	| undefined;

/** Resolved image as the design-system components expect it. */
export type ResolvedImage = { src: string; alt: string; blurDataURL?: string };

/** Map a projected Sanity image to `{ src, alt, blurDataURL }`, or undefined if no asset. */
export function mapImage(
	img: QueryImage,
	width: number,
	fallbackAlt = "",
): ResolvedImage | undefined {
	// Guards a missing asset, NOT a dangling ref (asset present but its document deleted):
	// urlFor would then build a URL that 404s. Acceptable — the common case is no asset.
	if (!img?.asset) return undefined;
	return {
		// Cast as in footer.ts: the projection is a valid image source at runtime, but its
		// generated type is not structurally `SanityImageSource`.
		src: urlFor(img as SanityImageSource)
			.width(width)
			.auto("format")
			.url(),
		alt: img.alt ?? fallbackAlt,
		blurDataURL: img.lqip ?? undefined,
	};
}
