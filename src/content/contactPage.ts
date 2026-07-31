/**
 * Contact page maquette content — single home of the page's design copy
 * (constitution Principle IX: maquette values live in ONE place). Lives in
 * `src/content/` so both the seed (`@/sanity/seed/documents/contactPage.seed.ts`)
 * and the front fallback (`@/lib/sanity/contactPage.ts` DEFAULTS) import it
 * "downward" — no sideways dependency.
 *
 * `requestTypes` pairs each form label with the recipient it routes to. Defaults
 * are the 4 categories the client defined; recipients are M365 shared mailboxes,
 * editable in the Studio. Sending is via OVH Email Pro (see research §2).
 *
 * The postal `address` mirrors the footer's, MINUS its copyright line (the footer
 * stores "2026 estuaire©\n…"; the contact block shows the address only).
 */
export const contactPageContent = {
	heroTitleOutline: "Nous\nsommes",
	heroTitleFill: "à votre écoute",

	formTitleOutline: "Une question,\nUn projet ?",
	formTitleFill: "Tout commence ici.",
	requestTypes: [
		{ label: "J'ai un projet", recipient: "projet@estuaire.fr" },
		{
			label: "Je souhaite vous rejoindre",
			recipient: "recrutement@estuaire.fr",
		},
		{
			label: "Je souhaite collaborer avec vous",
			recipient: "partenariat@estuaire.fr",
		},
		{ label: "J'ai une autre demande", recipient: "contact@estuaire.fr" },
	],

	findTitleOutline: "Nous",
	findTitleFill: "trouver",
	address: "Zi la seiglerie 3, 2 rue Henri Giffard\n44270 machecoul",
	contactTitleOutline: "Nous",
	contactTitleFill: "contacter",
	email: "contact@estuaire.fr",
	// Workshop entrance, 2 rue Henri Giffard (ZI la Seiglerie 3, Machecoul-Saint-Même).
	// Geocoded and cross-checked against the BAN (api-adresse.data.gouv.fr, housenumber
	// match) and Nominatim/OSM.
	mapLocation: { lat: 46.977055, lng: -1.802443 },
	// 16, not 15: at 15 the industrial estate is an unlabelled block of grey shapes.
	mapZoom: 16,

	seoMetaTitle: "Contact",
	seoMetaDescription:
		"Contactez Estuaire : formulaire, coordonnées et localisation de notre atelier à Machecoul.",
};
