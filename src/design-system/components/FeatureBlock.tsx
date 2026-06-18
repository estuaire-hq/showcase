import Image from "next/image";
import { cn, umamiAttrs } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { Button } from "./Button";

/**
 * Full-bleed image feature band (kit « Notre vision du métier d'agenceur » + the
 * sectors page « 04/ SECTEURS » bands, node 51:3386). A full-bleed image under a ~25%
 * ink veil with overlaid content — a title, an optional separator rule + promise line,
 * and an optional light CTA. Aspect defaults to the kit band 1920/718; pass a responsive
 * `aspect-*` via `className` for a taller stacked layout on small screens.
 *
 * The title defaults to Montserrat (font-sans, « Notre vision… »); pass `display` for
 * Montserrat Alternates with the brand casse (BrandText) — used by the sector bands
 * (« Retail », « Bureau »…). On hover (kit survol): the image blurs (LAYER_BLUR 15px)
 * and the CTA turns cream — not a zoom.
 *
 * Presentational only (Principle VIII) — image, copy, CTA href + tracking are passed in.
 */
export function FeatureBlock({
	image,
	alt,
	blurDataURL,
	title,
	body,
	rule = false,
	cta,
	ctaUmamiEvent,
	ctaUmamiData,
	display = false,
	className,
}: {
	/** Background image src. Absent (unseeded) → the band degrades to its dark backdrop. */
	image?: string;
	alt: string;
	/** LQIP blur placeholder (SC-007 / cas limite « visuel lent »). */
	blurDataURL?: string;
	/** Use \n for line breaks. */
	title: string;
	/** Optional promise/body line under the title (e.g. a sector promise). */
	body?: string;
	/** Show a separator rule between the title and the body (kit sector band). */
	rule?: boolean;
	cta?: { label: string; href: string };
	/** Umami event fired on the CTA click (declarative — Principle VI). */
	ctaUmamiEvent?: string;
	ctaUmamiData?: Record<string, string>;
	display?: boolean;
	className?: string;
}) {
	const umami = umamiAttrs(ctaUmamiEvent, ctaUmamiData);

	return (
		<section
			className={cn(
				"group relative isolate aspect-[1920/718] overflow-hidden bg-ink",
				className,
			)}
		>
			{image && (
				<Image
					src={image}
					alt={alt}
					fill
					sizes="100vw"
					placeholder={blurDataURL ? "blur" : "empty"}
					blurDataURL={blurDataURL}
					className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[15px]"
				/>
			)}
			{/* Kit Rectangle 397 veil = ink @ 0.253 (constant) */}
			<div className="absolute inset-0 bg-ink/25" />
			<div className="relative z-10 flex h-full flex-col justify-center gap-7 px-5 py-12 text-paper md:gap-8 md:px-10 lg:px-[7.29%]">
				<h2
					className={cn(
						"max-w-[18ch] whitespace-pre-line font-semibold text-title-sm leading-[1.13] lg:text-title",
						display ? "font-display" : "font-sans",
					)}
				>
					{display ? <BrandText>{title}</BrandText> : title}
				</h2>
				{(rule || body) && (
					<div className="flex max-w-[88%] flex-col gap-4 lg:max-w-[85.4%]">
						{rule && <div className="h-[2px] w-full bg-paper lg:h-[3px]" />}
						{body && (
							<p className="whitespace-pre-line font-display font-semibold text-body-sm leading-snug lg:text-body lg:leading-snug">
								{body}
							</p>
						)}
					</div>
				)}
				{cta && (
					/* Kit BTN = 398×61 (fixed width, not content). Survol: cream on block hover. */
					<Button
						tone="light"
						href={cta.href}
						className="w-full max-w-[398px] group-hover:bg-cream group-hover:text-ink hover:bg-cream hover:text-ink"
						{...umami}
					>
						{cta.label}
					</Button>
				)}
			</div>
		</section>
	);
}
