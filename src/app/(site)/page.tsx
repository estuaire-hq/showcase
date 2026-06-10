import { sanityFetch } from "@/lib/sanity/live";
import { HOME_PAGE_QUERY } from "@/lib/sanity/queries";

export default async function HomePage() {
	const { data } = await sanityFetch({ query: HOME_PAGE_QUERY });

	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
			<h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
				{data?.title ?? "Estuaire"}
			</h1>
			{data?.tagline && (
				<p className="mt-6 text-ink/60 text-lg sm:text-xl">{data.tagline}</p>
			)}
		</main>
	);
}
