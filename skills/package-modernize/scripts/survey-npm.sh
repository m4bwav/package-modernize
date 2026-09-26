#!/usr/bin/env bash
# Survey an npm package before planning (package-modernize, Phase 0). Read-only: registry and GitHub queries only.
# Usage: survey-npm.sh PACKAGE [OWNER/REPO]   (the repo defaults to the one in the registry's repository.url)
# Needs: npm, curl, gh (logged in). Redirect into ai-docs/notes/ and cite it from the plan's survey table.
set -u
PKG="${1:?usage: survey-npm.sh PACKAGE [OWNER/REPO]}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

section() { printf '\n## %s\n$ %s\n' "$1" "$2"; }
run() { section "$1" "$2"; eval "$2" 2>&1 || printf '(command failed: exit %s)\n' "$?"; }

printf '# npm survey: %s (%s)\n' "$PKG" "$(date -u +%Y-%m-%dT%H:%MZ)"

run "Registry metadata" "npm view $PKG name version dist-tags time.created time.modified license author repository.url homepage main module types exports bin engines dependencies peerDependencies deprecated"
run "All published versions with dates" "npm view $PKG time --json"
run "Attestations and signatures on the latest version" "npm view $PKG dist.attestations dist.signatures --json"
# Email addresses masked: this output is committed to the package's public ai-docs.
run "Maintainers (emails masked)" "npm view $PKG maintainers --json | sed -E 's/ <[^>]*>/ <email>/'"
run "Downloads, last month" "curl -s https://api.npmjs.org/downloads/point/last-month/$PKG"
run "Downloads, last year by month" "curl -s \"https://api.npmjs.org/downloads/range/last-year/$PKG\" | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const m={};for(const {day,downloads} of JSON.parse(s).downloads){const k=day.slice(0,7);m[k]=(m[k]||0)+downloads}console.log(m)})'"
run "Dependents (registry search; npmjs.com shows the list)" "curl -s \"https://registry.npmjs.org/-/v1/search?text=$PKG&size=1\" | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=JSON.parse(s);console.log(JSON.stringify({total:r.total, first:r.objects[0]?.package?.name, dependents: r.objects[0]?.dependents ?? \"(see https://www.npmjs.com/browse/depended/$PKG)\"}))})'"
run "Dependents by name: public repositories whose package.json names it (the registry gives only a count)" "gh search code \"\\\"$PKG\\\"\" --filename package.json --json repository --jq '.[].repository.nameWithOwner' --limit 50 2>&1 | sort -u"
run "Tarball file list of the published version" "npm pack $PKG --dry-run --json 2>/dev/null | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const [p]=JSON.parse(s);console.log(p.size+\" bytes, \"+p.entryCount+\" files\");for(const f of p.files)console.log(\" \"+f.path+\" \"+f.size)})'"

section "Runtime dependencies: how far behind" "npm view <dep> version time.modified deprecated"
deps=$(npm view "$PKG" dependencies --json 2>/dev/null)
if [ -n "$deps" ] && [ "$deps" != "null" ]; then
  echo "$deps" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const [n,r] of Object.entries(JSON.parse(s)))console.log(n+" "+r)})' | while read -r dep range; do
    latest=$(npm view "$dep" version 2>/dev/null); modified=$(npm view "$dep" time.modified 2>/dev/null); deprecated=$(npm view "$dep" deprecated 2>/dev/null)
    printf '%s: wanted %s, latest %s (modified %s)%s\n' "$dep" "$range" "$latest" "${modified:0:10}" "${deprecated:+, DEPRECATED: $deprecated}"
  done
else
  echo "(no runtime dependencies)"
fi

REPO="${2:-}"
url=""
if [ -z "$REPO" ]; then
  url=$(npm view "$PKG" repository.url 2>/dev/null)
  REPO=$(printf '%s' "$url" | sed -E 's#.*github\.com[:/]([^/]+/[^/.]+)(\.git)?.*#\1#')
fi
if [ -n "$REPO" ] && [ "$REPO" != "$url" ]; then
  printf '\n# GitHub side (%s)\n' "$REPO"
  bash "$HERE/survey-github.sh" "$REPO"
else
  printf '\n(no GitHub repository found in repository.url; pass OWNER/REPO as the second argument)\n'
fi

printf '\n## Next: in the clone\n'
printf -- '- Read every source and test file, package.json, the build config, the README and every dotfile.\n'
printf -- '- Leaked credentials: .travis.yml, .npmrc, .env, workflows, and history (git log -S TOKEN_NAME).\n'
printf -- '- Run the old build and tests as they are (Windows: npm --script-shell "C:/Program Files/Git/bin/bash.exe" test for ./node_modules/.bin scripts).\n'
printf -- '- Then the golden capture from the PUBLISHED version in a scratch project (scripts/golden-capture-npm.template.cjs).\n'
