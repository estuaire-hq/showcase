# Tasks: Page contact

**Input**: Design documents from `/specs/013-contact-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: non demandés dans le spec → aucune tâche de test (vérification manuelle via skills `verify` + `estuaire-pixel-review`).

**Décisions verrouillées** : envoi **Nodemailer → SMTP OVH Email Pro** (`pro1.mail.ovh.net`, compte `noreply` existant — adresse exacte = conf) ; réception = **boîtes partagées Exchange M365**, transparent côté code ; routage `type → email` **éditable dans Sanity** ; carte **react-leaflet** (OSM, sans clé) ; anti-spam honeypot + time-trap ; formulaire fait main + zod partagé.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Ajouter les dépendances dans `package.json` : `nodemailer@^9` + `@types/nodemailer` (dev), `react-leaflet@^5` + `leaflet@^1.9` + `@types/leaflet` (dev) ; **déplacer `zod` de `devDependencies` → `dependencies`** (usage runtime). Puis `npm install`.
- [X] T002 [P] Documenter dans `.env.example` les variables server-only : `SMTP_HOST` (`pro1.mail.ovh.net`), `SMTP_PORT` (587), `SMTP_SECURE` (false), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO` (fallback `contact@estuaire.fr`) — avec commentaires (OVH Email Pro ; PAS de `NEXT_PUBLIC_`).
- [X] T003 [P] Copier le visuel du formulaire depuis le cache Figma (`.design/figma-cache/assets/51-4607.jpg`) vers `seed-assets/contact/form-visual.jpg` (committé, hors `public/`).

---

## Phase 2: Foundational (Modèle Sanity + coquille de page) — BLOQUE toutes les stories

**⚠️ CRITICAL** : le singleton `contactPage` et la page sont partagés par US1, US2, US3.

- [X] T004 Créer le schéma `src/sanity/schemas/documents/contactPage.ts` (`defineType`, singleton) : groupes `hero`/`form`/`coordinates`/`seo` ; champs `heroTitleOutline`, `heroTitleFill`, `formImage` (`imageField`), `formTitleOutline`, `formTitleFill`, **`requestTypes` = `array` d'objets `{ label: string (req), recipient: string (req, `Rule.email()`) }`** (réordonnable), `findTitleOutline/Fill`, `address` (`text`), `contactTitleOutline/Fill`, `email` (validé), `mapLocation` (`geopoint`), `mapZoom` (`number` 8–18), `seoMetaTitle/Description/OgImage`. `preview` fixe « Page contact ».
- [X] T005 Enregistrer `contactPage` dans `src/sanity/schemas/index.ts`.
- [X] T006 Ajouter l'entrée desk singleton « Contact » dans `src/sanity/structure.ts` (`S.document().schemaType("contactPage").documentId("contactPage")`) + ajouter `"contactPage"` au tableau `SINGLETONS`.
- [X] T007 `npm run typegen` → régénère `src/sanity.types.ts` (type `ContactPage`). (dépend de T004–T005)
- [X] T008 [P] Créer `src/content/contactPage.ts` (copie maquette partagée seed ↔ fallback) : titres, **4 `requestTypes` par défaut** (`{ "J'ai un projet" → projet@…, "Je souhaite vous rejoindre" → recrutement@…, "Je souhaite collaborer avec vous" → partenariat@…, "J'ai une autre demande" → contact@… }`), `address` (réutiliser la constante de `src/content/footer.ts`, sans la ligne copyright), `email`, `mapLocation` (Machecoul ≈ 46.9931,-1.8221), `mapZoom` 15, SEO.
- [X] T009 Ajouter `CONTACT_PAGE_QUERY` (`defineQuery`) dans `src/lib/sanity/queries.ts` selon `contracts/contactPage-query.md` (dont `requestTypes[]{ label, recipient }`, `formImage{…lqip}`, `mapLocation`). Re-`npm run typegen`. (dépend de T004)
- [X] T010 Créer le mapping `src/lib/sanity/contactPage.ts` : `getContactPageProps()` via `sanityFetch` (tag `contactPage`) + défauts depuis `src/content/contactPage.ts` (`?? `), `mapImage` pour `formImage`/`seoOgImage`, extraction `geopoint` → `{lat,lng,zoom,markerLabel}`. (dépend de T007, T008, T009)
- [X] T011 Créer le seed `src/sanity/seed/documents/contactPage.seed.ts` (`defineSeed<ContactPage>`, `_id: "contactPage"` **sans point**, `image("contact/form-visual.jpg", …)`, valeurs depuis `src/content/contactPage.ts`) + l'enregistrer dans `src/sanity/seed/registry.ts`. (dépend de T007, T008, T003)
- [X] T012 Créer la coquille de page `src/app/(site)/contact/page.tsx` (RSC) : `generateMetadata` (SEO + fallback), `getContactPageProps()`, structure des 3 sections (placeholders) + `<Footer />` partagé (aucune prop threadée). (dépend de T010)
- [X] T013 Seeder le dataset dev : `npm run seed:check -- contactPage` puis `npm run seed -- contactPage`. (dépend de T011)

