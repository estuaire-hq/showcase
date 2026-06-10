import type { SchemaTypeDefinition } from "sanity";
import { footer } from "./documents/footer";
import { homePage } from "./documents/homePage";

export const schemaTypes: SchemaTypeDefinition[] = [homePage, footer];
