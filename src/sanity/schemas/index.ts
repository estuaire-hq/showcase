import type { SchemaTypeDefinition } from "sanity";
import { aboutPage } from "./documents/aboutPage";
import { footer } from "./documents/footer";
import { homePage } from "./documents/homePage";

export const schemaTypes: SchemaTypeDefinition[] = [
	homePage,
	aboutPage,
	footer,
];
