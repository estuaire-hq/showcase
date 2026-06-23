"use client";

import { useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * LogomarkLoader — the Estuaire logomark drawn by ONE continuous stroke, as a loading
 * indicator and as the site-entry trace.
 *
 * Concept (canonical handoff, see the curtain-logomark-loader brief): the mark is 3
 * interlaced ribbons. We don't draw their fill — we stroke each ribbon's CENTERLINE with
 * a thick round stroke, clipped to the union of the ribbon shapes (`clip-path`). As the
 * stroke advances, the ribbon fills with clean edges. A SINGLE cursor `p ∈ [0,1]` is
 * spread across the 5 centerline segments PROPORTIONALLY to their length, so one
 * continuous front travels the whole mark from the top-right hook (start) to the
 * bottom-right hook (end) under one ease — never 5 pieces lighting up separately. The
 * path order red→blue is `TOP1↩ → TOP2 → MID → BOT2 → BOT1` (TOP1 reversed to begin at
 * the top-right hook).
 *
 * Pitfalls it avoids (do NOT reintroduce):
 *  1. Stroke "in fill", not an outline — we stroke the CENTERLINE (width 8.4, clipped),
 *     never the ribbon perimeter.
 *  2. One continuous front — a single cursor `p` spread by length, not parallel/staggered
 *     per-segment tweens.
 *  3. No parasitic dot before a segment starts — `stroke-dasharray = "Lᵢ  Lᵢ+4"` (not
 *     "Lᵢ") + initial offset `Lᵢ` fully masks a segment until the front reaches it (the
 *     +4 margin avoids the sub-pixel sliver the round cap would inflate into a disc).
 *  4. Dash resets per sub-path → one `<path>` = one sub-path (a single `M`); hence 5
 *     separate paths, not one concatenated path.
 *
 * Presentational only: takes a size + `loop`, honors `prefers-reduced-motion` (full
 * static mark, no animation). Color comes from `currentColor` (`text-estuaire` by
 * default) — pass `className` to override (e.g. white on the dark site-entry screen).
 *
 * `loop` (default true) = loading: trace → hold → un-trace → loop. `loop={false}` =
 * site entry: traces once in 1s and stays full (ready for the FLIP into the sticky menu).
 */

// --- 5a. The 3 ribbons (fill shapes), unioned into ONE clip. viewBox 0 0 68.5 75 ---
const FILLS = [
	{
		name: "top",
		d: "M57.6175 6.34727C60.0684 6.34727 62.0618 8.30145 62.0618 10.7042C62.0618 13.107 60.0684 15.0611 57.6175 15.0611L23.0137 15.0853V21.4326L57.6175 21.4084C63.5764 21.4084 68.4062 16.6149 68.4062 10.7042C68.4062 4.79355 63.5764 0 57.6175 0C51.6586 0 46.8288 4.79355 46.8288 10.7042V14.1218L53.1732 14.1159V14.1156V10.7042C53.1732 8.30145 55.1665 6.34727 57.6175 6.34727ZM26.5083 6.36908C28.9591 6.36908 30.9525 8.32337 30.9525 10.7262L30.9797 14.1288H37.2938L37.2998 10.7262C37.2998 4.81529 32.47 0.0214844 26.5112 0.0214844C20.5524 0.0214844 15.7227 4.81529 15.7227 10.7262L15.7286 24.6318L22.0219 24.6199L22.064 10.7262C22.064 8.32337 24.0573 6.36908 26.5083 6.36908Z",
	},
	{
		name: "bot",
		d: "M23.0137 53.5664V59.9137L57.6175 59.9379C60.0684 59.9379 62.0618 61.8921 62.0618 64.2948C62.0618 66.6976 60.0684 68.6518 57.6175 68.6518C55.1665 68.6518 53.1732 66.6976 53.1732 64.2948V60.8802H46.8347L46.8288 64.2948C46.8288 70.2055 51.6586 74.999 57.6175 74.999C63.5764 74.999 68.4062 70.2055 68.4062 64.2948C68.4062 58.3842 63.5764 53.5906 57.6175 53.5906L23.0137 53.5664ZM37.3036 60.8811H30.9894L30.9622 64.2926C30.9622 66.6954 28.9689 68.6496 26.518 68.6496C24.0671 68.6496 22.0738 66.6954 22.0738 64.2926L22.0316 45.4971H15.7354L15.7384 45.5L15.7324 64.2926C15.7324 70.2034 20.5622 74.9971 26.521 74.9971C32.4798 74.9971 37.3096 70.2034 37.3096 64.2926L37.3036 60.8811Z",
	},
	{
		name: "mid",
		d: "M53.2208 44.5527C57.1322 44.5527 60.3027 41.406 60.3027 37.5278C60.3027 33.6495 57.1322 30.5029 53.2208 30.5029L11.0238 30.4817C8.45842 30.4817 6.36857 28.5245 6.36857 26.0072C6.36857 23.49 8.45812 21.4395 11.0238 21.4395H14.7756V15.0862L11.0238 15.0742C4.94748 15.0742 0.0212266 19.8831 0.0212266 25.911C0.0212266 31.9389 4.94718 36.8261 11.0238 36.8261L53.2328 36.8473V36.8503C53.6392 36.8503 53.9673 37.1545 53.9673 37.5278C53.9673 37.901 53.6392 38.2053 53.2328 38.2053L11.0025 38.1904C4.92631 38.1904 0 43.0772 0 49.1054C0 55.1336 4.92601 60.0205 11.0025 60.0205L14.7603 60.0086V53.5859H11.0025C8.4372 53.5859 6.34735 51.5354 6.34735 49.0182C6.34735 46.5009 8.4369 44.5377 11.0025 44.5377L53.2208 44.5527Z",
	},
] as const;

// --- 5b. The 5 centerlines, by deterministic sampling (straight segments + arcs by
// centre/radius/angles — avoids the ambiguity of SVG large/sweep flags). ---
const D2R = Math.PI / 180;

type CLSeg =
	| { t: "M" | "L"; x: number; y: number }
	| { t: "A"; cx: number; cy: number; r: number; a0: number; a1: number };
type Pt = [number, number];

// arc → points (angles in degrees, screen frame y-down)
function arcPts(
	cx: number,
	cy: number,
	r: number,
	a0: number,
	a1: number,
): Pt[] {
	const out: Pt[] = [];
	const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 5));
	for (let i = 0; i <= n; i++) {
		const a = (a0 + ((a1 - a0) * i) / n) * D2R;
		out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
	}
	return out;
}

