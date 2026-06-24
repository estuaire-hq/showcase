import type { Metadata, Viewport } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/sanity/live";
import "./globals.css";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-montserrat",
	display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
	subsets: ["latin"],
	// 700 powers the bold footer brand wordmark (logo_footer) so the « stuaire » run
	// renders as true bold rather than faux-bold (client review 2026-06: footer logotype).
	weight: ["400", "500", "600", "700"],
	style: ["normal", "italic"],
	variable: "--font-montserrat-alternates",
	display: "swap",
});

const umamiScriptUrl = process.env.UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

export const metadata: Metadata = {
	title: {
		default: "Estuaire",
		template: "%s | Estuaire",
	},
	description: "Estuaire — par Mosaique Production",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isEnabled: isDraftMode } = await draftMode();
	return (
		<html
			lang="fr"
			className={`overflow-x-clip ${montserrat.variable} ${montserratAlternates.variable}`}
			// The pre-paint anti-flash script (below) sets `data-hero-entry` on <html> before
			// hydration; suppress the expected attribute mismatch (next-themes pattern).
			suppressHydrationWarning
		>
			{/* overflow-x-clip (not hidden) prevents horizontal scroll without creating a
			    scroll container — safe with Lenis + ScrollTrigger pins (position: fixed). */}
			<body className="overflow-x-clip font-sans antialiased">
				{/* Anti-flash + top-0 for the home site-entry intro. A RAW synchronous inline
				    script as the first body child runs WHILE the HTML is parsed — before the
				    navbar/hero (which come later in the document) paint. On a hard load of the
				    home (motion enabled) it pins scroll to the top and drops an ink shield over
				    the whole page (above the navbar) from the very first frame. `HeroIntro` removes
				    the `data-hero-entry` attribute once its overlay is mounted (ink→ink, seamless);
				    a 4s failsafe clears it if the intro never mounts. Self-contained (injects its
				    own <style>, never depends on the build emitting a rule); a data-attribute (not a
				    class) so React's <html> hydration can't reconcile it away (+ suppressHydration
				    on <html>). #0e1215 = the ink token. Skipped under reduced motion + off the home.
				    A raw inline script (not next/script beforeInteractive, which can defer in the
				    App Router and let the page paint first). */}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static no-flash bootstrap (no user input)
					dangerouslySetInnerHTML={{
						__html:
							"(function(){try{if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);var s=document.createElement('style');s.textContent='html[data-hero-entry]::before{content:\"\";position:fixed;inset:0;z-index:100;background:#0e1215;pointer-events:none}';(document.head||document.documentElement).appendChild(s);var e=document.documentElement;e.setAttribute('data-hero-entry','pending');setTimeout(function(){e.removeAttribute('data-hero-entry')},4000)}}catch(_){}})()",
					}}
				/>
				{children}
				{umamiScriptUrl && umamiWebsiteId && (
					<Script
						defer
						src={umamiScriptUrl}
						data-website-id={umamiWebsiteId}
						strategy="afterInteractive"
					/>
				)}
				{isDraftMode && (
					<>
						<SanityLive />
						<VisualEditing />
					</>
				)}
			</body>
		</html>
	);
}
