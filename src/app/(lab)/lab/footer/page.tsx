import { SiteFooter } from "@/design-system";
import { FooterReveal } from "@/lib/motion/FooterReveal";

// Lab validation route for the FooterReveal shell: a tall, scrollable page so the
// "footer appears from behind the page + settles" beat can be seen end-to-end.
// Removed with the rest of the lab. The DS <SiteFooter> gets maquette mock props
// (same values as the kit page) — no Sanity in the lab.
export default function FooterRevealLab() {
	return (
		<FooterReveal
			footer={
				<SiteFooter
					cta={{
						titleOutline: "Une question,",
						titleFill: "un projet ?",
						label: "tout commence ici",
						href: "#",
						images: [
							{
								src: "/lab/images/image-import-1.jpg",
								alt: "L'atelier Estuaire",
							},
							{
								src: "/lab/images/image-import-8.jpg",
								alt: "Réalisation Estuaire",
							},
							{
								src: "/lab/images/image-import-40.jpg",
								alt: "Agencement Estuaire",
							},
						],
					}}
					address={
						"2026 estuaire©\nZi la seiglerie 3, 2 rue Henri Giffard\n44270 machecoul"
					}
					navLinks={[
						{ label: "nous découvrir", href: "#" },
						{ label: "expertises", href: "#" },
						{ label: "univers", href: "#" },
						{ label: "réalisations", href: "#" },
					]}
					legalLinks={[
						{ label: "Conditions générales d'utilisation", href: "#" },
						{ label: "Mentions légales", href: "#" },
						{ label: "Politique de confidentialité", href: "#" },
						{ label: "Politique en matière de cookies", href: "#" },
					]}
					contactHref="#"
				/>
			}
		>
			<main className="bg-paper">
				<section className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
					<p className="font-display text-warm text-caption uppercase tracking-widest">
						Lab · FooterReveal
					</p>
					<h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-7xl">
						Scrolle jusqu'en bas
					</h1>
					<p className="mt-6 max-w-prose text-ink/60 text-lg">
						Le footer est posé derrière cette page. En fin de scroll, la page
						glisse vers le haut et le découvre — il remonte se caler à sa place.
					</p>
				</section>
				<section className="flex min-h-svh items-center justify-center border-cream border-t px-6">
					<p className="max-w-prose text-ink/50 text-lg">
						Section intermédiaire — du contenu pour avoir de la hauteur de
						scroll avant la révélation finale.
					</p>
				</section>
			</main>
		</FooterReveal>
	);
}
