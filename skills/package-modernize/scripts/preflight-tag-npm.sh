#!/usr/bin/env bash
# Check that a version is safe to tag before `npm version X` and `git push --follow-tags` (package-modernize, Phases 5 and 6).
# Usage: preflight-tag-npm.sh VERSION [REPO_DIR]     (run from anywhere; REPO_DIR defaults to .)
# Checks, in order: clean tree on the default branch and level with origin; tag vVERSION free locally and on origin;
# CHANGELOG.md has a `## [BASE]` heading (BASE = VERSION without the prerelease part; a release needs a date, a bare
# `## [Unreleased]` is not found by release.yml); then the package's own lint, typecheck, check and test scripts; then the
# golden recording (check-golden-untouched.sh); xo's cache is cleared before the lint (L-040); then the shell in every workflow (check-workflow-shell.py). Prints PASS or FAIL per check; exit 1 on any FAIL.
# Written after is-an-image-url burned 2.0.0-beta.1 (no changelog section) and beta.2 (lint on the heading fix) (L-029).
set -u
VERSION="${1:?usage: preflight-tag-npm.sh VERSION [REPO_DIR]}"
DIR="${2:-.}"
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="${VERSION%%-*}"
fail=0
pass() { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

git -C "$DIR" fetch -q origin --tags 2>/dev/null
branch=$(git -C "$DIR" rev-parse --abbrev-ref HEAD)
default=$(git -C "$DIR" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
[ -z "$default" ] && default=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null)
[ "$branch" = "$default" ] && pass "on the default branch ($branch)" || bad "on $branch, not the default branch ($default)"
[ -z "$(git -C "$DIR" status --porcelain)" ] && pass "working tree clean" || bad "uncommitted changes: $(git -C "$DIR" status --porcelain | head -3 | tr '\n' ' ')"
[ "$(git -C "$DIR" rev-parse HEAD)" = "$(git -C "$DIR" rev-parse "origin/$branch" 2>/dev/null)" ] && pass "level with origin/$branch" || bad "HEAD differs from origin/$branch (push or pull first)"
if git -C "$DIR" rev-parse -q --verify "refs/tags/v$VERSION" >/dev/null || git -C "$DIR" ls-remote --exit-code --tags origin "v$VERSION" >/dev/null 2>&1; then
  bad "tag v$VERSION already exists (pick the next prerelease number)"
else
  pass "tag v$VERSION is free"
fi

cl="$DIR/CHANGELOG.md"
if [ ! -f "$cl" ]; then
  bad "no CHANGELOG.md"
else
  esc=$(printf '%s' "$BASE" | sed 's/\./\\./g')
  if grep -Eq "^## \[$esc\]" "$cl"; then
    pass "CHANGELOG.md has a ## [$BASE] section"
    if [ "$VERSION" = "$BASE" ]; then
      grep -Eq "^## \[$esc\] - [0-9]{4}-[0-9]{2}-[0-9]{2}" "$cl" && pass "the ## [$BASE] heading is dated" || bad "the ## [$BASE] heading has no date (a release needs ## [$BASE] - YYYY-MM-DD)"
    fi
    grep -Eq "^\[$esc\]: " "$cl" && pass "link definition [$BASE]: present" || printf 'WARN  no [%s]: link definition (fine if the heading has no link)\n' "$BASE"
  else
    bad "CHANGELOG.md has no ## [$BASE] heading (release.yml takes the notes from it; rename ## [Unreleased] to ## [$BASE] - Unreleased and its link definition too)"
  fi
fi

# xo caches per file and its cache can predate an edit, so a stale cache passes locally what CI fails (L-040).
rm -rf "$DIR/node_modules/.cache/xo-linter" "$DIR/node_modules/.cache/eslint"
scripts=$(node -e "const p=require(require('path').resolve('$DIR','package.json'));console.log(Object.keys(p.scripts||{}).join(' '))" 2>/dev/null)
for s in lint typecheck check test; do
  case " $scripts " in
    *" $s "*)
      if (cd "$DIR" && npm run -s "$s" >"${TMPDIR:-/tmp}/preflight-$s.log" 2>&1); then pass "npm run $s"
      else bad "npm run $s (last lines below)"; tail -15 "${TMPDIR:-/tmp}/preflight-$s.log" | sed 's/^/      /'; fi ;;
  esac
done

if [ -d "$DIR/test/golden" ]; then
  if bash "$HERE/check-golden-untouched.sh" "$DIR" >"${TMPDIR:-/tmp}/preflight-golden.log" 2>&1; then pass "golden recording unchanged since it was committed"
  else bad "golden recording edited"; grep '^FAIL' "${TMPDIR:-/tmp}/preflight-golden.log" | sed 's/^/      /'; fi
fi

if [ -d "$DIR/.github/workflows" ]; then
  if python "$HERE/check-workflow-shell.py" "$DIR" >"${TMPDIR:-/tmp}/preflight-wf.log" 2>&1; then pass "workflow shell (shellcheck)"
  else bad "workflow shell"; grep -v 'run blocks checked' "${TMPDIR:-/tmp}/preflight-wf.log" | head -20 | sed 's/^/      /'; fi
fi

[ $fail -eq 0 ] && echo "READY: npm version $VERSION && git push --follow-tags origin $branch" || echo "NOT READY"
exit $fail
