# Quickstart — Page contact

Comment lancer, seeder et vérifier la page contact en développement.

## Prérequis

- Worktree `013-contact-page` (portless wiring committé).
- Dépendances installées : `npm ci` (ajoute `nodemailer`, `react-leaflet`, `leaflet` + types
  une fois le `package.json` mis à jour par l'implémentation).

## 1. Lancer le serveur de dev

```bash
npm run dev
# → http://013-contact-page.estuaire.localhost:1355/contact
# (escape hatch sans portless : PORTLESS=0 npm run dev → http://localhost:3000/contact)
```

Le gate Coming-Soon est **OFF** dans les serveurs de dev de worktree → l'URL nommée sert le
vrai site directement.

## 2. Régénérer les types après le schéma

```bash
npm run typegen      # sanity schema extract && sanity typegen generate
# → met à jour src/sanity.types.ts (type ContactPage + CONTACT_PAGE_QUERYResult)
```

## 3. Seeder le contenu (dev)

```bash
npm run seed:check -- contactPage   # dry-run (offline) : valide required + assets présents
npm run seed -- contactPage         # createIfNotExists sur le projet Sanity DEV
# (--reset pour réinitialiser à la maquette ; NE PAS --reset si un autre worktree travaille)
```

> L'asset du visuel formulaire vit dans `seed-assets/contact/` (committé, hors `public/`).

## 4. Tester l'envoi du formulaire

- **Sans secrets SMTP** (cas worktree par défaut) : `SMTP_HOST` absent → Nodemailer utilise
  `jsonTransport`, le message est **loggé** au lieu d'être envoyé. Le parcours succès est donc
  testable de bout en bout.
  ```bash
  tail -f "$(wt config state logs get --hook=user:post-start:server)"
  # remplir le formulaire + envoyer → voir le JSON du message dans les logs
  ```
- **Avec SMTP réel** : poser `SMTP_HOST/PORT/USER/PASS/FROM` + `CONTACT_TO` dans
  `.env.development` (git-crypt, par Pierre) ; M365 exige le **SMTP AUTH activé** sur la boîte.

### Curl rapide

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -F 'name=Jean Dupont' -F 'email=jean@example.com' \
  -F 'message=Bonjour, je souhaite un devis.' -F 'requestType=Demande de devis' \
  -F 'website=' -F "_ts=$(($(date +%s%3N)-5000))"
# → 200 {"ok":true}
```

## 5. Vérifier (gates de qualité)

```bash
npm run lint         # Biome (lint + format)
npm run typegen      # types à jour, pas de drift
npm run seed:check   # seed valide
```

- **Pixel-perfect** : charger la skill `estuaire-pixel-review` → capturer `/contact` par
  breakpoint, aligner section par section contre le render Figma `.design/figma-cache/assets/
  51-4548.png` (hero, formulaire+visuel, coordonnées+carte, footer). Boucler jusqu'à zéro écart.
- **Accessibilité** : navigation clavier (tab order logique), labels associés, erreurs
  annoncées (`role="alert"`, `aria-invalid`/`aria-describedby`), `prefers-reduced-motion`.
- **Carte** : zoom/déplacement OK, marqueur sur Machecoul ; couper le JS → l'adresse texte
  reste lisible (repli FR-018).

## 6. Scénarios d'acceptation à rejouer (spec §User Stories)

1. Envoi valide → confirmation + reset (US1 / FR-010).
2. Email invalide / champ requis vide → erreurs ciblées, saisie conservée (US1 / FR-002, FR-006).
3. Type de demande + pièce jointe conforme → reçus avec le message (US1 / FR-008/009).
4. SMTP indisponible (couper le transport) → message d'erreur + email direct visible (US1 / FR-011).
5. Adresse + email affichés, mailto actionnable, carte centrée + marqueur (US2 / FR-015→017).
6. Éditer un texte / une coordonnée / la liste des types de demande en Studio → publier →
   reflété en ligne (US3 / FR-019).
