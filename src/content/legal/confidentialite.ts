import type { LegalPageProps } from "@/design-system";
import { host, LEGAL_UPDATED_LABEL, publisher, SITE_DOMAIN } from "./identity";

/**
 * « Politique de confidentialité » copy. Built to satisfy RGPD art. 13 (information
 * obligatoire) + loi n° 78-17 (Informatique et Libertés). The processing covered is
 * the (planned) contact form: the field list mirrors the standard contact superset
 * and the form must match it when built. Cookies: cookieless audience measurement
 * (Umami) → exempt from consent (art. 82 loi 78-17), so no banner.
 */
export const confidentialite: LegalPageProps = {
	eyebrow: "Protection des données",
	title: "Politique de confidentialité",
	updatedLabel: LEGAL_UPDATED_LABEL,
	intro: `La présente politique décrit la manière dont ${publisher.legalName} (marque « ${publisher.brand} ») collecte et traite vos données à caractère personnel lorsque vous utilisez le site ${SITE_DOMAIN}, dans le respect du Règlement général sur la protection des données (RGPD, règlement UE 2016/679) et de la loi n° 78-17 du 6 janvier 1978 modifiée, dite « Informatique et Libertés ».`,
	sections: [
		{
			heading: "Responsable du traitement",
			blocks: [
				{
					kind: "paragraph",
					text: "Le responsable du traitement de vos données est :",
				},
				{
					kind: "definitions",
					items: [
						{ term: "Responsable", value: publisher.legalName },
						{ term: "Siège social", value: publisher.address },
						{ term: "Adresse électronique", value: publisher.email },
						{ term: "Téléphone", value: publisher.phone },
					],
				},
				{
					kind: "rich",
					content: [
						"Aucun délégué à la protection des données (DPO) n'a été désigné. Pour toute question relative à vos données, vous pouvez nous écrire à ",
						{ text: publisher.email, href: `mailto:${publisher.email}` },
						".",
					],
				},
			],
		},
		{
			heading: "Données collectées",
			blocks: [
				{
					kind: "paragraph",
					text: "Nous ne collectons que les données strictement nécessaires aux finalités décrites ci-dessous :",
				},
				{
					kind: "list",
					items: [
						"Données que vous nous transmettez via le formulaire de contact : vos nom et prénom, votre adresse électronique, le cas échéant votre numéro de téléphone et le nom de votre société, ainsi que le contenu de votre message.",
						"Données de mesure d'audience : statistiques de fréquentation agrégées et anonymes, collectées sans cookie ni identifiant individuel (voir la section « Cookies et traceurs »).",
					],
				},
				{
					kind: "note",
					text: "Fournir les données du formulaire de contact est nécessaire pour traiter votre demande : à défaut, nous ne serions pas en mesure d'y répondre. Nous ne collectons aucune donnée sensible.",
				},
				{
					kind: "paragraph",
					text: "Le site ne met en œuvre aucune décision automatisée ni profilage produisant des effets juridiques à votre égard, au sens de l'article 22 du RGPD.",
				},
			],
		},
		{
			heading: "Finalités et bases juridiques",
			blocks: [
				{
					kind: "paragraph",
					text: "Vos données sont traitées pour les finalités suivantes, sur les bases juridiques associées (article 6 du RGPD) :",
				},
				{
					kind: "list",
					items: [
						"Répondre à vos demandes de contact et assurer le suivi de notre échange. Base juridique : l'intérêt légitime de l'éditeur à répondre aux sollicitations qui lui sont adressées (art. 6.1.f), ou l'exécution de mesures précontractuelles prises à votre demande (art. 6.1.b).",
						"Mesurer l'audience du site afin d'en améliorer le contenu et l'ergonomie. Base juridique : l'intérêt légitime de l'éditeur (art. 6.1.f), au moyen d'une solution de mesure d'audience sans cookie.",
					],
				},
			],
		},
		{
			heading: "Destinataires des données",
			blocks: [
				{
					kind: "list",
					items: [
						`Les services internes de ${publisher.legalName} habilités à traiter votre demande.`,
						`Nos prestataires techniques agissant en qualité de sous-traitants, dans la limite de leurs missions : notre hébergeur ${host.legalName} (stockage et mise à disposition du site) et notre prestataire d'acheminement des courriers électroniques.`,
					],
				},
				{
					kind: "paragraph",
					text: "Vos données ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales. Elles sont hébergées et traitées au sein de l'Union européenne : aucun transfert de vos données en dehors de l'Union européenne n'est réalisé.",
				},
			],
		},
		{
			heading: "Durée de conservation",
			blocks: [
				{
					kind: "list",
					items: [
						"Demandes adressées via le formulaire de contact : 3 ans à compter de notre dernier échange, puis suppression ou archivage.",
						"Données de mesure d'audience : conservées sous une forme agrégée et anonyme, sans permettre votre identification.",
					],
				},
			],
		},
		{
			heading: "Vos droits",
			blocks: [
				{
					kind: "paragraph",
					text: "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données :",
				},
				{
					kind: "list",
					items: [
						"Droit d'accès : obtenir la confirmation que vos données sont traitées et en recevoir une copie.",
						"Droit de rectification : faire corriger des données inexactes ou incomplètes.",
						"Droit à l'effacement : demander la suppression de vos données dans les cas prévus par la loi.",
						"Droit à la limitation du traitement.",
						"Droit d'opposition au traitement fondé sur l'intérêt légitime, pour des raisons tenant à votre situation particulière.",
						"Droit à la portabilité de vos données.",
						"Droit de définir des directives relatives au sort de vos données après votre décès.",
					],
				},
				{
					kind: "rich",
					content: [
						"Vous pouvez exercer ces droits en nous écrivant à ",
						{ text: publisher.email, href: `mailto:${publisher.email}` },
						`, ou par courrier à l'adresse du siège social (${publisher.address}). Une preuve d'identité pourra vous être demandée en cas de doute raisonnable sur votre identité. Nous nous engageons à répondre dans un délai d'un mois à compter de la réception de votre demande.`,
					],
				},
			],
		},
		{
			heading: "Réclamation auprès de la CNIL",
			blocks: [
				{
					kind: "rich",
					content: [
						"Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL) : 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou en ligne sur ",
						{ text: "www.cnil.fr", href: "https://www.cnil.fr" },
						".",
					],
				},
			],
		},
		{
			id: "cookies",
			heading: "Cookies et traceurs",
			blocks: [
				{
					kind: "paragraph",
					text: "Le site n'utilise aucun cookie publicitaire ni traceur de suivi à des fins marketing.",
				},
				{
					kind: "paragraph",
					text: "La mesure d'audience est réalisée au moyen d'une solution respectueuse de la vie privée, sans dépôt de cookie ni d'identifiant sur votre terminal et sans suivi de votre navigation entre les sites. Ce dispositif ne requiert donc pas votre consentement au titre de l'article 82 de la loi Informatique et Libertés (exemption applicable à la mesure d'audience).",
				},
				{
					kind: "paragraph",
					text: "Seuls peuvent être déposés des cookies strictement nécessaires au fonctionnement du site, eux aussi exemptés de consentement. Aucune bannière de consentement n'est donc affichée.",
				},
			],
		},
		{
			heading: "Sécurité",
			blocks: [
				{
					kind: "paragraph",
					text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé ou la divulgation : hébergement sécurisé au sein de l'Union européenne, accès restreint aux seules personnes habilitées et transmission chiffrée des échanges (HTTPS).",
				},
			],
		},
		{
			heading: "Modification de la politique",
			blocks: [
				{
					kind: "paragraph",
					text: "La présente politique de confidentialité est susceptible d'évoluer pour tenir compte des évolutions légales, réglementaires ou techniques. La date de dernière mise à jour figure en tête de cette page.",
				},
			],
		},
	],
};
