# Quickstart — Construire & vérifier les sous-pages « Expertise »

Guide opérationnel pour implémenter les 3 sous-pages après ce plan. Charger les skills avant
chaque tâche : **`estuaire-figma-cli`** (lire la maquette), **`estuaire-pixel-perfect`** (méthode
de build), **`estuaire-motion`** (cinématiques), **`estuaire-pixel-review`** (sign-off final).
Toujours lire le **node complet** — jamais un résumé (Principe VII).

## 0. Prérequis

```bash
git-crypt unlock                 # secrets .env.development en clair
npm install
npm run dev                      # http://010-expertise-subpages.estuaire.localhost:1355/expertises/agencement-sur-mesure
                                 # (PORTLESS=0 npm run dev → http://localhost:3000/…)
                                 # ⚠️ relancer après tout changement @theme
```

## 1. Lire la maquette (source de vérité — ne jamais deviner)

```bash
npm run figma -- list                          # cibles disponibles (vérifier les nodes des sous-pages)
# Agencement (référence responsive — 3 frames) :
npm run figma -- read 51:3008                   # desktop, node complet (offline)
npm run figma -- read 87:6762                   # tablette
npm run figma -- read 87:6964                   # mobile
# Mobiliers & présentoirs (desktop only — responsive dérivé de l'agencement) :
npm run figma -- read 51:3134                   # mobiliers desktop
npm run figma -- read 51:3259                   # présentoirs desktop
```

