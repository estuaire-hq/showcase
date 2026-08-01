# Estuaire security grid

The checklist the skill walks: **nine code rows plus one dependency row** the probe cannot
compute. Deliberately short. Estuaire is a showcase site with **no authentication, no user
accounts, no persisted user data and no payments**. Rows for SQL injection, session handling,
JWT, privilege escalation or multi-tenancy are absent because that surface does not exist here.
Adding a row is a decision: record it in the ADR, do not grow the grid by reflex.

Every row states **why the built-in `/security-review` will not catch it**, so the split stays
justified rather than habitual. The recurring reasons are its own hard exclusions: *"a lack of
hardening measures"*, *"DoS / rate limiting / resource exhaustion"*, *"vulnerabilities related to
outdated third-party libraries"*, *"secrets stored on disk"*, plus its diff-only scope.

**Absolute rule, no exception:** never open `.env.development` or any `.env*` file (`.env.example`
excepted), not even in the name of a security audit. Auditing how secrets are *handled* is done by
reading the code that *reads* them. If a row seems to need a secret's value, the row is wrong.

---

## Dependency axis

`references/deps.sh` covers vulnerabilities (per package, placed on a reachability cran) and
version lag. One row it cannot compute:

### `DEP-HEALTH`: maintenance and bus factor of the direct dependencies

**Question.** Applying `CLAUDE.md`'s *Dependencies* criteria to what is **already installed**, not
just to new additions: is any direct dependency abandoned, single-maintainer, or losing adoption?

