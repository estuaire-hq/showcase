import type { SchemaTypeDefinition } from "sanity";
import { aboutPage } from "./documents/aboutPage";
import { expertisesPage } from "./documents/expertisesPage";
import { footer } from "./documents/footer";
import { homePage } from "./documents/homePage";

export const schemaTypes: SchemaTypeDefinition[] = [
	homePage,
	aboutPage,
	expertisesPage,
	footer,
];
