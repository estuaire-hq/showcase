import { Footer } from "@/components/Footer";
import { FooterReveal } from "@/lib/motion/FooterReveal";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";

// Shell for all public pages: smooth scroll (Lenis) wraps everything, then the page
// renders as the opaque top layer with the global footer revealed behind it.
// `FooterReveal` makes the footer "appear from behind the page" and settle into
// place at the end of the scroll (see FooterReveal). The footer stays a
// self-fetching connected component (`src/components/Footer.tsx`); the reveal is a
// presentational motion shell that takes it as a prop. The header + floating
// scroll-to-top will join this shell later.
export default function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SmoothScroll>
			<FooterReveal footer={<Footer />}>{children}</FooterReveal>
		</SmoothScroll>
	);
}
