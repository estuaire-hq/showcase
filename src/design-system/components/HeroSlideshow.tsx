"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

export type HeroSlide = {
	/** Resolved image URL (page builds it from Sanity via urlFor). Optional: the
	 *  hero degrades to its dark panel + title when no image is configured yet. */
	src?: string;
	alt: string;
	/** Contour lines (may contain \n). Rendered stroked. */
	titleOutline: string;
	/** Solid last line. */
	titleFill: string;
	blurDataURL?: string;
};

const UPPER = /\p{Lu}/u;
const charFont = (ch: string) =>
	UPPER.test(ch)
		? "var(--font-montserrat)"
		: "var(--font-montserrat-alternates)";

/** Split a slide into render lines: the outline lines (stroked) + the fill line. */
function slideLines(slide: HeroSlide) {
	const outline = slide.titleOutline ? slide.titleOutline.split("\n") : [];
	return [
		...outline.map((text) => ({ text, outline: true })),
		{ text: slide.titleFill ?? "", outline: false },
	];
}

/**
 * Hero slideshow (maquette « 02/SLIDER v1 », nodes 51:2420 + 51:2221 / 77:3149 /
 * 77:3150). The IMAGE cross-fades; the TITLE is RECONSTRUCTED letter by letter on each
 * slide change — only the characters that differ from the previous slide re-animate
 * (a light fade + downward settle, staggered), the rest stay put. No control, auto
 * (FR-002). The `label` is the constant brand H1 (FR-014) above the rotating title.
 *
 * NOTHING animates on first paint (the initial slide is static); the reconstruction
 * only fires on subsequent slide changes. `prefers-reduced-motion` → no autoplay and
 * no reconstruction (the first slide stays frozen).
 *
 * Per-breakpoint geometry: dark panel left 52% (lg) / 64.2% (md), full on mobile;
 * the image is a contained window straddling the dark/white seam (lg) / a band (mobile).
 */
