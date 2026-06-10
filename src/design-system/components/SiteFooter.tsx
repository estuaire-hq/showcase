import { OutlineText } from "../typography/OutlineText";
import { Button } from "./Button";
import { ContactButton } from "./ContactButton";
import { FooterLink } from "./FooterLink";
import { LinkedInButton } from "./LinkedInButton";
import { Slideshow } from "./Slideshow";

type LinkItem = { label: string; href: string };
type Slide = { src: string; alt: string; blurDataURL?: string };

/**
 * Big footer (kit `51:2222` desktop · `77:3629` tablet · `78:4371` mobile).
 * Mobile-first; the DS breakpoints are base = mobile (390), `md:` = tablet (768),
 * `lg:` = desktop (1920). Responsive behaviour from the 3 frames:
 *  - margins 20 → 40 → 139px (≈7.24%) · title 35 → 75px · address 16 → 25px
 *  - CTA: image full-width BELOW the text on mobile; to the right on `md`+
 *  - chrome: single column on mobile (nav centred, rules between blocks);
 *    two columns on `md`+
 *  - legal: stacked on mobile/tablet; 4 columns on `lg`
 * The scroll-to-top button is a separate scroll-following page-shell element
 * (`ScrollTopButton`), NOT part of the footer. Wordmark = text placeholder for
 * the `logo_footer` vector.
 */
export function SiteFooter({
	cta,
	wordmark = "Estuaire",
	tagline = "agenceur-concepteur engagé.",
	navLinks,
	legalLinks,
	address,
	contactHref = "/contact",
	plaquetteLabel = "pour prolonger votre visite, téléchargez notre plaquette ici",
	plaquetteHref = "#",
	linkedInHref = "https://www.linkedin.com",
}: {
	cta: {
		titleOutline: string;
		titleFill: string;
		label: string;
		href: string;
		/** Slideshow images (≥1). The page resolves these from Sanity via urlFor. */
		images: Slide[];
	};
	wordmark?: string;
	tagline?: string;
	navLinks: LinkItem[];
	legalLinks: LinkItem[];
	/** Multi-line; \n preserved. */
	address: string;
	contactHref?: string;
	plaquetteLabel?: string;
	plaquetteHref?: string;
	linkedInHref?: string;
}) {
	return (
		<footer className="bg-ink text-paper">
			<div className="mx-auto w-full max-w-[1920px] px-5 pt-12 pb-16 md:px-10 lg:px-[7.24%] lg:pt-20 lg:pb-24">
				{/* 1 — CTA banner: stacked on mobile (image below), 2 cols on md+ */}
				<div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start md:gap-10 lg:gap-16">
					<div className="flex flex-col">
						<h2 className="font-display text-lead font-semibold leading-[1.21] lg:text-title">
							<OutlineText tier="title">{cta.titleOutline}</OutlineText>
							<br />
							{cta.titleFill}
						</h2>
						<Button
							tone="light"
							href={cta.href}
							className="mt-8 w-full max-w-[620px] lg:mt-10"
						>
							{cta.label}
						</Button>
						{/* Rule tracks the button width (kit: rule ≈ button at every breakpoint). */}
						<div className="mt-7 w-full max-w-[620px] border-paper border-t-[3px] lg:mt-9 lg:max-w-[613px]" />
					</div>
					<Slideshow
						images={cta.images}
						sizes="(min-width:1024px) 42vw, 100vw"
						className="aspect-[350/340] w-full lg:aspect-[812/552]"
					/>
				</div>

				{/* 2 — Brand lockup (placeholder for the logo_footer vector) */}
				<div className="mt-16 lg:mt-24">
					<p className="font-sans font-bold text-6xl leading-[0.95] lg:text-8xl">
						{wordmark}
					</p>
					<p className="mt-2 font-display text-paper/90 text-xl lg:mt-3 lg:text-3xl">
						{tagline}
					</p>
				</div>

				{/* 3 — Footer chrome: 1 column on mobile, 2 columns on md+ */}
				<div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:justify-between lg:gap-10">
					<div className="flex flex-col items-start">
						<LinkedInButton href={linkedInHref} />
						<address className="mt-8 whitespace-pre-line font-sans text-caption text-paper/85 not-italic leading-[24px] lg:mt-[61px] lg:text-body lg:leading-[35px]">
							{address}
						</address>
						<Button
							tone="outline"
							href={plaquetteHref}
							className="mt-8 w-full max-w-[866px] lg:mt-[121px]"
						>
							{plaquetteLabel}
						</Button>
					</div>
					{/* Right column — centred + ruled on mobile; right-aligned column on md+ */}
					<div className="flex flex-col items-center border-paper/30 border-t pt-10 md:shrink-0 md:items-start md:border-t-0 md:pt-0 lg:w-[398px]">
						<nav className="flex flex-col items-center md:items-start">
							{navLinks.map((l) => (
								<FooterLink
									key={l.label}
									href={l.href}
									label={l.label}
									className="leading-[45px]"
								/>
							))}
						</nav>
						<ContactButton
							tone="bleu"
							size="lg"
							href={contactHref}
							className="mt-[17px] hover:bg-paper hover:text-ink"
						/>
					</div>
				</div>

				{/* Bottom: rule + legal links (stacked on mobile/tablet, 4 cols on lg) */}
				<div className="mt-12 border-paper/30 border-t pt-9 lg:mt-[61px] lg:pt-[37px]">
					<div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:gap-x-8">
						{legalLinks.map((l) => (
							<FooterLink
								key={l.label}
								variant="legal"
								href={l.href}
								label={l.label}
							/>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
