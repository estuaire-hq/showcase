import type { Metadata } from "next";
import { mentionsLegales } from "@/content/legal/mentions-legales";
import { LegalPage } from "@/design-system";

// Static legal page (content lives in `src/content/legal/`, no Sanity): the RSC is a
// thin connector that renders the design-system `<LegalPage>`. Route kept extension-less
// for the coming-soon gate (CLAUDE.md).

export const metadata: Metadata = {
	title: "Mentions légales",
	description:
		"Mentions légales du site Estuaire : éditeur, hébergeur et informations légales (LCEN).",
};

export default function MentionsLegalesPage() {
	return (
		<main
			data-nav-logo-tone="onLight"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onLight"
		>
			<LegalPage {...mentionsLegales} />
		</main>
	);
}
