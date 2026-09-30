#!/usr/bin/env bash
# Set a .NET repository's version for a release or a rehearsal in one call (package-modernize, Phases 5 and 6):
# writes <Version> in Directory.Build.props (else the one project file that has it), regenerates the packages.lock.json
# files that record a project reference's version, reverts the ones that changed only in line endings, proves a
# locked restore, and checks the CHANGELOG heading. Prints the changed files; commits nothing.
# Usage: bump-version-dotnet.sh VERSION [REPO_DIR]    for example 2.0.0-beta.1
# Without the lock step, a locked restore fails with NU1004 after the bump, because a test project's lock file records
# its project reference as "[2.0.0, )"; finding and fixing that by hand cost four calls in FizzBuzzPlus (2026-09-29).
set -u
VERSION="${1:?usage: bump-version-dotnet.sh VERSION [REPO_DIR]}"
REPO_DIR="${2:-.}"
case "$VERSION" in
  v*) echo "bump-version-dotnet.sh: give the version without the leading v (${VERSION#v}); the tag is the one with the v" >&2; exit 2 ;;
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) echo "bump-version-dotnet.sh: '$VERSION' is not a semantic version" >&2; exit 2 ;;
esac
cd "$REPO_DIR" || exit 2
if [ -n "$(git status --porcelain)" ]; then
  echo "bump-version-dotnet.sh: the working tree has changes; commit or stash them first" >&2
  exit 2
fi

if grep -q '<Version>' Directory.Build.props 2> /dev/null; then
  file=Directory.Build.props
else
  mapfile -t files < <(git ls-files '*.csproj' '*.fsproj' '*.vbproj' | xargs grep -l '<Version>' 2> /dev/null)
  if [ "${#files[@]}" -ne 1 ]; then
    echo "bump-version-dotnet.sh: no <Version> in Directory.Build.props and ${#files[@]} project files with one (${files[*]:-none}); set it by hand" >&2
    exit 2
  fi
  file="${files[0]}"
fi
old="$(sed -n 's:.*<Version>\([^<]*\)</Version>.*:\1:p' "$file" | head -1)"
if [ "$old" = "$VERSION" ]; then
  echo "$file already has <Version>$VERSION</Version>"
else
  sed -i "s:<Version>[^<]*</Version>:<Version>$VERSION</Version>:" "$file"
  echo "$file: <Version> $old -> $VERSION"
fi

status=0
if git ls-files | grep -q 'packages.lock.json$'; then
  if ! dotnet restore --force-evaluate > /dev/null 2>&1; then
    echo "dotnet restore --force-evaluate FAILED; run it to see why" >&2
    exit 1
  fi
  # restore rewrites every lock file with CRLF on Windows; keep only the ones whose content changed
  while IFS= read -r lock; do
    if git -c core.safecrlf=false diff --quiet -- "$lock"; then git checkout -q -- "$lock"; else echo "lock file updated: $lock"; fi
  done < <(git -c core.safecrlf=false ls-files -m -- '*packages.lock.json' | sort -u)
  if dotnet restore --locked-mode > /dev/null 2>&1; then
    echo "dotnet restore --locked-mode: ok"
  else
    echo "dotnet restore --locked-mode: FAILED after the update" >&2
    status=1
  fi
fi

base="${VERSION%%-*}"
if [ -f CHANGELOG.md ]; then
  if ! grep -q "^## \[$base\]" CHANGELOG.md; then
    echo "CHANGELOG.md: no '## [$base]' section; release notes come from it" >&2
    status=1
  elif [ "$VERSION" = "$base" ] && ! grep -Eq "^## \[$base\] - [0-9]{4}-[0-9]{2}-[0-9]{2}" CHANGELOG.md; then
    echo "CHANGELOG.md: the heading for $base needs its release date (## [$base] - YYYY-MM-DD)" >&2
    status=1
  else
    echo "CHANGELOG.md: section [$base] present"
  fi
fi

git -c core.safecrlf=false status --short
if [ "$status" = 0 ]; then echo "READY: commit, pull request, green ci on the default branch, then tag v$VERSION"; fi
exit "$status"
