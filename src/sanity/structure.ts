import {
	DocumentsIcon,
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

// Non-singleton types with an explicit desk entry below — excluded from the auto-listed types
// after the divider so they don't appear twice. `expertiseSubpage` (3 sub-pages) and
// `sectorDetail` (4 sectors) are multi-instance, each with its own curated list.
const EXPLICIT = [...SINGLETONS, "expertiseSubpage", "sectorDetail"];

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
				.title("Sous-pages d'expertise")
				.icon(DocumentsIcon)
				.child(
					S.documentTypeList("expertiseSubpage").title(
						"Sous-pages d'expertise",
					),
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
				(listItem) => !EXPLICIT.includes(listItem.getId() as string),
			),
		]);
