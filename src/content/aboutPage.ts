/**
 * About page maquette content — the single home of the « Nous découvrir » editorial
 * copy (constitution Principle IX: maquette values live in ONE place). Read losslessly
 * from the Figma about nodes (51:2699 desktop / 78:4374 tablet / 78:4626 mobile) —
 * never guessed.
 *
 * Lives in `src/content/` like `homePage.ts`/`footer.ts`: it belongs to neither the
 * Studio/model side (`src/sanity/`) nor the runtime consumption side (`src/lib/sanity/`),
 * so both import it "downward". Consumed by:
 *   - the seed (`@/sanity/seed/documents/aboutPage.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/aboutPage.ts` DEFAULTS) → rendered if Sanity
 *     is empty (text only — SC-006).
 *
 * Images are intentionally NOT here (text only): content images come from the seed
 * (seed-assets/aboutPage/, uploaded to Sanity), exactly like the home (ADR 0004).
 *
 * `\n` is meaningful only where the maquette uses a deliberate break: title lines
 * (outline/fill device) and paragraph breaks (`\n\n`) in body copy — rendered with
 * `whitespace-pre-line`. Soft wraps inside a Figma text box are NOT preserved (the
 * front reflows responsively). Section titles use the brand outline/fill device.
 */
export const aboutPageContent = {
	// — Hero (02/ SLIDER) —
	heroEyebrow: "Menuiserie et agencement sur-mesure",
	heroTitleOutline: "Nous sommes\nagenceurs et concepteurs.",
	heroTitleFill: "Nous sommes engagés.",

	// — Intro (03/ INTRO) —
	introStatement:
		"La réussite d'un agencement tient à la justesse de sa conception.",
	introText:
		"Chaque projet est pensé avec la même exigence que celle que nous mettons à le fabriquer. Nos équipes s'engagent pleinement à chaque étape : du mobilier unique à la petite série industrialisée pour les déploiements multisites.\n\nNotre expertise repose sur la maîtrise multimatériaux : menuiserie, serrurerie, miroiterie, sellerie… Différents savoir-faire sont coordonnés, transformés et assemblés au sein de notre atelier grâce à un réseau de partenaires qualifiés et éprouvés. Chaque nouvelle compétence est intégrée et participe à élargir notre champ d'intervention.",
	introHighlight:
		"Nous faisons dialoguer créativité,\nfaisabilité technique et maîtrise industrielle.",

	// — Vision (04/ VISION) —
	visionTitleOutline: "Notre",
	visionTitleFill: "vision",
	visionText:
		"Nous sommes le fruit de plusieurs mondes qui se rencontrent et s'enrichissent.\n\nNotre écosystème est nourri par l'ingéniosité de nos concepteurs, qui imaginent des solutions sur mesure, et par l'engagement de nos agenceurs, véritables artisans du concret. Mais cet écosystème ne prend pleinement vie que lorsqu'il se connecte à celui de nos clients.\n\nChaque client possède son univers, ses produits, ses besoins, ses enjeux.\n\nEt comme dans la nature, où chaque milieu nourrit et dépend des autres, nous collaborons aussi avec des partenaires aux savoir-faire pointus qui enrichissent cette dynamique.\n\nChaque projet devient un espace vivant où clients, partenaires et équipes trouvent leur place. Ensemble, nous créons des réalisations équilibrées, harmonieuses, où les talents, les idées, les matières et les savoir-faire s'assemblent pour donner naissance à des projets qui ont du sens et qui durent.\n\nNous faisons de chaque rencontre une synergie fertile. Estuaire c'est un lieu de confluence où les univers se rencontrent pour créer des espaces singuliers.",

	// — Atelier (05/ ATELIER) —
	atelierTitleOutline: "De notre atelier",
	atelierTitleFill: "à votre chantier",
	atelierText:
		"Implantés à Machecoul, là où la Loire rejoint l'océan, nous évoluons dans un environnement industriel dynamique, favorable aux synergies, aux recrutements de talents et à la réactivité avec nos partenaires.\n\nC'est au sein de notre atelier que nous transformons des intentions en réalisations concrètes parfaitement exécutées.",
	atelierPillarsLead: "Un atelier de 3000 m2 pour garantir :",
	atelierPillars: ["précision", "fiabilité", "Performance"],
	atelierCapabilities: [
		"Parc machines dernière génération",
		"Nombreux postes de montage",
		"Cabine de peinture sur mesure",
		"Organisation agile entre sur-mesure et série",
	],
	atelierHighlight:
		"Installation et déploiements partout en France et en Europe, grâce à nos conducteurs de travaux répartis entre Nantes et Paris.",

	// — Mode opératoire (06/ MODE OPÉRATOIRE) —
	processTitleOutline: "Notre mode",
	processTitleFill: "opératoire",
	processIntro:
		"De la réception de votre cahier des charges jusqu'à l'installation finale, nos chargés de projets assurent un suivi rigoureux à chaque étape du projet. Ce pilotage de proximité permet d'appréhender des dossiers complexes, d'anticiper l'ensemble des contraintes tout en sécurisant les coûts et délais.",
	processSteps: [
		{
			number: "01",
			title: "Analyse",
			text: "Un projet d'agencement est toujours un équilibre entre ambition créative, contraintes techniques, logistiques, budgétaires et calendaires.\n\nNotre rôle est d'accompagner architectes, designers, marques ou particuliers vers la solution la plus pertinente.\n\nVotre cahier des charges est notre base de travail. Nous l'optimisons, le challengeons et le précisons, sans compromis sur la qualité des finitions.",
			bullets: [] as string[],
		},
		{
			number: "02",
			title: "Co-conception",
			text: "Un projet d'agencement évolue et se construit avec nos clients. Ensemble, nous redéfinissons et validons chaque étape afin de transformer une intention en solution prête à produire.",
			bullets: [
				"Sourcing de partenaires aux savoir-faire spécifiques.",
				"Étude, échantillonnage, réalisations de tests et maquettes.",
				"Optimisation des matériaux et des techniques selon le triptyque coût / délai / qualité.",
				"Élaboration des plans techniques.",
				"Programmation et optimisation de la production.",
			],
		},
		{
			number: "03",
			title: "Co-construction",
			text: "La collaboration et l'engagement guident notre fabrication. Chaque projet est porté par une équipe impliquée jusqu'à l'installation. Cette organisation limite les pertes d'information, sécurise la qualité et fiabilise les délais. La transversalité est organisée :",
			bullets: [
				"Les chargés de projets travaillent en étroite collaboration avec le bureau d'études et les conducteurs de travaux.",
				"Les concepteurs suivent le projet des plans techniques jusqu'au montage à blanc.",
				"Les agenceurs sont encadrés par un responsable atelier–BE unique, garant de la continuité et de la maîtrise de la production.",
			],
		},
		{
			number: "04",
			title: "Installation et déploiement",
			text: "Un projet ne s'arrête pas à la sortie d'atelier.\n\nInterlocuteur dédié, le conducteur de travaux prend en charge le dossier dès la commande : relevés de cotes, supervision des équipes sur site, déploiements multisites, pose conforme et soignée.\n\nAprès livraison, il reste l'interlocuteur direct pour tout suivi ou SAV, afin d'assurer la continuité du projet sur l'ensemble des sites.",
			bullets: [] as string[],
		},
	],

	// — Grand visuel (07/ BIG IMAGE) —
	statementText:
		"Nous ne sommes pas contraints par notre outil de production. Notre atelier est un cadre pour expérimenter, pour innover.",

	// — CTA (08/ CTA expertises) —
	ctaLabel: "découvrir nos expertises",
	ctaHref: "/expertises",

	// — SEO (defaults; editable in Studio) —
	seoMetaTitle: "Nous découvrir",
	seoMetaDescription:
		"Agenceur-concepteur engagé, Estuaire fait dialoguer créativité, faisabilité technique et maîtrise industrielle. Découvrez notre vision, notre atelier de 3000 m² à Machecoul et notre mode opératoire, de l'analyse à l'installation.",
};
