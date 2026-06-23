import type { ReactNode } from "react";

/**
 * Presentational renderer for a long-form legal document (mentions légales, politique
 * de confidentialité). Props only, no Sanity, no router (Principle VIII). The two
 * legal pages share the exact same layout/typography, so it lives here once.
 *
 * Sober on purpose: legal copy is read, not scanned. A calm, narrow reading column
 * (≈820px) on `bg-paper`, ink/slate text at the `body-sm` (16px) tier (the convention
 * for fine print), headings stepped up responsively. No marketing contour/fill device.
 *
 * The site header is `fixed` and overlays the page top, so these "no-hero" pages add
 * their own top offset (`pt-32 lg:pt-44`) to clear the bar.
 */

/** An inline run inside a `rich` block: a plain string, or a link `{ text, href }`. */
export type LegalInline = string | { text: string; href: string };

export type LegalBlock =
	/** A plain paragraph. `\n` is honoured (`whitespace-pre-line`). */
	| { kind: "paragraph"; text: string }
	/** A paragraph mixing text and links (email, CNIL, cross-page reference). */
	| { kind: "rich"; content: LegalInline[] }
	/** A bulleted list. */
	| { kind: "list"; items: string[] }
	/** A label → value description list (identity fields). */
	| { kind: "definitions"; items: { term: string; value: string }[] }
	/** A discreet aside (e.g. "fournir ces données est nécessaire…"). */
	| { kind: "note"; text: string };

export type LegalSubsection = { heading: string; blocks: LegalBlock[] };

export type LegalSection = {
	/** Optional anchor id (deep-linkable, e.g. `cookies`). */
	id?: string;
	heading: string;
	blocks?: LegalBlock[];
	subsections?: LegalSubsection[];
};

export type LegalPageProps = {
	eyebrow?: string;
	title: string;
	/** e.g. "Dernière mise à jour : 23 juin 2026". */
	updatedLabel?: string;
	intro?: string;
	sections: LegalSection[];
};

function isExternal(href: string) {
	return href.startsWith("http");
}

function InlineLink({ text, href }: { text: string; href: string }) {
	const external = isExternal(href);
	return (
		<a
			href={href}
			className="text-estuaire underline decoration-from-font underline-offset-2 transition-colors hover:text-ink"
			{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
		>
			{text}
		</a>
	);
}

function Block({ block }: { block: LegalBlock }) {
	switch (block.kind) {
		case "paragraph":
			return (
				<p className="whitespace-pre-line text-body-sm text-slate leading-relaxed">
					{block.text}
				</p>
			);
		case "rich":
			return (
				<p className="text-body-sm text-slate leading-relaxed">
					{block.content.map((seg, i) =>
						typeof seg === "string" ? (
							// biome-ignore lint/suspicious/noArrayIndexKey: positional inline run
							<span key={i}>{seg}</span>
						) : (
							// biome-ignore lint/suspicious/noArrayIndexKey: positional inline run
							<InlineLink key={i} text={seg.text} href={seg.href} />
						),
					)}
				</p>
			);
		case "list":
			return (
				<ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm text-slate leading-relaxed marker:text-warm">
					{block.items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			);
		case "definitions":
			return (
				<dl className="border-ink/10 border-y">
					{block.items.map((d) => (
						<div
							key={d.term}
							className="grid grid-cols-1 gap-1 border-ink/10 border-b py-3 last:border-b-0 sm:grid-cols-[14rem_1fr] sm:gap-6"
						>
							<dt className="font-sans font-semibold text-body-sm text-ink">
								{d.term}
							</dt>
							<dd className="text-body-sm text-slate">{d.value}</dd>
						</div>
					))}
				</dl>
			);
		case "note":
			return (
				<p className="border-warm/40 border-l-2 pl-4 text-body-sm text-warm italic leading-relaxed">
					{block.text}
				</p>
			);
	}
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
	return (
		<div className="flex flex-col gap-4">
			{blocks.map((block, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: positional content block
				<Block key={i} block={block} />
			))}
		</div>
	);
}

function Container({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto w-full max-w-[820px] px-5 md:px-8">{children}</div>
	);
}

export function LegalPage({
	eyebrow,
	title,
	updatedLabel,
	intro,
	sections,
}: LegalPageProps) {
	return (
		<article className="bg-paper pb-20 lg:pb-32">
			{/* Header: own top offset to clear the fixed site header */}
			<header className="border-ink/10 border-b pt-32 pb-10 lg:pt-44 lg:pb-14">
				<Container>
					{eyebrow && (
						<p className="font-sans text-caption text-warm uppercase tracking-[0.05em]">
							{eyebrow}
						</p>
					)}
					<h1 className="mt-3 font-display font-semibold text-title-sm text-ink leading-[1.1] lg:text-title lg:leading-[1.05]">
						{title}
					</h1>
					{updatedLabel && (
						<p className="mt-4 text-caption text-warm">{updatedLabel}</p>
					)}
					{intro && (
						<p className="mt-6 text-body-sm text-slate leading-relaxed">
							{intro}
						</p>
					)}
				</Container>
			</header>

			<Container>
				<div className="flex flex-col gap-12 pt-12 lg:gap-16 lg:pt-16">
					{sections.map((section) => (
						<section
							key={section.heading}
							id={section.id}
							className="scroll-mt-32 lg:scroll-mt-40"
						>
							<h2 className="mb-5 font-display font-semibold text-lead-sm text-ink leading-tight lg:text-lead">
								{section.heading}
							</h2>
							{section.blocks && <Blocks blocks={section.blocks} />}
							{section.subsections?.map((sub) => (
								<div key={sub.heading} className="mt-7">
									<h3 className="mb-3 font-sans font-semibold text-body-sm text-ink">
										{sub.heading}
									</h3>
									<Blocks blocks={sub.blocks} />
								</div>
							))}
						</section>
					))}
				</div>
			</Container>
		</article>
	);
}
