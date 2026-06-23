# Research — Page contact

Phase 0 du plan. Résout les inconnues techniques du spec (carte, email, anti-spam, pièce
jointe, source des coordonnées, formulaire). Chaque décision : **Decision / Rationale /
Alternatives**. Sources live vérifiées (règle « Verify Before Acting »).

---

## 1. Carte interactive

- **Decision** : **react-leaflet v5 + leaflet v1.9**, tuiles **OpenStreetMap** (raster, sans
  clé API), composant client `ContactMap` chargé en **import dynamique `ssr: false`**, marqueur
  custom (épingle brandée Estuaire, cf. maquette), CSS Leaflet importé localement.
- **Rationale** :
  - react-leaflet **v5.0.0 exige React 19** en peer dependency → compatible avec notre React
    19.2 ([releases](https://github.com/PaulLeCam/react-leaflet/releases)).
  - **Gratuit, sans clé, sans facturation** (tuiles OSM publiques) — cohérent avec le plan
    gratuit du projet (Cloudflare/Sanity free tier).
  - Permet le **marqueur brandé** de la maquette (épingle avec logo) via un `L.icon`/`divIcon`
    custom, et un rendu clair/désaturé via filtre CSS — ce qu'un simple iframe ne permet pas
    (Principe VII pixel-perfect).
  - Bien maintenu, très adopté, typé (`@types/leaflet`).
  - `ssr: false` évite l'erreur « window is not defined » (Leaflet touche le DOM) et garde la
    carte hors du bundle initial → JS client minimal (Principe I).
- **Alternatives rejetées** :
  - **iframe OSM** (`openstreetmap.org/export/embed.html`) : zéro dépendance mais marqueur
    orange standard imposé, pas de style ni d'épingle brandée → infidèle à la maquette.
  - **MapLibre GL** : vecteur/WebGL, nécessite une source de tuiles/style (souvent une clé,
    ex. MapTiler) → plus de complexité et une dépendance à clé, contraire au Principe IV.
  - **Google Maps JS API** : clé + facturation + ToS → écarté pour un vitrine free-tier.
- **Repli (FR-018)** : si la carte ne charge pas (réseau, JS off, `ssr:false`), l'adresse
  texte de la section coordonnées (rendue côté serveur) reste un repli suffisant. Le composant
  `ContactMap` gère son propre état d'échec sans casser la page.
- **Localisation par défaut** : Machecoul (≈ `lat 46.9931, lng -1.8221`), zoom ~15 — éditable
  via le `geopoint` Sanity (FR-019). Coordonnées exactes à affiner par l'éditeur.

## 2. Service d'envoi d'email

> **✅ DÉCISION ARRÊTÉE (clarifiée 2026-06-23)** — architecture **hybride** :
> - **ENVOI** : relais **SMTP OVH Email Pro** (`pro1.mail.ovh.net`, 587 STARTTLS / 465 SSL),
>   authentifié par un **compte Email Pro `noreply` déjà créé** (service `emailpro-ls132877-1`).
>   `From` = ce compte (SPF OVH aligné), email visiteur en `replyTo`.
>   *Sous-point* : l'adresse exacte du compte `noreply` doit être fournie par Pierre — le CLI
>   `ovhcloud` n'expose Email Pro qu'au niveau service (`list/get/edit`), **pas la liste des
>   comptes** (pas de passthrough API). Je connais l'hôte SMTP, pas l'adresse exacte.
> - **RÉCEPTION** : les 4 destinataires sont des **boîtes partagées Exchange (tenant M365
>   Mosaique Production)**. Côté code c'est **transparent** : on envoie un email normal vers une
>   adresse, Exchange le livre dans la boîte partagée (aucune intégration Graph/API requise).
>   Les adresses sont **éditables dans Sanity** (`requestTypes[].recipient`).
>
> **Inventaire OVH (compte MOSAIQUE PRODUCTION, Machecoul)** :
> - MX `estuaire.fr` → `mx1/2/3.mail.ovh.net` ; **DNS géré chez Cloudflare** (NS Cloudflare).
> - **Pas de MX Plan** (`email-mxplan list` = null). Offre `email-domain` estuaire.fr = `redirect`
>   (MX + SPF `valid`) mais **0 redirection** configurée → `contact@` n'est pas une redirection.
> - **Service Email Pro** présent : `emailpro-ls132877-1`, hostname `pro1.mail.ovh.net`,
>   `maxSendSize` 100 Mo → les boîtes @estuaire.fr sont des **comptes Email Pro**.
> - **SPF** : `v=spf1 include:mx.ovh.com -all` → OVH autorisé ✅. **DKIM** : aucun sélecteur
>   trouvé → **à activer** (records à poser chez Cloudflare). **DMARC** : absent (optionnel).

- **Decision (partielle, mécanisme)** : **Nodemailer ^9.0.1** (+ `@types/nodemailer`), transport
  centralisé et **agnostique** dans `src/lib/contact/mailer.ts`. **Fallback `jsonTransport`**
  quand `SMTP_HOST` est absent (dev sans secrets) : message sérialisé/loggé au lieu d'être
  envoyé → parcours testable de bout en bout sans creds. *Conséquence clé : le choix du relais ne
  change que ce fichier + les variables d'env ; tout le reste du plan (form, validation,
  anti-spam, route, modèle Sanity, carte) en est indépendant.*
  Nodemailer 9.0.1 = dernière stable, SMTP bundlé, aucun package tiers
  ([npm](https://www.npmjs.com/package/nodemailer)).

- **Configuration retenue** (variables server-only, PAS de `NEXT_PUBLIC_`) :

  ```bash
  SMTP_HOST=pro1.mail.ovh.net
  SMTP_PORT=587                 # STARTTLS ; alternative 465 + SMTP_SECURE=true (SSL)
  SMTP_SECURE=false             # false pour 587, true pour 465
  SMTP_USER=<compte@estuaire.fr>          # vraie boîte Email Pro (adresse complète = identifiant)
  SMTP_PASS=<mot_de_passe>
  SMTP_FROM=Estuaire <compte@estuaire.fr> # DOIT être @estuaire.fr (alignement SPF)
  CONTACT_TO=contact@estuaire.fr          # destinataire des demandes
  ```

  Dev → `.env.development` (git-crypt, posé par Pierre) ; prod → UI Coolify ;
  `.env.example` documente les clés (sans secret). Si `SMTP_HOST` absent en worktree →
  fallback `jsonTransport` (cf. ci-dessus).
- **Règles de délivrabilité** : (1) `From` = adresse `@estuaire.fr` (SPF OVH aligné) ; (2) email
  visiteur en `replyTo`, jamais en `From` ; (3) une vraie boîte Email Pro est requise pour
  s'authentifier (SMTP AUTH = adresse + mot de passe). 10 Mo de pièce jointe < `maxSendSize` 100 Mo.
- **Destinataire — routage par type de demande (CMS)** : le destinataire dépend du **type de
  demande** choisi (décision Pierre 2026-06-20). Le routage `libellé → email` vit dans le CMS
  (`contactPage.requestTypes[].recipient`, éditable — FR-007/FR-019). Défauts :
  « J'ai un projet » → `projet@`, « Je souhaite vous rejoindre » → `recrutement@`,
  « Je souhaite collaborer avec vous » → `partenariat@`, « J'ai une autre demande » → `contact@`.
  **Sécurité** : le client n'envoie que le **libellé** ; la route `/api/contact` re-fetche les
  `requestTypes` côté serveur et résout `to = map[label].recipient ?? CONTACT_TO`. `CONTACT_TO`
  (`contact@estuaire.fr`) n'est donc plus l'unique destinataire mais le **fallback** ops-contrôlé.
  L'email **affiché** (mailto) de la section coordonnées reste éditable en CMS.
  *Note ops* : les 4 destinataires sont des **boîtes partagées Exchange (M365)** — elles doivent
  exister dans le tenant, et leur **domaine doit router (MX) vers Exchange** pour recevoir. C'est
  indépendant de la boîte d'**envoi** OVH (`SMTP_USER`/`FROM`).
  ⚠️ **Caveat anti-spoofing** : éviter d'envoyer « en tant que `@estuaire.fr` » VERS un Exchange
  qui considère `estuaire.fr` comme son propre domaine (Exchange marque comme spoof un mail de son
  domaine venu d'un serveur externe = OVH). Cleanest : domaine d'**envoi** (OVH, ex.
  `noreply@estuaire.fr`) ≠ domaine de **réception** des boîtes partagées (ex. `@mosaiqueproduction.fr`),
  OU `estuaire.fr` reste pleinement chez OVH. Comme les destinataires sont éditables dans Sanity,
  le client renseigne les adresses réelles des boîtes partagées (à valider à l'appel + en test réel).
- **À faire côté DNS (Cloudflare)** : **activer DKIM** sur le domaine Email Pro (OVH fournit les
  records → les poser chez Cloudflare) ; **DMARC** optionnel (`_dmarc` TXT `p=none`). Non bloquant
  pour envoyer (SPF suffit), mais fortement recommandé.
- **Impact constitution** : la constitution cite « SMTP Microsoft 365 du client » — l'inventaire
  montre que le mail estuaire.fr est en réalité **OVH Email Pro**. On reste sur du **SMTP** (donc
  l'esprit du choix tient), mais il faut **un ADR + un amendement PATCH** de la table de stack
  (M365 → OVH Email Pro). À acter avant l'implémentation.
- **Alternatives écartées** : M365 (le mail n'est pas chez Microsoft) ; MTA local VPS
  (délivrabilité, port 25) ; relais tiers Brevo/Mailjet/SES (inutile, OVH Email Pro suffit).

## 3. Mécanisme de soumission (route vs Server Action)

- **Decision** : **Route Handler `POST /api/contact`** recevant `multipart/form-data` ; le
  client (`ContactForm`) fait un `fetch("/api/contact", { method:"POST", body: FormData })`.
- **Rationale** :
  - Suit la **convention existante** des routes API (`api/revalidate`, runtime Node,
    `Response.json`).
  - **Exempté du gate Coming-Soon** : le matcher du proxy exclut `api/*` (alors qu'une Server
    Action POST sur la route page serait réécrite vers `/coming-soon` quand le token est posé) —
    plus sûr pour un endpoint de formulaire.
  - Contrat explicite, testable au `curl`, gère nativement le `File` de la pièce jointe via
    `request.formData()`.
- **Alternatives rejetées** : **Server Action** (idiomatique mais sensible au gate, et moins
  explicite comme contrat pour un endpoint qui reçoit un fichier).

## 4. Formulaire : validation & état (fait main vs librairie)

- **Decision** : **formulaire fait main** (React `useState`) + **schéma zod partagé**
  (`src/lib/contact/schema.ts`) importé côté client (validation à la soumission) ET côté serveur
  (revalidation — FR-006). **Pas de react-hook-form.**
- **Rationale** :
  - 6 champs + 1 fichier : la complexité ne justifie pas une dépendance (Principe IV / YAGNI).
  - zod est **déjà installé** ; un seul schéma garantit l'alignement client↔serveur (DRY).
  - L'accessibilité (FR-021 : `aria-invalid`, `aria-describedby`, association label/erreur,
    `role="alert"` sur les messages) est portée par les primitives DS `Field`/`TextField`/
    `TextArea` — pas besoin du câblage de RHF.
  - **À faire** : déplacer `zod` de `devDependencies` → `dependencies` (usage runtime serveur).
- **Alternatives rejetées** : **react-hook-form + @hookform/resolvers** (excellent mais
  surdimensionné ici), validation HTML native seule (insuffisante pour des messages ciblés +
  revalidation serveur partagée).
- **Double-envoi (FR-013)** : bouton `disabled` pendant le `fetch` (état `submitting`) ; le
  `Button` DS gère déjà `disabled:opacity-50`.

## 5. Anti-spam (FR-012, SC-007)

- **Decision** : **honeypot + time-trap**, sans dépendance.
  - **Honeypot** : champ leurre `website` masqué (off-screen + `aria-hidden` + `tabindex=-1` +
    `autocomplete=off`) ; rempli ⇒ rejet silencieux (200 « ok » feint pour ne pas renseigner le
    bot).
  - **Time-trap** : champ caché `_ts` = horodatage de rendu du formulaire ; soumission en
    < ~2,5 s ⇒ rejet (comportement de bot).
- **Rationale** : **zéro friction** pour l'humain (FR-012 « sans friction excessive »), zéro
  dépendance, zéro clé. Suffisant pour un vitrine à faible trafic (SC-007).
- **Alternatives / upgrade path documenté** : **Cloudflare Turnstile** (le site est déjà derrière
  Cloudflare) — plus robuste mais ajoute un widget client + vérification serveur + 2 clés. À
  garder comme évolution si le spam persiste (décision documentée, pas implémentée maintenant).

## 6. Pièce jointe (FR-008)

- **Decision** : **un seul fichier**, optionnel. Contraintes vérifiées **client ET serveur** :
  - **Taille max** : **10 Mo** (marge sous la limite d'attachement SMTP M365 ~25–35 Mo après
    inflation base64).
  - **Formats autorisés** : PDF, images (PNG, JPG, WEBP), documents bureautiques (DOC, DOCX,
    XLS, XLSX, PPT, PPTX). Vérif par **extension + type MIME**.
  - Fichier non conforme ⇒ refus **avant envoi** avec message explicite (FR-008).
- **Rationale** : couvre les besoins courants (devis, plans, briefs) en bornant la surface
  (taille pour la délivrabilité SMTP, types pour la sécurité). Validation double = pas de
  contournement client.

## 7. Source des coordonnées (adresse / email)

- **Decision** : la page contact **possède ses propres champs** `address` + `email` dans le
  singleton `contactPage` (contenu page-specific, fetché par la page — Principe VIII). Le
  **fallback code** de l'adresse réutilise la **même constante** que le footer
  (`src/content/footer.ts`) extraite dans `src/content/contactPage.ts`, pour éviter la
  duplication littérale en code.
- **Rationale** :
  - Le footer modélise déjà une `address` (multi-lignes avec copyright) mais **pas d'email** →
    il n'existe aucune source « email » à réutiliser telle quelle.
  - La maquette présente l'adresse comme **deux blocs éditoriaux distincts** (footer ET section
    coordonnées) — les rendre éditables séparément est cohérent avec le design.
  - Éviter un **refactor du footer** vers un `siteSettings` partagé maintenant = respect du
    Principe IV (YAGNI). La centralisation reste possible plus tard (ADR dédié) si le besoin
    apparaît — noté comme alternative.
- **Alternative rejetée (pour l'instant)** : introduire un singleton `siteSettings`
  (adresse + email canoniques) consommé par footer ET contact. Plus « pur » mais c'est un
  refactor du footer hors scope de cette feature.

## 8. Tracking Umami (Principe VI)

- **Decision** : événement **`contact_form_submit`** avec propriété `{ status: "success" |
  "error" }` (succès et échec **distinctement**, comme l'exige le Principe VI), déclenché
  **côté client** dans `ContactForm` à la réception de la réponse, via le helper existant
  `trackEvent(name, data)`. Le **clic sur l'email** (mailto) est tracé en déclaratif via
  `umamiAttrs("contact_email_click")`.
- **Rationale** : la soumission est une action client avec réponse serveur → le tracking client
  sur la réponse est le plus simple et suffisant. Aucune PII dans le nom/props de l'événement
  (seul `status`). L'API serveur Umami n'est pas nécessaire ici (pas un événement purement
  serveur type webhook).
- **À NE PAS tracer** (choix documenté) : la frappe dans les champs, l'ouverture du select — non
  porteurs de valeur métier.

## 9. Animations (FR-022, skill estuaire-motion)

- **Decision** : entrées de section discrètes (titres en line-mask, panneau/visuel/coordonnées),
  via les primitives GSAP du projet, **neutralisées sous `prefers-reduced-motion`**. Le texte
  reste l'ancre statique ; le mouvement porte sur visuels et transitions (cinématique Estuaire).
  Détail arrêté en build via la skill `estuaire-motion`.
- **Rationale** : cohérence avec les autres pages ; FR-022 impose le respect de la préférence
  de mouvement réduit.

---

## Synthèse des dépendances ajoutées (traçabilité Principe IV)

| Dépendance | Type | Justification | Maintenue / adoptée |
|---|---|---|---|
| `nodemailer` ^9.0.1 | dep runtime | Mandatée par la constitution (SMTP M365) | Oui — standard de facto |
| `@types/nodemailer` | devDep | Types TS | Oui |
| `react-leaflet` ^5 | dep | Carte interactive brandée, gratuite, sans clé, React 19 | Oui — très adoptée |
| `leaflet` ^1.9 | dep | Moteur de carte de react-leaflet | Oui — très adoptée |
| `@types/leaflet` | devDep | Types TS | Oui |
| `zod` ^4.4.3 | **déplacer** devDep → dep | Validation runtime partagée client/serveur (déjà installé) | Oui |

Aucune dépendance pour le formulaire (fait main) ni l'anti-spam (honeypot + time-trap).
