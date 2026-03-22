# Plan d'implémentation : Initialisation du projet & base de déploiement

**Branche** : `001-project-init` | **Date** : 2026-03-19 | **Spec** : [spec.md](spec.md)

## Résumé

Scaffolding complet du projet Next.js 15 + Sanity Cloud + Tailwind CSS v4 avec gestion des secrets via git-crypt. Livraison d'une page d'accueil provisoire, du Studio Sanity embarqué à `/studio`, et d'une configuration prête pour le déploiement Docker via Coolify.

## Contexte technique

**Langage** : TypeScript 5.x (strict mode)
**Framework** : Next.js 15, App Router, standalone output
**CMS** : Sanity Cloud via `next-sanity` 12.x (Studio embarqué)
**Styles** : Tailwind CSS v4 (CSS-first config, plugin PostCSS `@tailwindcss/postcss`)
**Secrets** : git-crypt (chiffrement transparent des fichiers `.env` dans git)
**Linting + Formatting** : Biome (`biome.json`) avec domaines `next` et `react` activés
**Type de projet** : Application web (site vitrine)
**Plateforme cible** : VPS OVH Ubuntu, Docker via Coolify
**Contraintes de performance** : Lighthouse 90+, chargement < 3s
**Échelle** : Site vitrine mono-utilisateur, trafic faible à modéré

## Vérification de conformité constitutionnelle

| Principe | Statut | Justification |
|----------|--------|---------------|
| I. Server-First Rendering | ✅ Conforme | Page d'accueil en RSC, `output: 'standalone'`, pas de JS client sur la homepage |
| II. CMS as Single Content Source | ✅ Conforme | Studio embarqué à `/studio`, schémas TypeScript colocalisés. Le message "bientôt disponible" est un placeholder statique acceptable pour l'initialisation |
| III. Feature-Based Architecture | ✅ Conforme | Routes dans `app/(site)/`, code partagé dans `lib/`, schémas dans `sanity/` |
| IV. Simplicity Over Abstraction | ✅ Conforme | Dépendances minimales, pas de state management, pas d'abstraction prématurée |
| V. Bilingual Convention | ✅ Conforme | Docs en français, code/commits/branches en anglais |

Aucune violation — pas besoin de suivi de complexité.

## Structure du projet

### Documentation (cette feature)

```text
specs/001-project-init/
├── spec.md
├── plan.md              # Ce fichier
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── revalidation-webhook.md
└── checklists/
    └── requirements.md
```

### Code source (racine du dépôt)

```text
src/
├── app/
│   ├── globals.css              # Tailwind v4 : @import "tailwindcss" + @theme
│   ├── layout.tsx               # Layout racine (metadata, fonts, import CSS)
│   ├── not-found.tsx            # Page 404 stylisée
│   ├── (site)/
│   │   └── page.tsx             # Page d'accueil provisoire
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx         # Sanity Studio embarqué
│   └── api/
│       └── revalidate/
│           └── route.ts         # Squelette webhook revalidation
├── lib/
│   └── sanity/
│       ├── client.ts            # Configuration client Sanity
│       ├── sanity-fetch.ts      # Wrapper fetch avec ISR tags
│       └── queries.ts           # Requêtes GROQ (vide pour l'instant)
└── sanity/
    └── schemas/
        └── index.ts             # Export des schémas (vide pour l'instant)

Dockerfile                       # Multi-stage build (install → build → run)
sanity.config.ts                 # Config Sanity Studio (racine, 'use client')
next.config.ts                   # Config Next.js (standalone output)
postcss.config.mjs               # Plugin @tailwindcss/postcss
biome.json                       # Biome lint + format (domaines next, react)
tsconfig.json                    # TypeScript strict, path alias @/
package.json                     # Dépendances + scripts npm
.env.development                 # Variables dev (clair sur disque, chiffré dans git via git-crypt)
.env.example               # Documentation des variables attendues
.gitattributes                   # Déclaration des fichiers chiffrés par git-crypt
```

**Décision de structure** : Structure conforme au Principe III (feature-based). La route `(site)` regroupe les pages publiques. Le Studio vit hors du groupe `(site)` pour avoir son propre layout. `lib/sanity/` est partagé entre toutes les routes.

## Artifacts générés

| Artifact | Chemin | Statut |
|----------|--------|--------|
| Recherche | [research.md](research.md) | ✅ Complet |
| Modèle de données | [data-model.md](data-model.md) | ✅ Complet |
| Contrat webhook | [contracts/revalidation-webhook.md](contracts/revalidation-webhook.md) | ✅ Complet |
| Quickstart | [quickstart.md](quickstart.md) | ✅ Complet |

## Prochaine étape

Exécuter `/speckit.tasks` pour générer la liste des tâches d'implémentation à partir de ce plan.
