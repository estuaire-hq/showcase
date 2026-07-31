"use client";

import { useCallback, useEffect, useState } from "react";
import {
	breakpoint,
	CTA_SLOT,
	decodeHeaderBand,
	type HeaderBand,
	LOGO_SLOT,
	type MeasuredTones,
	resolveToneFromSamples,
	TOGGLE_SLOT,
} from "@/design-system";

/**
 * Resolve the navbar's tone PER SLOT from what is actually behind each box (ADR 0029).
 *
 * Two kinds of surface float under the transparent bar, and each needs its own oracle:
 *
 *  - a **photo** (`PageHero`'s full-bleed visual): unreadable from CSS, so the server
 *    samples it from the image's LQIP and emits `data-nav-band-*` (see
 *    `@/lib/nav/luminance`); this hook reads the columns each slot covers.
 *  - a **solid panel** (« Univers »'s ink cartouche, « Réalisations »'s blue panel, the
 *    home hero's ink/paper split): the colour IS in the DOM, so it is read straight from
 *    the painted backgrounds. No band, no image decode, and it follows the CSS
 *    automatically instead of duplicating the panel's geometry.
 *
 * The solid case is not a nicety: those panels are sized in **percentages** while the pills
 * have a **fixed px width anchored right**, so their overlap shifts with the viewport. The
 * declared tones happened to be right at 1920 and wrong from 1024 to ~1700, where « nous
 * découvrir » sat ink-on-ink (1:1) on three pages. Measured, not deduced: post-mortem 0022.
 *
 * Either way the geometry is read here rather than server-side: a pill's width depends on
 * the rendered font, so its box only exists in the browser.
 */

type Bands = { sm?: HeaderBand; md?: HeaderBand; lg?: HeaderBand };

/** Horizontal samples across a slot's box. Enough to catch a panel seam crossing it. */
const SAMPLES_PER_SLOT = 5;

/** Read the bands off the page's declaring element (same element as the tone attributes). */
function readBands(): Bands {
	const el = document.querySelector(
		"[data-nav-band-sm], [data-nav-band-md], [data-nav-band-lg]",
	);
	return {
		sm: decodeHeaderBand(el?.getAttribute("data-nav-band-sm")),
		md: decodeHeaderBand(el?.getAttribute("data-nav-band-md")),
		lg: decodeHeaderBand(el?.getAttribute("data-nav-band-lg")),
	};
}

/** Pick the band for the viewport in force. The hero's aspect ratio changes per breakpoint,
 *  so each has its own crop and its own sampled strip. */
function bandForViewport(bands: Bands, width: number): HeaderBand | undefined {
	if (width >= breakpoint.desktop) return bands.lg;
	if (width >= breakpoint.tablet) return bands.md;
	return bands.sm;
}

/**
 * Resolve any CSS colour to sRGB + alpha through a 1×1 canvas.
 *
 * Not a regex: Tailwind v4 emits an **`oklab()`** computed value for any colour carrying an
 * opacity (`bg-ink/25` reads as `oklab(0.179 -0.004 -0.008 / 0.25)`), so scraping numbers out
 * of the string would silently read lightness as a red channel. The canvas converts whatever
 * the engine produces.
 */
function makeColourReader() {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	return (css: string) => {
		if (!ctx || !css || css === "transparent") return undefined;
		ctx.clearRect(0, 0, 1, 1);
		ctx.fillStyle = css;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		return a === 0 ? undefined : { r, g, b, alpha: a / 255 };
	};
}

/**
 * Luminance (0-255) of the page surface painted behind a viewport point, or `undefined` when
 * an image paints there (the sampled band answers for photos).
 *
 * Composites translucent layers top-down and falls back to `paper` for the share no layer
 * covers, which is what the page surface is.
 */
function paintedLuminanceAt(
	x: number,
	y: number,
	readColour: (
		css: string,
	) => { r: number; g: number; b: number; alpha: number } | undefined,
): number | undefined {
	let r = 0;
	let g = 0;
	let b = 0;
	let remaining = 1;
	for (const el of document.elementsFromPoint(x, y)) {
		// The bar is not its own background. A `fixed` layer (the site-entry intro, the
		// page-transition curtain) is a transient veil over the page, not its surface, and it
		// covers the bar anyway while it is up.
		if (el.closest("header")) continue;
		if (getComputedStyle(el).position === "fixed") continue;
		if (el instanceof HTMLImageElement) return undefined;
		const paint = readColour(getComputedStyle(el).backgroundColor);
		if (!paint) continue;
		const share = remaining * paint.alpha;
		r += share * paint.r;
		g += share * paint.g;
		b += share * paint.b;
		remaining -= share;
		if (remaining <= 0.01) break;
	}
	r += remaining * 255;
	g += remaining * 255;
	b += remaining * 255;
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function useMeasuredTones(pathname: string): MeasuredTones | undefined {
	const [tones, setTones] = useState<MeasuredTones | undefined>(undefined);

	const measure = useCallback(() => {
		// `clientWidth`, not `innerWidth`: the latter counts the scrollbar, which the
		// full-bleed hero the band describes does not span.
		const width = document.documentElement.clientWidth;
		if (width === 0) return;
		const band = bandForViewport(readBands(), width);
		const readColour = makeColourReader();

		const next: MeasuredTones = {};
		for (const el of document.querySelectorAll("[data-nav-slot]")) {
			const box = el.getBoundingClientRect();
			// A slot hidden at this breakpoint (the desktop list below `lg`, the toggle above
			// it) has a zero-width box and nothing to measure.
			if (box.width === 0) continue;
			const y = box.top + box.height / 2;
			const samples: number[] = [];
			for (let i = 0; i < SAMPLES_PER_SLOT; i++) {
				// Inset by 1px so the edge samples land inside the box, not on its border.
				const x = box.left + 1 + ((box.width - 2) * i) / (SAMPLES_PER_SLOT - 1);
				const painted = paintedLuminanceAt(x, y, readColour);
				if (painted !== undefined) {
					samples.push(painted);
				} else if (band) {
					// A photo paints here: read the band column under this point.
					const column = Math.min(
						band.length - 1,
						Math.max(0, Math.floor((x / width) * band.length)),
					);
					samples.push(band[column]);
				}
			}
			if (samples.length === 0) continue;
			const resolved = resolveToneFromSamples(samples);
			const slot = el.getAttribute("data-nav-slot");
			if (slot === LOGO_SLOT) next.logo = resolved;
			else if (slot === TOGGLE_SLOT) next.toggle = resolved;
			else if (slot === CTA_SLOT) next.cta = resolved;
			else if (slot) next.links = { ...next.links, [slot]: resolved };
		}
		setTones(next);
	}, []);

	// Re-measure on route change (new page, new surfaces) and on resize (new breakpoint, new
	// boxes, and a different overlap with a percentage-sized panel). The first pass waits for
	// `fonts.ready`: pill widths depend on the rendered font, so measuring before it lands
	// would sample the wrong columns.
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run on route change
	useEffect(() => {
		let frame = 0;
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(measure);
		};
		schedule();
		document.fonts?.ready.then(schedule);
		window.addEventListener("resize", schedule);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", schedule);
		};
	}, [measure, pathname]);

	return tones;
}
