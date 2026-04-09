import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const homePage = defineType({
	name: "homePage",
	title: "Page d'accueil",
	type: "document",
	icon: HomeIcon,
	fields: [
		defineField({
			name: "title",
			title: "Titre",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "tagline",
			title: "Accroche",
			type: "string",
			description: "Phrase affichée sous le titre",
		}),
	],
});
