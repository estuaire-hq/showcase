import type { Metadata } from "next";
import { BrandText } from "@/design-system/typography/BrandText";

// Public "coming soon" placeholder shown by the proxy gate on every route
// while `SITE_PREVIEW_TOKEN` is set. Lives outside the (site) group so it does
// not inherit the real site's footer/header — it only uses the root layout
// (fonts + globals). Kept self-contained: no /public asset, so the gate stays
// watertight (the matcher can block everything but build assets).
export const metadata: Metadata = {
	title: "Estuaire — bientôt en ligne",
	robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
			<h1 className="font-display text-estuaire text-subtitle-sm leading-tight sm:text-subtitle">
				<BrandText>Mosaique Production devient Estuaire.</BrandText>
			</h1>
			<p className="max-w-xl font-sans text-body-sm text-ink/60 sm:text-body">
				Encore un peu de patience : notre nouveau site prend forme et sera
				bientôt en ligne.
			</p>
		</main>
	);
}
