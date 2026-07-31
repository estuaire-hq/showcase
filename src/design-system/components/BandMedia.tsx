import Image from "next/image";
import { oversampled } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
	BAND_BLEED,
	BAND_IMAGE_HOVER,
	BAND_PARALLAX,
	BAND_VEIL,
	BAND_VEIL_REST,
} from "../bandLink";

/**
 * The visual half of a full-bleed « bandeau-lien »: the image layer under its ink veils.
 * Shared by `CaseStudyPanel` (home), `CaseStudyCard` (portfolio + expertise detail) and
 * `FeatureBlock` (univers sectors + expertises levels), so the hover, the veil and the
 * scroll bleed have ONE definition (see `../bandLink`) instead of three that drifted apart.
 *
 * The caller owns the band's box (aspect ratio, `overflow-hidden`, `group`, `isolate`) and
 * stacks its own content above this. A missing image degrades to the bare veils over the
 * caller's `bg-ink`, never a broken `<Image src="">`.
 *
 * The image layer carries `data-parallax`, inert unless a `<Parallax>` ancestor is mounted
 * (`@/lib/motion`) — the design system declares the hook, the driver lives outside it
 * (ADR 0021 D8; same convention as `Testimonial`). The layer is taller than the band so
 * the drift never exposes an edge.
 */
export function BandMedia({
	image,
	alt,
	blurDataURL,
	sizes = "100vw",
	priority,
}: {
	/** Absent (unseeded / dangling asset) → the band degrades to its veils. */
	image?: string;
	alt: string;
	/** LQIP blur placeholder. */
	blurDataURL?: string;
	/** Defaults to the full viewport. Over-requesting is the intended direction (ADR 0027). */
	sizes?: string;
	priority?: boolean;
}) {
	return (
		<>
			<div
				className={cn("absolute inset-x-0", BAND_BLEED)}
				data-parallax={BAND_PARALLAX}
			>
				{image && (
					<Image
						// Oversampled so the browser, not Sanity's soft CDN resize, does the
						// last downscale (`@/lib/images`, ADR 0027).
						src={oversampled(image)}
						alt={alt}
						fill
						sizes={sizes}
						priority={priority}
						placeholder={blurDataURL ? "blur" : "empty"}
						blurDataURL={blurDataURL}
						className={cn("object-cover", BAND_IMAGE_HOVER)}
					/>
				)}
			</div>
			<div aria-hidden className={cn("absolute inset-0", BAND_VEIL)} />
			<div aria-hidden className={cn("absolute inset-0", BAND_VEIL_REST)} />
		</>
	);
}
