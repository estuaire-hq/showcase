---
tags: [post-mortem, sanity, schema, studio, field-groups]
status: actioned
date: 2026-06-14
---
# 0006 — Sanity field `group` on a nested object type crashed the Studio

## What happened
Opening the `homePage` document in the prod Studio threw, before any field rendered:

> `Field group 'hero' is not defined in schema for type 'heroSlide'`

The shared `imageField` helper in `src/sanity/schemas/documents/homePage.ts` always set a
`group` on the image field. It was reused **inside the nested `heroSlide` object** (the array
member of `heroSlides`) with `group: "hero"`. But field groups are declared on the type that
owns them — the `groups: [...]` array lived on the `homePage` **document**, not on the nested
`heroSlide` object. A `group` may only reference a group defined on the *same* type, so the
Studio crashed resolving it.

This shipped in #5 and was independent of the seed reset that surfaced it (field groups are
Studio-only UI metadata — they do not appear in the document data, GROQ results, or
`sanity.types.ts`, so neither the data nor the front was affected). See the sibling render bug
[[0005-coming-soon-gate-breaks-next-image-local-assets]].

## Root cause
A helper that carried a document-level concern (`group`) was reused in a context where that
concern is invalid (a nested object). Field groups are not inherited from the parent document
into nested object types; each type defines its own. Nothing catches this statically: `defineType`
is typed but does not validate group references, `sanity schema extract` / TypeGen pass, lint and
`next build` pass — it only throws at Studio render time.

## Fix
Make `group` optional in the helper and omit it for the nested image:
`imageField(name, title, group?)` → spread `...(group ? { group } : {})`; call
`imageField("image", "Visuel")` inside `heroSlide`. Document-level images keep their group.
TypeGen confirmed zero change to `sanity.types.ts`; no re-seed needed.

## Prevention
- **`group` belongs only to fields of the type that declares the `groups`** (usually the document).
  Never set `group` on a field inside a nested `object`/array-member type — it has no groups unless
  it declares its own.
- **A schema that extracts cleanly is not a schema that renders.** Group/structure errors only
  surface in the Studio. Before sign-off on a new document type, **open it in the Studio** (create
  + edit), don't rely on TypeGen/build passing.
- **Audit shared field helpers at every call site.** A helper that injects a document-level prop
  (`group`, `fieldset`) is a hazard when reused inside nested object types.
