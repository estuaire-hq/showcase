import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
			<h1 className="font-display text-6xl font-semibold tracking-tight">
				404
			</h1>
			<p className="mt-4 text-ink/60 text-lg">Cette page n&apos;existe pas.</p>
			<Link
				href="/"
				className="mt-8 text-ink/50 text-sm underline underline-offset-4 transition-colors hover:text-ink"
			>
				Retour à l&apos;accueil
			</Link>
		</main>
	);
}
