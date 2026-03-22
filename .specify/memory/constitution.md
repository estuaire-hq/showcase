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

## Technical Stack & Constraints

### Stack applicative

| Couche | Technologie | Version / Détail |
|---|---|---|
| Framework | Next.js | 15 (App Router, TypeScript, standalone output) |
| CMS | Sanity Cloud | Plan gratuit, Studio embarqué |
| Styles | Tailwind CSS | v4 |
| Animations | GSAP ou Framer Motion | TODO(ANIMATION_LIB): à confirmer |
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
- Toutes les variables sont préfixées par domaine :
  `NEXT_PUBLIC_SANITY_*`, `SMTP_*`, `NEXT_PUBLIC_UMAMI_*`, etc.
- Pas de `.env` par sous-projet ou par service.
- Un `.env.example` documente toutes les variables attendues.

## Development Workflow

### Conventions de code

- **TypeScript strict** : pas de `any` sauf cas documenté.
- **Server Components par défaut** : `"use client"` justifié au cas par cas.
- **Schemas Sanity en TypeScript** : types dérivés des schémas.
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

**Version**: 1.1.0 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-03-22
