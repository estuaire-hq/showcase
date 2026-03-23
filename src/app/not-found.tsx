import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
			<h1 className="text-6xl font-bold tracking-tight">404</h1>
			<p className="mt-4 text-lg text-muted">Cette page n&apos;existe pas.</p>
			<Link
				href="/"
				className="mt-8 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
			>
				Retour à l&apos;accueil
			</Link>
		</main>
	);
}
