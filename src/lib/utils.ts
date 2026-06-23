import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { createTV } from "tailwind-variants";

// The brand type scale + palette are CUSTOM `@theme` tokens (`text-title`, `text-body-sm`,
// `text-ink`, …). Default tailwind-merge doesn't know them, so it mis-grouped e.g.
// `text-title-sm` and `text-ink` as the same `text-*` conflict and DROPPED the size →
// section titles collapsed to 16px on mobile (the "tiny titles" bug). Register the custom
// font-size names (so they classify as font-size) and the custom text colours (so they
// stay in text-color) — now a size + a colour coexist instead of overriding each other.
// Shared by BOTH `cn` (tailwind-merge) AND `tv` (tailwind-variants has its OWN internal
// merge, so it needs the same config or it drops sizes too).
const twMergeConfig = {
	extend: {
		classGroups: {
			"font-size": [
				{
					text: [
						"display",
						"display-sm",
						"title",
						"title-sm",
						"subtitle",
						"subtitle-sm",
						"lead",
						"lead-sm",
						"body",
						"body-sm",
						"caption",
					],
				},
			],
			"text-color": [
				{
					text: [
						"estuaire",
						"ink",
						"slate",
						"warm",
						"cream",
						"paper",
						"disabled",
						"danger",
					],
				},
			],
		},
	},
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Project `tv` (tailwind-variants) configured with the brand tokens. Import this instead
 * of `tv` from "tailwind-variants" in DS components, so the variants' internal merge keeps
 * custom font-sizes alongside colours (same fix as `cn`).
 */
export const tv = createTV({ twMergeConfig });

declare global {
	interface Window {
		/** Umami tracker injected as a <script> in the root layout (absent in dev without env). */
		umami?: {
			track: (event: string, data?: Record<string, unknown>) => void;
		};
	}
}

/**
 * Build the declarative Umami data-attributes for a CTA (Principle VI). Returns
 * `{ "data-umami-event": <event>, "data-umami-event-<k>": <v>, … }`, or `{}` when no
 * event — spread onto a Button/Link. Centralises the idiom shared by the DS bands
 * (`SplitSection`, `FeatureBlock`). No PII in keys/values.
 */
export function umamiAttrs(
	event?: string,
	data?: Record<string, string>,
): Record<string, string> {
	if (!event) return {};
	const attrs: Record<string, string> = { "data-umami-event": event };
	for (const [k, v] of Object.entries(data ?? {})) {
		attrs[`data-umami-event-${k}`] = v;
	}
	return attrs;
}

/**
 * Fire a custom Umami event from the client (Principle VI). Guarded: a no-op when
 * the tracker script is absent (e.g. dev without the Umami env) or during SSR. No
 * PII in the event name/props. See research §8.
 */
export function trackEvent(name: string, data?: Record<string, unknown>) {
	if (typeof window === "undefined") return;
	try {
		window.umami?.track(name, data);
	} catch {
		// Analytics is fire-and-forget — a malformed/blocked tracker must never
		// break a click handler.
	}
}
