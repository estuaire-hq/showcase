# Spécification : Initialisation du projet & base de déploiement

**Branche**: `001-project-init`
**Créée le**: 2026-03-18
**Statut**: Draft
**Contexte**: Initialisation du projet Next.js + Sanity avec le minimum viable pour valider le pipeline de déploiement Coolify et poser les fondations pour les features suivantes.

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Le visiteur voit une page d'accueil provisoire (Priorité : P1)

Un visiteur accède à l'URL du site Estuaire et voit une page provisoire stylisée confirmant que le site est en ligne. La page affiche le nom de la marque Estuaire et un bref message "bientôt disponible". Ce scénario valide l'ensemble du pipeline de déploiement, du code jusqu'à la production.

**Pourquoi cette priorité** : Sans pipeline de déploiement fonctionnel, aucune autre feature ne peut être livrée. Ce scénario prouve que toute la chaîne fonctionne de bout en bout : le code compile, l'image Docker est créée, Coolify le déploie, le domaine résout, et le visiteur voit du contenu.

**Test indépendant** : Vérifiable en visitant l'URL de production dans un navigateur et en confirmant que la page se charge avec le contenu attendu, les bonnes balises meta, et sans erreurs.

**Scénarios d'acceptation** :

1. **Étant donné** que le site est déployé, **Quand** un visiteur accède à l'URL racine, **Alors** il voit une page provisoire stylisée avec le nom Estuaire
2. **Étant donné** que le site est déployé, **Quand** un visiteur consulte le code source ou les en-têtes HTTP, **Alors** la page est rendue côté serveur (pas une coquille côté client)
3. **Étant donné** que le site est déployé, **Quand** un robot d'indexation visite l'URL racine, **Alors** il reçoit du HTML valide avec un titre et une description meta

---

### Scénario 2 - L'éditeur de contenu accède à Sanity Studio (Priorité : P2)

Un éditeur de contenu accède au chemin `/studio` du site et voit l'interface Sanity Studio embarquée. Il peut se connecter avec ses identifiants Sanity et voir le tableau de bord du Studio. Ce scénario valide que l'intégration CMS fonctionne et que les éditeurs ont un espace pour gérer le contenu quand les futures features le nécessiteront.

**Pourquoi cette priorité** : Le CMS est la source unique de contenu (Principe constitutionnel II). Avoir un Studio fonctionnel tôt permet aux éditeurs de se familiariser avec l'outil et de préparer du contenu en parallèle du développement des pages qui l'afficheront.

**Test indépendant** : Vérifiable en naviguant vers `/studio`, en se connectant, et en confirmant que le tableau de bord du Studio se charge sans erreurs.

**Scénarios d'acceptation** :

1. **Étant donné** qu'un utilisateur navigue vers `/studio`, **Quand** la page se charge, **Alors** l'interface Sanity Studio s'affiche
2. **Étant donné** qu'un utilisateur est sur la page de connexion du Studio, **Quand** il s'authentifie avec des identifiants Sanity valides, **Alors** il voit le tableau de bord du Studio
3. **Étant donné** qu'un éditeur est connecté au Studio, **Quand** il regarde la navigation, **Alors** il voit un espace de travail vide et prêt pour les futurs types de contenu

---

### Scénario 3 - Le développeur lance le projet en local (Priorité : P1)

Un développeur clone le dépôt et lance le serveur de développement local. Les variables d'environnement sensibles sont chiffrées dans git via git-crypt : le fichier `.env.development` est en clair sur le disque local mais chiffré de manière transparente dans le dépôt. Le développeur n'a qu'à déverrouiller le dépôt une seule fois avec la clé symétrique pour accéder à toutes les variables. Il voit la même page provisoire qu'en production. L'environnement de développement est pleinement fonctionnel avec le rechargement à chaud, la vérification TypeScript et le linting.

**Pourquoi cette priorité** : Au même niveau que le scénario 1 car l'expérience développeur est fondatrice. Sans environnement local fonctionnel, aucune feature ne peut être développée. Ce scénario valide le scaffolding du projet, les dépendances et la configuration. L'utilisation de git-crypt garantit que le setup local est quasi-instantané — un seul `git-crypt unlock` et c'est prêt.

**Test indépendant** : Vérifiable en clonant le dépôt, en déverrouillant via `git-crypt unlock`, en exécutant `npm install` puis `npm run dev`, et en confirmant que le serveur démarre et que la page se charge sur `localhost:3000`.

**Scénarios d'acceptation** :