function buildPts(segs: CLSeg[]): Pt[] {
	const pts: Pt[] = [];
	for (const s of segs) {
		if (s.t === "A") {
			// Skip the arc's first point — it duplicates the previous segment's end.
			for (const p of arcPts(s.cx, s.cy, s.r, s.a0, s.a1).slice(1)) pts.push(p);
		} else {
			pts.push([s.x, s.y]);
		}
	}
	return pts;
}

const toD = (pts: Pt[]): string =>
	`M ${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ")}`;
const rev = (pts: Pt[]): Pt[] => pts.slice().reverse();

const TOP1 = buildPts([
	{ t: "M", x: 23, y: 18.25 },
	{ t: "L", x: 57.62, y: 18.3 },
	{ t: "A", cx: 57.62, cy: 10.7, r: 7.6, a0: 90, a1: -193 },
]); // ends at the top-right hook (RED) — reversed below to start there
const TOP2 = buildPts([
	{ t: "M", x: 18.89, y: 24.63 },
	{ t: "L", x: 18.89, y: 10.73 },
	{ t: "A", cx: 26.51, cy: 10.73, r: 7.62, a0: 180, a1: 360 },
	{ t: "L", x: 34.13, y: 14.13 },
]);
const MID = buildPts([
	{ t: "M", x: 13.2, y: 16.2 },
	{ t: "L", x: 10.86, y: 18.24 },
	{ t: "A", cx: 10.86, cy: 25.91, r: 7.67, a0: 270, a1: 90 },
	{ t: "L", x: 53.28, y: 33.67 },
	{ t: "A", cx: 53.28, cy: 37.5, r: 3.85, a0: 270, a1: 450 },
	{ t: "L", x: 10.86, y: 41.42 },
	{ t: "A", cx: 10.86, cy: 49.09, r: 7.67, a0: 270, a1: 90 },
	{ t: "L", x: 13.2, y: 58.8 },
]);
const BOT2 = buildPts([
	{ t: "M", x: 18.9, y: 45.5 },
	{ t: "L", x: 18.9, y: 64.29 },
	{ t: "A", cx: 26.52, cy: 64.29, r: 7.62, a0: 180, a1: 0 },
	{ t: "L", x: 34.13, y: 60.88 },
]);
const BOT1 = buildPts([
	{ t: "M", x: 23, y: 56.75 },
	{ t: "L", x: 57.62, y: 56.7 },
	{ t: "A", cx: 57.62, cy: 64.29, r: 7.6, a0: 270, a1: 553 },
]); // ends at the bottom-right hook (BLUE)

