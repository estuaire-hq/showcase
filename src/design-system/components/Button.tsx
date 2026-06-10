import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Arrow } from "./Arrow";

/**
 * Estuaire pill CTA — the kit's button family (Component 32/33/34, BTN envoyer,
 * BTN contactez-nous). Fully rounded, 61px tall, Montserrat Alternates SemiBold
 * 24px label, trailing arrow. Each `tone` encodes a rest→hover colour pair from
 * the kit. Renders a `<button>` by default, or a Next `<Link>` when `href` is set.
 *
 * tone mapping (rest → hover):
 *   light    paper/ink   → estuaire/paper   (« en savoir plus »)
 *   dark     ink/paper   → estuaire/paper   (« voir nos réalisations »)
 *   send     paper/ink   → ink/paper        (« envoyer »)
 *   primary  estuaire/paper → slate/paper   (« contactez-nous »)
 *   outline  ⬚ paper-stroke → estuaire fill (« téléchargez notre plaquette »)
 */
const button = tv({
	// Label centred across the full width; arrow pinned ~28px from the right edge
	// and vertically centred (kit geometry: arrow-right-1 at x=button.width-44, y centre).
	base: "relative inline-flex h-[61px] shrink-0 items-center justify-center rounded-full px-14 font-display text-body font-semibold leading-none transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	variants: {
		tone: {
			light: "bg-paper text-ink hover:bg-estuaire hover:text-paper",
			dark: "bg-ink text-paper hover:bg-estuaire hover:text-paper",
			send: "bg-paper text-ink hover:bg-ink hover:text-paper",
			primary: "bg-estuaire text-paper hover:bg-slate hover:text-paper",
			outline:
				"bg-transparent text-paper ring-1 ring-inset ring-paper hover:bg-estuaire hover:text-paper hover:ring-estuaire",
		},
		block: { true: "w-full", false: "" },
	},
	defaultVariants: { tone: "light", block: false },
});

export const buttonStyles = button;
export type ButtonTone = NonNullable<VariantProps<typeof button>["tone"]>;

type BaseProps = VariantProps<typeof button> & {
	/** Show the trailing arrow glyph (default true). */
	arrow?: boolean;
	className?: string;
	children: ReactNode;
};

type ButtonAsButton = BaseProps &
	Omit<ComponentProps<"button">, keyof BaseProps> & { href?: undefined };
type ButtonAsLink = BaseProps &
	Omit<ComponentProps<typeof Link>, keyof BaseProps> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
	const { tone, block, arrow = true, className, children, ...rest } = props;
	const cls = button({ tone, block, class: className });
	const content = (
		<>
			<span>{children}</span>
			{arrow && (
				<Arrow className="-translate-y-1/2 absolute top-1/2 right-7 size-5" />
			)}
		</>
	);

	if (rest.href != null) {
		return (
			<Link className={cls} {...(rest as ComponentProps<typeof Link>)}>
				{content}
			</Link>
		);
	}
	const { href: _omit, ...buttonRest } = rest as ComponentProps<"button"> & {
		href?: undefined;
	};
	return (
		<button type="button" className={cls} {...buttonRest}>
			{content}
		</button>
	);
}