Lire chaque section sur le node **avant** de la coder : `02/ SLIDER` (hero + fil d'Ariane) ·
`03/ INTRO` (+ demi-fond bleu sur agencement) · `04/ RESPONSABLE` · `05/ NOS ENGAGEMENTS` (la
grille 3×2 + traits + numéros) · `06/ CAS STUDY` (bande + bouton). Relever la **copie verbatim**
des 3 pages (fil d'Ariane, eyebrow + titre hero, phrase phare, texte d'intro, phrase
d'engagement, les **6 intitulés d'engagement**, titre + meta + libellé/lien du cas study) pour
`src/content/expertiseSubpages.ts`. Les renders de référence servent au **diff visuel** final.

## 2. Créer le modèle Sanity (Principe IX — ordre imposé par CLAUDE.md)

1. `npm run seed:scaffold -- expertiseSubpage` (squelette de seed — on l'adaptera en tableau de 3).
2. Écrire `src/sanity/schemas/documents/expertiseSubpage.ts` (document **non singleton** ; groupes
   `hero`/`intro`/`responsable`/`engagements`/`caseStudy`/`seo` ; champ `slug` source `title` ;
   objet `engagement` `{title}` requis + `preview` ; `responsableImages` array ; `caseStudyMeta`
   array de strings — cf. `data-model.md` + `contracts/content-model.md`). Réutiliser `imageField`.
3. Enregistrer dans `src/sanity/schemas/index.ts` (`schemaTypes`).
4. `src/sanity/structure.ts` : **NE PAS** ajouter à `SINGLETONS` (multi-instances). Ajouter un
   `S.listItem()` « Sous-pages d'expertise » listant `S.documentTypeList("expertiseSubpage")`.
5. `npm run typegen` → régénère `src/sanity.types.ts` (commité ; type `ExpertiseSubpage`).
6. Ajouter `EXPERTISE_SUBPAGE_QUERY` (`$slug`) + `EXPERTISE_SUBPAGE_SLUGS_QUERY` dans
   `src/lib/sanity/queries.ts` (cf. `contracts/content-model.md` §3).
7. Créer `src/content/expertiseSubpages.ts` (copie maquette **indexée par slug**, source unique —
   Principe IX) + `export const EXPERTISE_SLUGS`.
8. Créer `src/lib/sanity/expertiseSubpage.ts` : `getExpertiseSubpageProps(slug)` (fetch by slug +
   defaults par slug + `mapImage`), miroir de `expertisesPage.ts`. Retourne `null` si slug
   inconnu. Dériver le lien parent du fil d'Ariane (`/expertises`).

## 3. Seeder les 3 contenus par défaut

1. Déposer les visuels par expertise dans `seed-assets/expertiseSubpages/<slug>/…` (committé, hors
   `public/`).
2. Écrire `src/sanity/seed/documents/expertiseSubpages.seed.ts` : **default-export d'un tableau de
   3** `defineSeed<ExpertiseSubpage>({ _id: "expertiseSubpage.<slug>", _type: "expertiseSubpage",
   slug: { _type: "slug", current: "<slug>" }, … })`, texte depuis `@/content/expertiseSubpages.ts`,
   images via `image(...)`, engagements `{_type:"engagement", title}`.
3. `src/sanity/seed/registry.ts` : `import expertiseSubpages from "./documents/expertiseSubpages.seed";`
   puis `seeds = [..., ...expertiseSubpages]` (spread des 3 docs).
4. `npm run seed -- expertiseSubpage --check` (dry-run : required + assets) puis
   `npm run seed -- expertiseSubpage` (projet **dev** uniquement ; la prod se seede par la CI).

## 4. Design system : réutiliser + 2 primitifs neufs + 2 extensions

- **Réutilisés** : `PageHero`, `SectionTitle`, `Pullquote`, `CaseStudyCard`, `Button`,
  `BrandText`/`OutlineText`. Ne rien dupliquer (Principe X).
- **Nouveaux primitifs** (dans `src/design-system/components/`, exportés depuis `index.ts`) :
  - **`Breadcrumb`** — `items: {label, href?}[]`, séparateur `/`, `BrandText`, `<nav aria-label>`.
  - **`EngagementsGrid`** — `items: {title}[]`, grille 3×2 (1→2→3 responsive), numéro **dérivé de
    l'ordre** (`01/`…, Montserrat Alternates), traits 3px (tokens), intitulés `<h3>`.
- **Extensions délibérées (seulement si le node le confirme — research §3)** :
  - `PageHero` : prop optionnelle `breadcrumb?: ReactNode` (slot en haut du hero).
  - `CaseStudyCard` : slot bouton optionnel + passe-plat `data-umami-*` (la carte n'est plus
    cliquable en entier — c'est le bouton qui route).
  - Toute couleur/taille = token `@theme` (bleu = `bg-estuaire`, jamais `#003787`). Aucune valeur
    en dur (Principe X).

## 5. Composer le connecteur dynamique (RSC)

`src/app/(site)/expertises/[expertise]/page.tsx` :

1. `export function generateStaticParams()` → `EXPERTISE_SLUGS.map(expertise => ({ expertise }))`.
2. `export async function generateMetadata({ params })` → lit `getExpertiseSubpageProps(slug).seo`
   (repli maquette) ; `notFound()` si `null`.
3. `default async function` : `const slug = (await params).expertise;` →
   `const props = await getExpertiseSubpageProps(slug); if (!props) notFound();`
4. `<main data-nav-*-tone=…>` (tonalité lue sur le hero au build — attendu `onDark`).
5. Sections dans l'ordre FR-002 (cf. `contracts/section-contracts.md`) : `PageHero` (+
   `Breadcrumb`) → intro → responsable → `SectionTitle` + `EngagementsGrid` → cas study
   (`SectionTitle` + `CaseStudyCard` + `Button`).
6. Visuels en `next/image` + LQIP, enveloppés de `<Parallax>` ; le bouton du cas study reçoit
   `data-umami-event="case_study_click"` + `data-umami-event-expertise={slug}`.
7. **Ne pas** rendre de bloc CTA ni de footer : le shell les monte déjà (« BIG FOOTER »).

## 6. Motion (skill `estuaire-motion`)

- Hero **statique**. Reveals au scroll (line-mask sur titres, parallaxe/clip sur visuels d'intro /
  responsable / cas study, apparition discrète des cellules d'engagements) via `<Parallax>` +
  `data-*`. Une seule motion focale à la fois ; le texte reste l'ancre.
- Vérifier `prefers-reduced-motion` : tout au repos, contenu complet (FR-013).

## 7. Vérifier

```bash
npm run lint                     # Biome
npm run typegen                  # cohérence schéma ↔ types
npm run build                    # build prod (les 3 routes pré-générées)
```

- **Pixel-review** (skill `estuaire-pixel-review`, MANDATORY) : capturer les 3 sous-pages par
  breakpoint, aligner **section par section** contre le render Figma (side-by-side + overlay +
  diff), boucler fix→recapture→re-diff jusqu'à zéro écart. L'agencement a les 3 frames ;
  mobiliers/présentoirs se vérifient en desktop (responsive dérivé — déclarer « non vérifié » tout
  écart résiduel tablette/mobile faute de frame).
- **Accessibilité** : un seul H1 par page (hero), navigation clavier de bout en bout (fil d'Ariane
  + bouton cas study), `alt` sur tous les visuels, contrastes (FR-014 / SC-005).
- **CMS** : modifier un champ / un engagement / le lien du cas study d'**une** page → vérifier la
  MAJ après revalidation **sans impact** sur les 2 autres (SC-006) ; vider un champ → repli
  maquette (SC-007).
- **Liens** : depuis `/expertises`, les 3 « en savoir plus » mènent désormais à leur sous-page
  (SC-001) ; le bouton cas study mène à la route de réalisation (404 temporaire OK — FR-007).

## Definition of Done (rappel des critères de succès)

- [ ] 3 routes servies via `[expertise]` ; les 3 « en savoir plus » de la 008 fonctionnels
      (SC-001).
- [ ] 5 sections rendues dans l'ordre + le « BIG FOOTER » du shell (FR-002), fidèles à la maquette
      sur les 3 formats (SC-004).
- [ ] Les 6 engagements numérotés `01/`…`06/`, numérotation dérivée de l'ordre (FR-006).
- [ ] Contenu éditable par page (CMS), repli maquette complet sans saisie (SC-006/SC-007) ;
      éditer une page n'affecte pas les autres (SC-006).
- [ ] Bouton cas study → réalisation (FR-007) + événement Umami `case_study_click` (Principe VI).
- [ ] `prefers-reduced-motion` honoré ; pages parcourables au clavier, 0 piège (SC-005).
- [ ] H1 unique par page + métadonnées SEO éditables par page (FR-015).
- [ ] `lint`, `typegen`, `build`, `seed -- expertiseSubpage --check` au vert.
```
