"use client";

export default function GlobalError({
	error: _error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="fr">
			<body className="flex min-h-svh flex-col items-center justify-center bg-neutral-950 px-6 text-center text-neutral-50">
				<h1 className="text-6xl font-bold tracking-tight">Erreur</h1>
				<p className="mt-4 text-lg text-neutral-400">
					Une erreur inattendue est survenue.
				</p>
				<button
					type="button"
					onClick={reset}
					className="mt-8 text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-50"
				>
					Réessayer
				</button>
			</body>
		</html>
	);
}
