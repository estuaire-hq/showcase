"use client";

export default function SiteError({
	error: _error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
			<h1 className="font-display text-6xl font-semibold tracking-tight">
				Erreur
			</h1>
			<p className="mt-4 text-ink/60 text-lg">
				Une erreur inattendue est survenue.
			</p>
			<button
				type="button"
				onClick={reset}
				className="mt-8 text-ink/50 text-sm underline underline-offset-4 transition-colors hover:text-ink"
			>
				Réessayer
			</button>
		</main>
	);
}
