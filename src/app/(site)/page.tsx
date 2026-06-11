import { sanityFetch } from "@/lib/sanity/live";
import { HOME_PAGE_QUERY } from "@/lib/sanity/queries";

export default async function HomePage() {
	const { data } = await sanityFetch({ query: HOME_PAGE_QUERY });

	return (
		// Header tone declaration for the transparent navbar (contract section-tone.md).
		// This is a LIGHT placeholder hero → onLight (dark content) keeps the logo/links
		// legible. When the real Figma hero (node 51:2221, dark-left / light-right) is
		// built, switch to: data-nav-logo-tone="onDark" data-nav-links-tone="onLight"
		// data-nav-toggle-tone="onDark" (mobile bar sits over the dark zone, node 77:3150).
		<main
			data-nav-logo-tone="onLight"
			data-nav-links-tone="onLight"
			className="flex min-h-svh flex-col items-center justify-center px-6 text-center"
		>
			<h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
				{data?.title ?? "Estuaire"}
			</h1>
			{data?.tagline && (
				<p className="mt-6 text-ink/60 text-lg sm:text-xl">{data.tagline}</p>
			)}
		</main>
	);
}
