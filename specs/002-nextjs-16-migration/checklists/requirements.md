# Specification Quality Checklist: Migration Next.js v15 → v16 + Sanity v4 → v5 (latest stable)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-06-11
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- **Cas particulier « migration technique »** : le sujet *est* une mise à niveau de
  framework + CMS, donc nommer « Next.js 15/16 », « Sanity v4/v5 », « Turbopack »,
  « middleware/proxy », « revalidateTag », « `@sanity/client` v7 » relève de la définition
  de l'objet, pas d'une fuite de détail d'implémentation. Les *exigences* et *critères de
  succès* restent formulés en termes de résultats observables (parité visuelle, gate
  fonctionnel, Studio éditable, contenu intact, contenu revalidé, CI verte, image Docker
  qui démarre).
- **Périmètre élargi (décision actée le 2026-06-11)** : la spec couvre désormais
  **Next 16 + Sanity v4 → v5** en un seul lot. Justification : React 19.2 est le prérequis
  partagé (Next 16 l'impose, Sanity v5 le requiert), ce qui rend la montée Sanity v5
  peu coûteuse et cohérente avec la migration. **Sanity v6 reste exclu** (pré-version non
  stable). Les fonctionnalités optionnelles v16 (Cache Components, React Compiler, View
  Transitions) restent différées.
- **Point de vigilance technique principal** à creuser au plan : le bump transitif
  `@sanity/client` v6 → v7 (changement de stratégie cache/live sur `useCdn` + token),
  à valider avec `defineLive`, la revalidation par webhook et le draft mode / Visual Editing.
- Prochaine étape recommandée : `/speckit.plan` (la décision technique mérite aussi un ADR
  dans `docs/vault/decisions/`, cf. FR-018).
