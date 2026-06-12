// Paint / text formatting for the read digest — extracted from figma-node.mjs.
// Turns raw Figma fills, strokes, text style and per-character overrides into the
// compact, human-readable strings the `read` digest prints. Pure (no I/O).

import type { Color, FigmaNode, Paint, TextStyle } from "./types";

/**
 * Is this paint a visible image fill (the bitmap-bearing kind)? The single
 * definition of "image slot" shared by collect (download targets) and read
 * (digest/inventory) — change the rule here, not in four call sites.
 */
export function isVisibleImageFill(paint: Paint): boolean {
	return paint.type === "IMAGE" && paint.visible !== false;
}

/** The first visible image fill of a node, or undefined. */
export function imageFillOf(node: FigmaNode): Paint | undefined {
	return (node.fills ?? []).find(isVisibleImageFill);
}

/** `{r,g,b}` (0–1) → `#rrggbb`. */
export function hex(c?: Color): string {
	if (!c) return "?";
	const part = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, "0");
	return `#${part(c.r)}${part(c.g)}${part(c.b)}`;
}

/** Format a fills/strokes array: SOLID (+per-paint opacity), GRADIENT, IMAGE. */
export function formatPaints(paints?: Paint[]): string | null {
	if (!Array.isArray(paints) || paints.length === 0) return null;
	return paints
		.map((p) => {
			if (p.visible === false) return `${p.type}(hidden)`;
			if (p.type === "SOLID")
				return `${hex(p.color)}${p.opacity != null && p.opacity < 1 ? `·a${p.opacity.toFixed(2)}` : ""}`;
			if (p.type?.startsWith("GRADIENT"))
				return `${p.type}[${(p.gradientStops ?? []).map((s) => hex(s.color)).join("→")}]`;
			if (p.type === "IMAGE") return `IMAGE(${p.scaleMode ?? ""})`;
			return p.type;
		})
		.join(", ");
}

/** Format a TEXT node's full style block. */
export function formatTextStyle(style: TextStyle = {}): string {
	const ls = (style.letterSpacing ?? 0).toFixed(2);
	const lh = Math.round(style.lineHeightPx ?? 0);
	return `text{${style.fontFamily} ${style.fontWeight} ${style.fontSize}px lh${lh} ls${ls} ${style.textCase ?? ""} ${style.textAlignHorizontal ?? ""}}`;
}

/**
 * Per-character style overrides for a TEXT node: `characterStyleOverrides`
 * indexes into `styleOverrideTable`. Returns one `charOverride#<id>{…}` string
 * per distinct override actually present (EF — overrides restored losslessly).
 */
export function formatCharOverrides(node: FigmaNode): string[] {
	const ids = new Set((node.characterStyleOverrides ?? []).filter(Boolean));
	const table = node.styleOverrideTable ?? {};
	const out: string[] = [];
	for (const id of ids) {
		const ov = table[id] ?? {};
		const bits: string[] = [];
		if (ov.fills) bits.push(`fill=${formatPaints(ov.fills)}`);
		if (ov.strokes)
			bits.push(
				`stroke=${formatPaints(ov.strokes)} w${ov.strokeWeight ?? "?"}`,
			);
		if (ov.fontFamily) bits.push(ov.fontFamily);
		if (ov.fontWeight) bits.push(`w${ov.fontWeight}`);
		if (bits.length) out.push(`charOverride#${id}{${bits.join(" ")}}`);
	}
	return out;
}