**How.** For each direct dependency, look up **live** (never from memory, per the global "verify
before acting" rule): last release date, commit activity, maintainer count, open/closed issue
ratio, weekly downloads. Prioritise the ones on cran 1-2 (served or on the request path) and the
ones with no realistic replacement.
```bash
npm view <pkg> time.modified   # last publish
npm view <pkg> maintainers     # bus factor, with the caveat below
```
Read the maintainer count with judgement: org-published packages (`react`, `next`) show a single
publishing account without having a bus factor of one. Cite the metric, not a conclusion it does
not support.

**Pass.** Every cran 1-2 dependency has had a release in roughly the last 12 months and more than
one active maintainer, or its risk is knowingly accepted in the ledger.

**Not the built-in.** Hard exclusion: *"vulnerabilities related to outdated third-party libraries,
managed separately"*. It never looks at dependency health at all.

**Out of scope, deliberately: supply chain** (postinstall scripts, publish provenance,
typosquatting). Named here so the gap is a visible choice, not an oversight. Do not add it without
changing the ADR.

---

## Code rows

### `CODE-HEADERS`: HTTP response headers

**Question.** What security headers does a visitor actually receive?

**How.** `grep -n "headers" next.config.ts` establishes what the app declares. Then **observe the
real response**. Cloudflare and Coolify sit in front of the app and can inject or strip headers, so
the code alone does not answer this (brownfield rule: trust infrastructure over code).
```bash
curl -sS -D - -o /dev/null https://estuaire.fr/ | sed -n '1,/^\r*$/p'
curl -sS -D - -o /dev/null http://estuaire.fr/  | sed -n '1,4p'   # HTTPS redirect present?
```
**Pass.** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, a
frame-ancestors decision (CSP or `X-Frame-Options`), and either a CSP or a written reason why not.

**Size the two halves separately.** The four simple headers are a `headers()` block in
`next.config.ts` or a Cloudflare Transform Rule, cheap and low risk. A CSP on a site loading the
Sanity image CDN, Umami and OSM tiles, with GSAP and styled-components injecting inline styles, is
a different order of magnitude. Present them as **two items**, never as one, otherwise the cheap
half gets blocked by the expensive half.

**Not the built-in.** *"A lack of hardening measures. Code is not expected to implement all
security best practices, only flag concrete vulnerabilities."* Missing headers are structurally
invisible to it.

### `CODE-NEXT-PUBLIC`: the `NEXT_PUBLIC_` boundary

**Question.** Is anything secret inlined into the client bundle, and does any server-only value
wrongly carry the prefix?

**How.** `grep -rn "process\.env" src/ *.ts .design/scripts/` and read **every** hit. Two failure
directions, both in `CLAUDE.md`:
- a **secret** carrying `NEXT_PUBLIC_`, which Next inlines into the JS served to every visitor;
- a value injected into HTML by a **Server Component** carrying the prefix, inlined at build time,
  which breaks per-environment configuration across Docker/Coolify. That one is a correctness bug
  more than a vulnerability, but it lives on the same boundary.

**Pass.** Only non-secret identifiers carry the prefix. Every credential, token or webhook secret
is read without it, from server-only code.

**Not the built-in.** It treats *"environment variables and CLI flags as trusted values"* and
excludes *"secrets stored on disk"*, so neither direction is in its remit.

### `CODE-SANITY-TOKENS`: read token, write token, dataset visibility

**Question.** Which Sanity token exists in which environment, can the **write** token be reached
from anything a request can execute, and what does the dataset expose without any token at all?

**How.**
```bash
grep -rn "SANITY_API_WRITE_TOKEN\|SANITY_API_READ_TOKEN" src/ .github/
```
The write token must appear **only** in the seed runner (`src/sanity/seed/`) and the CI workflow,
never under `src/app/**`, and nothing under `src/app/**` may import the seed runner.

Then the dataset's own visibility, which decides what a token protects at all. `aclMode: public`
means anonymous GROQ reads of the whole dataset. Verify by observation, on the **dev** project:
```bash
mcp Sanity list_datasets  # projectId wje1fhkq (dev). PROD needs an explicit per-action go.
B="https://wje1fhkq.api.sanity.io/v2021-06-07/data/query/production"
curl -sS --get "$B" --data-urlencode 'query=count(*)' --data-urlencode 'perspective=raw'
```
A `perspective=raw` count served without a 401 proves unpublished documents are anonymously
readable when they exist. A count of zero drafts means "none right now", not "protected": say
which of the two you observed. Note that private datasets are a **paid** Sanity feature, so on the
Free plan this is a plan constraint to accept and work around (keep nothing confidential in
drafts), not a code fix.

**Pass.** Write token CI-only, read token server-only, the app's runtime cannot mutate content, and
the dataset's visibility is a known and accepted state rather than a surprise.

**Not the built-in.** Same secrets and env exclusions as the row above, and this is existing code
plus live infrastructure, not a diff.

### `CODE-WEBHOOK`: `/api/revalidate` signature

**Question.** Can anyone trigger a revalidation, and does the endpoint fail **closed** when the
secret is missing?

**How.** Read `src/app/api/revalidate/route.ts` against the installed library, not against
assumption:
```bash
grep -nE "secret|isValidSignature" node_modules/next-sanity/dist/webhook/index.js
```
`parseBody` returns `isValidSignature: null` (not `false`) when no secret is configured. The route
must reject on **falsy**, not on `=== false`, otherwise an unset `REVALIDATION_SECRET` in prod
turns the endpoint into an open revalidation trigger. This is the row's load-bearing detail: it is
one refactor away from failing open, so re-check the comparison every pass.

**Pass.** Falsy check present, generic error bodies, and the handler does nothing but revalidate.

**Not the built-in.** Only if a diff touches this file. On a baseline pass it is out of its scope
entirely.

### `CODE-CONTACT-ABUSE`: abuse of the contact endpoint

**Question.** What does an attacker get by hammering `POST /api/contact`?

**How.** Read `src/app/api/contact/route.ts` and `src/lib/contact/`. Establish, concretely:
- is there any **rate limit** (per IP, per window)? `grep -rniE "rate.?limit|throttl" src/` answers
  the app layer. The edge layer is a separate question: Cloudflare is in front, so **check whether
  a rate-limiting or bot rule exists there**, and if you cannot see the Cloudflare configuration,
  record it as UNVERIFIED rather than assuming either way;
- is the anti-bot gate **client-controlled**? `_ts` is a hidden input in `ContactForm.tsx`, so the
  minimum fill-time check is forgeable by any script that posts an old timestamp;
- what does one accepted request **cost**? An attachment up to 10 MB is buffered in memory and
  relayed through an authenticated mailbox.

**Never load-test the production endpoint.** Every accepted request sends a real email to the
client. If the app-layer behaviour needs proving, do it against a local dev server, where
`SMTP_HOST` is unset and nodemailer's `jsonTransport` keeps everything on the machine.

**Impact to state plainly.** Mail-relay abuse from a genuine `@estuaire.fr` sender, SMTP quota
burn, sender-reputation and deliverability damage, the client's inbox flooded, memory pressure on a
single VPS.

**Not the built-in.** Three separate hard exclusions: *DoS*, *rate limiting*, *resource
exhaustion*. It will never report this, at any scope.

### `CODE-CONTACT-INJECTION`: the only untrusted-input surface

**Question.** Every field a stranger controls: where does it end up, and is it neutralised there?

**How.** Trace each field from `route.ts` to `mailer.ts`: HTML body, text body, subject, `replyTo`,
recipient, attachment filename and bytes. Confirm rather than assume:
- validation runs **server-side** too, never client-only;
- the HTML body is escaped;
- the **recipient** is resolved server-side from the CMS, never taken from the request;
- header injection through an interpolated field. Nodemailer Q-encodes and folds the subject, so a
  newline in `name` cannot forge a header. Verified empirically rather than read from docs, and
  worth **re-verifying after a nodemailer major**:
```bash
node --input-type=module -e '
import nodemailer from "nodemailer";
const t = nodemailer.createTransport({ streamTransport: true, buffer: true });
const out = await t.sendMail({ from:"a@b.c", to:"d@e.f", subject:"X\nBcc: victim@evil.tld", text:"x" });
console.log(out.message.toString().split("\r\n\r\n")[0]);'
```

**Pass.** Server-side validation, escaped output, server-resolved recipient, attachment allowlist
enforced on the extension (MIME is advisory only, browsers vary).

**Not the built-in.** Genuine overlap here: this is exactly what it does well. So in `diff` mode,
**let it own this row** and do not duplicate the analysis. The row exists for the baseline pass,
where the built-in has no reach.

### `CODE-STUDIO-DRAFT`: `/studio` and draft mode

**Question.** What can an unauthenticated visitor do with `/studio` and `/api/draft-mode/enable`?

**How.** `/studio` is publicly served by design, since Sanity enforces auth at its API layer rather
than at the route, so the whole Studio bundle is downloadable by anyone. That is surface and
weight, not a breach. For draft mode, verify the guard in the installed library:
```bash
grep -nE "validatePreviewUrl|401|redirect" node_modules/next-sanity/dist/draft-mode/index.js
```
It validates a Sanity-issued preview-URL secret and answers 401 otherwise. Confirm that still
holds, and state what an attacker would gain if it did not: reading **unpublished** content,
because the route configures the client with a `SANITY_API_READ_TOKEN`.

**Pass.** Draft mode gated by the preview secret, no token exposed to the browser, and the Studio
exposes no project secret beyond the public `projectId` and `dataset`.

**Not the built-in.** Existing code, and the reachability question is about the deployment rather
than the diff.

### `CODE-PUBLIC-SURFACE`: inventory of what is reachable

**Question.** What is publicly reachable today, and what changed since the last pass?

**How.**
```bash
find src/app -name "route.ts" -o -name "robots.ts" -o -name "sitemap.ts" | sort
ls src/middleware.ts src/proxy.ts 2>/dev/null   # neither should exist
```
Record the full list in the report. **This row is the tripwire**: a new endpoint appearing between
two passes is the highest-value signal the ledger produces, and it costs one command.

**Pass.** Every reachable endpoint is intentional, and each one is covered by a row above or
carries a written reason why it needs none (`/api/health` returns a constant and leaks nothing).

**Not the built-in.** It reviews changed lines and does not maintain an inventory across passes.

### `CODE-DEPLOY`: image and runtime posture

**Question.** Does the built image carry anything it should not, and does it run with more
privilege than it needs?

**How.** Read `Dockerfile` and `.dockerignore`. Confirm a non-root `USER`, no secret baked into a
layer (`ARG` or `ENV` carrying credentials), `.env*` excluded from the build context, and
build-only material (`seed-assets/`, `.design/`, `specs/`) kept out of the runtime image. Prod
configuration lives in the Coolify UI, so no `.env.production` should exist anywhere.

**Pass.** Non-root runtime, no credentials in the image, `.env*` and build-only assets ignored.

**Not the built-in.** Hardening and secrets-on-disk exclusions again.
