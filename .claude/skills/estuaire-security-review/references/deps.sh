#!/usr/bin/env bash
# Estuaire dependency probe: the reproducible input of the "dependencies" axis of the
# estuaire-security-review skill. Read-only, it never installs, updates or fixes anything.
#
# Usage:  bash .claude/skills/estuaire-security-review/references/deps.sh [--json]
#
# Emits three sections with a STABLE shape so two passes are comparable:
#   1. VULNS    npm audit findings, one row per package, placed on a reachability cran
#   2. LAG      direct dependencies behind their latest published version
#   3. SUMMARY  counts per cran
#
# WHY the cran: `npm audit` alone is not decidable on this project. `sanity` is a production
# dependency (the embedded Studio), so its whole CLI subtree sits in the production tree even
# though nothing in the running site ever loads it. "Is it in package.json's dependencies?"
# therefore answers nothing; "can a visitor's request reach it?" is the question. The cran is
# derived from the DIRECT dependency at the root of the path (see CRAN below).
#
# The cran comes from the installed dependency graph, not from a runtime trace. It is a strong
# signal, not proof: when a case is genuinely ambiguous, escalate to the CI build and inspect
# `.next/standalone`. Re-confirm CRAN whenever a direct dependency is added.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

JSON_OUT=0
[ "${1:-}" = "--json" ] && JSON_OUT=1

# npm exits non-zero when it finds vulnerabilities / outdated packages: expected, not an error.
# The payloads are too large to pass through the environment, so they go through temp files.
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
npm audit --json >"$WORK/audit.json" 2>/dev/null || true
npm ls --omit=dev --all --json >"$WORK/prod.json" 2>/dev/null || true
npm outdated --json >"$WORK/outdated.json" 2>/dev/null || true

[ -s "$WORK/audit.json" ] || { echo "deps.sh: npm audit produced no output (offline? no lockfile?)" >&2; exit 1; }

JSON_OUT=$JSON_OUT WORK=$WORK node -e '
const fs = require("node:fs");
const read = (f) => { try { return JSON.parse(fs.readFileSync(`${process.env.WORK}/${f}`, "utf8") || "{}"); } catch { return {}; } };
const audit = read("audit.json");
const prodTree = read("prod.json");
const outdated = read("outdated.json");
const asJson = process.env.JSON_OUT === "1";

// Reachability crans, keyed by the DIRECT dependency at the root of the prod path.
// Source of truth for the mapping (referenced by references/grid.md, not restated there).
const CRAN = {
  // 1-browser: shipped in the public pages client bundle
  react: 1, "react-dom": 1, "@portabletext/react": 1, clsx: 1, "tailwind-merge": 1,
  "tailwind-variants": 1, gsap: 1, "@gsap/react": 1, lenis: 1, leaflet: 1, "react-leaflet": 1,
  // 2-server: in the running Next server, on the public request path
  next: 2, "next-sanity": 2, "@sanity/image-url": 2, nodemailer: 2,
  // 3-studio: in the prod tree but only loaded by /studio (authoring surface)
  sanity: 3, "@sanity/vision": 3, "@sanity/locale-fr-fr": 3, "styled-components": 3,
};
const CRAN_LABEL = {
  1: "1-browser  (served to every visitor)",
  2: "2-server   (prod Next runtime, public request path)",
  3: "3-studio   (loaded only on /studio)",
  4: "4-tooling  (CLI / build / dev only, never on a request path)",
};
// VERIFIED override: `@sanity/cli` and its subtree are entered ONLY through the `sanity` bin
// (`node_modules/sanity/bin/sanity`, whose own header states it delegates to @sanity/cli).
// Nothing in `sanity/lib/index.js` imports it, so on this project it is reached only by
// `npm run typegen` / `seed:schema`, i.e. local + CI tooling. Re-verify after a sanity major.
const TOOLING_SUBTREES = ["@sanity/cli", "@sanity/runtime-cli"];

// Walk the production tree once: package name -> shortest dependency path to it.
const prodPaths = new Map();
(function walk(node, trail) {
  for (const [name, child] of Object.entries(node?.dependencies || {})) {
    const path = [...trail, name];
    const known = prodPaths.get(name);
    if (!known || path.length < known.length) prodPaths.set(name, path);
    if (!trail.includes(name)) walk(child, path); // guard against dedupe cycles
  }
})(prodTree, []);

const rank = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };

function cranOf(path) {
  if (!path) return { cran: 4, why: "absent from the production tree (devDependency)" };
  const tooling = path.find((p) => TOOLING_SUBTREES.includes(p));
  if (tooling) return { cran: 4, why: `reached only through the ${tooling} subtree (sanity bin)` };
  const root = path[0];
  if (CRAN[root]) return { cran: CRAN[root], why: `via the ${root} direct dependency` };
  return { cran: 2, why: `via ${root}, an UNMAPPED direct dep: confirm by hand` };
}

