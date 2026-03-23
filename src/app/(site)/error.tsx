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
			<h1 className="text-6xl font-bold tracking-tight">Erreur</h1>
			<p className="mt-4 text-lg text-muted">
				Une erreur inattendue est survenue.
			</p>
			<button
				type="button"
				onClick={reset}
				className="mt-8 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
			>
				Réessayer
			</button>
		</main>
	);
}
