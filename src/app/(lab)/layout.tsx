import type { Metadata } from "next";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";

// TODO(lab): temporary playground — remove the entire `(lab)` route group and its
// served assets (`public/figma`, `public/lab`) once the homepage is fully built and
// validated. Production pages live under `(site)` and consume `@/design-system`.
//
// The lab is an internal playground: never index it. Smooth scroll (Lenis) now
// lives in the shared motion home (`@/lib/motion/SmoothScroll`), wrapped here and on
// the public site.
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
	return <SmoothScroll>{children}</SmoothScroll>;
}
