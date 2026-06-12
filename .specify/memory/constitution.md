<!--
  Sync Impact Report
  ===================
  Version change: (none) → 1.0.0
  Modified principles: N/A (initial ratification)
  Added sections:
    - Core Principles (5 principles)
    - Technical Stack & Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check section generic)
    - .specify/templates/spec-template.md        ✅ compatible (no constitution-specific references)
    - .specify/templates/tasks-template.md       ✅ compatible (phase structure fits project)
    - .specify/templates/commands/*.md           ✅ no command files exist yet
  Follow-up TODOs:
    - Animation library (GSAP vs Framer Motion) to be confirmed during first feature spec

  Sync Impact Report (1.0.0 → 1.1.0)
  ====================================
  Version change: 1.0.0 → 1.1.0
  Modified sections:
    - Variables d'environnement: .env.local → .env.development + git-crypt + Coolify UI
  Rationale: .env.development is only loaded in dev mode (not during next build),
    preventing dev secrets from leaking into Docker production images. git-crypt
    provides transparent encryption in git. Production vars live in Coolify UI.

  Sync Impact Report (1.1.0 → 1.2.0)
  ====================================
  Version change: 1.1.0 → 1.2.0
  Added principles:
    - VI. Intentional Event Tracking
  Modified sections:
    - Variables d'environnement: prefix example updated from NEXT_PUBLIC_UMAMI_*
      to UMAMI_* (alignment with recent code change)
  Rationale for MINOR bump: new principle introduces a material, testable
    expectation about analytics instrumentation.
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check generic)
    - .specify/templates/spec-template.md        ✅ compatible (no principle-specific fields)
    - .specify/templates/tasks-template.md       ✅ compatible (no category changes required)
  Out-of-scope (moved to CLAUDE.md):
    - NEXT_PUBLIC_ reservation rule: operational guidance for the dev agent,
      not a constitutional principle. Lives in CLAUDE.md Environment Variables.

  Sync Impact Report (1.2.0 → 1.3.0)
  ====================================
  Version change: 1.2.0 → 1.3.0
  Added principles:
    - VII. Pixel-Perfect Fidelity (Figma source of truth + build method)
  Added sections:
    - Memory & Knowledge Architecture (project vs local memory; the docs/vault/ project vault)
  Rationale for MINOR bump: a new binding principle (pixel-perfect fidelity / Figma
    source of truth) and a new knowledge-architecture section establishing the project
    vault and the project-vs-local memory frontier.
  Codified skills (operational, in .claude/skills/):
    - estuaire-motion (motion cinematics), estuaire-figma (pixel-perfect build method)
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check generic)
    - .specify/templates/spec-template.md        ✅ compatible
    - .specify/templates/tasks-template.md       ✅ compatible
  Deferred: Design-System-First and Intentional Motion principles to a later amendment,
    once the design system is fully integrated (per Pierre's sequencing).

  Sync Impact Report (1.3.0 → 1.4.0)
  ====================================
  Version change: 1.3.0 → 1.4.0
  Modified principles:
    - VII. Pixel-Perfect Fidelity — added binding rules: read the FULL Figma node at
      build time (figma-node.mjs), never a hand-rolled digest / memory / inference;
      "pixel-perfect" requires a Figma-render diff or must be declared "non vérifié".
  Modified sections:
    - Memory & Knowledge Architecture — post-mortems / methodology lessons MUST be
      recorded in docs/vault/post-mortems/ before moving on.
  Rationale for MINOR bump: expansion of an existing principle with new testable rules
    + a new knowledge-architecture obligation. Triggered by post-mortem 0001 (pixel-perfect
    missed via lossy extraction). No principle removed/redefined → not MAJOR.
  Companion changes (operational, not constitutional):
    - .design/scripts/figma-node.mjs (lossless node reader) added.
    - estuaire-figma skill rewritten (failure modes + completeness gate + verify gate).
    - kit-inventory.md re-labelled "MAP, not a build spec".
    - CLAUDE.md Project Memory & Vault: post-mortems requirement added.

  Sync Impact Report (1.4.0 → 1.5.0)
  ====================================
  Version change: 1.4.0 → 1.5.0
  Added principles:
    - VIII. Data/Presentation Boundary (Connected Components) — DS components are
      presentational (props only) and MUST NOT touch Sanity; global/singleton content
      is loaded by a connected Server Component in src/components/ that self-fetches and
      renders the DS component (so layouts/pages consume <Footer /> with no prop threading);
      page-specific content stays fetched by the page.
  Modified principles:
    - III. Feature-Based Architecture — clarified that the catch-all `components/` ban does
      NOT forbid purpose-scoped top-level modules (src/design-system/, src/components/ for
      connected components). Reconciles III with the new VIII; no semantic reversal.
  Rationale for MINOR bump: a new binding, testable principle establishing the
    data/presentation boundary, plus a clarifying expansion of III. Extends Principle II +
    ADR 0003/0004 (DS isolation) without redefining or removing any existing principle → not MAJOR.
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check generic)
    - .specify/templates/spec-template.md        ✅ compatible (no principle-specific fields)
    - .specify/templates/tasks-template.md       ✅ compatible (no category changes required)
  Companion changes (operational, not constitutional):
    - docs/vault/decisions/0005-connected-components-for-global-sanity-content.md added.
    - CLAUDE.md Key Patterns + Design System: connected-component convention documented.
    - src/components/Footer.tsx (first connected wrapper); (site)/layout.tsx renders <Footer />.

  Sync Impact Report (1.5.0 → 1.6.0)
  ====================================
  Version change: 1.5.0 → 1.6.0
  Added principles:
    - IX. Modèle Sanity : source de vérité, types dérivés, seeds typés — le schéma
      (defineType) est la source unique du modèle ; les types de contenu DOIVENT être
      générés (Sanity TypeGen, src/sanity.types.ts commité), jamais tapés à la main ; tout
      seed DOIT être déclaratif, typé contre le type généré, et validé avant écriture
      (champs required présents + assets existants, dry-run --check) ; createIfNotExists
      par défaut (réinitialisation opt-in via --reset) ; valeurs de maquette à un seul endroit.
  Rationale for MINOR bump: a new binding, testable principle. Extends Principle II (the CMS
    owns content) to the model/types dimension; consistent with Principle IV (justified
    anti-drift tooling in an internal module, not a published package). No principle removed
    or redefined → not MAJOR.
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check generic)
    - .specify/templates/spec-template.md        ✅ compatible (no principle-specific fields)
    - .specify/templates/tasks-template.md       ✅ compatible (no category changes required)
  Companion changes (operational, not constitutional):
    - Sanity TypeGen wired (sanity.cli.ts typegen config); src/sanity.types.ts generated +
      committed; lib/sanity/footer.ts consumes generated types (hand-typed FooterData removed).
    - Seed tooling added under src/sanity/seed/ (define.ts; run.ts with --check/--reset;
      scaffold.ts; registry.ts); scripts/seed-footer.mjs removed; tsx devDependency added.
    - src/content/footer.ts (shared maquette copy, single source); ADR 0006 added; CLAUDE.md
      updated (Project Structure, Adding a New Sanity Content Type, Sanity Types & Seeds, Do NOT).

  Sync Impact Report (1.6.0 → 1.6.1)
  ====================================
  Version change: 1.6.0 → 1.6.1
  Modified sections:
    - Variables d'environnement: documented that local dev and production point at TWO
      SEPARATE Sanity projects (distinct projectId), not just different datasets. A local
      seed populates only the dev project; prod is seeded via CI with the prod project's
      projectId + a write token for the prod project.
  Rationale for PATCH: factual clarification/correction of an existing section (the env /
    infrastructure reality). No principle added, removed, or redefined.
  Companion changes (operational, not constitutional):
    - CLAUDE.md Environment Variables: two-projects note added.
    - .github/workflows/seed-sanity.yml (CI bootstrap of the prod project, createIfNotExists).
    - seed-assets/ introduced (committed seed images, outside public/, excluded from the build
      via .dockerignore); footer.seed.ts points there; ADR 0006 updated.

  Sync Impact Report (1.6.1 → 1.6.2)
  ====================================
  Version change: 1.6.1 → 1.6.2
  Modified sections:
    - Technical Stack & Constraints / « Stack applicative » : Next.js 15 → 16,
      Sanity Cloud v4 → v5, et résolution du TODO(ANIMATION_LIB) → GSAP
      (+ @gsap/react, Lenis ; framer-motion non utilisé, cf. package.json).
  Rationale for PATCH: mise à jour factuelle de la table descriptive de stack vers les
    versions migrées + résolution d'un TODO de longue date. Aucun principe ajouté,
    supprimé ou redéfini (les 9 principes restent inchangés ; le Constitution Check de
    la migration 002-nextjs-16-migration les valide tous). Analogue au bump 1.6.0 → 1.6.1
    (correction factuelle d'une section existante).
  Companion changes (operational, not constitutional):
    - specs/002-nextjs-16-migration/ (spec, plan, tasks, research, contracts).
    - ADR 0008 (décision de migration, à venir) ; ADR 0007 à mettre à jour (middleware → proxy).

  Sync Impact Report (1.6.2 → 1.7.0)
  ====================================
  Version change: 1.6.2 → 1.7.0
  Added principles:
    - X. Design System : source unique du langage visuel — tout choix visuel DOIT venir
      du design system (@/design-system + tokens @theme). AUCUNE couleur codée en dur
      (tokens @theme uniquement ; pas de hex/rgb/hsl ni de valeur arbitraire type
      bg-[#…] / text-[18px]) ; AUCUNE taille de police codée en dur (échelle
      text-display/title/subtitle/lead/body/caption) ; les composants d'UI réutilisables
      (boutons, pills, cartes…) DOIVENT vivre dans src/design-system/ et être consommés via
      @/design-system, jamais réimplémentés ad hoc ; variantes via tailwind-variants ;
      CSS custom / valeurs arbitraires rares et justifiées, jamais pour une couleur ou une
      taille de marque.
  Rationale for MINOR bump: nouveau principe contraignant et testable, qui codifie en loi la
    discipline design-system jusqu'ici seulement opérationnelle (CLAUDE.md « Design System » /
    ADR 0003). Étend les Principes VII (pixel-perfect) et VIII (DS présentationnel) sans
    redéfinir ni supprimer aucun principe existant → pas MAJOR. (10 principes désormais.)
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ compatible (Constitution Check générique)
    - .specify/templates/spec-template.md        ✅ compatible (aucun champ lié à un principe)
    - .specify/templates/tasks-template.md       ✅ compatible (aucune catégorie à changer)
  Companion changes (operational, not constitutional):
    - CLAUDE.md « Design System » + « Do NOT » encodent déjà ces règles (désormais constitutionnelles).
    - docs/vault/decisions/0003-design-system.md est l'ADR d'origine.

  Sync Impact Report (1.7.0 → 1.7.1)
  ====================================
  Version change: 1.7.0 → 1.7.1
  Modified principles:
    - VII. Pixel-Perfect Fidelity — operational references only (no normative change):
      the Figma source is now mirrored into a versioned local cache (.design/figma-cache/)
      and read 100 % offline. Replaced the named scripts figma-pull.mjs / figma-node.mjs by
      the canonical chain `.design/scripts/figma.ts collect` / `read`; the verify render is
      provided manually (PNG export) since the ad-hoc `render` command was retired.
  Rationale for PATCH bump: factual correction of operational references after feature
    004-figma-local-cache consolidated 6 prototype scripts into one `figma.ts` chain
    (collect/read/list/status). No principle added, removed, or redefined.
  Companion changes (operational, not constitutional):
    - .claude/skills/estuaire-figma/SKILL.md updated to the new commands + manual verify captures.
    - CLAUDE.md « Pixel-Perfect & Animation » / « Lab » / « Design System » updated.
    - docs/vault/decisions/0010-figma-local-cache.md records the decision.
  Templates requiring updates:
    - .specify/templates/*.md                   ✅ compatible (no constitution-specific references)
-->

# Estuaire Constitution

## Core Principles

### I. Server-First Rendering

Tous les composants DOIVENT être des React Server Components par défaut.
La directive `"use client"` est autorisée uniquement quand le composant
nécessite de l'interactivité navigateur (événements, hooks React, animations).

- Les pages DOIVENT utiliser ISR (Incremental Static Regeneration) via
  `revalidateTag` déclenché par webhook Sanity.
- Le build DOIT produire un `standalone` output pour le déploiement Docker.
- Le JavaScript client DOIT rester minimal : pas de bundle superflu.

**Justification** : un site vitrine n'a quasiment aucune logique côté client.
Maximiser le rendu serveur garantit performance, SEO et simplicité.

### II. CMS as Single Content Source

Tout le contenu éditorial et les assets média DOIVENT vivre dans Sanity Cloud.
Aucun texte de contenu, image de contenu ou donnée éditoriale ne DOIT être
codé en dur dans les composants ou les fichiers du dépôt.

- Les schémas Sanity DOIVENT être écrits en TypeScript et colocalisés dans
  le projet (Sanity Studio embarqué).
- Les requêtes GROQ DOIVENT être typées et colocalisées avec le composant
  ou la route qui les consomme.
- Les assets statiques de l'UI (icônes, logo SVG, polices) restent dans le
  dépôt — seuls les assets de contenu vont dans Sanity.

**Justification** : le client doit pouvoir modifier tout le contenu visible
sans intervention développeur. Un CMS headless avec studio embarqué offre
autonomie éditoriale et workflow de prévisualisation.

### III. Feature-Based Architecture

Le code source DOIT être organisé par fonctionnalité/route dans l'App Router,
pas par type technique (pas de dossier `components/` global fourre-tout).

- Chaque route ou fonctionnalité regroupe ses composants, requêtes Sanity,
  types et styles associés.
- Les éléments partagés entre plusieurs fonctionnalités vivent dans un
  dossier `shared/` ou `lib/` dédié.
- Un composant ne DOIT PAS dépendre d'une autre fonctionnalité sans passer
  par une interface partagée explicite.
- L'interdiction vise un `components/` **fourre-tout**, pas les modules
  top-level à **rôle défini** : `src/design-system/` (langage visuel, cf.
  Principe VII et [[decisions/0003-design-system]]) et `src/components/`
  (composants connectés au CMS, cf. Principe VIII) sont autorisés et explicitement
  cadrés par leur rôle.

**Justification** : la colocation facilite la navigation, la suppression de
code mort et le raisonnement local sur chaque fonctionnalité.

### IV. Simplicity Over Abstraction

Chaque dépendance, couche d'abstraction ou pattern ajouté DOIT être justifié
par un besoin concret et immédiat — pas par une anticipation hypothétique.

- YAGNI : ne pas construire ce qui n'est pas demandé.
- Préférer 3 lignes de code similaires à une abstraction prématurée.
- Pas de state management global (Redux, Zustand, etc.) sauf preuve de
  nécessité. Les Server Components et le cache Next.js couvrent la majorité
  des cas.
- Pas de monorepo, pas de packages internes — un seul projet Next.js.

**Justification** : projet freelance solo sur un site vitrine. La complexité
accidentelle est l'ennemi principal. Chaque ajout doit prouver sa valeur.

### V. Bilingual Convention

La documentation (README, specs, docs) DOIT être rédigée en **français**.
Tout le reste DOIT être en **anglais** : code, noms de variables, composants,
commits, branches, commentaires de code.

- Les messages de commit suivent le format Conventional Commits en anglais.
- Les noms de branches sont en anglais (ex: `feat/contact-form`).
- Les commentaires de code sont en anglais.

**Justification** : le français pour la documentation assure la clarté pour
le client et le contexte métier. L'anglais pour le code assure la cohérence
avec l'écosystème technique (noms de librairies, API, docs officielles).

### VI. Intentional Event Tracking

Toute interaction utilisateur porteuse de valeur métier DOIT faire l'objet
d'une décision explicite de tracking via Umami — traçée ou non, et pourquoi.
Le tracking pageview par défaut ne suffit PAS dès qu'une interaction permet
de mesurer un résultat (conversion, engagement, frein).

- Les événements custom Umami DOIVENT être implémentés pour, au minimum :
  - Soumissions de formulaire (succès et échec, distinctement)
  - Clics sur les CTA principaux (contact, devis, téléphone, email)
  - Actions métier clés définies au cas par cas (ouverture de projet,
    lecture vidéo, téléchargement, etc.)
- Toute nouvelle fonctionnalité interactive DOIT, en phase de spec ou de
  plan, statuer sur les événements à tracer. L'absence de tracking doit
  être un choix documenté, pas un oubli.
- Les événements NE DOIVENT PAS contenir d'information personnellement
  identifiable (PII) dans leur nom ou leurs propriétés custom.
- Quand un événement est déclenché par une route serveur (Server Action,
  API route, webhook), préférer l'API serveur Umami plutôt que de
  dépendre du tracker client.

**Justification** : un site vitrine sans mesure d'engagement ne peut être
itéré de façon informée. Tracer les interactions clés permet d'identifier
ce qui convertit et ce qui est ignoré — sans tomber dans le travers inverse
d'instrumenter chaque clic au risque de polluer les données et la privacy.

### VII. Pixel-Perfect Fidelity

L'implémentation visuelle DOIT être fidèle au pixel à la maquette **Figma**, qui
est la **source de vérité** du design (le fichier Pencil `.pen` est déprécié).

- Les **dimensions intrinsèques** (positions, tailles, font-size, letter-spacing,
  couleurs, rayons, contours/strokes) DOIVENT correspondre exactement à Figma.
- Les **dimensions dynamiques** liées à la taille d'écran PEUVENT dévier de la
  maquette — ex. une section pleine hauteur (`min-h-[100svh]`) plutôt qu'une
  hauteur figée.
- Le responsive se fait **par breakpoint**, en correspondant à la frame Figma
  dédiée (desktop / tablette / mobile).
- Les specs DOIVENT être tirées de Figma via la **REST API**, mises en cache localement
  (`.design/figma-cache/`, versionné) par `.design/scripts/figma.ts collect`, pas du Dev
  Mode MCP (limité sur le plan Starter). Les fichiers source de design vivent dans `.design/`.
- Les specs DOIVENT être lues sur le **node Figma COMPLET au moment du build**
  (`.design/scripts/figma.ts read <node|nom>`, 100 % hors-ligne depuis le cache) — JAMAIS
  depuis un résumé fait-maison, la mémoire, ou la déduction. Toute valeur présente dans Figma
  (position, opacité de calque, taille, police, rayon, nombre d'éléments) DOIT être lue, jamais devinée.
- « Pixel-perfect » NE PEUT être revendiqué qu'après un **diff visuel contre un render
  Figma** du node. Le render de référence est **fourni manuellement** (export PNG de Figma) ;
  s'il est indisponible, l'état DOIT être déclaré explicitement « non vérifié », pas affirmé.
- La méthode de fabrication est codifiée dans la skill **`estuaire-figma`**, qui
  DOIT être chargée avant de construire une page, une section ou un composant.

**Justification** : le rendu est le produit. Distinguer dimensions intrinsèques
(exactes) et dynamiques (adaptatives) permet d'être fidèle sans casser le responsive.
Lire la source complète plutôt qu'un digest, et vérifier contre Figma, évite les
approximations qui s'accumulent (cf. [[post-mortems/0001-pixel-perfect-lossy-extraction]]).

### VIII. Data/Presentation Boundary (Connected Components)

Les composants du design system (`@/design-system`) DOIVENT être purement
présentationnels : ils reçoivent leurs données en props et ne DOIVENT JAMAIS
accéder à Sanity (`sanityFetch`, GROQ, `@/lib/sanity`, `urlFor`). Le chargement
d'un document Sanity DOIT se faire en dehors du design system.

- Le contenu **global / singleton** (footer, header, paramètres de site) DOIT
  être chargé par un **composant connecté** : un React Server Component dans
  `src/components/` qui fait le fetch + mapping et rend le composant DS
  correspondant. Pages et layouts consomment alors `<Footer />` — sans threader
  de props.
- Le mapping Sanity → props (requête GROQ, valeurs par défaut, `urlFor`) vit
  dans `@/lib/sanity/<doc>.ts`, séparé du composant React.
- Le contenu **spécifique à une page** reste fetché par la page (Server
  Component), qui passe les props au composant DS.
- Le DS reste ainsi isolable, testable et rendu en isolation (lab / Storybook)
  sans aucune dépendance au CMS.

**Justification** : séparer « qui charge » de « qui affiche » (pattern
container / présentation) préserve l'isolation du design system (cf. Principe II
et [[decisions/0003-design-system]] / [[decisions/0004-content-images-in-sanity]])
tout en supprimant la cérémonie de threading des props pour le contenu global.
Colocaliser le fetch avec le composant connecté est l'idiome App Router (RSC).

### IX. Modèle Sanity : source de vérité, types dérivés, seeds typés

Le schéma Sanity (`defineType`) est la **source de vérité unique** du modèle de
contenu. Les types TypeScript du contenu DOIVENT en être **dérivés par génération**
(Sanity TypeGen), JAMAIS écrits à la main. Tout pré-remplissage de contenu (*seed*)
DOIT être **typé** contre le type généré et **validé** contre le schéma avant écriture.

- Les types de documents et de résultats de requêtes (GROQ) DOIVENT provenir de
  TypeGen (`src/sanity.types.ts`, commité). Aucun type de contenu tapé à la main ne
  DOIT doublonner le schéma.
- Un seed DOIT être déclaratif et typé contre le type généré du document ; il NE DOIT
  PAS être un script ad hoc dupliquant la forme du document. L'outillage de seed vit
  dans un **module interne** (`src/sanity/seed/`), pas un package publié — abstraction
  justifiée par un besoin concret (la prévention de la dérive quand un agent crée le
  contenu), cohérente avec le Principe IV.
- Avant écriture, un seed DOIT passer une **validation** : champs `required` du schéma
  présents, assets référencés existants (dry-run `--check`).
- Le pré-remplissage par défaut NE DOIT PAS écraser le travail éditorial
  (`createIfNotExists` par défaut ; réinitialisation opt-in explicite via `--reset`).
- Les valeurs de maquette NE DOIVENT vivre qu'à **un seul endroit** (pas de duplication
  seed ↔ valeurs par défaut du front).

**Justification** : quand un agent (ou un développeur) crée le contenu initial depuis
les maquettes, la seule protection contre la dérive schéma↔seed↔front est que les trois
dérivent d'une source unique et soient validés mécaniquement. Étend le Principe II (le
CMS détient le contenu) à la dimension *modèle / types* (cf.
[[decisions/0006-schema-derived-types-and-typed-seeds]]).

### X. Design System : source unique du langage visuel

Tout choix visuel — couleur, typographie, rayon, espacement — et tout composant
d'interface réutilisable DOIT provenir du **design system** (`@/design-system` +
tokens Tailwind v4 `@theme`). Rien de tout cela ne DOIT être codé en dur ni
réinventé dans une page ou une fonctionnalité.

- **Couleurs** : AUCUNE couleur codée en dur — pas de hex, `rgb()`, `hsl()`, nom
  CSS arbitraire, ni valeur arbitraire Tailwind (`bg-[#1a1a1a]`, `text-[rgb(...)]`).
  Les couleurs DOIVENT être des tokens `@theme` (`bg-estuaire`, `text-ink`,
  `text-paper`, …).
- **Typographie** : AUCUNE taille de police codée en dur (px/rem arbitraire,
  `text-[18px]`). Les tailles DOIVENT venir de l'échelle de tokens (`text-display`,
  `text-title`, `text-subtitle`, `text-lead`, `text-body`, `text-caption`) ; les
  familles via les utilitaires de tokens (`font-display`), en respectant la règle de
  marque (UPPERCASE → Montserrat, lowercase → Montserrat Alternates, via `BrandText`).
- **Rayons, espacements et autres primitives de design** : via tokens / utilitaires
  Tailwind, jamais de valeur magique.
- **Composants d'UI réutilisables** (boutons, pills, cartes, champs, badges, toggles,
  etc.) DOIVENT vivre dans `src/design-system/` et être consommés via `@/design-system`.
  Ils NE DOIVENT PAS être réimplémentés ad hoc. S'il manque une primitive, on
  l'**ajoute au design system** (acte délibéré, cf. Principe III) — on ne la duplique
  pas dans une fonctionnalité.
- Les tokens `@theme` (`src/app/globals.css`) sont la **source de vérité** ; `tokens.ts`
  n'en est qu'un miroir TypeScript pour le JS/GSAP. Les variantes de composants se font
  avec **`tailwind-variants` (`tv`)** + `cn`.
- **CSS custom** et **valeurs arbitraires** sont l'exception : rares, justifiées par un
  commentaire explicite, et JAMAIS pour une couleur ou une taille typographique de marque.

**Justification** : le rendu est le produit (cf. Principe VII). Concentrer couleurs,
typographie et primitives dans un seul module garantit la cohérence visuelle, rend le
pixel-perfect maintenable, et permet de faire évoluer le langage visuel à un seul endroit
sans dérive. Consommer le design system plutôt que de le réimplémenter préserve aussi son
isolation présentationnelle (cf. Principe VIII et [[decisions/0003-design-system]]).

## Technical Stack & Constraints

### Stack applicative

| Couche | Technologie | Version / Détail |
|---|---|---|
| Framework | Next.js | 16 (App Router, TypeScript, standalone output) |
| CMS | Sanity Cloud | v5, plan gratuit, Studio embarqué |
| Styles | Tailwind CSS | v4 |
| Animations | GSAP | GSAP + `@gsap/react` + Lenis (scroll fluide) |
| Formulaire contact | Nodemailer | SMTP Microsoft 365 du client |
| Analytics | Umami | Auto-hébergé sur le même VPS (séparé) |

### Infrastructure

| Composant | Service | Détail |
|---|---|---|
| Hébergement app | VPS OVH (Ubuntu) | Déploiement via Coolify (Docker, git push) |
| CDN / DNS / WAF | Cloudflare | Plan gratuit |
| SSL | Let's Encrypt | Géré par Coolify |
| Contenu & assets | Sanity Cloud | Hébergé chez Sanity, pas sur le VPS |
| Email | SMTP M365 | Relais via le tenant Microsoft 365 du client |

### Revalidation

Webhook Sanity → API route Next.js → `revalidateTag()` (ISR).
Le VPS ne stocke ni contenu ni assets de contenu.

### Variables d'environnement

- Un seul fichier `.env.development` à la racine — source unique de vérité
  pour le développement local. Chiffré dans git via git-crypt, en clair sur
  disque après `git-crypt unlock`.
- Les variables de production vivent exclusivement dans l'UI Coolify.
- **Deux projets Sanity distincts** : le développement local et la production
  pointent vers des **projets Sanity séparés** (projectId différents) — pas un simple
  changement de dataset. `NEXT_PUBLIC_SANITY_PROJECT_ID` vaut le projet *dev* dans
  `.env.development`, le projet *prod* dans l'UI Coolify. Conséquence : un seed lancé
  en local ne peuple QUE le projet dev ; la production se seede via la CI, avec le
  projectId et un write token **du projet prod** (cf. Principe IX,
  [[decisions/0006-schema-derived-types-and-typed-seeds]]).
- Toutes les variables sont préfixées par domaine :
  `NEXT_PUBLIC_SANITY_*`, `SMTP_*`, `UMAMI_*`, etc.
- Pas de `.env` par sous-projet ou par service.
- Un `.env.example` documente toutes les variables attendues.

## Development Workflow

### Conventions de code

- **TypeScript strict** : pas de `any` sauf cas documenté.
- **Server Components par défaut** : `"use client"` justifié au cas par cas.
- **Schemas Sanity en TypeScript** : types dérivés des schémas (générés via
  Sanity TypeGen, jamais tapés à la main — Principe IX).
- **Formatting & Linting** : Biome (lint + format), exécuté avant chaque commit.

### Conventions Git

- Branches : `feat/`, `fix/`, `chore/`, `docs/` — noms en anglais.
- Commits : format Conventional Commits, en anglais.
- Branche principale : `main`.
- Déploiement : git push → Coolify détecte → build Docker → deploy.

### Structure du projet

```text
app/                    # App Router (feature-based)
├── (site)/             # Groupe de routes du site public
│   ├── page.tsx
│   ├── about/
│   ├── projects/
│   └── contact/
├── studio/[[...tool]]/ # Sanity Studio embarqué
└── api/                # API routes (webhook, contact)

lib/                    # Code partagé (queries, utils, types)
sanity/                 # Configuration et schémas Sanity
public/                 # Assets statiques UI uniquement
```

Cette structure est indicative et sera affinée lors de la première
spécification de fonctionnalité.

## Memory & Knowledge Architecture

La connaissance du projet est répartie en couches, avec une frontière claire entre
ce qui est **versionné dans le dépôt** (mémoire projet, partagée) et ce qui est
**local à l'agent** (non versionné).

### Mémoire projet (dans le dépôt)

- **Constitution** (`.specify/memory/constitution.md`) — la loi : principes immuables.
- **Specs speckit** (`specs/`) — le quoi/comment de chaque fonctionnalité.
- **Design system** (`src/design-system/`) — le langage visuel en code, importé via
  `@/design-system`. Importer = consommer ; éditer = modifier le DS (acte délibéré).
- **Skills** (`.claude/skills/`) — les méthodes réutilisables (`estuaire-motion`,
  `estuaire-figma`), à charger avant la tâche correspondante.
- **Vault Obsidian** (`docs/vault/`) — le *pourquoi* lisible humain : décisions (ADR),
  **post-mortems / leçons de méthode**, R&D, inventaire de contenu, glossaire.

### Mémoire locale de l'agent (hors dépôt)

La mémoire locale de l'agent contient l'état opérationnel et la façon de travailler —
PAS la connaissance projet durable.

### Règle de frontière

- Nécessaire pour **comprendre le projet** (un coéquipier, soi-même sur une autre
  machine) → **mémoire projet** (dépôt : vault / specs / DS).
- Règle qui doit **toujours tenir** → **constitution**.
- **État / façon d'assister** → mémoire locale de l'agent.

Toute décision durable (design, technique, produit) DOIT être consignée comme ADR
dans `docs/vault/decisions/`. Tout **post-mortem ou leçon de méthode** — après une
erreur, une reprise, ou un changement de façon de travailler (méthode, skill,
convention) — DOIT être consigné dans `docs/vault/post-mortems/` *avant de passer à la
suite* : une leçon non écrite se répète. Les fichiers source de design (`.pen`, exports
Figma, scripts de pull) vivent dans le dossier caché `.design/`.

## Governance

Cette constitution est le document de référence du projet estuaire.fr.
Elle prévaut sur toute autre convention implicite.

- **Amendement** : toute modification de la constitution DOIT être
  documentée dans le Sync Impact Report (commentaire HTML en tête de
  fichier) et versionnée selon les règles ci-dessous.
- **Versioning** : MAJOR pour changement incompatible de principe ou
  suppression ; MINOR pour ajout de principe ou expansion significative ;
  PATCH pour clarifications et corrections mineures.
- **Revue de conformité** : chaque spécification (`/speckit.specify`) et
  chaque plan (`/speckit.plan`) DOIVENT inclure un Constitution Check
  validant le respect des principes.
- **Fichier de guidance** : le fichier `CLAUDE.md` à la racine du projet
  complète cette constitution avec les instructions opérationnelles pour
  l'agent de développement.

**Version**: 1.7.1 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-06-12
