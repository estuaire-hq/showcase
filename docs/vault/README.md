# Estuaire — Project Vault

Human-readable **project knowledge**: the *why* behind decisions, R&D, and content.
Versioned in the repo — shared with anyone who clones it. Open this folder as an
Obsidian vault.

## What lives here vs elsewhere

| Lives here (vault) | Lives elsewhere |
|---|---|
| Decisions + rationale (ADRs), R&D logs, design notes, content inventory, glossary — the **why** | The **law** → constitution (`.specify/memory/constitution.md`) |
| | Per-feature **specs** → `specs/` |
| | The **design system** itself → `src/design-system/` |
| | Reusable **methods** → skills (`.claude/skills/`) |
| | Claude's operational / how-we-work notes → Claude **local** memory (not versioned) |

## Frontier rule (project vs local)

- Needed to **understand the project** (you, a teammate, future-me on another machine) → **vault (repo)**.
- A rule that must **always hold** → **constitution**.
- **How Claude assists / current status** → **Claude local memory** (not in repo).

## Structure

- `decisions/` — ADRs, one decision per note: *context · decision · rationale · consequences*. Filename `NNNN-kebab-title.md`.
- `post-mortems/` — what went wrong, root cause, and the fix. Write one after any mistake or methodology change. Filename `NNNN-kebab-title.md`.
- `design/` — design-system & motion notes (cinematics, pixel-perfect method).
- `research/` — R&D logs (ocitocine decode, parallax craft).
- `content/` — sitemap, case-study model, contact routing, copy.
- `index.md` — map of content (MOC).

## Conventions

- Obsidian-flavored markdown. Frontmatter for `tags` / `status` / `date`. Link liberally with `[[wikilinks]]`.
- Keep notes short and atomic. Record decisions *as they are made*.
- `.obsidian/workspace*` and cache are gitignored; notes are committed.
