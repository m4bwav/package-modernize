#!/usr/bin/env bash
# Find a stale `next` dist-tag (package-modernize, Phase 6 after the release, and any audit of the maintainer's packages).
# Usage: check-next-tag-npm.sh PACKAGE [PACKAGE...]
# Prints each package's dist-tags and STALE when `next` points at or below `latest` (semver order, so X.0.0-beta.1 < X.0.0),
# with the fix command for the maintainer's terminal. Exit 1 if any is stale. Read-only; no login needed.
set -u
[ $# -ge 1 ] || { echo "usage: check-next-tag-npm.sh PACKAGE [PACKAGE...]" >&2; exit 2; }
stale=0
for PKG in "$@"; do
  echo "\$ npm view $PKG dist-tags --json"
  TAGS="$(npm view "$PKG" dist-tags --json 2>/dev/null)" || { echo "$PKG: not found"; continue; }
  if ! TAGS="$TAGS" PKG="$PKG" node -e '
    const t = JSON.parse(process.env.TAGS), pkg = process.env.PKG;
    const parse = v => { const [core, pre] = v.split("+")[0].split(/-(.*)/s); return { core: core.split(".").map(Number), pre: pre ? pre.split(".") : [] }; };
    const cmpId = (a, b) => { const na = /^\d+$/.test(a), nb = /^\d+$/.test(b);
      if (na && nb) return Number(a) - Number(b); if (na) return -1; if (nb) return 1; return a < b ? -1 : a > b ? 1 : 0; };
    const cmp = (x, y) => { const a = parse(x), b = parse(y);
      for (let i = 0; i < 3; i++) if (a.core[i] !== b.core[i]) return a.core[i] - b.core[i];
      if (!a.pre.length || !b.pre.length) return b.pre.length - a.pre.length;
      for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
        if (a.pre[i] === undefined) return -1; if (b.pre[i] === undefined) return 1;
        const c = cmpId(a.pre[i], b.pre[i]); if (c) return c; }
      return 0; };
    console.log(`${pkg}: ${Object.entries(t).map(([k, v]) => `${k} ${v}`).join(", ")}`);
    if (t.next && t.latest && cmp(t.next, t.latest) <= 0) {
      console.log(`STALE: next ${t.next} <= latest ${t.latest}; maintainer runs: npm dist-tag rm ${pkg} next`);
      process.exit(1);
    }'; then stale=1; fi
done
exit $stale