// One row per vulnerable package (the decision is taken per package bump).
const rows = [];
for (const [name, v] of Object.entries(audit.vulnerabilities || {})) {
  const seen = new Set();
  const advisories = (v.via || [])
    .filter((x) => typeof x === "object")
    .filter((a) => { const k = a.url || a.title; return seen.has(k) ? false : (seen.add(k), true); });
  const path = prodPaths.get(name);
  const { cran, why } = cranOf(path);
  const fix = v.fixAvailable;
  rows.push({
    id: `DEP-${name}`,
    package: name,
    severity: v.severity,
    cran,
    cranWhy: why,
    prodPath: path ? path.join(" > ") : null,
    direct: !!v.isDirect,
    count: advisories.length,
    advisories: advisories.map((a) => ({ ghsa: (a.url || "").split("/").pop(), title: a.title, cvss: a.cvss?.score ?? null })),
    inheritedFrom: (v.via || []).filter((x) => typeof x === "string"),
    fix:
      fix === true ? "npm audit fix (no breaking change)"
      : fix && typeof fix === "object" ? `${fix.name}@${fix.version}${fix.isSemVerMajor ? " (MAJOR, breaking)" : ""}`
      : "none available",
  });
}
rows.sort((a, b) => a.cran - b.cran || (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9) || a.package.localeCompare(b.package));

// LAG. Only MAJOR gaps are signal on their own: a minor/patch gap that matters for security
// already surfaces as the `fix` of a VULNS row, so it is cross-referenced rather than listed.
// `npm outdated` reports type "dependencies" for devDeps too, so the real section is read
// from package.json.
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const devDeps = new Set(Object.keys(pkg.devDependencies || {}));
const fixTargets = new Set(
  rows.map((r) => (r.fix.includes("@") && !r.fix.startsWith("npm ") ? r.fix.split("@").slice(0, -1).join("@") : null)).filter(Boolean),
);
const carriesAuditFix = new Set(rows.filter((r) => r.fix.startsWith("npm audit fix")).map((r) => r.package));

const lagAll = Object.entries(outdated).map(([name, o]) => ({
  package: name,
  current: o.current ?? "(absent)",
  wanted: o.wanted,
  latest: o.latest,
  major: String(o.current ?? "").split(".")[0] !== String(o.latest ?? "").split(".")[0],
  section: devDeps.has(name) ? "devDependency" : "dependency",
  carriesFix: carriesAuditFix.has(name) || fixTargets.has(name),
}));
const lag = lagAll
  .filter((o) => o.major || o.carriesFix)
  .sort((a, b) => Number(b.major) - Number(a.major) || a.package.localeCompare(b.package));
const lagMinorHidden = lagAll.filter((o) => !o.major && !o.carriesFix).length;

if (asJson) {
  console.log(JSON.stringify({ vulns: rows, lag }, null, 2));
  process.exit(0);
}

console.log("== VULNS (npm audit, one row per package, ordered by reachability cran) ==");
if (!rows.length) console.log("  none");
let cur = null;
for (const r of rows) {
  if (r.cran !== cur) { cur = r.cran; console.log(`\n--- cran ${CRAN_LABEL[cur]} ---`); }
  console.log(`\n${r.id}  [${r.severity.toUpperCase()}]  ${r.count} advisor${r.count === 1 ? "y" : "ies"}${r.direct ? "  (DIRECT dep)" : ""}`);
  for (const a of r.advisories) console.log(`  - ${a.ghsa}${a.cvss ? ` cvss:${a.cvss}` : ""} ${a.title}`);
  if (!r.advisories.length) console.log(`  - no advisory of its own, vulnerable only through: ${r.inheritedFrom.join(", ") || "(unknown)"}`);
  console.log(`  path : ${r.prodPath || "(not in the production tree)"}`);
  console.log(`  cran : ${r.cranWhy}`);
  console.log(`  fix  : ${r.fix}`);
}

console.log("\n== LAG (major gaps, plus any gap that carries a security fix) ==");
if (!lag.length) console.log("  none");
for (const o of lag)
  console.log(
    `  LAG-${o.package}  ${o.major ? "MAJOR" : "minor"}  ${o.current} -> ${o.latest} (wanted ${o.wanted})` +
      `  [${o.section}]${o.carriesFix ? "  ** carries a security fix, see the VULNS row **" : ""}`,
  );
if (lagMinorHidden)
  console.log(`  (+ ${lagMinorHidden} minor/patch gaps with no security bearing: routine maintenance, not listed)`);

const byCran = rows.reduce((acc, r) => ((acc[r.cran] = (acc[r.cran] || 0) + 1), acc), {});
console.log("\n== SUMMARY ==");
console.log(`  vulnerable packages : ${rows.length}  (cran1 ${byCran[1] || 0} / cran2 ${byCran[2] || 0} / cran3 ${byCran[3] || 0} / cran4 ${byCran[4] || 0})`);
console.log(`  lagging direct deps : ${lag.length} (${lag.filter((o) => o.major).length} major)`);
console.log("  NOT covered here: supply-chain (postinstall scripts, publish provenance, typosquat),");
console.log("  a deliberate scope exclusion, and package HEALTH, which needs a live per-package");
console.log("  lookup (see references/grid.md, row DEP-HEALTH).");
'
