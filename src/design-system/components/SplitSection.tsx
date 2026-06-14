import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { SectionTitle } from "./SectionTitle";

export type SplitSectionImage = {
	src: string;
	alt: string;
	blurDataURL?: string;
};

/**
 * Split section band (maquette « 02/ NOS EXPERTISES » + « 04/ NOTRE VISION »): a
 * full-width coloured band with an image on one side and a text column (contour/fill
 * title + rule + body + CTA) on the other. Two variants:
 *
 *  - `expertises` — dark slate band, paper text, white CTA pill, image left (desktop).
 *  - `vision` — cream frame around a white card, ink text, dark CTA pill, image on a
 *    blue (estuaire) panel, image left (desktop).
 *
 * Responsive: side-by-side from `md`; stacked on mobile (image after the text for
 * expertises, before it for vision — matching the maquette stack order). Presentational
 * only — content (image, copy, CTA href) is passed in by the page (Principle VIII).
 *
 * `data-reveal` (title) and `data-image-reveal` (image) hooks let the page apply the
 * estuaire-motion line-mask + clip reveals; degrades to static content without them.
 */
export function SplitSection({
	variant,
	image,
	titleOutline,
	titleFill,
	text,
	cta,
	ctaUmamiEvent,
	ctaUmamiData,
	className,
}: {
	variant: "expertises" | "vision";
	image?: SplitSectionImage;
	titleOutline: string;
	titleFill: string;
	text: string;
	cta: { label: string; href: string };
	/** Umami event fired on the CTA click (declarative — see Principle VI). */
	ctaUmamiEvent?: string;
	ctaUmamiData?: Record<string, string>;
	className?: string;
}) {
	const isVision = variant === "vision";

	const umamiAttrs: Record<string, string> = {};
	if (ctaUmamiEvent) {
		umamiAttrs["data-umami-event"] = ctaUmamiEvent;
		for (const [k, v] of Object.entries(ctaUmamiData ?? {})) {
			umamiAttrs[`data-umami-event-${k}`] = v;
		}
	}

	const title = <SectionTitle outline={titleOutline} fill={titleFill} />;

	const body = (
		<div
			className={cn(
				"flex flex-col gap-7",
				isVision ? "text-ink" : "text-paper",
			)}
		>
			{title}
			<hr
				className={cn(
					"w-full border-t-[3px]",
					isVision ? "border-ink" : "border-paper",
				)}
			/>
			<p
				className={cn(
					"max-w-[40ch] whitespace-pre-line",
					isVision
						? "font-sans font-normal text-body leading-relaxed"
						: "font-display font-semibold text-body leading-snug lg:text-lead",
				)}
			>
				{text}
			</p>
			<Button
				tone={isVision ? "dark" : "light"}
				href={cta.href}
				arrow
				className="mt-1 w-full max-w-[398px]"
				{...umamiAttrs}
			>
				{cta.label}
			</Button>
		</div>
	);

	const media: ReactNode = image ? (
		<div
			data-parallax={isVision ? "4" : "16"}
			data-parallax-mode={isVision ? "drift" : "settle"}
			className={cn(
				"relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-full md:min-h-[520px]",
				isVision ? "bg-estuaire lg:min-h-[940px]" : "lg:min-h-[860px]",
			)}
		>
			<Image
				src={image.src}
				alt={image.alt}
				fill
				sizes="(min-width: 1024px) 36vw, (min-width: 768px) 40vw, 90vw"
				placeholder={image.blurDataURL ? "blur" : "empty"}
				blurDataURL={image.blurDataURL}
				className="object-cover"
			/>
		</div>
	) : null;

	const gridCols = media
		? "md:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]"
		: "md:grid-cols-1";

	// Vision: image + text centered on a white card inside a cream frame.
	if (isVision) {
		return (
			<section
				className={cn("bg-cream px-5 py-5 md:px-10 md:py-10", className)}
			>
				<div className="mx-auto max-w-[1920px] bg-paper px-5 py-12 md:px-12 md:py-16 lg:px-[7%] lg:py-24">
					<div
						className={cn(
							"flex flex-col gap-10 md:grid md:items-center md:gap-12 lg:gap-20",
							gridCols,
						)}
					>
						{media}
						{body}
					</div>
				</div>
			</section>
		);
	}

	// Expertises: a dark slate BAND that stops short of the section bottom, so the
	// image BLEEDS past it into the white strip below (maquette: the image sits ~12%
	// lower than the band and pokes out under it). The text stays centered in the band.
	return (
		<section className={cn("relative isolate bg-paper", className)}>
			<div
				aria-hidden
				className="absolute inset-x-0 top-0 bottom-[64px] bg-slate lg:bottom-[150px]"
			/>
			<div
				className={cn(
					"relative mx-auto flex max-w-[1920px] flex-col gap-10 px-5 pt-14 pb-8 md:grid md:items-center md:gap-12 md:px-10 md:pt-16 md:pb-10 lg:gap-20 lg:px-[7%] lg:pt-24 lg:pb-12",
					gridCols,
				)}
			>
				{/* Image left (desktop) / below the text (mobile); bottom-aligned (md+) so
				    its lower edge bleeds out under the slate band. */}
				<div className="order-2 md:order-1 md:self-end">{media}</div>
				<div className="order-1 md:order-2">{body}</div>
			</div>
		</section>
	);
}
