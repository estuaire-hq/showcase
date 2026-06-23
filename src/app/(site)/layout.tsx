import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { FooterReveal } from "@/lib/motion/FooterReveal";
import { RouteScrollRefresh } from "@/lib/motion/RouteScrollRefresh";
import { ScrollTopMount } from "@/lib/motion/ScrollTopMount";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";

// Shell for all public pages: smooth scroll (Lenis) wraps everything, then the page
// renders as the opaque top layer with the global footer revealed behind it.
// `FooterReveal` makes the footer "appear from behind the page" and settle into
// place at the end of the scroll (see FooterReveal). The footer stays a
// self-fetching connected component (`src/components/Footer.tsx`); the reveal is a
// presentational motion shell that takes it as a prop. The floating scroll-to-top is
// site-wide chrome (FR-015), mounted here inside SmoothScroll so it can drive Lenis.
// This layout PERSISTS across soft navigations, so `RouteScrollRefresh` re-measures
// every ScrollTrigger on route change — without it the footer reveal keeps the first
// page's stale range and leaves a white band below the footer (post-mortem 0014).
export default function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SmoothScroll>
			<RouteScrollRefresh />
			<Navbar />
			<FooterReveal footer={<Footer />}>{children}</FooterReveal>
			<ScrollTopMount />
		</SmoothScroll>
	);
}
