# Handoff

Updated 2026-09-26, evening: the continuation's A to D are done (C-20260926-7 to -9). Before that, 2026-09-26: is-an-image-url released and five scripts added. Earlier, 2026-09-25: the skill is public at github.com/m4bwav/package-modernize (created 2026-09-25 with the maintainer's OK) and its first real run, on replace-string-at-position, has reached the plan-review stop. The run fixed the skill as C-20260925-3. Read [log.md](log.md) for evidence and the decision entry under decisions/ for the layout.

Updated 2026-09-30: the SKILL.md body was split into on-demand references (8,883 -> 3,988 tokens; C-20260930-1, branch skill-slimming, PR for the maintainer). Each phase's "Read first" cell names the files to read; new run lessons go into those references or the system's reference, and the body should stay under 4,000 tokens (after compaction only an invoked skill's first 5,000 tokens come back). `evals/run-headless.mjs --skill-dir DIR` tests a branch without moving the installed junction (T-20260930-1, L-147).

## Current state

- `skills/package-modernize/`: SKILL.md (eight phases, shared checklists, per-system table, tools and prior art), references (npm complete; nuget from two runs plus docs; pypi, crates, maven, go unverified; plan-skeleton), scripts (survey-npm, survey-nuget, survey-github, two golden-capture templates, check-line-endings, check-readme-images, check-workflow-shell, check-golden-untouched, preflight-tag-npm, watch-run, verify-registry-npm, post-merge-cleanup), templates/npm (with test/golden/codec.cjs and .npmrc), templates/nuget and templates/rulesets, prompts (kickoff-skeleton, review-subagent), evergreen companions (tier fast; research checked 2026-09-26, next due 2026-10-05), evals with the headless harness (10 cases; pad-lite fixture; `--selftest`, `--rejudge`).
- Installed through the junction `~/.claude/skills/package-modernize`. The private overlay is read from `~/.package-modernize/OVERLAY.md` (a junction into the maintainer's private companion repository).
- C-20260925-3: `survey-npm.sh` never reached its GitHub half when given OWNER/REPO (unbound variable), and eval action-1 could not see it; fixed, and the harness can now require output content (`and: file_contains`). The golden capture lost NaN, Infinity and -0 through a JSON round trip; `codec.cjs` fixes it. Dependents are listed by name; maintainers' emails are masked; lint traps documented.

## Standing work

0. 2026-09-26, evening: C-20260926-7 (canary and untouched recording as Phase 2 exit criteria; check-golden-untouched.sh; evals action-canary and action-golden-untouched, 3/3 each, baseline fails only the canary, L-033, L-034), C-20260926-8 (release.yml id-token job split, `--ignore-scripts`, .npmrc `min-release-age=3`, tag ruleset; decision in decisions/), C-20260926-9 (action pins with runtimes in survey-github.sh). Not yet proven by a real run: the split release.yml, the .npmrc, the tag ruleset JSON against the API, and the five scripts of C-20260926-6. The next run (stack-exchange-markdown-retriever, kickoff in the private companion repository's prompts/) is their first use.
0a. action-golden-untouched passes without the skill (L-034); redesign its fixture so the plan states the promise only generally, then re-baseline.
0b. Immutable releases (secure-npm-package) not decided: check how an immutable GitHub Release behaves when the staged npm version is rejected; at the 2026-10-05 refresh.

1. Runs done: replace-string-at-position 2.0.0 and is-an-image-url 2.0.0 (both 2026-09-25/26). Log each skill fix from the next run as a `C-` entry with the run's date.
2. action-1 re-graded 2/2 after the evidence change (T-20260925-2); a fresh run of it may copy webhook ids from the package repository's committed survey note, so re-baseline it on another package when convenient.
3. The NuGet templates `release.yml`, `verify-published.yml` and the new `ci.yml` are unverified until a .NET run uses them; the two existing .NET libraries are the candidates.
4. Future scope (maintainer, 2026-09-26): after the packages, the skill will be run on repositories that were never published (example sites). It needs a variant without the registry phases (5 and 6), where the golden capture is screenshots or recorded HTML and the outcome is a deploy or an archive; write it as a reference only after its first real run.
5. Refresh due 2026-10-05 (`evergreen-refresh`); the research tracks are in RESEARCH.md.

## Next single action

Paste the stack-exchange-markdown-retriever kickoff prompt from the private companion repository into a fresh session; log each script's first real use and fix what it gets wrong as a C- entry.

## Dead ends hit

- A `sed -i` replacement containing Windows paths dropped their backslashes; the Edit tool restored them (L-008 in the skill).
- A YAML value starting with a `{{PLACEHOLDER}}` token parses as a flow mapping; the template quotes it.
- The evergreen `init` did not append its Maintenance section because SKILL.md already mentioned evergreen.json; the section was written by hand.
- Renaming the skill junction for the baseline made this session's roster show a skill named `package-modernize.off`; move the junction out of the skills folder instead next time.
- `ls -R` hides the templates' dotfiles (`.github/`, `.gitignore`); list them with `find -name ".*"`.
