import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/**
 * Image feature block (kit « Notre vision du métier d'agenceur »). Full-bleed
 * image under a ~25% ink veil, a title and a light CTA. The title defaults to
 * Montserrat (font-sans) to match « Notre vision… » in the kit; pass `display`
 * to use Montserrat Alternates instead. On hover (kit survol): the image blurs
 * (LAYER_BLUR 15px) and the CTA turns cream — not a zoom.
 */
export function FeatureBlock({
	image,
	alt,
	title,
	cta,
	display = false,
	className,
}: {
	image: string;
	alt: string;
	/** Use \n for line breaks. */
	title: string;
	cta?: { label: string; href: string };
	display?: boolean;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"group relative isolate aspect-[1920/718] overflow-hidden",
				className,
			)}
		>
			<Image
				src={image}
				alt={alt}
				fill
				sizes="(min-width: 1280px) 1200px, 100vw"
				className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[15px]"
			/>
			{/* Kit Rectangle 397 veil = ink @ 0.253 (constant) */}
			<div className="absolute inset-0 bg-ink/25" />
			<div className="relative z-10 flex h-full flex-col justify-center gap-8 px-[6.8%] py-10 text-paper">
				<h2
					className={cn(
						"max-w-[18ch] whitespace-pre-line text-title font-semibold leading-[1.13]",
						display ? "font-display" : "font-sans",
					)}
				>
					{title}
				</h2>
				{cta && (
					/* Kit BTN = 398×61 (fixed width, not content). Survol: cream on block hover. */
					<Button
						tone="light"
						href={cta.href}
						className="w-full max-w-[398px] group-hover:bg-cream group-hover:text-ink hover:bg-cream hover:text-ink"
					>
						{cta.label}
					</Button>
				)}
			</div>
		</section>
	);
}