1. **Étant donné** qu'un développeur a cloné le dépôt et déverrouillé git-crypt, **Quand** il exécute `npm install && npm run dev`, **Alors** le serveur de développement démarre sans erreurs avec les variables d'environnement disponibles en clair localement
2. **Étant donné** que le serveur tourne, **Quand** un développeur modifie un composant, **Alors** la page se recharge automatiquement pour refléter le changement
3. **Étant donné** que le serveur tourne, **Quand** un développeur exécute `npm run build`, **Alors** le build de production se termine sans erreurs
4. **Étant donné** que le projet est configuré, **Quand** un développeur exécute `npm run lint`, **Alors** le linter s'exécute et ne signale aucune erreur sur le code initial
5. **Étant donné** qu'un développeur a cloné le dépôt **sans** déverrouiller git-crypt, **Quand** il ouvre `.env.development`, **Alors** le fichier est illisible (contenu binaire chiffré) et un message dans le README indique la marche à suivre

### Cas limites

- Que se passe-t-il quand des variables d'environnement requises sont manquantes ? L'application doit échouer rapidement au moment du build avec un message clair indiquant quelles variables manquent.
- Que se passe-t-il quand git-crypt n'a pas été déverrouillé ? Le fichier `.env.development` est du binaire illisible. Next.js ne peut pas le parser et échoue au démarrage. Le README doit documenter la procédure `git-crypt unlock`.
- Que se passe-t-il quand un visiteur accède à une route inexistante ? L'application doit afficher une page 404 stylisée, cohérente avec l'identité visuelle du site.
- Que se passe-t-il quand l'identifiant du projet Sanity ou le dataset est mal configuré ? La route Studio doit afficher une erreur compréhensible plutôt qu'une page blanche.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : Le site DOIT afficher une page d'accueil provisoire à l'URL racine (`/`) avec le nom de la marque Estuaire et un bref message "bientôt disponible"
- **FR-002** : La page d'accueil DOIT être rendue côté serveur par défaut, sans JavaScript côté client requis pour l'affichage initial
- **FR-003** : Le site DOIT inclure des métadonnées HTML correctes (titre, description, balises Open Graph) pour la page d'accueil
- **FR-004** : Le site DOIT servir un Sanity Studio embarqué au chemin `/studio`
- **FR-005** : Les variables d'environnement sensibles (tokens, secrets) DOIVENT être chiffrées dans git via git-crypt — le fichier `.env.development` est en clair localement et chiffré de manière transparente dans le dépôt
- **FR-005b** : Les variables non sensibles (project IDs publics, dataset names) DOIVENT être documentées dans un fichier `.env.example` avec des commentaires explicatifs
- **FR-005c** : Le projet DOIT fonctionner en local avec une seule étape de configuration de secret (`git-crypt unlock` avec la clé symétrique)
- **FR-005d** : L'agent IA (Claude Code) NE DOIT PAS pouvoir lire les fichiers `.env*` — des règles `permissions.deny` DOIVENT être configurées dans `.claude/settings.json`
- **FR-006** : Le projet DOIT compiler avec succès en sortie standalone compatible Docker pour le déploiement via Coolify
- **FR-006b** : Le projet DOIT inclure un Dockerfile multi-stage (install → build → run) pour un contrôle explicite du build de production
- **FR-007** : Le site DOIT afficher une page 404 stylisée pour les routes inexistantes
- **FR-008** : Le projet DOIT passer la vérification TypeScript en mode strict et la validation Biome (lint + format) avec zéro erreurs
- **FR-009** : Le site DOIT utiliser Tailwind CSS pour tout le style, sans fichier CSS personnalisé
- **FR-010** : La structure du projet DOIT suivre l'architecture par fonctionnalité définie dans la constitution (routes dans `app/(site)/`, code partagé dans `lib/`)

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Un visiteur peut charger la page d'accueil en moins de 3 secondes sur une connexion standard
- **SC-002** : Le build de production se termine sans erreurs et génère une sortie standalone
- **SC-003** : Un éditeur de contenu peut accéder et se connecter à Sanity Studio depuis `/studio` en une seule étape depuis l'URL du site
- **SC-004** : Un nouveau développeur peut passer du `git clone` à un serveur local fonctionnel en moins de 5 minutes en suivant la documentation
- **SC-005** : Le site obtient un score de 90+ aux audits Lighthouse performance et SEO sur la page d'accueil provisoire
- **SC-006** : Le pipeline de déploiement (git push → site en ligne) se termine avec succès dès la première tentative

## Hypothèses

- Le projet Sanity Cloud existe déjà et les identifiants (project ID, dataset) sont disponibles
- L'instance Coolify sur le VPS OVH est déjà configurée et prête à recevoir des déploiements via git push
- Le domaine (estuaire.fr ou équivalent) est déjà configuré dans le DNS Cloudflare pointant vers le VPS
- Les identifiants SMTP Microsoft 365 ne sont pas nécessaires pour cette initialisation (le formulaire de contact viendra plus tard)
- L'intégration Umami analytics ne fait pas partie de cette initialisation (ce sera une feature séparée)
- Le choix de la bibliothèque d'animation (GSAP vs Framer Motion) est reporté à une future feature qui nécessitera réellement des animations
