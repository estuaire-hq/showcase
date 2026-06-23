"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { motion } from "../tokens";

/**
 * RollText — the Estuaire signature hover for interactive text (nav + footer links).
 *
 * Each letter sits in an `overflow-hidden` frame of height `1em`. Inside, a vertical
 * column holds the SAME letter twice — top (rest colour) and bottom (accent colour). On
 * hover the column rolls up by 50%, letter by letter (stagger), so the accent copy lands
 * exactly where the rest copy was. The "non-linear" feel comes from the signature
 * `expo.out` ease + the stagger wave, not a diagonal move.
 *
 * Presentational (props only — Principle VIII). `tone` adapts the colour pair to the
 * surface: `onLight` (ink → estuaire) or `onDark` (paper → cream). Motion values come
 * from the `motion` tokens (mirror of `@theme`); GSAP drives the roll.
 *
 * Accessibility: the duplicated glyphs are `aria-hidden`; the accessible name comes from
 * an `sr-only` copy of the text. Under `prefers-reduced-motion` no transform runs (the
 * GSAP timeline is never built) — instead the rest copy swaps to the accent colour on
 * hover (the `motion-reduce:` classes), so the link still gives feedback.
 */

type Tone = "onLight" | "onDark";

// Literal class strings (no template interpolation) so Tailwind's JIT sees every one.
// `rest`/`accent` colour the two stacked copies; `reduced` swaps the rest copy's colour
// on hover ONLY under reduced motion (where the roll is disabled).
const TONE: Record<Tone, { rest: string; accent: string; reduced: string }> = {
	onLight: {
		rest: "text-ink",
		accent: "text-estuaire",
		reduced: "motion-reduce:group-hover/roll:text-estuaire",
	},
	onDark: {
		rest: "text-paper",
		// Cream, dimmed so the incoming copy reads DARKER than the white rest copy on the
		// ink surface (Pierre, 2026-06-21). Tune the opacity here (e.g. /60 darker, /80 lighter).
		accent: "text-cream/70",
		reduced: "motion-reduce:group-hover/roll:text-cream/70",
	},
};

// Non-breaking space keeps a space glyph's width inside the inline-flex row.
const NBSP = " ";

export function RollText({
	text,
	tone = "onLight",
	className,
}: {
	text: string;
	tone?: Tone;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const reduced = useRef(false);
	const delayedPlay = useRef<gsap.core.Tween | null>(null);

	const { contextSafe } = useGSAP(
		() => {
			// Reduced motion: no roll — the colour swap is handled by the CSS classes below.
			reduced.current = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
		},
		{ scope: ref },
	);

	// Enter and leave run the SAME staggered roll with the SAME snappy `expo.out` easing —
	// the leave is the inverse motion (rolls back down), mirroring the enter. Only the
	// trigger delay differs: the enter waits, the leave starts IMMEDIATELY (Pierre,
	// 2026-06-23). NOT `timeline.reverse()`, which would reverse the easing too (a sluggish
	// slow-start that reads as a delay).
	const roll = contextSafe((yPercent: number) => {
		if (reduced.current || !ref.current) return;
		gsap.to(ref.current.querySelectorAll<HTMLElement>("[data-roll]"), {
			yPercent,
			duration: motion.rollDuration,
			ease: motion.easeExpo,
			stagger: { each: motion.rollStagger, from: "start" },
			overwrite: "auto",
		});
	});
	const play = contextSafe(() => {
		delayedPlay.current?.kill();
		delayedPlay.current = gsap.delayedCall(motion.rollDelay, () => roll(-50));
	});
	const reverse = contextSafe(() => {
		delayedPlay.current?.kill();
		roll(0);
	});

	const colours = TONE[tone];

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative hover only — the real interactive element is the wrapping <Link>/<button>; the accessible name comes from the sr-only copy.
		<span
			ref={ref}
			onMouseEnter={play}
			onMouseLeave={reverse}
			className={cn("group/roll inline-flex leading-none", className)}
		>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className="inline-flex leading-none">
				{[...text].map((char, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed string split, never reordered.
						key={`${char}-${i}`}
						className="inline-block h-[1em] overflow-hidden align-top leading-[1em]"
					>
						<span data-roll className="flex flex-col will-change-transform">
							<span
								className={cn(
									"block h-[1em] leading-[1em]",
									colours.rest,
									colours.reduced,
								)}
							>
								{char === " " ? NBSP : char}
							</span>
							<span
								className={cn("block h-[1em] leading-[1em]", colours.accent)}
							>
								{char === " " ? NBSP : char}
							</span>
						</span>
					</span>
				))}
			</span>
		</span>
	);
}
