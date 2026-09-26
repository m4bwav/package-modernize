# Learnings: package-modernize

Procedural lessons for [SKILL.md](SKILL.md). Research findings live in [RESEARCH.md](RESEARCH.md); every change is logged in [CHANGELOG.md](CHANGELOG.md); test runs in [TESTS.md](TESTS.md); state in `evergreen.json`. Format and write-time gate: [MAINTENANCE.md](MAINTENANCE.md) (LEARNINGS-FORMAT). Retired entries go to LEARNINGS-ARCHIVE.md with a reason.

Write an entry the moment a real signal happens: a user correction, the same error twice, a discovered workaround, an environment fact, a stated preference, a failed test or a failure in use. Check existing entries first, by meaning (`evergreen.py search "<the lesson>" --kinds learnings` finds near-duplicates in every registered unit): add / update / retire / none. Trigger and Hypothesis are required. Promote after three confirmations; retire when harmful > helpful.

The first twelve entries were seeded on 2026-09-25 from the three runs that preceded the skill (get-title-at-url, seeded-random-utilities, the two NuGet libraries); their evidence is those repositories' `ai-docs/` and the playbook the skill was built from. They are promoted into SKILL.md or a reference already, so their status says so.

## Active

### L-001 · 2026-09-25 · Survey claims can be wrong; the golden capture is the arbiter
- Trigger: the seeded-random-utilities kickoff said the empty string was no seed; the capture of the published 1.1.4 showed it was one (2026-09-25). A NuGet run rewrote a test expectation file to the new serializer's output instead of preserving the old.
- Hypothesis: a survey reads code and docs; only running the published artifact shows what callers actually get.
- Rule: capture the published version's answers to normal and odd inputs before any change, and check every survey and kickoff claim against the capture; write the corrections into the kickoff prompt's last section.
- Evidence: SKILL.md "Golden capture"; the playbook's section 2 (2nd run)
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-002 · 2026-09-25 · Two wishes in a kickoff can conflict; the plan says so instead of satisfying both badly
- Trigger: "bounded by the amount" and "bit for bit the same sequences" could not both hold for one method (seeded-random-utilities D6, 2026-09-25).
- Hypothesis: a prompt writer lists fixes without testing each against the compatibility promise.
- Rule: in Phase 1 test every requested fix against the promise; when they clash, recommend keeping the old name exact and adding the fix under a new name, and let the maintainer rule.
- Evidence: SKILL.md "Plan"; seeded-random-utilities plan D6
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-003 · 2026-09-25 · An independent read-only review finds what hundreds of passing tests miss
- Trigger: a fresh subagent reviewing the seeded-random-utilities branch for 37 minutes found 12 real issues after 905 tests passed (2026-09-25).
- Hypothesis: the author's tests encode the author's assumptions; a differential fuzz against the published version does not.
- Rule: run `prompts/review-subagent.md` in a fresh context before the pull request is reviewed; fix or answer every finding.
- Evidence: SKILL.md Phase 3; seeded-random-utilities pull request #17
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-004 · 2026-09-25 · Golden fixtures cover only the draws they record; read ported arithmetic line by line
- Trigger: mulberry32's counter in the old package was never wrapped, so it departed from the algorithm after about 4.9 million draws, far past any fixture (2026-09-25).
- Hypothesis: fixtures pin outputs, not invariants.
- Rule: for any algorithmic code, write oracles from the authors' reference implementation and read each ported expression for unwrapped sums, float multiplies and signed versus unsigned words.
- Evidence: seeded-random-utilities D2b and test/unit/generators.test.js
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-005 · 2026-09-25 · Tag only after the default branch is green; a tag on a failing commit burns the version
- Trigger: DotNetJsonPrettyPrinter tagged v2.1.0 and v3.0.0 with the release push; both landed on failing commits; force-pushing tags was refused; 2.1.1 and 3.0.1 were released instead (2026-09-25). DotNetRandomNameGenerator tagged after green and published first time.
- Hypothesis: a tag-triggered release workflow runs whatever the tag points at; the registry keeps the burned number.
- Rule: merge, wait for `ci` green on the default branch, then tag; the release workflow checks the tag against the version before packing anything.
- Evidence: references/nuget.md Phases 5 and 6; templates/nuget release.yml
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-006 · 2026-09-25 · A locked lock file for a multi-OS matrix must not depend on anything the SDK infers per OS
- Trigger: `dotnet restore --locked-mode` failed on Windows (reference assemblies present only locally) and on Linux (a Windows-only default runtime identifier on a net48 test exe) in the two NuGet runs (2026-09-25).
- Hypothesis: NuGet writes into the lock file whatever the SDK inferred on the machine that ran restore.
- Rule: reference `Microsoft.NETFramework.ReferenceAssemblies` explicitly with `PrivateAssets="all"`, pin `RuntimeIdentifier` and `SelfContained false` on net48 test executables, and give every project (benchmarks too) a lock file.
- Evidence: references/nuget.md Phase 1 defaults
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-007 · 2026-09-25 · Old bot pull requests are closed with one comment after the regenerated lockfile merges, never merged one by one
- Trigger: 12 Dependabot and several Snyk pull requests on 2019-era lockfiles in the npm runs; merging them would have churned a lockfile consumers never install (2026-09-25).
- Hypothesis: the rewrite removes the tools that brought the packages in, so the alerts close with the new lockfile.
- Rule: after the merge, confirm the alert count is 0, then close each pull request with a comment naming the merge commit and the removed tool.
- Evidence: SKILL.md "Community"; seeded-random-utilities plan D17
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-008 · 2026-09-25 · Windows shell tools mangle files; write with editor tools and check line endings by counting byte 13
- Trigger: Bash heredocs dropped backslashes and failed on nested quoting in every run; Git Bash's grep never sees carriage returns; the Write tool produced CRLF on one host; a sed edit in this skill's build dropped the backslashes of a Windows path (2026-09-24 to 25).
- Hypothesis: three layers of quoting (tool, bash, the command) each consume escapes.
- Rule: write and edit files with the editor tools; use `scripts/check-line-endings.mjs` before committing; never `cd` in a shell call; spawn npm through a shell from Node.
- Evidence: SKILL.md "The shape of a run" (Windows); references/npm.md traps
- Scope: env:windows
- Status: promoted (C-20260925-1) · helpful 4 · harmful 0 · last_confirmed 2026-09-25

