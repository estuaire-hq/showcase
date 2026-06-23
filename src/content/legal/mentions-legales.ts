import type { LegalPageProps } from "@/design-system";
import { host, LEGAL_UPDATED_LABEL, publisher, SITE_DOMAIN } from "./identity";

/**
 * « Mentions légales » copy. Mandatory identification of the éditeur (LCEN art. 1-1,
 * ex-6 III, dans sa rédaction issue de la loi SREN n° 2024-449) and of the hébergeur
 * (art. 1-1, 4°), plus the e-commerce transparency items of art. 19 (email + n° TVA),
 * applicable à un site vitrine au sens large de l'art. 14 LCEN.
 */
export const mentionsLegales: LegalPageProps = {
	eyebrow: "Informations légales",
	title: "Mentions légales",
	updatedLabel: LEGAL_UPDATED_LABEL,
	intro: `Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), les informations légales relatives au site ${SITE_DOMAIN} sont précisées ci-dessous.`,
	sections: [
		{
			heading: "Éditeur du site",
			blocks: [
				{
					kind: "paragraph",
					text: `Le site ${SITE_DOMAIN} est édité par :`,
				},
				{
					kind: "definitions",
					items: [
						{ term: "Raison sociale", value: publisher.legalName },
						{ term: "Marque", value: publisher.brand },
						{ term: "Forme juridique", value: publisher.legalForm },
						{ term: "Capital social", value: publisher.capital },
						{ term: "Siège social", value: publisher.address },
						{ term: "RCS", value: publisher.rcs },
						{ term: "SIRET", value: publisher.siret },
						{ term: "N° de TVA intracommunautaire", value: publisher.vat },
						{ term: "Téléphone", value: publisher.phone },
						{ term: "Adresse électronique", value: publisher.email },
						{
							term: "Directeur de la publication",
							value: publisher.publicationDirector,
						},
					],
				},
			],
		},
		{
			heading: "Hébergeur",
			blocks: [
				{ kind: "paragraph", text: "Le site est hébergé par :" },
				{
					kind: "definitions",
					items: [
						{ term: "Raison sociale", value: host.legalName },
						{ term: "Forme juridique", value: host.legalForm },
						{ term: "Capital social", value: host.capital },
						{ term: "Siège social", value: host.address },
						{ term: "RCS", value: host.rcs },
						{ term: "Téléphone", value: host.phone },
					],
				},
			],
		},
		{
			heading: "Propriété intellectuelle",
			blocks: [
				{
					kind: "paragraph",
					text: `L'ensemble des éléments composant le site ${SITE_DOMAIN} (textes, photographies, illustrations, vidéos, logo, charte graphique, mise en page et arborescence) est protégé par le droit d'auteur et le droit des marques. Ces éléments sont la propriété exclusive de ${publisher.legalName} ou de leurs auteurs respectifs.`,
				},
				{
					kind: "paragraph",
					text: `La marque « ${publisher.brand} » et son logo sont la propriété de ${publisher.legalName}. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, par quelque procédé que ce soit, est interdite sans l'autorisation écrite préalable de l'éditeur, sauf exceptions légales. Toute exploitation non autorisée est susceptible de constituer une contrefaçon engageant la responsabilité de son auteur.`,
				},
			],
		},
		{
			heading: "Liens hypertextes",
			blocks: [
				{
					kind: "paragraph",
					text: "Le site peut contenir des liens vers des sites tiers. Ces sites étant indépendants de l'éditeur, ce dernier ne saurait être tenu responsable de leur contenu ni de l'usage qui pourrait en être fait.",
				},
			],
		},
		{
			heading: "Données personnelles et cookies",
			blocks: [
				{
					kind: "rich",
					content: [
						"Le traitement de vos données personnelles ainsi que l'usage des cookies et traceurs sont décrits dans notre ",
						{
							text: "Politique de confidentialité",
							href: "/confidentialite",
						},
						".",
					],
				},
			],
		},
		{
			heading: "Droit applicable",
			blocks: [
				{
					kind: "paragraph",
					text: "Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.",
				},
			],
		},
	],
};