// One continuous stroke, red → blue: TOP1 reversed (start at top-right hook), then
// TOP2 → MID → BOT2 → BOT1 (end at the bottom-right hook).
const SEGS = [
	{ name: "top1r", d: toD(rev(TOP1)) },
	{ name: "top2", d: toD(TOP2) },
	{ name: "mid", d: toD(MID) },
	{ name: "bot2", d: toD(BOT2) },
	{ name: "bot1", d: toD(BOT1) },
];

const STROKE_W = 8.4; // ribbon width 6.34 + margin; the clip recuts the edges
const EASE = "power2.inOut"; // ≈ cubic-bezier(.65,0,.35,1)
const TRACE_DUR = 1.0; // storyboard reference
const HOLD_DUR = 0.4; // full-mark hold before un-tracing (loop only)
const UNTRACE_DUR = 0.8; // front retraces home (loop only)
const REPEAT_DELAY = 0.3;
const DASH_MARGIN = 4; // gap 4 units longer than the dash → clean mask, no sliver

type LogomarkLoaderProps = {
	/** Rendered width in px; height keeps the 68.5×75 aspect ratio. */
	size?: number;
	/** Loop (trace → hold → un-trace → repeat). `false` = trace once and stay full. */
	loop?: boolean;
	/** One-time beat (seconds) before the trace starts; loops keep their `repeatDelay`. */
	delay?: number;
	className?: string;
};

export function LogomarkLoader({
	size = 96,
	loop = true,
	delay = 0,
	className,
}: LogomarkLoaderProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	// Unique, selector-safe clip id so several loaders never share it.
	const clipId = `lm-clip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

	useGSAP(
		() => {
			const svg = svgRef.current;
			if (!svg) return;
			const paths = Array.from(
				svg.querySelectorAll<SVGPathElement>("path[data-seg]"),
			);
			if (paths.length !== SEGS.length) return;

			// One cursor across all segments, distributed by length → one continuous front.
			let cum = 0;
			const meta = paths.map((p) => {
				const L = p.getTotalLength();
				const m = { p, L, a: cum };
				cum += L;
				return m;
			});
			const total = cum;
			for (const m of meta) {
				gsap.set(m.p, {
					strokeDasharray: `${m.L} ${m.L + DASH_MARGIN}`,
					strokeDashoffset: m.L,
				});
			}

			const paint = (prog: number) => {
				const abs = prog * total;
				for (const m of meta) {
					const drawn = Math.max(0, Math.min(m.L, abs - m.a));
					m.p.style.strokeDashoffset = `${m.L - drawn}`;
				}
			};

			// §8 reduced motion: full static mark, no animation.
			if (prefersReducedMotion()) {
				paint(1);
				return;
			}

			const st = { v: 0 };
			// `delay` holds the masked (invisible) start state for one beat before the
			// first trace; GSAP applies it once, not on each repeat.
			const tl = gsap.timeline({
				delay,
				repeat: loop ? -1 : 0,
				repeatDelay: REPEAT_DELAY,
			});
			tl.to(st, {
				v: 1,
				duration: TRACE_DUR,
				ease: EASE,
				onUpdate: () => paint(st.v),
			});
			if (loop) {
				tl.to({}, { duration: HOLD_DUR }).to(st, {
					v: 0,
					duration: UNTRACE_DUR,
					ease: EASE,
					onUpdate: () => paint(st.v),
				});
			}
		},
		{ scope: svgRef },
	);

	return (
		<svg
			ref={svgRef}
			width={size}
			height={(size * 75) / 68.5}
			viewBox="0 0 68.5 75"
			fill="none"
			className={cn("text-estuaire", className)}
			role="img"
			aria-label="Chargement"
		>
			<defs>
				<clipPath id={clipId}>
					{FILLS.map((f) => (
						<path key={f.name} d={f.d} clipRule="evenodd" />
					))}
				</clipPath>
			</defs>
			{SEGS.map((s) => (
				<path
					key={s.name}
					data-seg=""
					d={s.d}
					fill="none"
					stroke="currentColor"
					strokeWidth={STROKE_W}
					strokeLinejoin="round"
					strokeLinecap="round"
					clipPath={`url(#${clipId})`}
				/>
			))}
		</svg>
	);
}
