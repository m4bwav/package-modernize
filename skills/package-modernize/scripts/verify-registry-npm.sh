#!/usr/bin/env bash
# Verify a published npm version from the registry side in one call (package-modernize, Phases 5 and 6, after the approval).
# Usage: verify-registry-npm.sh PACKAGE VERSION [OWNER/REPO]
# Prints: dist-tags; whether VERSION exists, its provenance predicate and any deprecation message on it; a scratch install
# with `npm audit signatures` and a require()/import smoke line plus the bin's --version; with OWNER/REPO, the GitHub Release
# and a verify-published.yml run for VERSION through watch-run.sh. Exit 1 if any check fails. Read-only on the registry.
set -u
PKG="${1:?usage: verify-registry-npm.sh PACKAGE VERSION [OWNER/REPO]}"
VERSION="${2:?version}"
REPO="${3:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
fail=0
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

echo "\$ npm view $PKG dist-tags"; npm view "$PKG" dist-tags
v=$(npm view "$PKG@$VERSION" version 2>/dev/null)
[ "$v" = "$VERSION" ] && echo "PASS  $PKG@$VERSION is on the registry" || bad "$PKG@$VERSION not found"
pred=$(npm view "$PKG@$VERSION" dist.attestations.provenance.predicateType 2>/dev/null)
[ -n "$pred" ] && echo "PASS  provenance $pred" || bad "no provenance attestation on $VERSION"
dep=$(npm view "$PKG@$VERSION" deprecated 2>/dev/null)
[ -z "$dep" ] && echo "PASS  $VERSION is not deprecated" || bad "$VERSION is deprecated: $dep"

scratch=$(mktemp -d)
( cd "$scratch" && npm init -y >/dev/null && npm i -s "$PKG@$VERSION" >/dev/null 2>&1 ) || bad "npm install $PKG@$VERSION in $scratch"
audit=$(cd "$scratch" && npm audit signatures 2>&1)
echo "$audit" | grep -q "verified registry signature" && echo "PASS  registry signature verified" || bad "npm audit signatures: $(echo "$audit" | tail -3 | tr '\n' ' ')"
echo "$audit" | grep -q "verified attestation" && echo "PASS  attestation verified" || bad "no verified attestation"
(cd "$scratch" && node -e "const m=require('$PKG');console.log('SMOKE require:', typeof m, Object.keys(m).slice(0,6).join(','))" 2>&1) | tail -1
(cd "$scratch" && node --input-type=module -e "const m=await import('$PKG');console.log('SMOKE import:', Object.keys(m).slice(0,6).join(','))" 2>&1) | tail -1
bins=$(cd "$scratch" && node -e "const p=require('./node_modules/$PKG/package.json');const b=typeof p.bin==='string'?[p.name]:Object.keys(p.bin||{});console.log(b.join(' '))")
for b in $bins; do out=$(cd "$scratch" && npx --no-install "$b" --version 2>&1 | tail -1); echo "SMOKE bin $b --version: $out"; done
rm -rf "$scratch"

if [ -n "$REPO" ]; then
  gh release view "v$VERSION" -R "$REPO" --json tagName,isPrerelease,isDraft,url \
    --jq '"PASS  release \(.tagName) prerelease=\(.isPrerelease) draft=\(.isDraft) \(.url)"' 2>/dev/null || bad "no GitHub Release v$VERSION"
  if gh api "repos/$REPO/contents/.github/workflows/verify-published.yml" >/dev/null 2>&1; then
    bash "$HERE/watch-run.sh" "$REPO" verify-published.yml --dispatch "version=$VERSION" || bad "verify-published.yml for $VERSION"
  fi
fi
[ $fail -eq 0 ] && echo "VERIFIED $PKG@$VERSION" || echo "NOT VERIFIED"
exit $fail
