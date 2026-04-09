# Modèle de données : Initialisation du projet

**Branche** : `001-project-init` | **Date** : 2026-03-22

## Entités

Aucune entité métier n'est définie dans cette feature d'initialisation. Le Studio Sanity sera livré vide, prêt à accueillir les schémas des futures features.

## Variables d'environnement

Le modèle de données de cette feature se résume aux variables de configuration :

### Variables publiques (inlinées dans le bundle client)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Identifiant du projet Sanity Cloud | `abc123de` |
| `NEXT_PUBLIC_SANITY_DATASET` | Nom du dataset Sanity | `production` |
| `NEXT_PUBLIC_SITE_URL` | URL canonique du site | `https://estuaire.fr` |

### Variables serveur (jamais exposées au client)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `SANITY_API_TOKEN` | Token API Sanity (lecture serveur) | `sk...` |
| `REVALIDATION_SECRET` | Secret partagé avec le webhook Sanity | `whsec_...` |

### Mapping des environnements

| Environnement | Projet Sanity | Source des variables | Mécanisme |
|---------------|---------------|---------------------|-----------|
| Local (dev) | `showcase-dev` | `.env.development` (clair sur disque, chiffré dans git) | git-crypt déchiffre automatiquement via filtres smudge/clean |
| Production | `showcase` | UI Coolify | Variables injectées dans le conteneur Docker |

### Protection des secrets

| Couche | Mécanisme | Ce qu'elle protège |
|--------|-----------|-------------------|
| git-crypt | Chiffrement transparent dans git | Secrets illisibles dans le dépôt distant |
| `permissions.deny` | Règles Claude Code dans `.claude/settings.json` | Agent IA ne peut pas lire `.env*` |
| Coolify UI | Variables de prod hors du dépôt | Secrets de prod jamais sur un poste de dev |
