# 0022 — Un défaut de netteté invisible à la revue pixel (et un `naturalWidth` qui ment)

**Date** : 2026-07-31 · **Branche** : `banner-links-unify` · **Origine** : revue client / ADR 0021 D9

> Numéro 0022 : suite de 0021. Des worktrees parallèles non mergés peuvent avoir pris le même
> numéro. Réconcilier / renuméroter au merge, skill `estuaire-branch-sync`.

## Ce qui s'est passé

Le client demande d'homogénéiser les bandeaux-liens et de remplacer le survol flou + zoom, en
redoutant que le zoom fasse « dépasser le 1920 » et dégrade l'image. En mesurant l'existant pour
répondre, on découvre un défaut **sans rapport avec le survol** :

`CaseStudyCard` — les bandes « Dernières réalisations » et le bandeau des sous-pages expertise —
annonçait `sizes="(min-width: 1280px) 1200px, 100vw"` pour une boîte de **1640 px**, sans
`oversampled()`, plus un `scale-105` statique. Résultat mesuré à 1920 px, DPR 1 : **1200 px demandés
au CDN pour 1722 px peints, soit 1,44× d'agrandissement en permanence, au repos**. Le composant
était mou depuis sa construction (PR #18, 2026-06-21), sur deux pages, pendant six semaines.

Il est passé à travers : la revue pixel-perfect desktop de la feature, la revue multi-résolution
(ADR 0022), la revue visuelle client de 2026-06 — qui a pourtant porté sur ce composant précis (« le
flou de survol est trop fort ») — et le travail sur la netteté des images (ADR 0027), qui a instauré
le suréchantillonnage sans l'appliquer ici.

## Cause racine

**La revue pixel compare des géométries, pas des densités de pixels.** Ses deux régimes mesurent la
position, la taille et la proportion (régime A) ou l'absence de débordement / d'illisibilité (régime
B). Un `<img>` correctement placé, correctement dimensionné, qui se contente d'être servi en 1200 px
dans une boîte de 1722, **passe les deux régimes**. Le diff pixel ne l'attrape pas non plus : la
maquette Figma est elle-même un rendu compressé, donc le flou différentiel se noie.

Autrement dit : ADR 0027 a défini la bonne politique de livraison, mais **rien ne la vérifie**. Le
suréchantillonnage est un opt-in par composant (`oversampled(src)`), donc oublier de l'appeler est
silencieux — et un `sizes` faux est encore plus silencieux, puisqu'il ne casse rien de visible.

## Le piège de mesure : `naturalWidth` sous-déclare

En vérifiant le correctif, la sonde a renvoyé `askedW: 3840` mais `naturalWidth: 2880`, et
`askedW: 1909` pour `naturalWidth: 954` — de quoi conclure que le CDN plafonnait et que le correctif
ne servait à rien. C'est faux : **Chromium décode les grandes images à taille réduite pour
économiser la mémoire**, et `naturalWidth` reflète ce décodage, pas la livraison.

Le test décisif : décoder la **même URL** dans un `new Image()` isolé, hors layout et hors filtre.

```js
const probe = await new Promise((res) => {
  const p = new Image();
  p.onload = () => res({ w: p.naturalWidth, h: p.naturalHeight });
  p.src = img.currentSrc;   // l'URL EXACTE que la page a demandée
});
```

Résultat : 1909×1536 et 3840×2560 — la pleine livraison. La leçon générale : **un `naturalWidth` lu
sur une image en page n'est pas un oracle de livraison**. Croire le premier chiffre aurait fait
annuler un correctif juste, exactement le type d'erreur du post-mortem 0021 en miroir.

## Ce qu'on change

1. **La revue pixel gagne un contrôle de netteté.** La sonde de `estuaire-pixel-review` doit
   rapporter, pour chaque `<img>` significatif et à chaque largeur : largeur demandée au CDN
   (`?w=`), largeur réellement peinte (`getBoundingClientRect().width`, qui inclut `scale`), et le
   ratio. Un ratio **peint / demandé > 1** est un défaut objectif, au même titre que `h-overflow`.
   C'est la seule façon d'empêcher la récidive : le défaut est arithmétique, donc détectable
   mécaniquement.
2. **Ne jamais lire la livraison sur `naturalWidth`** d'une image en page — décoder l'URL à part
   (extrait ci-dessus). À ajouter aux notes de la skill.
3. **Le suréchantillonnage cesse d'être un opt-in dispersé** : les bandeaux passent tous par
   `BandMedia`, qui appelle `oversampled()` et fixe `sizes` une fois. Un composant partagé est plus
   sûr qu'une convention à répéter.

## Ce qui n'était PAS la cause

Le zoom que redoutait le client. Mesuré, le `group-hover:scale-105` de la home coûtait **rien** :
3840 px livrés pour 2016 px peints au pic, soit 1,9× de marge. Le retirer était justifié
esthétiquement, pas pour la netteté. À l'inverse, la mollesse d'univers et d'expertises vient de
**sources trop petites** — 531 à 593 px placés dans des slots de 1920 px, dans le Figma lui-même,
donc reprises telles quelles par `seed-assets/` et par la prod via le seed CI. Aucun changement de
code ne la corrige.

**Corollaire de méthode** : le symptôme rapporté (« le zoom dégrade l'image ») pointait vers la
bonne famille de problème mais la mauvaise cause. Mesurer avant de croire la formulation du client
a fait trouver deux vrais défauts et écarté celui qu'il désignait — la discipline du post-mortem
0021 (« confirmer le symptôme »), appliquée à l'endroit où elle paie.
