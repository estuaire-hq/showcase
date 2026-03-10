# CLAUDE.md — Estuaire

## Project

Site vitrine Next.js + Sanity pour Mosaique Production / marque Estuaire, deploye via Coolify sur VPS OVH.

## Stack

- **Framework**: Next.js 15, App Router, TypeScript
- **CMS**: Sanity Cloud (embedded Studio)
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP, Framer Motion
- **Email**: Nodemailer
- **Analytics**: Umami (self-hosted)

## Commands

```bash
npm run dev       # Local dev server
npm run build     # Production build
npm run lint      # ESLint
```

**Deploy**: `git push` on main → Coolify auto-deploys on OVH VPS. No manual Docker/Coolify config changes without explicit mention.

## Project Structure

```
src/
  app/                    # App Router routes
    (site)/               # Public-facing pages
    studio/[[...tool]]/   # Embedded Sanity Studio
    api/                  # API routes (revalidation, contact form)
  components/             # React components (one component per file)
  lib/
    sanity/
      client.ts           # Sanity client config
      sanityFetch.ts      # Fetch wrapper with ISR tag support
      queries.ts          # GROQ queries
    utils/                # Shared utilities
  sanity/
    schemas/              # Sanity document & object schemas
    structure.ts          # Studio desk structure
```

## Language Conventions

- **French**: documentation only (README, docs, specs)
- **English**: code, commits, branch names, code comments

## Code Conventions

- Server Components by default; `"use client"` only when needed
- **Naming**: PascalCase components, camelCase functions/variables, kebab-case files
- No `any` in TypeScript — use proper types
- Absolute imports with `@/`
- One component per file

## Environment Variables

- **Single source**: one `.env.local` at the root, never additional `.env` files
- **Prefixes by domain**: `NEXT_PUBLIC_SANITY_`, `SMTP_`, `NEXT_PUBLIC_SITE_`, `REVALIDATION_`
- **Documented** in `.env.local.example` with comments for every expected variable
- Never create additional `.env` files (no `.env.production`, no per-service `.env`)

## Key Patterns

### Fetching Sanity Content

Use the `sanityFetch()` wrapper from `@/lib/sanity/sanityFetch`. It wraps `client.fetch()` with ISR cache tags for on-demand revalidation. All Sanity fetches happen server-side — never fetch Sanity content from the client.

### Revalidation

Sanity webhook → `POST /api/revalidate` → `revalidateTag(tag)`. Each query declares its cache tags via `sanityFetch()`.

### Adding a New Page

1. Create a route in `src/app/(site)/`
2. Create a Sanity schema in `src/sanity/schemas/`
3. Write a GROQ query in `src/lib/sanity/queries.ts`
4. Fetch data with `sanityFetch()` in the page's Server Component

### Adding a New Sanity Content Type

1. Define the schema in `src/sanity/schemas/`
2. Register it in the schema index
3. Add GROQ query + types
4. Add the desk structure entry if needed

## Do NOT

- Fetch Sanity content client-side (everything server-side)
- Write custom CSS — use Tailwind utilities (exceptions must be justified)
- Add dependencies without justification
- Modify Coolify/Docker config without mentioning it
- Create additional `.env` files (everything goes in `.env.local`)
