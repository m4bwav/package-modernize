#!/usr/bin/env bash
# Watch one GitHub Actions run and print only what the log needs (package-modernize, Phases 2 to 6).
# Usage: watch-run.sh OWNER/REPO WORKFLOW_FILE [RUN_ID] [--dispatch KEY=VALUE ...]
#   no RUN_ID: the newest run of WORKFLOW_FILE created in the last 3 minutes (after a push or a tag), waited for up to 60 s
#   --dispatch: start the workflow first (gh workflow run -f KEY=VALUE ...), then watch that run
# Prints: run id and url, one line per job, then on failure the last 40 lines of each failed step (timestamps and colours
# stripped), on success the lines that are evidence (stage id, staging tag, provenance, release url). Exit 0 only on success.
# Replaces the gh run list / watch / view --log / grep chain that cost six calls per release in the is-an-image-url run.
set -u
REPO="${1:?usage: watch-run.sh OWNER/REPO WORKFLOW_FILE [RUN_ID] [--dispatch KEY=VALUE ...]}"
WF="${2:?workflow file, for example release.yml}"
# Swapped or missing arguments used to cost twelve identical gh errors and a minute before "no run" (L-136).
case "$REPO" in
  */*) ;;
  *) echo "watch-run.sh: the first argument must be OWNER/REPO, got '$REPO' (usage: watch-run.sh OWNER/REPO WORKFLOW_FILE [RUN_ID])" >&2; exit 2 ;;
esac
case "$WF" in
  *.yml|*.yaml) ;;
  *) echo "watch-run.sh: the second argument must be a workflow file such as release.yml, got '$WF'" >&2; exit 2 ;;
esac
shift 2
RUN_ID=""
DISPATCH=()
while [ $# -gt 0 ]; do
  case "$1" in
    --dispatch) shift; while [ $# -gt 0 ] && [ "${1#--}" = "$1" ]; do DISPATCH+=(-f "$1"); shift; done ;;
    *) RUN_ID="$1"; shift ;;
  esac
done

if [ ${#DISPATCH[@]} -gt 0 ]; then
  echo "\$ gh workflow run $WF -R $REPO ${DISPATCH[*]}"
  gh workflow run "$WF" -R "$REPO" "${DISPATCH[@]}" || exit 1
fi

if [ -z "$RUN_ID" ]; then
  since=$(date -u -d '-3 minutes' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-3M +%Y-%m-%dT%H:%M:%SZ)
  for _ in $(seq 1 12); do
    RUN_ID=$(gh run list -R "$REPO" -w "$WF" -L 5 --json databaseId,createdAt \
      --jq "[.[] | select(.createdAt >= \"$since\")][0].databaseId // empty")
    [ -n "$RUN_ID" ] && break
    sleep 5
  done
  [ -n "$RUN_ID" ] || { echo "no run of $WF started since $since"; exit 1; }
fi

echo "run $RUN_ID https://github.com/$REPO/actions/runs/$RUN_ID"
gh run watch "$RUN_ID" -R "$REPO" --exit-status >/dev/null 2>&1
# gh run watch has exited non-zero while the run was still in progress (a dispatched verify-published run, 2026-09-29,
# L-133), so the verdict is the run's conclusion once it is completed; watch again until then, and stop on a gh error.
for _ in 1 2 3 4 5 6; do
  state=$(gh run view "$RUN_ID" -R "$REPO" --json status --jq .status 2>/dev/null)
  [ "$state" = completed ] || [ -z "$state" ] && break
  gh run watch "$RUN_ID" -R "$REPO" >/dev/null 2>&1 || sleep 20
done
conclusion=$(gh run view "$RUN_ID" -R "$REPO" --json conclusion --jq .conclusion 2>/dev/null)
[ "$conclusion" = success ] && status=0 || status=1
gh run view "$RUN_ID" -R "$REPO" --json conclusion,jobs \
  --jq '"conclusion: \(.conclusion)", (.jobs[] | "  \(.conclusion // .status)  \(.name)")'

# gh prints colours as ESC codes or as literal ^[[..m text, and the first line can carry a byte-order mark; the step's own
# script lines (colour 36;1) and the runner image line are not evidence.
strip() {
  sed -E 's/^[^\t]*\t[^\t]*\t//; s/^\xEF\xBB\xBF//; s/^[0-9T:.-]+Z //' \
    | grep -v -E '\[36;1m|runner-images|^shell: ' \
    | sed -E 's/\x1b\[[0-9;]*m//g; s/\^\[\[[0-9;]*m//g' \
    | grep -v -E '^\s*$|^##\[(group|endgroup)\]'
}
if [ "$status" -ne 0 ]; then
  echo "--- failed steps (last 40 lines) ---"
  gh run view "$RUN_ID" -R "$REPO" --log-failed 2>/dev/null | strip | tail -40
else
  gh run view "$RUN_ID" -R "$REPO" --log 2>/dev/null | strip \
    | grep -E 'staged with id|Staging to|Provenance statement published|Published|/releases/tag/|\+ [@a-z0-9._/-]+@[0-9]' | sort -u
fi
exit "$status"
