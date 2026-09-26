# Tests: package-modernize

Test runs for [SKILL.md](SKILL.md). Cases live in `evals/evals.json`; `evals/run-headless.mjs` runs them through the Claude Code CLI (`claude -p --output-format stream-json`), one fresh scratch directory per run, and judges on evidence: the Skill tool call in the trace for triggers and decoys, the survey script call in the trace for the action case, regexes over the written file for the outcome case. A failure that taught something is a lesson in [LEARNINGS.md](LEARNINGS.md); a fix it caused is logged in [CHANGELOG.md](CHANGELOG.md) with `because: T-...`; research it triggered is in [RESEARCH.md](RESEARCH.md); counts and the failing list are in `evergreen.json` under `tests`. Rules: [MAINTENANCE.md](MAINTENANCE.md) (testing section) and the plugin's `protocol/TESTING.md`.

A test passes on evidence (a tool call in the trace, a file, a marker, a log line), never on the transcript's claim that something was done.

Entry shape: `### T-YYYYMMDD-n · date · harness · env · passed/total`, then one line per failing case (`id · kind · class · what the evidence showed`), then `led to:` (L-, C-, R- ids or none). Newest first. Budget 150 lines; archive older runs to `TESTS-ARCHIVE.md`.

## Runs

### T-20260925-1 · 2026-09-25 · claude -p stream-json (evals/run-headless.mjs) · Windows 11, Claude Code 2.1.281 · 8/8
- Three passes in one evening. Baseline first, with the skill junction renamed away: `outcome-1` failed without the skill (a table without the required header), `action-1` passed without it (survey.txt written from ad hoc `gh api` and `curl` calls in 155 s), so its file evidence was dropped and the survey script call in the trace is now the only evidence.
- Pass 1 (6/8): triggers 9/9 invoked, decoys 0/9 invoked; `action-1` 2/3 and `outcome-1` 0/3, but three of the four failing runs ended with the account's session usage limit ("You've hit your session limit"), class `environment`; the fourth showed the skill globbing for the overlay junction and finding nothing.
- Pass 2 (7/8, after the limit reset and a shorter description): `action-1` 3/3 on the trace (skill invoked 3/3, about 260 s each); `outcome-1` 0/3 with the skill never invoked on "write only the decisions table", class `undertrigger`.
- Pass 3 (7/7 of the re-run cases, after adding "asks for a modernization plan, survey or decisions table for a package" to the description and phrasing the case as a maintainer would): `outcome-1` 3/3 with the skill invoked 3/3; triggers 9/9; decoys 0/9. Trigger results come from headless CLI sessions, a proxy for the interactive loop. Untested elsewhere (no second operating system reachable tonight).
- led to: L-013 (junction not seen by Glob; usage-limit replies), C-20260925-2 (Step 0 wording, description, the action case's evidence)
