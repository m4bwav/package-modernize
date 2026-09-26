#!/usr/bin/env bash
# Phase 4 cleanup after the rewrite's pull request merges (package-modernize). Dry run by default: prints every GitHub
# write it would make, so the maintainer can give one go for the whole list (L-028); --apply makes them.
# Usage: post-merge-cleanup.sh OWNER/REPO PR_NUMBER DISPOSITIONS_FILE [--apply] [--ruleset-from OWNER/REPO/RULESET_ID]
# DISPOSITIONS_FILE: one line per action, tab-separated, `#` comments allowed; {SHA} becomes the merge commit (7 chars):
#   pr<TAB>17<TAB>Closed by the 2.0.0 rewrite ({SHA}): ...     close with that comment and delete its branch
#   branch<TAB>mime-issue                                      delete a branch with no pull request
#   hook<TAB>14564187                                          delete a webhook
# Refuses to close anything while Dependabot alerts are open (the regenerated lockfile should have cleared them).
set -u
REPO="${1:?usage: post-merge-cleanup.sh OWNER/REPO PR_NUMBER DISPOSITIONS_FILE [--apply] [--ruleset-from OWNER/REPO/ID]}"
PR="${2:?merged pull request number}"
FILE="${3:?dispositions file}"
shift 3
APPLY=0; RULESET_FROM=""
while [ $# -gt 0 ]; do
  case "$1" in
    --apply) APPLY=1 ;;
    --ruleset-from) shift; RULESET_FROM="${1:-}" ;;
  esac
  shift
done
do_or_say() { if [ $APPLY -eq 1 ]; then echo "\$ $*"; "$@" 2>&1 | tail -1; else echo "would run: $*"; fi; }

state=$(gh pr view "$PR" -R "$REPO" --json state,mergeCommit,mergedAt --jq '"\(.state) \(.mergeCommit.oid // "") \(.mergedAt // "")"')
read -r pr_state sha merged_at <<<"$state"
[ "$pr_state" = "MERGED" ] || { echo "pull request #$PR is $pr_state, not merged; stop"; exit 1; }
parents=$(gh api "repos/$REPO/commits/$sha" --jq '.parents | length')
[ "$parents" = "2" ] && method="merge commit" || method="squash or rebase"
SHORT="${sha:0:7}"
echo "merged $merged_at as $method: $sha (comments use $SHORT)"

alerts=$(gh api "repos/$REPO/dependabot/alerts?state=open&per_page=100" --paginate --jq length 2>/dev/null | awk '{s+=$1} END {print s+0}')
echo "open Dependabot alerts: $alerts"
[ "$alerts" = "0" ] || { echo "alerts are not 0; closing the bot pull requests would hide real work; stop"; exit 1; }

while IFS=$'\t' read -r kind arg comment; do
  case "$kind" in ''|'#'*) continue ;; esac
  case "$kind" in
    pr) do_or_say gh pr close "$arg" -R "$REPO" --delete-branch --comment "${comment//\{SHA\}/$SHORT}" ;;
    branch) do_or_say gh api -X DELETE "repos/$REPO/git/refs/heads/$arg" ;;
    hook) do_or_say gh api -X DELETE "repos/$REPO/hooks/$arg" ;;
    *) echo "unknown disposition '$kind' (pr, branch, hook)" ;;
  esac
done < "$FILE"

if [ -n "$RULESET_FROM" ]; then
  if [ "$(gh api "repos/$REPO/rulesets" --jq length)" != "0" ]; then
    echo "rulesets already present: $(gh api "repos/$REPO/rulesets" --jq '[.[] | "\(.id) \(.name)"] | join(", ")')"
  else
    src_repo="${RULESET_FROM%/*}"; src_id="${RULESET_FROM##*/}"
    body=$(mktemp)
    gh api "repos/$src_repo/rulesets/$src_id" --jq '{name,target,enforcement,conditions,bypass_actors,rules}' > "$body"
    if [ $APPLY -eq 1 ]; then echo "\$ gh api -X POST repos/$REPO/rulesets (copy of $RULESET_FROM)"; gh api -X POST "repos/$REPO/rulesets" --input "$body" --jq '"ruleset \(.id) \(.name) \(.enforcement)"'
    else echo "would create a ruleset on $REPO copied from $RULESET_FROM: $(tr -d '\n' < "$body" | cut -c1-160)..."; fi
    rm -f "$body"
  fi
fi

if [ $APPLY -eq 1 ]; then
  echo "open pull requests: $(gh pr list -R "$REPO" -s open --json number --jq length)"
  echo "branches: $(gh api "repos/$REPO/branches" --paginate --jq '.[].name' | tr '\n' ' ')"
  echo "webhooks: $(gh api "repos/$REPO/hooks" --jq length)"
else
  echo "dry run only; add --apply after the maintainer's go"
fi
