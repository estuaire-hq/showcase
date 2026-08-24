# 0030. Revue de sécurité récurrente : périmètre, articulation avec le built-in, gate humain

**Statut** : accepté · **Date** : 2026-08-01 · **Branche** : `security-review-skill`

> Numéro 0030 : dernier numéro pris sur `origin/main` = 0029 (`navbar-tone-measured-from-content`).
> Des worktrees parallèles peuvent avoir pris 0030 de leur côté, à réconcilier au merge avec la
> skill `estuaire-branch-sync`.

## Contexte

Le site est en production. Il n'y avait jusqu'ici aucune revue de sécurité, ni ponctuelle ni
récurrente, et aucune trace des arbitrages qui auraient pu être faits. Deux manques distincts :

1. **Pas d'état des lieux.** `npm audit` renvoie 25 paquets vulnérables, chiffre inexploitable tel
   quel : il ne distingue pas ce qu'un visiteur peut atteindre de ce qui ne tourne que dans le CLI
   Sanity en local. Sans qualification, le réflexe est soit de tout ignorer, soit de lancer
   `npm audit fix --force` et de casser le Studio.
2. **Pas de mémoire.** Un item écarté à raison (une CVE critique dans une dépendance d'outillage,
   par exemple) revient identique au passage suivant, et l'arbitrage est refait à chaque fois, ou
   pire, oublié et traité par défaut.

Claude Code fournit un `/security-review` intégré, mais il ne couvre pas le besoin, pour deux
raisons établies en lisant son prompt :

- son périmètre est **câblé en dur** sur `git diff origin/HEAD...`, sans paramètre de portée. C'est
  un outil de diff, pas d'état des lieux ;
- ses **exclusions dures** écartent explicitement les « vulnérabilités liées à des bibliothèques
  tierces obsolètes », « l'absence de mesures de durcissement », le « DoS / rate limiting /
  épuisement de ressources » et les « secrets stockés sur disque ». Sur ce projet, ces quatre
  catégories sont précisément là où se trouve le risque réel.

## Décisions

### 1. Une skill projet, deux modes, une seule grille

`estuaire-security-review` produit l'état des lieux. Le mode `socle` (défaut) audite le code
existant, le mode `diff` revoit une branche avant PR. La grille de contrôle est **unique** : le mode
décide seulement quelles lignes sont en périmètre et si le built-in tourne. Deux grilles séparées
divergeraient en quelques mois.

### 2. Le built-in est utilisé à son périmètre naturel, pas tordu

En mode `diff`, `/security-review` est lancé et possède le diff, où il est bon (vulnérabilités
concrètement exploitables, faible taux de faux positifs). En mode `socle`, il n'est pas lancé du
tout : même en réussissant à le pointer sur tout le dépôt, ses exclusions lui interdiraient de
rapporter l'essentiel de ce qu'on cherche. Le recouvrement est quasi nul et se limite à une ligne
(la validation des entrées du formulaire de contact), attribuée au built-in en mode `diff`.

### 3. Le cran d'atteignabilité comme unité de décision des dépendances

Une vulnérabilité est classée par ce qu'une requête peut atteindre, pas par son score CVSS :
navigateur (1), runtime serveur (2), `/studio` seulement (3), outillage CLI et build (4). Le
discriminant est nécessaire ici parce que `sanity` est en `dependencies` (Studio embarqué) et traîne
tout son CLI dans l'arbre de production : « est-ce une dépendance de prod ? » ne répond à rien.
Au premier passage, ce classement sort **19 des 25 paquets** de tout chemin de requête.

Le cran est dérivé du graphe de dépendances installé, pas d'une trace d'exécution : signal fort, pas
preuve. Le build CI et `.next/standalone` restent l'escalade quand un cas est ambigu.

### 4. Périmètre dépendances : CVE, santé, retard. **Supply-chain exclue**

Les scripts postinstall, la provenance de publication et le typosquat sont **volontairement hors
périmètre**. Motif : sur un site vitrine dont les dépendances directes sont peu nombreuses et
mainstream, le coût d'outillage et de faux positifs dépasse le bénéfice attendu. L'exclusion est
écrite dans la skill et dans chaque rapport, pour qu'elle reste un choix visible et révisable plutôt
qu'un oubli. La rouvrir demande de modifier cette ADR.

### 5. Le gate humain est le point non négociable

La skill s'arrête après la présentation. Elle ne corrige rien, ne bumpe rien, ne lance jamais
`npm audit fix` de sa propre initiative. Chaque finding est présenté de façon décidable : ce qui est
en cause, la portée réelle (exploitable comment, par qui), le coût du correctif, le risque de ne rien
faire. La priorisation P1/P2/P3 découle de la portée, pas de la sévérité annoncée : une CRITICAL
inatteignable est un P3, et le dire est le travail.

### 6. Deux artefacts dans `docs/vault/security/`

- `YYYY-MM-DD-audit.md` : la photo de ce qui a été observé ce jour-là, y compris **ce qui a été
  vérifié sans finding**, sans quoi le passage suivant ne peut pas distinguer une absence d'un oubli.
- `ledger.md` : la mémoire, une ligne par identifiant stable, lue **avant** toute présentation. Elle
  porte le statut, le motif d'un refus, et l'**état observé** au moment de la décision. C'est cette
  dernière colonne qui permet de rouvrir un item refusé quand son nombre d'avis, sa sévérité ou son
  cran a bougé, et seulement dans ce cas.

Un seul fichier vivant aurait suffi à la traçabilité brute via l'historique git, mais aurait perdu
le narratif d'un passage (les comptes, les versions, les vérifications propres du jour).

## Conséquences

- La revue devient un geste répétable et comparable. Le premier passage
  ([[2026-08-01-audit]]) sort 3 items en P1, 4 en P2, le reste en informationnel, à partir des 25
  vulnérabilités brutes.
- Le registre crée une obligation : refuser un item impose d'écrire pourquoi. C'est le prix de ne
  pas re-arbitrer indéfiniment.
- La table `CRAN` de `references/deps.sh` doit être mise à jour à chaque nouvelle dépendance
  directe. Une dépendance non mappée bascule en cran 2 avec une mention « confirmer à la main »,
  donc l'oubli échoue bruyamment plutôt que d'être optimiste en silence.
- Un axe reste sans réponse par construction locale : la configuration Cloudflare (rate-limiting,
  WAF). Elle conditionne la portée réelle de l'abus du formulaire de contact et demande un accès que
  la skill n'a pas. Elle est tracée comme NON VÉRIFIÉE plutôt que supposée dans un sens ou l'autre.

## Références

- Skill : `.claude/skills/estuaire-security-review/` (`SKILL.md`, `references/grid.md`,
  `references/deps.sh`).
- Premier état des lieux : [[2026-08-01-audit]], registre : [[ledger]].
- Contexte connexe : [[decisions/0019-dynamic-content-in-sanity-and-mcp-write-access]] (tokens dev
  et prod), [[decisions/0026-sanity-cache-revalidation-and-isr-quota-model]] (webhook de
  revalidation), [[decisions/0023-contact-email-sending-ovh-emailpro]] (chaîne d'envoi du
  formulaire).