export function HeroSlideshow({
	label,
	slides,
	interval = 6000,
	className,
}: {
	label: string;
	slides: HeroSlide[];
	/** ms between slides (default 6000). */
	interval?: number;
	className?: string;
}) {
	const [active, setActive] = useState(0);
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);
	const prevLines = useRef<string[] | null>(null);
	const imgInit = useRef(false);

	// Scroll: the hero image keeps moving as the hero scrolls away — a slow parallax
	// rise + subtle zoom (recede). Scroll-driven only (nothing on first paint).
	useGSAP(
		() => {
			const img = imageRef.current;
			const section = sectionRef.current;
			if (!img || !section) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			gsap.fromTo(
				img,
				{ yPercent: 0, scale: 1 },
				{
					yPercent: -14,
					scale: 1.08,
					ease: "none",
					scrollTrigger: {
						trigger: section,
						start: "top top",
						end: "bottom top",
						scrub: true,
						invalidateOnRefresh: true,
					},
				},
			);
			ScrollTrigger.refresh();
		},
		{ scope: sectionRef },
	);

	useGSAP(
		() => {
			if (slides.length < 2) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			const id = setInterval(
				() => setActive((i) => (i + 1) % slides.length),
				interval,
			);
			return () => clearInterval(id);
		},
		{ dependencies: [slides.length, interval] },
	);

	// Reconstruction: on every `active` change, animate only the glyphs that differ
	// from the previous slide (by line + index). Skipped on the first run (no first
	// paint) and under reduced motion.
	const lines = slides.length ? slideLines(slides[active]) : [];
	useGSAP(
		() => {
			const root = titleRef.current;
			const prev = prevLines.current;
			const current = lines.map((l) => l.text);
			prevLines.current = current;
			if (!root || !prev) return; // first paint → static
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			// Collect every changed glyph ACROSS ALL LINES, in reading order (top line then
			// bottom), then animate them with ONE continuous stagger — the whole phrase
			// rebuilds letter after letter (the bottom line continues the top, never in
			// parallel). Per line, reconstruct from its first differing glyph to its end.
			const lineEls = root.querySelectorAll<HTMLElement>("[data-line]");
			const changed: HTMLElement[] = [];
			lineEls.forEach((lineEl, li) => {
				const before = prev[li] ?? "";
				const cur = current[li] ?? "";
				let from = 0;
				while (from < cur.length && before[from] === cur[from]) from++;
				changed.push(
					...[...lineEl.querySelectorAll<HTMLElement>("[data-char]")].slice(
						from,
					),
				);
			});
			if (changed.length)
				gsap.from(changed, {
					autoAlpha: 0,
					// random start offset per glyph → the rebuild feels organic (kept modest)
					yPercent: () => gsap.utils.random(20, 70),
					duration: 0.6,
					ease: "power3.out",
					stagger: 0.05,
				});
		},
		{ dependencies: [active], scope: titleRef },
	);

	// Image transition: a creative-but-subtle UPWARD clip wipe — the incoming image
	// does NOT start from zero (clip begins partially open, ~bottom 60% already shown),
	// crossfades in and settles a slight scale. Nothing on first paint / reduced motion
	// (the active image is just shown).
	useGSAP(
		() => {
			const root = imageRef.current;
			if (!root) return;
			const reduce = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			const imgs = root.querySelectorAll<HTMLElement>("[data-hero-img]");
			imgs.forEach((el, i) => {
				const isActive = i === active;
				if (!imgInit.current || reduce) {
					gsap.set(el, {
						autoAlpha: isActive ? 1 : 0,
						clipPath: "inset(0% 0 0 0)",
						scale: 1,
					});
					return;
				}
				if (isActive) {
					gsap.fromTo(
						el,
						{ autoAlpha: 0, clipPath: "inset(60% 0 0 0)", scale: 1.05 },
						{
							autoAlpha: 1,
							clipPath: "inset(0% 0 0 0)",
							scale: 1,
							duration: 1.1,
							ease: "power3.out",
						},
					);
				} else {
					gsap.to(el, { autoAlpha: 0, duration: 0.7, ease: "power2.out" });
				}
			});
			imgInit.current = true;
		},
		{ dependencies: [active], scope: imageRef },
	);

	if (slides.length === 0) return null;

	return (
		<section
			ref={sectionRef}
			data-hero
			className={cn(
				"relative isolate flex min-h-[611px] flex-col overflow-hidden bg-ink text-paper md:block md:min-h-0 md:h-[72.4vw] md:max-h-[760px] md:bg-paper lg:h-svh lg:max-h-none",
				className,
			)}
		>
			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-ink md:right-[35.8%] lg:right-[48%]"
			/>

			{/* Text column */}
			<div className="z-10 flex flex-col justify-start px-5 pt-28 pb-8 md:absolute md:inset-0 md:w-[64.2%] md:justify-center md:px-10 md:pt-0 md:pb-0 lg:w-[52%] lg:justify-end lg:px-[7%] lg:pb-[15%]">
				<h1 className="font-display font-semibold text-[2.5rem] leading-none tracking-[0.05em] md:text-[clamp(2.5rem,7vw,6.25rem)] lg:text-display lg:leading-none">
					<BrandText>{label}</BrandText>
				</h1>
				{/* Reconstructing rotating title (only changed glyphs re-animate). */}
				<div
					ref={titleRef}
					aria-live="polite"
					className="mt-3 font-display font-semibold text-[1.75rem] leading-[1.08] tracking-[0.02em] md:mt-5 md:text-[clamp(1.75rem,5.2vw,4.6875rem)] lg:leading-none"
				>
					{lines.map((line, li) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: positional lines
							key={li}
							data-line
							className="block"
							style={
								line.outline
									? {
											WebkitTextStrokeWidth: "2px",
											WebkitTextStrokeColor: "currentColor",
											WebkitTextFillColor: "transparent",
										}
									: undefined
							}
						>
							{[...line.text].map((ch, ci) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: positional glyphs
									key={ci}
									data-char
									className="inline-block whitespace-pre"
									style={{ fontFamily: charFont(ch) }}
								>
									{ch}
								</span>
							))}
						</span>
					))}
				</div>
			</div>

			{/* Image window — cross-fades through the slides; parallaxes on scroll. */}
			<div
				ref={imageRef}
				className="relative mx-5 mt-auto mb-8 h-[228px] overflow-hidden md:absolute md:mx-0 md:my-0 md:top-[30.6%] md:left-[51%] md:right-[5.2%] md:h-[51.3%] lg:top-[23.4%] lg:right-[7.3%] lg:left-[43.2%] lg:h-[63.6%]"
			>
				{slides.map((slide, i) =>
					slide.src ? (
						<div
							key={slide.src}
							data-hero-img
							aria-hidden={i !== active}
							className="absolute inset-0 will-change-[clip-path,opacity,transform]"
							// SSR / no-JS: show the first slide; GSAP takes over on mount.
							style={{ opacity: i === 0 ? 1 : 0 }}
						>
							<Image
								src={slide.src}
								alt={slide.alt}
								fill
								sizes="(min-width: 1024px) 50vw, (min-width: 768px) 44vw, 90vw"
								priority={i === 0}
								placeholder={slide.blurDataURL ? "blur" : "empty"}
								blurDataURL={slide.blurDataURL}
								className="object-cover"
							/>
						</div>
					) : null,
				)}
			</div>
		</section>
	);
}
