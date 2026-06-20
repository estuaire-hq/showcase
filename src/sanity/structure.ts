import {
	HomeIcon,
	InfoOutlineIcon,
	InlineIcon,
	ThLargeIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

const SINGLETONS = [
	"homePage",
	"aboutPage",
	"expertisesPage",
	"sectorsPage",
	"footer",
];

// Non-singleton types listed explicitly above; excluded from the auto-filter so they
// don't appear twice in « Contenu ».
const EXPLICIT_TYPES = [...SINGLETONS, "sectorDetail"];

export const structure: StructureResolver = (S) =>
	S.list()
		.title("Contenu")
		.items([
			S.listItem()
				.title("Page d'accueil")
				.icon(HomeIcon)
				.child(
					S.document()
						.schemaType("homePage")
						.documentId("homePage")
						.title("Page d'accueil"),
				),
			S.listItem()
				.title("Nous découvrir")
				.icon(InfoOutlineIcon)
				.child(
					S.document()
						.schemaType("aboutPage")
						.documentId("aboutPage")
						.title("Nous découvrir"),
				),
			S.listItem()
				.title("Expertises")
				.icon(ThLargeIcon)
				.child(
					S.document()
						.schemaType("expertisesPage")
						.documentId("expertisesPage")
						.title("Expertises"),
				),
			S.listItem()
				.title("Univers")
				.icon(ThLargeIcon)
				.child(
					S.document()
						.schemaType("sectorsPage")
						.documentId("sectorsPage")
						.title("Univers"),
				),
			S.listItem()
				.title("Univers — secteurs")
				.icon(ThLargeIcon)
				.child(
					S.documentTypeList("sectorDetail")
						.title("Univers — secteurs")
						.defaultOrdering([{ field: "title", direction: "asc" }]),
				),
			S.listItem()
				.title("Pied de page")
				.icon(InlineIcon)
				.child(
					S.document()
						.schemaType("footer")
						.documentId("footer")
						.title("Pied de page"),
				),
			S.divider(),
			...S.documentTypeListItems().filter(
				(listItem) => !EXPLICIT_TYPES.includes(listItem.getId() as string),
			),
		]);
