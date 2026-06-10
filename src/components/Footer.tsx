import { SiteFooter } from "@/design-system";
import { getFooterProps } from "@/lib/sanity/footer";

/**
 * Connected footer: a Server Component that self-fetches the `footer` Sanity
 * singleton and feeds the pure `<SiteFooter>` design-system component.
 *
 * This is the convention for global/singleton Sanity content (footer, header,
 * site settings…): the *connected wrapper* lives here in `src/components/` and
 * owns the data, while the design system stays presentational (props only) and
 * therefore reusable, testable, and rendered in isolation in the lab. Call sites
 * just render `<Footer />` — no props to thread through layouts or pages.
 */
export async function Footer() {
	return <SiteFooter {...(await getFooterProps())} />;
}
