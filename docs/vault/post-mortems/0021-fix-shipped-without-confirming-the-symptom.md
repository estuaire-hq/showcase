# 0021 — Un correctif livré sans avoir confirmé qu'il adressait le symptôme

**Date** : 2026-07-31 · **Branche** : `hero-image-sharpness` · **Origine** : PR #38 / ADR 0027

> Numéro 0021 : suite de 0020. Des worktrees parallèles non mergés peuvent avoir pris le même
> numéro. Réconcilier / renuméroter au merge, skill `estuaire-branch-sync`.

## Ce qui s'est passé

Le client signale un hero « de mauvaise qualité » sur `/nous-decouvrir`. L'investigation (PR #38)
trouve un **vrai** défaut du chemin de livraison : les URLs Sanity étaient plafonnées à 1920 puis
re-proxyées par `/_next/image`, donc doublement compressées et bornées. Le correctif — le CDN Sanity
devient l'optimiseur via un loader custom — est juste, documenté (ADR 0027) et mergé.

**Le client rouvre le sujet : le hero est toujours mou.** Le défaut trouvé était réel, mais ce
n'était pas *celui-là* qui produisait le symptôme rapporté. La cause dominante était le
**rééchantillonneur du CDN Sanity**, ~25 % plus mou qu'un Lanczos3 à largeur, codec et budget
d'octets identiques — invisible pour l'analyse de #38, qui n'a jamais comparé la sortie du CDN à une
référence.

## Cause racine (de la méthode, pas du code)

**Un défaut trouvé a été pris pour LA cause, sans boucler sur le symptôme.** La chaîne d'inférence
était : « le pipeline est cassé » → « le pipeline cassé explique un flou » → « donc le flou est
expliqué ». Le maillon manquant est le dernier : personne n'a mesuré le flou **avant** et **après**
sur la chose que le client regarde. Deux facteurs aggravants :

- **Pas de référence.** On a vérifié que la livraison était *cohérente* (bonne largeur, bon candidat,
  une seule passe) sans jamais demander : « à quel point cette image *pourrait-elle* être nette ? ».
  Sans plafond de comparaison, une image à 65 % du possible passe pour correcte.
- **Une observation lue trop vite.** Un crop 1:1 de la source a été jugé « authentiquement net »,
  et cela a servi à écarter la piste image. C'était vrai mais hors sujet : la netteté de la source
  ne dit rien de la netteté de la **réduction** qui en est servie.

## Ce qui aurait dû être fait

Fermer la boucle sur le symptôme : **mesurer la chose rapportée, avec une référence, avant et après.**
Ici cela tenait en une comparaison — sortie CDN à `w=1920` vs Lanczos3 local à `w=1920`, même codec,
même qualité. Trois minutes de mesure auraient donné 69,6 % vs 93,2 % et pointé le rééchantillonneur
dès #38.

## Règles à retenir

1. **Un défaut trouvé n'est pas une cause prouvée.** Tant que le symptôme n'a pas été *reproduit puis
   supprimé* par une mesure, on a un défaut de plus, pas un diagnostic. Formuler explicitement :
   « voici la mesure du symptôme avant / après ».
2. **Toujours se donner un plafond.** Pour une question de qualité (netteté, poids, latence),
   construire la meilleure version atteignable localement et s'y comparer. « Conforme » n'est pas
   « bon » : il faut connaître l'écart au possible.
3. **Mesurer la sortie, pas l'intention.** Vérifier l'URL / le paramètre demandé prouve ce qu'on a
   *demandé*, pas ce qui est *livré*. Ici : `sharpen=10…100` renvoyait une sortie identique à l'octet
   (paramètre ignoré) et un `q` inchangé pouvait basculer AVIF↔WebP selon la chaleur du cache. Décoder
   et mesurer les pixels reçus.
4. **Sur un symptôme visuel, mesurer les pixels peints, pas le fichier.** Le juge de paix est une
   capture `scale: device` de la vraie page, aux viewports **et DPR** réels : ce défaut est invisible
   en DPR 2 (le navigateur y refait la réduction) et ne se voit qu'en DPR 1 grand écran.
5. **Un rapport client vague couvre souvent plusieurs causes.** « Les images sont de mauvaise
   qualité » a recouvert ici deux défauts sans rapport : la mollesse du CDN sur `/nous-decouvrir`, et
   des sources de 551 px sur `/univers`. Diagnostiquer **par surface**, ne pas généraliser la première
   cause trouvée — ni supposer, comme l'ADR 0027 l'a fait pour les bandes univers, que des assets
   trop petits viennent du client alors qu'ils venaient de nos propres `seed-assets/`.
