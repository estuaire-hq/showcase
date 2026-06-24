import Image from "next/image";
import { cn, umamiAttrs } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { Button } from "./Button";

/**
 * Full-bleed image feature band — shared by the sectors page « 04/ SECTEURS » bands
 * (node 51:3386) and the expertises « level cards » (kit « Notre vision du métier
 * d'agenceur », nodes 51:2958/2969/2981). A full-bleed image under a ~25% ink veil with
 * overlaid content — a title, an optional separator rule + promise line, and an optional
 * light CTA pill with a trailing arrow. On hover (kit survol): the image blurs (LAYER_BLUR
 * 15px) and the CTA turns cream — not a zoom.
 *
 * Aspect defaults to the kit band 1920/718; pass a responsive `aspect-*` via `className`
 * for a taller stacked layout on small screens (expertises: square mobile / 768·718 tablet;
 * sectors: 390·470 / 768·520). The content layout defaults to centred; pass
 * `contentClassName` to anchor it elsewhere (expertises cards anchor lower-left). Heading
 * level is overridable (`titleAs`) so cards can sit as `<h3>` under a section `<h2>`
 * (semantic hierarchy — FR-014).
 *
 * The title defaults to Montserrat (font-sans, « Notre vision… »); pass `display` for
 * Montserrat Alternates with the brand casse (BrandText) — used by the sector bands
 * (« Retail », « Bureau »…). Presentational only (Principle VIII) — image, copy, CTA href +
 * tracking are passed in; the CTA fires a declarative Umami event (`ctaUmamiEvent`).
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
	titleAs = "h2",
	className,
	contentClassName,
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
	titleAs?: "h2" | "h3";
	className?: string;
	/** Override the overlaid content box (alignment/padding) per consumer — defaults to a
	 *  centred band; expertises cards anchor it lower-left. */
	contentClassName?: string;
}) {
	const Heading = titleAs;
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
					className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[8px]"
				/>
			)}
			{/* Kit Rectangle 397 veil = ink @ 0.253 (constant) */}
			<div className="absolute inset-0 bg-ink/25" />
			<div
				className={cn(
					"relative z-10 flex h-full flex-col justify-center gap-7 px-5 py-12 text-paper md:gap-8 md:px-10 lg:px-[7.29%]",
					contentClassName,
				)}
			>
				<Heading
					className={cn(
						"max-w-[18ch] whitespace-pre-line font-semibold text-title-sm leading-[1.13] lg:text-title",
						display ? "font-display" : "font-sans",
					)}
				>
					{display ? <BrandText>{title}</BrandText> : title}
				</Heading>
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
				{/* Render the CTA only with a real destination — an empty href would be a
				    dead link to the current page. */}
				{cta?.href && (
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
