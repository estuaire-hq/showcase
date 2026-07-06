import type { JsonLdObject } from "@/lib/seo/jsonld";

// Renders one schema.org node as an `application/ld+json` script. Server-only data (Principle
// VIII: the DS never touches this); the builder lives in `@/lib/seo/jsonld`. `<` is escaped to
// `<` so a stray `</script>` in a value can never break out of the tag (JSON-LD XSS guard).

export function JsonLd({ data }: { data: JsonLdObject }) {
	const json = JSON.stringify(data).replace(/</g, "\\u003c");
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: serialized structured data, `<` escaped above
			dangerouslySetInnerHTML={{ __html: json }}
		/>
	);
}
