/**
 * Sector detail pages (« univers / <Secteur> ») maquette content — the single home of
 * the editorial copy (constitution Principle IX: maquette values live in ONE place).
 * Read losslessly from the Figma desktop nodes (51:3520 retail · 51:3661 bureau ·
 * 51:3797 residentiel · 51:3929 scenographie) — never guessed.
 *
 * Lives in `src/content/` like the other page content: consumed by
 *   - the seeds (`@/sanity/seed/documents/sectorDetail.<slug>.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/sectorDetail.ts` DEFAULTS) → rendered if a field
 *     is empty (text only — SC-007).
 *
 * Images are intentionally NOT here (text only): content images come from the seeds
 * (seed-assets/sectorDetail/<slug>/, uploaded to Sanity), like the other pages (ADR 0004).
 *
 * `\n` is meaningful only where the maquette uses a deliberate break: title lines
 * (outline/fill device), the « contraintes terrain » fill line, and paragraph breaks
 * (`\n\n`) in body copy — rendered with `whitespace-pre-line`. Statements, the argument
 * and quotes are authored as single sentences (centered, they wrap responsively).
 *
 * Constraint chip `emphasis` (outline / ink / accent) drives the maquette's visual rhythm.
 * Retail is confirmed against the full node; the other three are provisional and refined
 * during the pixel-perfect pass (the chip labels are exact, the emphasis rhythm is tuned).
 */

export type SectorSlug = "retail" | "bureau" | "residentiel" | "scenographie";
// Must stay in sync with the design-system `PillEmphasis` (the page wires this straight
// into <Pill emphasis>). Kept separate so the neutral content layer never imports the DS.
export type ConstraintEmphasis = "outline" | "ink" | "accent";
export type SectorConstraint = { label: string; emphasis: ConstraintEmphasis };
export type SectorTestimonial = { quote: string; attribution?: string };

export type SectorDetailContent = {
	title: string;
	heroEyebrow: string;
	heroTitleOutline: string;
	heroTitleFill: string;
	introStatement: string;
	introText: string;
	enjeuxTitleOutline: string;
	enjeuxTitleFill: string;
	enjeux: string[];
	contraintesTitleOutline: string;
	contraintesTitleFill: string;
	contraintes: SectorConstraint[];
	argument: string;
	citations: SectorTestimonial[];
	seoMetaTitle: string;
	seoMetaDescription: string;
};

// Shared maquette testimonials (the same two appear on retail / bureau / residentiel;
// scenographie swaps the first for Géraldine Lecoq). Single source — no duplication.
const TESTIMONIAL_DELPHINE: SectorTestimonial = {
	quote:
		"Ce que j'apprécie, c'est votre professionnalisme et votre relationnel : vous êtes rigoureux, disponibles et réactifs. La qualité est toujours au rendez-vous et vous trouvez rapidement des solutions face aux imprévus. Avec vous, je suis sereine, j'avance les yeux fermés.",
	attribution: "Delphine Tipré, architecte d'intérieur, Clarins",
};
const TESTIMONIAL_ANTOINE: SectorTestimonial = {
	quote:
		"J'apprécie particulièrement la qualité de nos échanges, dès la phase de conception jusqu'à l'exécution. Vous êtes transparents et apportez de vraies solutions. Le fait de travailler toujours avec les mêmes interlocuteurs apporte une réelle fiabilité et garantit un projet maîtrisé du début à la fin.",
	attribution: "Antoine Bloudeau, architecte DE, Parella",
};

