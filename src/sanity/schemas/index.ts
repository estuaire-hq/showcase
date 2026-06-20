import type { SchemaTypeDefinition } from "sanity";
import { aboutPage } from "./documents/aboutPage";
import { expertiseSubpage } from "./documents/expertiseSubpage";
import { expertisesPage } from "./documents/expertisesPage";
import { footer } from "./documents/footer";
import { homePage } from "./documents/homePage";
import { sectorDetail } from "./documents/sectorDetail";
import { sectorsPage } from "./documents/sectorsPage";

export const schemaTypes: SchemaTypeDefinition[] = [
	homePage,
	aboutPage,
	expertisesPage,
	expertiseSubpage,
	sectorsPage,
	sectorDetail,
	footer,
];
