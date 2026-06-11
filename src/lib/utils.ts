import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

declare global {
	interface Window {
		/** Umami tracker injected as a <script> in the root layout (absent in dev without env). */
		umami?: {
			track: (event: string, data?: Record<string, unknown>) => void;
		};
	}
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
