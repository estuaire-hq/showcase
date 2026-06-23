import type { Metadata } from "next";
import { confidentialite } from "@/content/legal/confidentialite";
import { LegalPage } from "@/design-system";

// Static legal page (content lives in `src/content/legal/`, no Sanity): the RSC is a
// thin connector that renders the design-system `<LegalPage>`. Route kept extension-less
// for the coming-soon gate (CLAUDE.md).

export const metadata: Metadata = {
	title: "Politique de confidentialité",
	description:
		"Politique de confidentialité du site Estuaire : données collectées, finalités, durées de conservation, vos droits (RGPD).",
};

export default function ConfidentialitePage() {
	return (
		<main
			data-nav-logo-tone="onLight"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onLight"
		>
			<LegalPage {...confidentialite} />
		</main>
	);
}
