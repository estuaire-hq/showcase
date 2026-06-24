import { contactPageContent } from "@/content/contactPage";
import type { ContactPage } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared contactPageContent (single source with the front
// fallback — Principle IX). The seed adds the `_type` discriminators the schema
// expects (`requestType` members, `geopoint`); the runner injects each `_key`.
//
// The form visual lives in seed-assets/ (committed, outside public/ — never served,
// never in the build; see ADR 0006). The runner uploads it; the app reads it from Sanity.
const { requestTypes, mapLocation, ...text } = contactPageContent;

export default defineSeed<ContactPage>({
	_id: "contactPage",
	_type: "contactPage",
	...text,
	formImage: image(
		"seed-assets/contact/form-visual.jpg",
		"Estuaire — nous contacter",
	),
	requestTypes: requestTypes.map((rt) => ({
		...rt,
		_type: "requestType" as const,
	})),
	mapLocation: {
		_type: "geopoint" as const,
		lat: mapLocation.lat,
		lng: mapLocation.lng,
	},
});