**Checkpoint** : `/contact` rend (sections vides) avec le contenu Sanity ; Studio édite le singleton.

---

## Phase 3: User Story 1 — Envoyer un message via le formulaire (P1) 🎯 MVP

**Goal** : un visiteur remplit et envoie le formulaire ; le message (champs + pièce jointe) parvient à Estuaire, routé selon le type de demande, avec confirmation à l'écran.

**Independent Test** : remplir avec données valides → message de succès + mail reçu (en dev : visible dans les logs via `jsonTransport`) ; email mal formé / champ requis vide → erreurs ciblées, saisie conservée.

### Primitives design-system (présentationnelles)

- [X] T014 [P] [US1] Créer `src/design-system/components/TextField.tsx` (input underline `border-b border-ink`, h-50px, placeholder/label, `text-body`, tokens `@theme`, états `aria-invalid`/`aria-describedby`).
- [X] T015 [P] [US1] Créer `src/design-system/components/TextArea.tsx` (zone encadrée `border border-ink`, ~254px, idem a11y/tokens).
- [X] T016 [P] [US1] Créer `src/design-system/components/Field.tsx` (wrapper label + message d'erreur `role="alert"`, association id — FR-021, réutilisable).
- [X] T017 [US1] Ajouter l'état d'erreur/`aria-invalid` à `src/design-system/components/Select.tsx` ; exporter `TextField`/`TextArea`/`Field` dans `src/design-system/index.ts`. (dépend de T014–T016)

### Validation + transport partagés

- [X] T018 [P] [US1] Créer `src/lib/contact/schema.ts` : schéma **zod** partagé (name 2–120, email, company ≤160, requestType, message 10–5000) + contraintes fichier (≤10 Mo, MIME/ext autorisés) + helpers de messages. Réutilisable client + serveur.
- [X] T019 [P] [US1] Créer `src/lib/contact/mailer.ts` : transport **Nodemailer SMTP** (OVH Email Pro, `SMTP_*`) ; **fallback `jsonTransport`** si `SMTP_HOST` absent ; fonction `sendContactEmail({to, replyTo, fields, attachment?})`.

### Route serveur

- [X] T020 [US1] Créer `src/app/api/contact/route.ts` (POST, runtime Node) selon `contracts/contact-api.md` : `request.formData()` → anti-spam (honeypot `website` + time-trap `_ts` < 2,5 s → `200` feint) → `contactSchema.safeParse` (`400`) → validation fichier (`422`) → **résolution destinataire serveur** (`sanityFetch(CONTACT_PAGE_QUERY)` → map `label→recipient`, `to = map[label] ?? CONTACT_TO`) → `sendContactEmail` (`503` si échec) → `200`. Logs sans PII. (dépend de T018, T019, T009)

### UI formulaire + sections

- [X] T021 [US1] Créer `src/app/(site)/contact/ContactForm.tsx` (`"use client"`) : champs via primitives DS, `Select` nourri par `requestTypes` (libellés), `FileInput` (accept), champ honeypot masqué + `_ts`, validation client (zod partagé), `fetch("/api/contact", FormData)`, états `idle/submitting/success/error` (bouton `disabled` pendant l'envoi — FR-013, reset au succès — FR-010, saisie conservée en erreur — FR-011), `trackEvent("contact_form_submit", { status })` (Principe VI). (dépend de T014–T018)
- [X] T022 [US1] Intégrer la **section formulaire** dans `page.tsx` (panneau beige `#eee6dc` via token, visuel à gauche `next/image` depuis `formImage`, titre outline/fill, `<ContactForm requestTypes=… />`) — géométrie maquette (skill `estuaire-pixel-perfect`). (dépend de T012, T021)
- [X] T023 [US1] Intégrer la **section hero** dans `page.tsx` (titre « Nous sommes » outline + « à votre écoute » fill, style de marque). (dépend de T012)

**Checkpoint** : MVP — envoi de bout en bout fonctionnel (dev via `jsonTransport`), validation client+serveur, anti-spam, Umami.

---

## Phase 4: User Story 2 — Trouver et joindre Estuaire (coordonnées + carte) (P2)

**Goal** : adresse + email actionnable + carte interactive centrée sur Estuaire avec marqueur.

**Independent Test** : adresse/email affichés, clic email ouvre le client mail, carte zoom/déplacement OK avec marqueur ; JS coupé → adresse texte reste lisible (repli).

- [X] T024 [P] [US2] Créer `src/app/(site)/contact/ContactMap.tsx` (`"use client"`, import dynamique `ssr:false`) : `react-leaflet` (MapContainer/TileLayer OSM), marqueur custom brandé (épingle Estuaire), CSS Leaflet importée, props `{lat,lng,zoom,markerLabel}`, gestion d'échec silencieuse.
- [X] T025 [US2] Intégrer la **section coordonnées** dans `page.tsx` : titres « Nous trouver »/« Nous contacter » (outline/fill), `address` multi-lignes, `email` en `mailto:` actionnable + `umamiAttrs("contact_email_click")`, divider, `<ContactMap/>` à droite (l'adresse texte sert de repli — FR-018). (dépend de T012, T024)

**Checkpoint** : US1 + US2 fonctionnent indépendamment.

---

## Phase 5: User Story 3 — Gérer le contenu via le back-office (P3)

**Goal** : éditer textes / coordonnées / liste des types de demande dans Studio se reflète en ligne sans intervention technique.

**Independent Test** : modifier un texte / l'email / réordonner un `requestType` dans Studio → publier → changement visible (et routage cohérent).

- [X] T026 [US3] Confirmer la **revalidation** : `getContactPageProps()` utilise `sanityFetch` avec tag `["contactPage"]`, et le webhook `POST /api/revalidate` couvre ce tag (vérifier `src/lib/sanity/contactPage.ts` + la route revalidate). (dépend de T010)
- [X] T027 [US3] Vérifier en Studio l'éditabilité complète : `requestTypes` réordonnable, `recipient` validé email, repli `getContactPageProps` quand champs vides (FR-020), cohérence routage après édition. (dépend de T013)

**Checkpoint** : les 3 stories fonctionnent indépendamment.

---

## Phase 6: Polish & Cross-Cutting

- [X] T028 [P] **Motion** (skill `estuaire-motion`) : entrées de section discrètes (titres line-mask, panneau/visuel/coordonnées), neutralisées sous `prefers-reduced-motion` (FR-022).
- [X] T029 **Responsive** par breakpoint (tablette/mobile dérivés des conventions du site — FR-003) : empilement hero / visuel+form / coordonnées+carte.
- [X] T030 [P] **Accessibilité** (FR-021) : ordre de tabulation, labels associés, erreurs annoncées (`role="alert"`, `aria-invalid`/`aria-describedby`), focus visible.
- [X] T031 [P] **Gouvernance** : rédiger `docs/vault/decisions/0023-contact-email-sending-ovh-emailpro.md` (envoi = OVH Email Pro SMTP ; réception = boîtes partagées Exchange ; routage CMS ; caveats MX/anti-spoof) + **amendement PATCH** de la constitution (table de stack « Formulaire contact » : SMTP M365 → **OVH Email Pro**) avec Sync Impact Report. *(renuméroté 0019 → 0023 au merge de main — skill `estuaire-branch-sync`.)*
- [X] T032 **Pixel-perfect sign-off** (skill `estuaire-pixel-review`, OBLIGATOIRE) : capturer `/contact` par breakpoint, aligner section par section contre `.design/figma-cache/assets/51-4548.png`, boucler fix→recapture jusqu'à zéro écart ; nommer tout écart restant UNVERIFIED.
- [X] T033 **Gates** : `npm run lint` (Biome) + `npm run typegen` (pas de drift) + `npm run seed:check` ; rejouer les scénarios de `quickstart.md`.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** : T001 d'abord (deps) ; T002, T003 en parallèle.
- **Phase 2 (Foundational)** : BLOQUE tout. Ordre : T004→T005→T007 (+T008 en //) →T009→T010→T011→T012→T013. (T006 après T004/T005.)
- **Phase 3 (US1)** : après Phase 2. T014/T015/T016/T018/T019 en parallèle → T017 → T020 → T021 → T022/T023.
- **Phase 4 (US2)** : après Phase 2. T024 (//) → T025. Indépendante d'US1.
- **Phase 5 (US3)** : après Phase 2/3. Surtout vérification.
- **Phase 6 (Polish)** : après les stories visées. T031 (ADR) indépendant du reste ; T032 en dernier.

### Parallel Opportunities

- Setup : T002 ‖ T003.
- US1 : T014 ‖ T015 ‖ T016 ‖ T018 ‖ T019 (fichiers distincts).
- US1 et US2 peuvent être menées en parallèle une fois la Phase 2 finie.
- Polish : T028 ‖ T030 ‖ T031.

---

## Implementation Strategy

### MVP (User Story 1)
1. Phase 1 (Setup) → 2. Phase 2 (Foundational) → 3. Phase 3 (US1) → **STOP & valider** l'envoi de bout en bout (dev `jsonTransport`). Démo possible.

### Incrémental
US1 (MVP) → US2 (coordonnées+carte) → US3 (édition CMS) → Polish (motion, responsive, a11y, ADR, pixel-review, gates). Chaque story ajoute de la valeur sans casser les précédentes.

---

## Notes

- `[P]` = fichiers distincts, pas de dépendance.
- Le destinataire n'est JAMAIS lu depuis le client (sécurité) — résolu serveur depuis le CMS.
- Carte en îlot client `ssr:false` (Leaflet touche le DOM) ; form en îlot client. Reste RSC (Principe I).
- Tokens `@theme` only (Principe X) ; le beige `#eee6dc` → token existant, sinon ajout délibéré au DS.
- Commit après chaque tâche ou groupe logique. PR en anglais + template.
