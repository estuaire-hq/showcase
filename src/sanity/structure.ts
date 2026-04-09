import { HomeIcon } from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

const SINGLETONS = ["homePage"];

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
			S.divider(),
			...S.documentTypeListItems().filter(
				(listItem) => !SINGLETONS.includes(listItem.getId() as string),
			),
		]);