### L-009 · 2026-09-25 · The published tarball can hold files the repository does not
- Trigger: replace-string-at-position 1.0.4's tarball holds an unregistered `cli.js`, `.travis.yml`, `.vscode/launch.json` and `test.js` (checked 2026-09-25); the Claude Code 2.1.88 tarball shipped a full source map (2026-03-31).
- Hypothesis: without a `files` allowlist, `npm pack` takes everything `.npmignore` does not exclude.
- Rule: survey the published artifact, not only the clone; the new version uses a `files` allowlist and a test that asserts the exact pack list.
- Evidence: SKILL.md "Survey" and "Security"; templates/npm shape.test.js
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-010 · 2026-09-25 · The everlast doc lint has three habits to write around
- Trigger: it read JSDoc tags, the `@AGENTS.md` import and npm scopes as social handles, wanted a `## Reasons` heading in decisions and a `## Next single action` in the handoff, and reported paths of files that did not exist yet as dead (2026-09-25). The first run with the skill got 23 findings on its plan and survey note: 16 backticked future paths (the skeleton's rule, not followed), a missing `## Status` in the plan and `## Summary` in the note (not in the skeleton), JSDoc tags in the API sketch, `id-token: write` read as a credential, and the maintainer's email in the survey output (2026-09-25).
- Hypothesis: the privacy and dead-path checks are regex-based.
- Rule: write paths of not-yet-existing files without backticks, include the four headings, phrase around at-sign words and `token:` in docs, and keep emails out of saved survey output (the script masks them now).
- Evidence: references/npm.md traps; references/plan-skeleton.md; the playbook's section 8
- Scope: skill
- Status: promoted (C-20260925-1, C-20260925-3) · helpful 3 · harmful 0 · last_confirmed 2026-09-25

### L-011 · 2026-09-25 · Approvals that the registry or GitHub gate must be the maintainer's clicks; the agent stops and waits
- Trigger: approving a NuGet deployment through `gh api .../pending_deployments` was refused for the agent; npm staged approvals need 2FA (2026-09-25).
- Hypothesis: the gate exists so that a person, not the automation, decides what goes live.
- Rule: at each approval the run posts what is staged or waiting and stops; it never looks for a way around the gate.
- Evidence: SKILL.md "The shape of a run"
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-012 · 2026-09-25 · Registry indexing lags differ per surface; verification waits and re-polls
- Trigger: nuget.org's package page showed a version within minutes while the registration index took about 25 minutes (NU1102 in a consumer meanwhile); Deno refused an npm version under 24 hours old (2026-09-25).
- Hypothesis: search, flat container, registration and third-party caches update independently.
- Rule: verify-published workflows poll the authoritative endpoint with a bounded wait before the consumer checks, and pass the flags that turn off age policies for the one command that needs it.
- Evidence: templates/npm and templates/nuget verify-published.yml
- Scope: skill
- Status: promoted (C-20260925-1) · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-013 · 2026-09-25 · The overlay folder is a junction, and file globbing does not see it; the harness must also spot usage-limit replies
- Trigger: in the first eval run the skill's Glob for `.package-modernize/OVERLAY.md` under the home folder returned nothing although the junction existed (3 of 3 action runs); and three runs ended with "You've hit your session limit", judged as failures until the transcripts were read (2026-09-25).
- Hypothesis: Glob skips hidden folders and reparse points; a usage-limit reply is a normal `result` event with no tool calls.
- Rule: Step 0 tells the skill to Read the overlay at its full path; the harness reports a run whose final text mentions a session limit as `environment`, not as a skill failure, and the suite is re-run after the limit resets.
- Evidence: SKILL.md Step 0; evals/run-headless.mjs; T-20260925-1
- Scope: env:windows, harness
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-014 · 2026-09-25 · An eval that only sees the script call passes a script that dies halfway
- Trigger: the first real run (replace-string-at-position Phase 0) found `survey-npm.sh` exiting on "url: unbound variable" whenever OWNER/REPO was passed, so the whole GitHub half (issues, webhooks, alerts) never ran; action-1 had passed 3 of 3 because its evidence was the call in the trace (2026-09-25).
- Hypothesis: `set -u` plus a variable set only on one branch; the eval grades that the script ran, not that it finished.
- Rule: action evidence for a script also checks the saved file for a fact only the script's late section produces (`and: file_contains`, for example a webhook id), never for a heading, because the agent may save its own report instead of the raw output (T-20260925-2); run each script once end to end on a real package before calling it tested.
- Evidence: C-20260925-3; evals/evals.json action-1; evals/run-headless.mjs; T-20260925-2
- Scope: skill, harness
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-015 · 2026-09-25 · A JSON round trip erases exactly the edge inputs a golden capture is for
- Trigger: the capture template copied arguments with `JSON.parse(JSON.stringify(...))`, so NaN and Infinity positions became null and -0 became 0 before the call; the recorded case would have claimed NaN behaves like null (2026-09-25).
- Hypothesis: the template was written for a package whose inputs were seeds and small integers.
- Rule: store arguments with a tagged codec (`templates/npm/test/golden/codec.cjs`), decode fresh for each call, and record thrown errors with their class, shared by the capture and the golden test.
- Evidence: C-20260925-3; replace-string-at-position test/golden/1.0.4.json (cases 20, 25, 26, 29)
- Scope: skill
- Status: promoted (C-20260925-3) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-016 · 2026-09-25 · The dependents, not the survey count, decide what a major may refuse
- Trigger: the kickoff and inventory knew one dependent; the registry said 4; `gh search code` found two, a third-party one included, and reading both call sites showed they pass only strings and an in-text index, which is what made refusing every other call safe (2026-09-25).
- Hypothesis: npm's dependents count has no names; an agent that stops at the number cannot judge a break.
- Rule: list the dependents by name in Phase 0 and read each call site; write in the plan's D15 which calls they make and whether the new major keeps them exact.
- Evidence: C-20260925-3; replace-string-at-position survey note, plan D1 and D15
- Scope: skill
- Status: promoted (C-20260925-3) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-017 · 2026-09-25 · A callable CommonJS build needs its own entry, a strict banner and a TypeScript 5 interop-off fixture
- Trigger: replace-string-at-position kept `require()` returning the function (plan D2). Rolldown's `output.exports: 'default'` failed the declaration build; the working build (a second tsdown config whose lone default export cjsDefault turns into `module.exports =`) had no `'use strict'`, which the Phase 3 review caught through `Object.hasOwn(fn, 'caller')`; TypeScript 6 fixtures cannot turn esModuleInterop off, so `import = require()` users were untested (2026-09-25).
- Hypothesis: tsdown's defaults assume a named-exports CommonJS build; the strict directive comes from ESM semantics that a CommonJS chunk does not inherit.
- Rule: for a `module.exports = function` package use the recipe in references/npm.md (two configs, hand-written entry points, `banner: {js: "'use strict';"}`), and add a TypeScript 5.9 consumer fixture with esModuleInterop off that compiles and runs `import = require()`, `import * as` and the default import.
- Evidence: C-20260925-4; replace-string-at-position pull requests #2 and #3
- Scope: skill
- Status: promoted (C-20260925-4) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-018 · 2026-09-25 · The maintainer may merge before ruling; treat the merge as the recommendations standing and keep going
- Trigger: the maintainer merged the v2 pull request while the plan's questions (D3c, D4) were open and the review was still running; the review's fixes went into a second pull request (2026-09-25).
- Hypothesis: the pull request stop is where a busy maintainer looks; "silence means the recommendations stand" extends to a merge.
- Rule: after an early merge, record in the plan that the recommendations stand, put the review fixes on a new branch and pull request, and never treat the merge as the OK for a deletion the plan asked about separately (webhooks).
- Evidence: replace-string-at-position ai-docs/log.md
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-25
