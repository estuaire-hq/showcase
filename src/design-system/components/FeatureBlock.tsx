import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/**
 * Full-width image feature block — the expertises « level card » (kit « Notre vision du
 * métier d'agenceur », nodes 51:2958/2969/2981; tablet 87:5600; mobile 87:6290). A
 * full-bleed image under a ~25% ink veil, a lower-left title and a light CTA pill with a
 * trailing arrow. The title defaults to Montserrat (font-sans) to match the maquette; pass
 * `display` to use Montserrat Alternates instead. On hover (kit survol): the image blurs
 * (LAYER_BLUR 15px) and the CTA turns cream — not a zoom.
 *
 * Responsive aspect read on the maquette: square on mobile (390×390), 768×718 on tablet,
 * 1920×718 on desktop. Heading level is overridable (`titleAs`) so cards can sit as `<h3>`
 * under a section `<h2>` (semantic hierarchy — FR-014). The CTA forwards optional
 * `tracking` data-attributes (e.g. Umami events) to its inner button (Principle VI).
 */
export function FeatureBlock({
	image,
	alt,
	title,
	cta,
	display = false,
	titleAs = "h2",
	className,
}: {
	image: string;
	alt: string;
	/** Use \n for line breaks. */
	title: string;
	cta?: {
		label: string;
		href: string;
		/** data-* attributes forwarded to the CTA button (e.g. Umami tracking). */
		tracking?: Record<`data-${string}`, string>;
	};
	display?: boolean;
	titleAs?: "h2" | "h3";
	className?: string;
}) {
	const Heading = titleAs;
	return (
		<section
			className={cn(
				// `bg-ink` is the degraded backdrop when no image is configured yet, so the
				// veiled card stays dark (white title legible) instead of a broken empty image.
				"group relative isolate aspect-square overflow-hidden bg-ink md:aspect-[768/718] lg:aspect-[1920/718]",
				className,
			)}
		>
			{image && (
				<Image
					src={image}
					alt={alt}
					fill
					sizes="100vw"
					className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[15px]"
				/>
			)}
			{/* Kit Rectangle 397 veil = ink @ 0.253 (constant) */}
			<div className="absolute inset-0 bg-ink/25" />
			{/* Content sits lower-left (maquette): title then CTA, anchored to the bottom. */}
			<div className="relative z-10 flex h-full flex-col justify-end gap-6 px-5 pb-9 text-paper md:gap-8 md:px-[11.7%] md:pb-[13%] lg:px-[6.8%] lg:pb-[9.5%]">
				<Heading
					className={cn(
						"max-w-[18ch] whitespace-pre-line text-title-sm font-semibold leading-[1.13] lg:text-title",
						display ? "font-display" : "font-sans",
					)}
				>
					{title}
				</Heading>
				{/* Render the CTA only with a real destination — an empty href would be a
				    dead link to the current page. */}
				{cta?.href && (
					<Button
						tone="light"
						href={cta.href}
						className="self-start group-hover:bg-cream group-hover:text-ink hover:bg-cream hover:text-ink"
						{...cta.tracking}
					>
						{cta.label}
					</Button>
				)}
			</div>
		</section>
	);
}
