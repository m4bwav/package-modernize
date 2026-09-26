# Log

Append-only. One line per operation: `## [YYYY-MM-DD] op | title` where op is one of add, update, supersede, verify, verify-failed, prune, handoff, index. Newest at the bottom. Never edited, only appended; this is the history the entries themselves do not carry.

## [2026-09-25] init | scaffolded
## [2026-09-25] add | skill scaffolded: SKILL.md, 6 references, scripts, npm and NuGet templates, prompts, evergreen unit (tier fast, due 2026-10-09), evals suite; junction ~/.claude/skills/package-modernize; evergreen links and lint OK
## [2026-09-25] index | rebuilt (0 entries)
## [2026-09-25] add | decision: Skill layout: public skill repository, private overlay, eight phases, one reference per system, tier fast
## [2026-09-25] handoff | 27 lines
## [2026-09-25] verify | eval suite 8/8 (T-20260925-1): triggers 9/9, decoys 0/9 invoked, action 3/3 on the survey script call, outcome 3/3; description tuned (C-20260925-2)
## [2026-09-25] index | rebuilt (1 entries)
## [2026-09-25] update | GitHub repository created 2026-09-25 (public, maintainer's OK) after a grep for private details; master pushed
## [2026-09-25] update | C-20260925-3 from the first real run (replace-string-at-position Phases 0 and 1): survey-npm.sh unbound variable fixed and rerun end to end (exit 0, 172 lines, both dependents named, nodei.co badge caught), emails masked, codec.cjs for golden capture and test, plan-skeleton Status heading, npm reference baseline and lint traps, eval action-1 now requires the webhook section in survey.txt
## [2026-09-25] index | rebuilt (1 entries)
## [2026-09-25] verify | T-20260925-2: action-1 re-run 2 runs; harness 0/2 on a mis-specified heading check, re-graded 2/2 on the webhook id check (script's GitHub section present in both transcripts)
## [2026-09-25] update | C-20260925-4: callable CommonJS recipe, 'use strict' banner, TypeScript 5 interop-off fixture, zizmor.yml template, Dependabot cooldown, TAP trap; L-017, L-018 (from the first real run's Phases 2 to 4)
## [2026-09-25] update | C-20260925-5: badges and images section in SKILL.md, scripts/check-readme-images.mjs (dead services, HTTP errors, badges that say not found, relative paths, nuget.org allow-list), plan-skeleton disposition table, npm and nuget checklist rows; R-20260925-4 (user request)
## [2026-09-26] update | handoff: future scope, unpublished repositories (example sites) after the packages; needs a no-registry variant
## [2026-09-26] update | C-20260926-1: L-022 to L-026 from is-an-image-url Phases 2 and 3 (first-hand rulings, fixture socket reuse, exact inlining, xo --fix traps, network timeouts and SSRF wording) into SKILL.md stops and references/npm.md
## [2026-09-26] update | C-20260926-2: L-027 (read the merge method and SHA the maintainer used; ruleset before the merge) and L-028 (under auto mode take the go for GitHub writes in the session, hand over commands) from is-an-image-url Phase 4, into SKILL.md stops and Phases row 4 and references/npm.md Phase 4 (ruleset copy command)
## [2026-09-26] update | C-20260926-3: L-028 updated; the release tag push is refused under auto mode even after a go; references/npm.md Rehearsal says hand the commands over
## [2026-09-26] update | C-20260926-4: L-029 (changelog heading ## [X.0.0], lint before tagging) and L-028 update (the maintainer wants commands run on explicit instruction) from is-an-image-url's beta (beta.3 staged after two failed tags)
## [2026-09-26] update | C-20260926-5: scripts/check-workflow-shell.py (shellcheck per run block via uvx) and L-030, after a truncated test line in is-an-image-url's verify workflow passed actionlint and failed the beta's Bun verification
## [2026-09-26] update | C-20260926-6: scripts preflight-tag-npm.sh, watch-run.sh, verify-registry-npm.sh, post-merge-cleanup.sh (tested on is-an-image-url's runs, a replay and a dry run); plan-skeleton names them; deprecation by CLI with full messages (L-031); L-032; research R-20260926-1, -2 (evergreen checked m 0.4, next due 2026-10-05)
## [2026-09-26] update | C-20260926-7: canary and untouched recording as Phase 2 exit criteria; scripts/check-golden-untouched.sh (PASS on is-an-image-url, replace-string-at-position, seeded-random-utilities; FAIL on a planted edit) run by preflight-tag-npm.sh; evals action-canary and action-golden-untouched with the pad-lite fixture; harness fixtures, evidence.all, --selftest, --rejudge
## [2026-09-26] add | decision: release hardening from secure-npm-package (C-20260926-8): release.yml id-token job split from the GitHub Release, --ignore-scripts, template .npmrc min-release-age=3 (tested on npm 11.16: blocks resolution, not npm ci), tag ruleset templates/rulesets/tags-admins-only.json via post-merge-cleanup.sh --tag-ruleset (dry run on is-an-image-url; not yet POSTed)
## [2026-09-26] update | C-20260926-9: survey-github.sh lists action pins with runtimes; NuGet/login v1.2.0 is node24; context-health has four dead node20 pins
## [2026-09-26] verify | T-20260926-1: suite 10/10 (triggers 9/9, decoys 0/9, outcome 3/3, action-1 3/3 after re-pointing to markdown-plain-link-replacer, the two new cases 3/3); baseline fails action-canary, passes action-golden-untouched (L-034)
## [2026-09-26] index | rebuilt (2 entries)