export const sectorDetailContent: Record<SectorSlug, SectorDetailContent> = {
	retail: {
		title: "Retail",
		heroEyebrow: "Retail design & agencement\nde boutiques sur-mesure",
		heroTitleOutline: "Des points\nde vente à",
		heroTitleFill: "votre image.",
		introStatement:
			"Le lien avec une marque se vit d'abord à travers ses points de vente, boutiques, pop-up, concept stores, PLV ou instituts.",
		introText:
			"Mais l'enjeu n'est pas seulement esthétique : tout doit être parfaitement opérationnel dès le premier jour de vente.\n\nAprès installation, la réactivité reste de mise pour assurer la maintenance et le déploiement réseau. Le concept doit s'adapter à différentes configurations, différents lieux, qui ont, chacun, leurs propres contraintes.",
		enjeuxTitleOutline: "Les enjeux",
		enjeuxTitleFill: "du retail",
		enjeux: [
			"Garantir une ouverture à date fixe",
			"Optimiser l'expérience vendeurs et visiteurs",
			"Respecter les standards de marque",
			"Mettre en valeur l'offre produits",
		],
		contraintesTitleOutline: "Les contraintes",
		contraintesTitleFill: "terrain\nà anticiper",
		contraintes: [
			{ label: "accès réglementés", emphasis: "ink" },
			{ label: "délais maîtrisés", emphasis: "outline" },
			{ label: "lumière & électricité", emphasis: "outline" },
			{ label: "normes & conformité", emphasis: "accent" },
			{ label: "dimensions produits", emphasis: "outline" },
			{ label: "maintenance réactive", emphasis: "outline" },
			{ label: "coordination chantier", emphasis: "accent" },
			{ label: "adaptation multi-sites", emphasis: "outline" },
		],
		argument:
			"Nous maitrisons aussi bien le cahier des charges de la marque que ceux des grands magasins avec lesquels nous devons aussi jongler.",
		citations: [TESTIMONIAL_DELPHINE, TESTIMONIAL_ANTOINE],
		seoMetaTitle: "Retail",
		seoMetaDescription:
			"Retail design et agencement de boutiques sur-mesure : Estuaire conçoit et déploie vos points de vente, de l'idée à l'ouverture, en France et en Europe.",
	},

	bureau: {
		title: "Bureau",
		heroEyebrow: "Agencement de bureaux et\nlocaux professionnels sur mesure",
		heroTitleOutline: "Des espaces\noù il fait",
		heroTitleFill: "bon travailler.",
		introStatement:
			"L'environnement de travail est un outil stratégique pour la performance des entreprises.",
		introText:
			"Durabilité des mobiliers professionnels, confort et modularité des espaces de travail : chaque décision d'aménagement a un impact direct sur le bien-être et l'efficacité en entreprise.\n\nDe l'open space au réfectoire, les mobiliers requièrent une maitrise hybride entre sur-mesure et production industrielle. Si certains ajustements peuvent être finalisés après livraison, l'essentiel doit être prêt à accueillir les collaborateurs dans de bonnes conditions à la première heure.",
		enjeuxTitleOutline: "Les enjeux",
		enjeuxTitleFill: "de l'agencement\nde bureaux",
		enjeux: [
			"Livrer des espaces immédiatement opérationnels",
			"Créer des espaces évolutifs, durables sans compromis sur le confort",
			"Traduire une culture d'entreprise en espace efficient",
		],
		contraintesTitleOutline: "Les contraintes",
		contraintesTitleFill: "terrain\nà anticiper",
		contraintes: [
			{ label: "Connectivité réseau", emphasis: "ink" },
			{ label: "Insonorisation des espaces", emphasis: "outline" },
			{ label: "Confort de travail", emphasis: "outline" },
			{ label: "Ergonomie des postes", emphasis: "accent" },
			{ label: "Intervention en site occupé", emphasis: "outline" },
			{ label: "délais maîtrisés", emphasis: "outline" },
		],
		argument:
			"Déménager des dizaines, centaines ou milliers de collaborateurs implique une chose essentielle : ne pas interrompre leur travail en livrant un espace « prêt à l'emploi ».",
		citations: [TESTIMONIAL_DELPHINE, TESTIMONIAL_ANTOINE],
		seoMetaTitle: "Bureau",
		seoMetaDescription:
			"Agencement de bureaux et locaux professionnels sur mesure : Estuaire crée des espaces de travail opérationnels, durables et évolutifs, livrés sans interrompre votre activité.",
	},

	residentiel: {
		title: "Résidentiel",
		heroEyebrow: "Agencement résidentiel\n& mobilier sur mesure",
		heroTitleOutline: "Un intérieur\npensé pour vous",
		heroTitleFill: "et fabriqué\npour durer.",
		introStatement:
			"Parce qu'un lieu de vie est, par définition, intime, chaque décision compte double.",
		introText:
			"Un espace privé, maison ou appartement, est le point de départ du quotidien et doit être pensé pour traverser l'épreuve du temps.\n\nConcevoir un dressing, une bibliothèque, une cuisine, ou tout autre mobilier clé, exige une écoute attentive, une sensibilité particulière et une implication directe, pour faire naître un agencement intérieur qui accompagne toute une vie.",
		enjeuxTitleOutline: "Les enjeux",
		enjeuxTitleFill: "de l'agencement\nrésidentiel",
		enjeux: [
			"Concevoir des espaces pensés pour durer",
			"Répondre à un usage quotidien et intensif",
			"Combiner esthétique, confort et fonctionnalité",
		],
		contraintesTitleOutline: "Les contraintes",
		contraintesTitleFill: "terrain\nà anticiper",
		contraintes: [
			{ label: "Planning glissant", emphasis: "outline" },
			{ label: "Entretien facilité", emphasis: "accent" },
			{ label: "Durabilité élevée", emphasis: "ink" },
			{ label: "Forte exigence matière", emphasis: "outline" },
			{ label: "Adaptation au lieu existant", emphasis: "outline" },
		],
		argument:
			"Chaque lieu de vie est unique, intimement lié à ses occupants, pour qui nous redoublons d'attention, de conseil afin de construire un espace qui leur ressemble.",
		citations: [TESTIMONIAL_DELPHINE, TESTIMONIAL_ANTOINE],
		seoMetaTitle: "Résidentiel",
		seoMetaDescription:
			"Agencement résidentiel et mobilier sur mesure : Estuaire conçoit des intérieurs pensés pour vous et fabriqués pour durer, du dressing à la cuisine.",
	},

	scenographie: {
		title: "Scénographie",
		heroEyebrow:
			"Scénographie, showroom\net mise en valeur de\nvos espaces commerciaux",
		heroTitleOutline: "Quand l'espace\ndevient",
		heroTitleFill: "expérience.",
		introStatement:
			"Parce qu'elle est souvent éphémère, on imagine à tort qu'une scénographie est légère.",
		introText:
			"Pourtant, chaque événement, chaque salon comporte ses propres contraintes : flux de visiteurs, expérience sur site, volumes souvent hors normes et exigences de sécurité.\n\nSignalétique, stands, expositions, showrooms ou décors, le caractère exceptionnel de ces installations nécessitent une maitrise technique particulière couplée à une grande agilité pour faire naître des structures complexes.",
		enjeuxTitleOutline: "Les enjeux de",
		enjeuxTitleFill: "la scénographie",
		enjeux: [
			"Traduire une intention en expérience",
			"Créer un impact visuel fort",
			"Garantir modularité et sécurité",
		],
		contraintesTitleOutline: "Les contraintes",
		contraintesTitleFill: "terrain\nà anticiper",
		contraintes: [
			{ label: "Interventions simultanées", emphasis: "outline" },
			{ label: "Réactivité sur site", emphasis: "outline" },
			{ label: "Transport et stockage facilités", emphasis: "outline" },
			{ label: "Montage/démontage express", emphasis: "accent" },
			{ label: "Coûts matières maitrisés", emphasis: "ink" },
			{ label: "Conception intelligente", emphasis: "ink" },
		],
		argument:
			"Souvent lié à un événement, la fabrication d'une scénographie est sujettie à une forte pression ce qui nous impose une grande disponibilité et réactivité avec les équipes terrain.",
		citations: [
			{
				quote:
					"Les projets ont été menés de manière rigoureuse pour un rendu parfait dont nous sommes très fiers aujourd'hui. Nous continuons la collaboration avec grand plaisir et beaucoup de hâte de découvrir à chaque fois les réalisations des équipes. Merci pour tout.",
				attribution: "Géraldine Lecoq, co-présidente, TEDx Nantes",
			},
			TESTIMONIAL_ANTOINE,
		],
		seoMetaTitle: "Scénographie",
		seoMetaDescription:
			"Scénographie, showroom et mise en valeur de vos espaces commerciaux : Estuaire fabrique des structures à fort impact, modulables et sûres, dans des délais maîtrisés.",
	},
};

/** The four sector slugs, in display order — used to validate the route's `[slug]` param
 *  (`isSectorSlug` → `notFound()` on an unknown slug). */
export const SECTOR_SLUGS = Object.keys(sectorDetailContent) as SectorSlug[];
