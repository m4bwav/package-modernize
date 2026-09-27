# Changelog: package-modernize

Every change to [SKILL.md](SKILL.md) and its companions, newest first, each with the reason. Reasons cite findings in [RESEARCH.md](RESEARCH.md) (`R-`), lessons in [LEARNINGS.md](LEARNINGS.md) (`L-`), and test runs in [TESTS.md](TESTS.md) (`T-`). State in `evergreen.json`. Protocol: [MAINTENANCE.md](MAINTENANCE.md).

Entry shape: `### C-YYYYMMDD-n · date · one-line summary`, then `because:` (IDs or "user request"), `files:` (file and section), and a sentence on what changed. Cite section headings, not line numbers.

### C-20260927-9 · 2026-09-27 · NuGet coverage complete (`nuget-coverage-complete`)
- because: L-062 `verify-waits-both-indexes`; TrailerClipper 2.0.0 released through every phase
- files: SKILL.md (description, coverage table), references/nuget.md (coverage line with worked-example workflows, rehearsal verified, Traps, what it still lacks), LEARNINGS.md (L-062)
- The first NuGet run through all eight phases; the reference now points at TrailerClipperLib's workflows as the worked example until templates are copied.

### C-20260927-8 · 2026-09-27 · Cite IDs with code names (`cite-ids-with-code-names`)
- because: user request
- files: SKILL.md (While working: capture learnings)
- Bare IDs such as L-058 were unmemorable; a code name now follows every cited ID, and the numbers stay the stable key.

### C-20260927-7 · 2026-09-27 · NuGet Phase 2 and 3 from TrailerClipper: generated golden replay, public API baseline, tool packages, external programs, CI traps
- because: L-058, L-059, L-060, L-061 (TrailerClipper Phases 2 and 3)
- files: references/nuget.md (Phase 2 bullets; Phase 5 policy scope; Traps), templates/nuget/.editorconfig (tests section glob), LEARNINGS.md (L-058 to L-061)
- The first NuGet run with a golden replay, a reflection API baseline and an independent review; the review again found 12 real issues after every test passed.

### C-20260927-6 · 2026-09-27 · NuGet golden capture proven on a run: net48 for Framework-era packages, fixtures for packages that run a program, bundled DLLs in the survey
- because: L-056, L-057 (TrailerClipper Phases 0 and 1)
- files: references/nuget.md (Phase 0: golden capture, nupkg file list), scripts/golden-capture-nuget.template.cs (header), LEARNINGS.md (L-056, L-057)
- The first NuGet capture ran on net48 against WAV and MP3 fixtures measured with ffprobe; the template and reference now say when and how.

### C-20260927-5 · 2026-09-27 · Widest audience as a plan rule
- because: L-055 (user request)
- files: SKILL.md (Plan (Phase 1): the runtime floor and matrix), LEARNINGS.md (L-055)
- Latest tooling does not justify narrowing the audience; a dropped runtime, platform or target needs a named reason.

### C-20260927-4 · 2026-09-27 · Differential against the published old version after the review; staggered-timer tests; auto-mode limits at Phase 4
- because: L-052, L-053, L-054 (markdown-plain-link-replacer Phases 3 to 6, 2.0.0 released)
- files: references/npm.md (Phase 3; Phase 4 permission-mode bullet), LEARNINGS.md (L-052 to L-054)
- The review found 3 bugs, and an offline differential against the published 1.1.16 found 2 more; Phase 4 records what Claude Code's auto mode blocks and what the maintainer must run.

