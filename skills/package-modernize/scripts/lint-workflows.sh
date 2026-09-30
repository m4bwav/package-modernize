#!/usr/bin/env bash
# Lint a repository's GitHub workflows in one call (package-modernize, whenever a workflow changes): actionlint with
# shellcheck, check-workflow-shell.py and zizmor offline. Prints one line per tool and the findings only on failure.
# Usage: lint-workflows.sh [REPO_DIR]   (default: the current directory)
# Tools come from PATH, else from a cache outside every repository (PACKAGE_MODERNIZE_TOOLS, default
# ~/.cache/package-modernize/tools), else are downloaded into it once from the pinned GitHub releases below and checked
# against the sha256 digests GitHub publishes for them. zizmor runs through uvx at a pinned version.
# Replaces the find-the-binaries, actionlint, check-workflow-shell and zizmor chain that cost four to six calls per
# workflow change, and the hunt through old scratchpads for a copy of actionlint (FizzBuzzPlus Phase 5, 2026-09-29).
set -u
REPO_DIR="${1:-.}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOLS="${PACKAGE_MODERNIZE_TOOLS:-$HOME/.cache/package-modernize/tools}"
ACTIONLINT_VERSION=1.7.12
SHELLCHECK_VERSION=0.11.0
ZIZMOR_VERSION=1.30.1

if [ ! -d "$REPO_DIR/.github/workflows" ]; then
  echo "lint-workflows.sh: no .github/workflows in $REPO_DIR" >&2
  exit 2
fi

case "$(uname -s)-$(uname -m)" in
  MINGW*-x86_64|MSYS*-x86_64|CYGWIN*-x86_64) PLATFORM=windows-x64; EXE=.exe ;;
  Linux-x86_64) PLATFORM=linux-x64; EXE= ;;
  Darwin-arm64) PLATFORM=darwin-arm64; EXE= ;;
  *) PLATFORM=unknown; EXE= ;;
esac

# asset name and sha256 per tool and platform (from the GitHub releases API's digest field, 2026-09-29)
asset_for() {
  case "$1-$PLATFORM" in
    actionlint-windows-x64) echo "actionlint_${ACTIONLINT_VERSION}_windows_amd64.zip 6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9" ;;
    actionlint-linux-x64) echo "actionlint_${ACTIONLINT_VERSION}_linux_amd64.tar.gz 8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8" ;;
    actionlint-darwin-arm64) echo "actionlint_${ACTIONLINT_VERSION}_darwin_arm64.tar.gz aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f" ;;
    shellcheck-windows-x64) echo "shellcheck-v${SHELLCHECK_VERSION}.zip 8a4e35ab0b331c85d73567b12f2a444df187f483e5079ceffa6bda1faa2e740e" ;;
    shellcheck-linux-x64) echo "shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.gz b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6" ;;
    shellcheck-darwin-arm64) echo "shellcheck-v${SHELLCHECK_VERSION}.darwin.aarch64.tar.gz 339b930feb1ea764467013cc1f72d09cd6b869ebf1013296ba9055ab2ffbd26f" ;;
  esac
}

sha256_of() {
  if command -v sha256sum > /dev/null; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

# Prints the path of the tool, downloading it into $TOOLS when it is neither on PATH nor cached.
resolve() {
  local tool="$1" url_base="$2" found asset digest tmp bin
  found="$(command -v "$tool" 2> /dev/null)"
  if [ -n "$found" ]; then echo "$found"; return 0; fi
  if [ -x "$TOOLS/$tool$EXE" ]; then echo "$TOOLS/$tool$EXE"; return 0; fi
  read -r asset digest <<< "$(asset_for "$tool")"
  if [ -z "${asset:-}" ]; then
    echo "lint-workflows.sh: no pinned $tool build for $PLATFORM; install it on PATH" >&2
    return 1
  fi
  mkdir -p "$TOOLS"
  tmp="$(mktemp -d)"
  if ! curl -fsSL -o "$tmp/$asset" "$url_base/$asset"; then
    echo "lint-workflows.sh: download failed: $url_base/$asset" >&2
    rm -rf "$tmp"; return 1
  fi
  if [ "$(sha256_of "$tmp/$asset")" != "$digest" ]; then
    echo "lint-workflows.sh: sha256 of $asset does not match the pinned digest; not installed" >&2
    rm -rf "$tmp"; return 1
  fi
  case "$asset" in
    *.zip) unzip -q -o "$tmp/$asset" -d "$tmp/x" ;;
    *) mkdir -p "$tmp/x" && tar -xzf "$tmp/$asset" -C "$tmp/x" ;;
  esac
  bin="$(find "$tmp/x" -type f -name "$tool$EXE" | head -1)"
  if [ -z "$bin" ]; then
    echo "lint-workflows.sh: $tool$EXE not found inside $asset" >&2
    rm -rf "$tmp"; return 1
  fi
  cp "$bin" "$TOOLS/$tool$EXE" && chmod +x "$TOOLS/$tool$EXE"
  rm -rf "$tmp"
  echo "lint-workflows.sh: installed $tool$EXE in $TOOLS (sha256 checked)" >&2
  echo "$TOOLS/$tool$EXE"
}

status=0
out="$(mktemp)"
trap 'rm -f "$out"' EXIT

ACTIONLINT="$(resolve actionlint "https://github.com/rhysd/actionlint/releases/download/v$ACTIONLINT_VERSION")" || status=1
SHELLCHECK="$(resolve shellcheck "https://github.com/koalaman/shellcheck/releases/download/v$SHELLCHECK_VERSION")" || status=1

if [ -n "${ACTIONLINT:-}" ] && [ -n "${SHELLCHECK:-}" ]; then
  # Files named explicitly: with none, actionlint looks for the git repository and fails outside one.
  if (cd "$REPO_DIR" && find .github/workflows -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) -print0 \
      | xargs -0 "$ACTIONLINT" -shellcheck "$SHELLCHECK") > "$out" 2>&1; then
    echo "actionlint $("$ACTIONLINT" -version | head -1) with shellcheck: clean"
  else
    echo "actionlint: FINDINGS"; cat "$out"; status=1
  fi
else
  echo "actionlint: NOT RUN (tool missing)"; status=1
fi

if (cd "$REPO_DIR" && PATH="$(dirname "${SHELLCHECK:-/nonexistent}"):$PATH" python "$HERE/check-workflow-shell.py") > "$out" 2>&1; then
  # the block counts show the check saw the files (given a file instead of a directory, it checks nothing)
  echo "check-workflow-shell.py: clean ($(grep -Eo '[0-9]+ run blocks? checked' "$out" | awk '{n += $1} END {print n + 0}') run blocks)"
else
  echo "check-workflow-shell.py: FINDINGS"; cat "$out"; status=1
fi

if command -v uvx > /dev/null; then
  if (cd "$REPO_DIR" && uvx "zizmor@$ZIZMOR_VERSION" --offline --no-progress .github/workflows) > "$out" 2>&1; then
    echo "zizmor $ZIZMOR_VERSION offline: $(grep -E '^No findings|suppressed' "$out" | tail -1)"
  else
    echo "zizmor $ZIZMOR_VERSION offline: FINDINGS"; grep -v ' INFO ' "$out"; status=1
  fi
else
  echo "zizmor: NOT RUN (uvx not on PATH)"; status=1
fi

if [ "$status" = 0 ]; then echo "WORKFLOWS CLEAN"; else echo "WORKFLOWS NOT CLEAN"; fi
exit "$status"
