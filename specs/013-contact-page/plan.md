# Implementation Plan: Page contact

**Branch**: `013-contact-page` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-contact-page/spec.md`

## Summary

Construire la page `/contact` (singleton Sanity `contactPage`) fidèle à la maquette Figma
`contact` (node `51:4548`) : un hero outline « Nous sommes / à votre écoute », une section
**formulaire** (visuel à gauche, panneau beige `#eee6dc` à droite) avec champs Nom & prénom*,
Société, Email, Type de demande (liste éditable), Message, Pièce jointe + bouton « envoyer »,
une section **coordonnées + carte interactive**, et le footer partagé. La soumission part vers
une route serveur `POST /api/contact` qui valide (zod, client + serveur), filtre le spam
(honeypot + time-trap), et relaie le message par **Nodemailer** via le SMTP Microsoft 365 du
client. La carte est un composant **react-leaflet** (tuiles OpenStreetMap, sans clé), chargé
en client, avec repli texte sur l'adresse. Événements Umami `contact_form_submit`
(succès / échec, distinctement — Principe VI).

> **✅ Relais email arrêté** (inventaire OVH 2026-06-20) : **SMTP OVH Email Pro**
> (`pro1.mail.ovh.net:587`), boîte d'envoi `@estuaire.fr`, From aligné SPF, visiteur en
> `replyTo`. Restent : (1) confirmer/choisir la boîte d'envoi exacte (Pierre) ; (2) **ADR +
> amendement PATCH** de la constitution (la table de stack dit « SMTP M365 » alors que le mail
> est en réalité OVH Email Pro) ; (3) activer DKIM côté Cloudflare. Détails : [research.md §2](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.8 (strict), React 19.2, Node (route handler runtime)
**Framework**: Next.js 16.2 (App Router, RSC par défaut, standalone output)
**CMS**: Sanity Cloud v5 (Studio embarqué), TypeGen → `src/sanity.types.ts`
**Styling**: Tailwind CSS v4 (`@theme` tokens) + `tailwind-variants` + `cn`
**Animations**: GSAP + `@gsap/react` + Lenis (entrées de section ; respecter `prefers-reduced-motion`)
**Primary Dependencies (nouvelles)**:
  - `nodemailer` ^9.0.1 + `@types/nodemailer` (envoi email — mandaté par la constitution)
  - `react-leaflet` ^5 + `leaflet` ^1.9 + `@types/leaflet` (carte interactive, React 19, sans clé)
  - `zod` ^4.4.3 (DÉJÀ présent — à déplacer de devDependencies vers dependencies : usage runtime)
**Storage**: aucune persistance des soumissions (transmission email uniquement, cf. Assumptions du spec).
  Contenu éditorial dans Sanity (singleton `contactPage`).
**Testing**: vérification manuelle (skill `verify` + `estuaire-pixel-review`) ; `npm run lint` (Biome) ;
  `npm run typegen` ; `npm run seed:check` (dry-run du seed)
**Target Platform**: Web (desktop maquette de référence ; tablette/mobile dérivés par breakpoint)
**Project Type**: Web application (site vitrine Next.js + Sanity, projet unique)
**Performance Goals**: JS client minimal — seuls le formulaire (`ContactForm`) et la carte
  (`ContactMap`, import dynamique `ssr:false`) sont des îlots client ; le reste RSC. ISR via
  `sanityFetch` (tags de revalidation).
**Constraints**: aucune couleur/typo codée en dur (tokens `@theme` — Principe X) ; SMTP M365
  (Basic Auth SMTP AUTH à activer côté tenant — note ops) ; pièce jointe unique, taille/format
  bornés ; accessibilité clavier + lecteur d'écran (FR-021).
**Scale/Scope**: 1 page publique + 1 singleton CMS + 1 route API + 4 nouvelles primitives DS
  (TextField, TextArea, Field/erreur, + état d'erreur sur Select) + 2 îlots client (form, map).

## Constitution Check

*GATE : à valider avant Phase 0, re-vérifié après Phase 1.*

| Principe | Conformité |
|---|---|
| **I. Server-First** | Page RSC + `generateMetadata`. `"use client"` justifié sur 2 îlots : `ContactForm` (état, validation, fetch) et `ContactMap` (Leaflet, WebDOM). Route `/api/contact` runtime Node. ISR via `sanityFetch`. ✅ |
| **II. CMS source unique** | Tout le contenu (hero, visuel, titres, coordonnées, position carte, types de demande) dans le singleton `contactPage`. Aucun texte de contenu en dur. ✅ |
| **III. Feature-based** | Page + îlots colocalisés sous `src/app/(site)/contact/`. Primitives réutilisables → `src/design-system/`. Pas de fourre-tout. ✅ |
| **IV. Simplicity** | 2 dépendances ajoutées, chacune justifiée (voir research.md) : Nodemailer (mandaté), react-leaflet (carte interactive brandée, gratuite, sans clé). Formulaire **fait main** (6 champs) + zod partagé — PAS de react-hook-form. Anti-spam **sans dépendance** (honeypot + time-trap). ✅ |
| **V. Bilingual** | Code/commits/PR en anglais ; docs (spec, plan, ADR) en français. ✅ |
| **VI. Umami** | `contact_form_submit` { status: "success" \| "error" } décidé (voir research.md §Tracking). Clic email mailto tracé. ✅ |
| **VII. Pixel-perfect** | Build depuis le node Figma complet (`51:4548`) via skill `estuaire-pixel-perfect` ; sign-off `estuaire-pixel-review` (diff section par section). ✅ |
| **VIII. Data/Presentation** | Primitives DS présentationnelles (props only). La page (RSC) fetche `contactPage` et passe les props au form/map. Aucun accès Sanity dans le DS. ✅ |
| **IX. Modèle Sanity** | Schéma `contactPage` → `npm run typegen` → query typée → mapping → seed typé `defineSeed<ContactPage>` validé `--check`. Copie maquette dans `src/content/contactPage.ts`. ✅ |
| **X. Design System** | Couleurs/typo via tokens `@theme` (`bg-paper`, `text-ink`, `text-body`…). Beige du panneau via token existant (sinon ajout délibéré au DS). Variantes via `tv`. ✅ |

**Gate result : PASS** — aucune violation. Section Complexity Tracking vide.

## Project Structure

### Documentation (this feature)

```text
specs/013-contact-page/
├── spec.md              # Feature specification (déjà présent)
├── plan.md              # Ce fichier (/speckit.plan)
├── research.md          # Phase 0 — décisions techniques
├── data-model.md        # Phase 1 — modèle Sanity contactPage + entité soumission
├── quickstart.md        # Phase 1 — comment lancer / vérifier
├── contracts/           # Phase 1 — contrat API + shape GROQ
│   ├── contact-api.md
│   └── contactPage-query.md
├── checklists/
│   └── requirements.md  # déjà présent (validé)
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé ici)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (site)/
│   │   └── contact/
│   │       ├── page.tsx            # RSC : generateMetadata + fetch contactPage + compose sections
│   │       ├── ContactForm.tsx     # "use client" — état, validation zod, fetch /api/contact, états succès/erreur, Umami
│   │       └── ContactMap.tsx      # "use client" — react-leaflet (import dynamique ssr:false), marqueur brandé
│   └── api/
│       └── contact/
│           └── route.ts            # POST — parse multipart, valide (zod + fichier + anti-spam), Nodemailer → CONTACT_TO
├── components/
│   └── (pas de wrapper connecté ici — le contenu contactPage est page-specific, fetché par la page)
├── content/
│   └── contactPage.ts              # copie maquette partagée (seed ↔ fallback front) ; réutilise l'adresse de footer.ts
├── design-system/
│   ├── components/
│   │   ├── TextField.tsx           # NOUVEAU — input underline (border-b), label/erreur/aria
│   │   ├── TextArea.tsx            # NOUVEAU — textarea encadrée (border), label/erreur/aria
│   │   ├── Field.tsx               # NOUVEAU — wrapper label + message d'erreur (a11y, réutilisable)
│   │   ├── Select.tsx              # EXISTANT — + état d'erreur/aria-invalid
│   │   ├── FileInput.tsx           # EXISTANT — réutilisé (accept/onChange)
│   │   └── Button.tsx              # EXISTANT — tone="send" pour « envoyer »
│   └── index.ts                    # exporter les nouvelles primitives
├── lib/
│   ├── sanity/
│   │   ├── queries.ts              # + CONTACT_PAGE_QUERY (defineQuery)
│   │   └── contactPage.ts          # mapping Sanity → props (defaults + mapImage + geopoint)
│   ├── contact/
│   │   ├── schema.ts               # zod schema partagé (client + serveur) + contraintes fichier
│   │   └── mailer.ts               # transport Nodemailer (SMTP M365 ; fallback jsonTransport en dev)
│   └── utils.ts                    # EXISTANT — trackEvent / umamiAttrs réutilisés
└── sanity/
    ├── schemas/
    │   ├── documents/contactPage.ts    # NOUVEAU — defineType singleton
    │   └── index.ts                    # + register contactPage
    ├── structure.ts                    # + entrée desk « Contact » (singleton)
    └── seed/
        ├── documents/contactPage.seed.ts  # NOUVEAU — defineSeed<ContactPage>
        └── registry.ts                    # + register le seed

seed-assets/contact/                  # visuel du formulaire (51-4607.jpg) committé hors public/
.env.example                          # + SMTP_* + CONTACT_TO (documentés)
```

**Structure Decision** : projet Next.js unique (Option « web application »). On suit à
l'identique le pattern des pages récentes (expertiseSubpage / sectorDetail) : schéma → typegen →
query → mapping → seed → content. Le formulaire et la carte sont des **îlots client colocalisés**
avec la page (Principe III), nourris en props par la page RSC (Principe VIII). Les nouvelles
primitives de saisie vont au **design system** (Principe X), jamais réimplémentées ad hoc.

## Complexity Tracking

*Aucune violation de la Constitution Check — section vide.*