### C-20260926-12 · 2026-09-26 · Description cut from 1,380 to 1,001 characters, under the spec's 1,024 cap
- because: user request (description over the Agent Skills spec limit, which some hosts enforce by dropping the skill; over 200 words); T-20260926-2
- files: SKILL.md front matter `description`
- Every quoted trigger and every package system, phase and boundary is kept; the phase list is shorter (CI moved into the tooling clause, badges and images left to the body) and the coverage note reads "npm complete, NuGet partly, others unverified". The body is unchanged, still about 7K tokens (over the spec's 5K guidance; not restructured here).

### C-20260927-3 · 2026-09-27 · Young dependencies past the cooldown, the canary on an untracked src/, xo --fix and the Node floor, runtime-dependency test routing
- because: L-046 (proven), L-047, L-048, L-049, L-050, L-051 (markdown-plain-link-replacer Phase 2, the first run whose new major keeps runtime dependencies)
- files: references/npm.md (Phase 1 install cooldown; Phase 2: commit src before the canary, list every recorded difference before writing exceptions, the mechanical swap for a dependency's new major, fetch routing and recorded oracles; Traps: xo --fix and Promise.withResolvers, editor-tool escapes and grep-gated commits), templates/npm/xo.config.js (unicorn/prefer-promise-with-resolvers off), LEARNINGS.md (L-046 promoted, L-047 to L-051)
- The run's own maintainer packages were younger than the three-day cooldown; installing them alongside the rest resolved 35 young versions, and CI's signature audit refused them.

### C-20260927-2 · 2026-09-27 · Many-host network capture with a socket guard; npm init writes to the working directory
- because: L-044, L-045 (markdown-plain-link-replacer Phases 0 and 1); L-046 recorded as active until Phase 2 proves it
- files: references/npm.md (Phase 0: many-host capture through one proxy, the socket guard; Traps: npm init and --prefix), LEARNINGS.md (L-044 to L-046)
- The per-case "must reach the proxy" check of the fixed-host recipe aborted on cases that send nothing; a guard on net.Socket.prototype.connect enforces the actual rule. A stray npm init changed a tracked package.json during Phase 0.

### C-20260927-1 · 2026-09-27 · format-json-files lessons: filesystem capture recipe, export = namespace traps, xo cache cleared in preflight
- because: L-039, L-040, L-041, L-042, L-043 (format-json-files 2.0.0 release, the first package that writes files)
- files: references/npm.md (Phase 0: filesystem capture and Windows symlinks; Phase 1 export shape: CommonJS entry with types; Traps: xo cache, release-notes.md lint, text-scanning review findings), scripts/preflight-tag-npm.sh (clears xo's cache before the lint), LEARNINGS.md (L-039 to L-043 promoted)
- The templates already ignore release-notes.md (e690577); the rest of the run's lessons were still only in LEARNINGS.md and now sit where the next run reads them.

### C-20260926-11 · 2026-09-26 · npm deprecate is the maintainer's terminal; tag pushes stay in the main session
- because: L-037, L-038 (stack-exchange-markdown-retriever 2.0.0 release)
- files: references/npm.md (Phases 5 and 6), LEARNINGS.md
- npm deprecate exits EOTP without a TTY, so the maintainer runs it with the full message. A subagent refused on a tag push hands the step to the main session instead of asking the maintainer.

### C-20260926-10 · 2026-09-26 · Fixed-host capture recipe, fixture server under the untouched check, token search in scripts and old versions, four traps
- because: L-035, L-036; the stack-exchange-markdown-retriever run (first use of check-golden-untouched.sh, watch-run.sh and check-workflow-shell.py)
- files: scripts/check-golden-untouched.sh (checks `fixture-server*` too), scripts/README.md, references/npm.md (Phase 0: fixed-host HTTPS capture through a CONNECT proxy, error-path claims read from the capture, leaked credentials in npm scripts and old versions; Traps: `npx --no -- <bin>`, `node --import` with a file URL, DecompressionStream differences per Node line, a hanging golden case on its own fixture server), LEARNINGS.md (L-035, L-036)
- check-golden-untouched.sh let the fixture server change although its routes define what each recorded case means; it now checks it (passes on is-an-image-url and stack-exchange-markdown-retriever). watch-run.sh and check-workflow-shell.py worked as documented on first use.

### C-20260926-9 · 2026-09-26 · The survey lists every action pin with its runtime
- because: R-20260926-1 (GitHub stopped running node20 actions on 2026-09-23)
- files: scripts/survey-github.sh (section "Action pins in the default branch's workflows"), scripts/README.md, SKILL.md ("What every run does the same way": Survey), references/nuget.md (Phase 2: NuGet/login v1.2.0 runtime)
- Each `uses:` pin in the default branch's workflows is printed with the `runs.using` its action.yml declares at that ref, and node12, node16 and node20 pins are marked DEAD. Tested on is-an-image-url (all node24), DotNetJsonPrettyPrinter (all node24, NuGet/login@v1 included) and context-health (four DEAD pins); stack-exchange-markdown-retriever has no workflows. NuGet/login v1.2.0 (SHA 8d19675, the template's pin) declares node24.

### C-20260926-8 · 2026-09-26 · Release hardening from secure-npm-package: split id-token job, tag ruleset, install cooldown
- because: R-20260926-1; decision ai-docs/decisions/2026-09-26-release-hardening-from-secure-npm-package.md (in the skill repository)
- files: templates/npm/.github/workflows/release.yml (publish job `contents: read` with `--ignore-scripts`; new github-release job), templates/npm/.npmrc (new, `min-release-age=3`), templates/rulesets/tags-admins-only.json (new), scripts/post-merge-cleanup.sh (`--tag-ruleset`; the branch-ruleset check counts branch rulesets only), scripts/README.md, templates/README.md, references/npm.md (Phase 1 defaults: install cooldown, release, tag protection; Phase 4 shortcut), references/plan-skeleton.md (Phase 4), SKILL.md (Security)
- The id-token job no longer holds `contents: write`; the cooldown was tested on npm 11.16 (blocks resolution of versions younger than three days, leaves `npm ci` from the lockfile alone); the tag ruleset goes out with the Phase 4 go. Immutable releases and `ignore-scripts` in `.npmrc` were considered and left out, with reasons in the decision.

### C-20260926-7 · 2026-09-26 · Canary and untouched recording are Phase 2 exit criteria, checked by a script and proven by two evals
- because: R-20260926-2, T-20260926-1
- files: SKILL.md (Phases row 2; Golden capture; Tools and prior art), references/npm.md (Phase 2: canary recipe and untouched check), references/plan-skeleton.md (Phases 0 and 2), scripts/check-golden-untouched.sh (new), scripts/preflight-tag-npm.sh (runs it), scripts/README.md, evals/evals.json (action-canary, action-golden-untouched), evals/fixtures/ (pad-lite and a divergent src), evals/run-headless.mjs (fixtures, `evidence.all` checks, `--selftest`, `--rejudge`)
- A green golden suite now counts only after a planted line in `src/` has turned it red, and the recording, capture script and codec must stay as committed in Phase 0 (fixes go in `src/` or become ruled exceptions). check-golden-untouched.sh passes on the three finished npm packages and fails on a planted edit.

### C-20260926-6 · 2026-09-26 · Release and cleanup shortcuts as scripts, deprecation by CLI with full messages, research on prior art
- because: L-031, L-032, R-20260926-1, R-20260926-2
- files: scripts/preflight-tag-npm.sh, scripts/watch-run.sh, scripts/verify-registry-npm.sh, scripts/post-merge-cleanup.sh (new), scripts/README.md, SKILL.md (Phases row 4: cleanup script; "Tools and prior art": code-modernization 1.0.0 canary, Evil Martians secure-npm-package, Drydock, RepoRescue), references/npm.md (Phase 4 cleanup shortcut; Phases 5 and 6: shortcuts, `next` after the release, deprecation by CLI with the full message), references/plan-skeleton.md (Phases 4 to 6 name the scripts; dispositions.tsv in the appendix), RESEARCH.md (R-20260926-1, R-20260926-2), LEARNINGS.md (L-031, L-032)
- is-an-image-url's release took about 25 ad-hoc calls and two failed tags that the new scripts reduce to four calls and a pre-tag stop; a placeholder deprecation message went live because a chat reply used shorthand.

### C-20260926-5 · 2026-09-26 · Shell inside workflows checked by shellcheck, not only actionlint
- because: L-030
- files: scripts/check-workflow-shell.py (new), scripts/README.md, SKILL.md (Phases row 2), references/npm.md (Traps: actionlint), LEARNINGS.md (L-030)
- A truncated test line in is-an-image-url's verify workflow passed actionlint (no shellcheck installed) and failed the Bun job of the beta's verification; the new script runs shellcheck on each run block and catches it.

### C-20260926-4 · 2026-09-26 · Changelog heading and a lint pass before the first tag; the maintainer wants commands run, not handed over
- because: L-029, L-028 (updated)
- files: references/npm.md (Phase 5 and 6: "Before the first tag", Rehearsal), LEARNINGS.md (L-028, L-029)
- is-an-image-url spent beta.1 and beta.2 on a bare `## [Unreleased]` heading and then an unused link definition; the tag push went through once the maintainer explicitly said to run it.

### C-20260926-3 · 2026-09-26 · The release tag push is the maintainer's under automatic permission modes
- because: L-028 (updated)
- files: LEARNINGS.md (L-028 rule and evidence), references/npm.md (Phase 5 and 6: Rehearsal)
- With the maintainer's in-session "go", the ruleset went through but `npm version` plus the tag push was refused as creating a public surface; the reference now says to hand those two commands over.

### C-20260926-2 · 2026-09-26 · Lessons from is-an-image-url Phase 4: read the merge actually made, take the go for GitHub writes in the session
- because: L-027, L-028
- files: SKILL.md ("The shape of a run" stops: GitHub writes under automatic permission modes; Phases table row 4: ruleset before the merge, read the merge method and SHA), LEARNINGS.md (L-027, L-028), references/npm.md (Phase 4: ruleset command)
- The maintainer merged with a merge commit where the plan said squash, and auto mode refused the ruleset after the bot pull request closures although the plan recorded the OKs; the ruleset JSON is now in the reference so the HANDOFF can carry it.

### C-20260926-1 · 2026-09-26 · Lessons from is-an-image-url Phases 2 and 3: first-hand rulings, fixture socket reuse, exact inlining, xo --fix traps, network timeouts and SSRF wording
- because: L-022, L-023, L-024, L-025, L-026 (user request: record the net-positive learnings)
- files: SKILL.md (stops: rulings taken first-hand in a later session), references/npm.md (Phase 2: golden pattern for callback and network packages, fixture socket wait, inlined dependencies, network package checks; Traps: xo --fix, import-x/order, portable Node lines through npx, actionlint download), LEARNINGS.md (L-022 to L-026)
- The run got its rulings only after a blocked action, lost a Node-line pass to a test harness race, nearly changed an inlined regex and Windows answers, had public types changed by the lint fixer, and shipped docs with a bypassable SSRF recommendation and an overflowing timeout until the review caught them.

### C-20260925-6 · 2026-09-25 · Second real run (is-an-image-url, Phases 0 and 1): network and callback capture, run the published bin, stale branches, misspelled dotfiles, sync off for no-push runs
- because: L-019, L-020, L-021
- files: references/npm.md (Phase 0: diff the tarball against the repository and count its carriage returns; run a published bin before planning; the capture recipe for asynchronous and network packages with a local fixture server; everlast `--sync off` when the run must not push), SKILL.md ("Golden capture": network, callback and CLI packages; "Community": branches with no pull request), scripts/golden-capture-npm.template.cjs (header points to the async worked example), scripts/survey-github.sh (`.synk` in the dead-file pattern; every root dotfile; branches with no open pull request)
- The survey missed a misspelled Snyk policy file and a branch no pull request pointed at; the capture template could not record a callback or a request; nothing told the run to try the CLI, which turned out to have crashed on every call since 2019; and "sync push" would have pushed a run that was told not to.

### C-20260925-5 · 2026-09-25 · Badges and images: a rule for every phase and a checker script
- because: user request; R-20260925-4
- files: SKILL.md (new "Badges and images" section; Phase 0 and Phase 2 exit criteria; the plan's questions), scripts/check-readme-images.mjs (new), scripts/README.md, references/plan-skeleton.md (survey row, D11 widened, a badges-and-images disposition table), references/npm.md (Phase 0 bullet, Phase 2 README line, checklist row), references/nuget.md (the allow-list, checklist row), templates/npm/README.template.md, prompts/kickoff-skeleton.md
- The skill removed dead badges only in passing and said nothing about images: screenshots and GIFs from dead hosts or showing the old API, relative paths that break on npmjs.com and nuget.org, badges that answer 200 but say "not found". Every image now gets a keep, replace or remove decision in the plan, and the script proves the result before and after the release.

### C-20260925-4 · 2026-09-25 · Second part of the first real run (replace-string-at-position Phases 2 to 4): callable CommonJS recipe, zizmor config, Dependabot cooldown, review lessons
- because: L-017, L-018
- files: references/npm.md (Phase 1 export-shape row: the verified two-config tsdown recipe for a `module.exports = function` package; Phase 2 note on a TypeScript 5 fixture with esModuleInterop off; traps: TAP output on Node 20 and 22, zizmor comments inside `run: |`), templates/npm/.github/zizmor.yml (new: adhoc-packages ignored for verify-published.yml), templates/npm/.github/dependabot.yml (cooldown 7 days on both ecosystems; comment no longer names another package's handoff stage), templates/README.md
- zizmor over the whole repository flagged the template's Dependabot config (no cooldown) and verify-published's deliberate registry install; the review found that a CommonJS build without `'use strict'` changes the function's own properties and that TypeScript 6 fixtures cannot check esModuleInterop-off consumers.

### C-20260925-3 · 2026-09-25 · First real run (replace-string-at-position, Phases 0 and 1): survey script fixed, golden codec, dependents by name, lint traps
- because: L-014, L-015, L-016, L-010 (updated)
- files: scripts/survey-npm.sh (url initialised so the GitHub half runs when OWNER/REPO is passed; dependents by name through `gh search code`; maintainers' emails masked), scripts/survey-github.sh (badge grep adds nodei.co and badgen), scripts/golden-capture-npm.template.cjs and templates/npm/test/golden/golden.test.template.js (use the new templates/npm/test/golden/codec.cjs), templates/npm/CLAUDE.md (plan file name is a placeholder), references/plan-skeleton.md (`## Status` heading; lint traps for future paths, JSDoc tags and `id-token`), references/npm.md (Phase 0 baseline in a scratch clone, each old tool alone, dependents by name; traps: lint headings, GNU tar and `C:`, `npm exec` working directory), SKILL.md ("Survey" dependents by name; "Golden capture" codec), scripts/README.md, templates/README.md, evals/run-headless.mjs and evals/evals.json (action evidence can require output content; action-1 requires the survey's webhook section)
- The survey had never run to the end with a repository argument, and action-1 could not notice; the capture template would have recorded NaN, Infinity and -0 cases as null and 0. Both would have misled the plan of any package with numeric inputs.

### C-20260925-2 · 2026-09-25 · First test pass: description tuned for plan and decisions-table asks, overlay read by path, action evidence trace-only
- because: T-20260925-1, L-013
- files: SKILL.md (frontmatter description: shortened from 1700 to about 1250 characters so the roster shows the trigger phrases, plus "asks for a modernization plan, survey or decisions table for a package"; Step 0: read the overlay with the Read tool at its full path), evals/evals.json (action-1 evidence is the survey script call only, baselines recorded; outcome-1 prompt phrased as a maintainer would), evals/run-headless.mjs (new harness), TESTS.md
- The outcome case never invoked the skill on "write only the decisions table" (undertrigger, 0 of 3), and the action case passed without the skill on a file-exists check; after the edits the suite is 8/8.

### C-20260925-1 · 2026-09-25 · Created as an evergreen unit from the npm playbook, two NuGet runs and today's registry research
- because: user request (the kickoff prompt of 2026-09-25), R-20260925-1 to R-20260925-5, L-001 to L-012
- files: SKILL.md (all sections), references/ (npm, nuget, pypi, crates, maven, go, plan-skeleton), scripts/ (survey-npm, survey-nuget, survey-github, golden-capture templates, check-line-endings), templates/npm and templates/nuget, prompts/ (kickoff-skeleton, review-subagent), RESEARCH.md, LEARNINGS.md, TESTS.md, evals/evals.json, evergreen.json
- Initial version. Eight phases the same for every system, with exit criteria and stops; shared checklists written once; a per-system table; npm complete from two runs, NuGet from two runs plus docs, four systems documented and marked unverified. Tier `fast`, interval 14 days. The private overlay mechanism (`PACKAGE_MODERNIZE_OVERLAY` or `~/.package-modernize/OVERLAY.md`) keeps the maintainer's identities and decisions out of the public skill. The npm templates come from seeded-random-utilities and get-title-at-url with placeholders; the NuGet release, verify and CI workflows are new (pinned actions, tag check before packing, attestation, environment gate) and marked unverified until a run uses them.

## C-20260927-1 · 2026-09-27 · Template ignores the generated release notes
- templates/npm/xo.config.js ignores `release-notes.md` and templates/npm/.gitignore lists it: release.yml writes the file before `npm run lint`, and xo failed on its unused link definition in the format-json-files beta.1 run (L-039).

## C-20260927-2 · 2026-09-27 · Remove the stale next dist-tag after release
- references/npm.md and SKILL.md Phase 6: after X.0.0 is live the maintainer runs `npm dist-tag rm PACKAGE next` and the agent reads back `npm dist-tag ls`; the old note that `next` may stay on the beta is gone. Mark asked for it after seeing `next` below `latest` on seeded-random-utilities, format-json-files and is-an-image-url.

## C-20260927-3 · 2026-09-27 · Stale next detection script
- scripts/check-next-tag-npm.sh: read-only semver check of `next` against `latest` for any list of packages; references/npm.md cites it with the research (OIDC cannot edit dist-tags yet, npm/cli#8547; move-to-stable is the common alternative to removal).

## C-20260927-4 · 2026-09-27 · next rule: never below latest
- Rule restated per Mark: `next` may equal `latest`, lead it, or be absent, never trail it. check-next-tag-npm.sh flags only `next < latest` and prints `dist-tag add PKG@latest next` (default) or `rm`; npm.md, SKILL.md Phase 6 and the overlay match.
