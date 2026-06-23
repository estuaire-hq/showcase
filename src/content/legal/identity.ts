/**
 * Single source of truth for the legal identity data shared by the two legal pages:
 *   - mentions légales      → the site « éditeur »   (LCEN art. 1-1 + art. 19)
 *   - politique de confid.  → the « responsable du traitement » (RGPD art. 13)
 * They are the SAME entity, so its data lives here once and both pages read it.
 *
 * This is PUBLIC legal data (company identification published on the site as required
 * by law), not secrets: it belongs in the repo, unlike `.env` values.
 *
 * Values provided by the client (2026-06). OVH (host) data verified against the public
 * RCS registry (SIREN 424 761 419, Lille Métropole). LCEN art. 1-1 (4°) only requires
 * the host's name, address and phone; the rest is included for completeness.
 */

export const SITE_DOMAIN = "estuaire.fr";

/** Last-updated / effective date of the two legal documents (displayed FR). */
export const LEGAL_UPDATED_LABEL = "Dernière mise à jour : 23 juin 2026";

/** The publisher / data controller (éditeur = responsable du traitement). */
export const publisher = {
	legalName: "MOSAIQUE PRODUCTION",
	brand: "Estuaire",
	legalForm: "Société par actions simplifiée (SAS)",
	capital: "40 000 €",
	address: "ZI La Seiglerie 3, 2 rue Henri Giffard, 44270 Machecoul-Saint-Même",
	rcs: "Nantes 502 396 344",
	siret: "502 396 344 00041",
	vat: "FR37502396344",
	email: "contact@estuaire.fr",
	phone: "02 85 52 62 02",
	publicationDirector: "Sébastien Lajoye",
} as const;

/** The hosting provider (hébergeur), LCEN art. 1-1, 4°. */
export const host = {
	legalName: "OVH SAS",
	legalForm: "Société par actions simplifiée (SAS)",
	capital: "50 000 000 €",
	address: "2 rue Kellermann, 59100 Roubaix, France",
	rcs: "Lille Métropole 424 761 419",
	phone: "1007 (ou +33 9 72 10 10 07)",
	website: "https://www.ovhcloud.com",
} as const;
