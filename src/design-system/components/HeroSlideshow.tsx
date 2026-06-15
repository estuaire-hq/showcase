"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { HeroTitle } from "./HeroTitle";

export type HeroSlide = {
	/** Resolved image URL (page builds it from Sanity via urlFor). Optional: the hero
	 *  degrades to its dark panel + title when no image is configured yet. */
	src?: string;
	alt: string;
	/** Keyword completing « <label> <trunk> … » — one per slide, changes in sync. */
	keyword: string;
	blurDataURL?: string;
};

/**
 * Hero slideshow (maquette « 02/SLIDER v1 », nodes 51:2420 + 51:2221 / 77:3149 /
 * 77:3150). The IMAGE cross-fades (clip wipe), and in sync the title's KEYWORD rolls in
 * a masked odometer — one title = one image. The trunk « <label> / <trunk> » is static;
 * only the last line (the keyword) moves. No control, auto (FR-002).
 *
 * The keyword odometer is the SAME motion as the full-screen intro, so the title's
 * animation is continuous from the intro into the live hero. `paused` freezes the hero
 * on `startIndex` while the intro plays above it; when it flips false the slideshow
 * starts. NOTHING animates on first paint; `prefers-reduced-motion` → no autoplay, no
 * roll (the first slide stays frozen).
 *
 * Per-breakpoint geometry: dark panel left 52% (lg) / 64.2% (md), full on mobile; the
 * image is a contained window straddling the dark/white seam (lg) / a band (mobile).
 */
export function HeroSlideshow({
	label,
	trunk,
	slides,
	paused = false,
	startIndex = 0,
	interval = 6000,
	className,
}: {
	label: string;
	trunk: string;
	slides: HeroSlide[];
	/** Freeze on `startIndex` (the intro plays above); slideshow starts when false. */
	paused?: boolean;
	/** Initial slide / keyword (intro continuity). */
	startIndex?: number;
	/** ms between slides (default 6000). */
	interval?: number;
	className?: string;
}) {
	const [active, setActive] = useState(startIndex);
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);
	const prevKw = useRef<number | null>(null);
	const imgInit = useRef(false);

	// Scroll: the hero image keeps moving as the hero scrolls away — a slow parallax
	// rise + subtle zoom (recede). Scroll-driven only (nothing on first paint).
	useGSAP(
		() => {
			const img = imageRef.current;
			const section = sectionRef.current;
			if (!img || !section) return;
			if (prefersReducedMotion()) return;
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

	// Autoplay: advance the active slide. Paused while the intro plays above; off under
	// reduced motion or with a single slide.
	useGSAP(
		() => {
			if (slides.length < 2 || paused) return;
			if (prefersReducedMotion()) return;
			// Clamp: a misconfigured `interval` (0 / negative) would busy-loop setInterval.
			const period = Math.max(1000, interval);
			const id = setInterval(
				() => setActive((i) => (i + 1) % slides.length),
				period,
			);
			return () => clearInterval(id);
		},
		{ dependencies: [slides.length, interval, paused] },
	);

	// Keyword odometer — on each `active` change, roll the keyword (IDENTICAL to the
	// intro: outgoing up + incoming from below, SAME duration + ease, started together).
	// Skipped on the first run (no first paint) and under reduced motion.
	useGSAP(
		() => {
			const title = titleRef.current;
			if (!title) return;
			const kws = gsap.utils.toArray<HTMLElement>(
				title.querySelectorAll("[data-kw]"),
			);
			const reduce = prefersReducedMotion();

			// First paint (or reduced motion): just show the active keyword, no animation.
			if (prevKw.current === null || reduce) {
				gsap.set(kws, { yPercent: 100, autoAlpha: 0 });
				if (kws[active]) gsap.set(kws[active], { yPercent: 0, autoAlpha: 1 });
				prevKw.current = active;
				return;
			}

			const incoming = kws[active];
			const outgoing = kws[prevKw.current];
			if (incoming && incoming !== outgoing) {
				if (outgoing)
					gsap.to(outgoing, {
						yPercent: -100,
						autoAlpha: 0,
						duration: 0.7,
						ease: "expo.out",
						overwrite: "auto",
					});
				gsap.fromTo(
					incoming,
					{ yPercent: 100, autoAlpha: 0 },
					{
						yPercent: 0,
						autoAlpha: 1,
						duration: 0.7,
						ease: "expo.out",
						overwrite: "auto",
					},
				);
			}
			prevKw.current = active;
		},
		{ dependencies: [active], scope: titleRef },
	);

	// Image transition: a creative-but-subtle UPWARD clip wipe — the incoming image does
	// NOT start from zero (clip begins partially open, ~bottom 60% already shown),
	// crossfades in and settles a slight scale. Nothing on first paint / reduced motion.
	useGSAP(
		() => {
			const root = imageRef.current;
			if (!root) return;
			const reduce = prefersReducedMotion();
			const imgs = root.querySelectorAll<HTMLElement>("[data-hero-img]");
			imgs.forEach((el) => {
				// Match on the slide's own index (not DOM position): image-less slides render
				// no node, so DOM order ≠ slide order when images are mixed (latent desync).
				const slideIndex = Number(el.dataset.slideIndex);
				const isActive = slideIndex === active;
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

	// The image window stays hidden while the intro plays + retracts above it (so the
	// slideshow never shows through the shrinking black panel); it fades in only once the
	// intro hands off (`paused` → false). Window-level (independent of the per-slide
	// cross-fade above).
	useGSAP(
		() => {
			const root = imageRef.current;
			if (!root) return;
			if (prefersReducedMotion()) {
				gsap.set(root, { autoAlpha: 1 });
				return;
			}
			if (paused) {
				gsap.set(root, { autoAlpha: 0 });
				return;
			}
			gsap.fromTo(
				root,
				{ autoAlpha: 0 },
				{ autoAlpha: 1, duration: 0.8, ease: "power2.out" },
			);
		},
		{ dependencies: [paused], scope: sectionRef },
	);

	if (slides.length === 0) return null;

	const firstKeyword = slides[startIndex]?.keyword ?? slides[0]?.keyword ?? "";

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
				data-hero-panel
				className="absolute inset-0 -z-10 bg-ink md:right-[35.8%] lg:right-[48%]"
			/>

			{/* Text column — the anchor. The accessible heading is the full first phrase;
			    the visible animated lockup is decorative (the keyword rotates). */}
			<div className="z-10 flex flex-col justify-start px-5 pt-28 pb-8 md:absolute md:inset-0 md:w-[64.2%] md:justify-center md:px-10 md:pt-0 md:pb-0 lg:w-[52%] lg:justify-end lg:px-[7%] lg:pb-[15%]">
				<h1 className="sr-only">
					{`${label} ${trunk} ${firstKeyword}`.trim()}
				</h1>
				{/* `data-hero-title` is the FLIP target the intro measures to land on. */}
				<div ref={titleRef} data-hero-title aria-hidden>
					<HeroTitle
						label={label}
						trunk={trunk}
						keywords={slides.map((s) => s.keyword)}
						activeIndex={startIndex}
					/>
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
							data-slide-index={i}
							aria-hidden={i !== active}
							className="absolute inset-0 will-change-[clip-path,opacity,transform]"
							// SSR / no-JS: show the start slide; GSAP takes over on mount.
							style={{ opacity: i === startIndex ? 1 : 0 }}
						>
							<Image
								src={slide.src}
								alt={slide.alt}
								fill
								sizes="(min-width: 1024px) 50vw, (min-width: 768px) 44vw, 90vw"
								priority={i === startIndex}
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
