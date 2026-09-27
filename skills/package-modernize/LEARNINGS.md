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

### L-019 · 2026-09-25 · A network or callback package needs a capture built around a local fixture server
- Trigger: is-an-image-url 1.0.4 answers through a callback after a `request` GET; the capture template is synchronous and records return values only. Written around a fixture server, the capture found non-boolean answers (`undefined`, `''`), a synchronous callback on every no-request path, an uncaught crash for a string callback, the whole body downloaded, and credentials leaked in a Referer header on a cross-host redirect; none of that is visible to a return-value capture or to the old tests, which hit google.com (2026-09-25).
- Hypothesis: the template was written for pure functions; the behaviour of a network package lives in timing, call counts and the requests it makes.
- Rule: follow references/npm.md's recipe (fixture server in the capture, placeholders in the arguments, requests with raw headers, callback timing, uncaught exceptions, CLI runs, run twice and diff), then probe the replacement transport on the same routes before the plan.
- Evidence: is-an-image-url test/golden/ (capture-1.0.4.cjs, fixture-server.cjs, fetch-probe.cjs); C-20260925-6
- Scope: skill
- Status: promoted (C-20260925-6) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-020 · 2026-09-25 · Run the published bin before planning; a CLI can be broken for years without an issue
- Trigger: the inventory and the kickoff said is-an-image-url "has a CLI (meow)"; the published 1.0.4's CLI fails on every call, `--help` included, because meow 5 no longer accepts `help` as an array; 1.0.3 (meow 3.7.0) worked. No issue was filed in six years (2026-09-25).
- Hypothesis: a survey reads `package.json` and the README, which describe the CLI, not whether it runs; a caret range on a CLI framework moves under the code.
- Rule: in Phase 0 install the published version in a scratch project and run the bin with `--help` and one input; when it fails, run the previous version to learn the contract; record the CLI runs in the golden file and write the refuted claim into the kickoff prompt.
- Evidence: is-an-image-url test/golden/1.0.4.json (`cli`); references/npm.md Phase 0; C-20260925-6
- Scope: skill
- Status: promoted (C-20260925-6) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-021 · 2026-09-25 · everlast's sync push pushes on its own; a run told not to push registers with sync off
- Trigger: the is-an-image-url run was told to commit locally and not push; `everlast.py project register --sync push` reported that the SessionEnd hook would commit and push `ai-docs/` whenever it was safe, which would have pushed master behind the maintainer's back (2026-09-25).
- Hypothesis: the skill's Phase 0 said "sync push" unconditionally, written for runs that push anyway.
- Rule: when a run must not push, register with `--sync off`, say so in the plan's D14, and re-register with `--sync push` once the maintainer has ruled.
- Evidence: is-an-image-url ai-docs/log.md; references/npm.md Phase 0; C-20260925-6
- Scope: skill
- Status: promoted (C-20260925-6) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-022 · 2026-09-26 · Take the plan rulings first-hand from the maintainer, not from a summary of an earlier session
- Trigger: the maintainer wrote "fix all your recommendations and push" in a fresh session; the recommendations were only in the previous session's closing report. Acting on them (18 branch deletions, 3 webhook deletions, a release) was blocked by the auto-mode check as approvals that came from model output, and the run stopped to ask. One multiple-choice question confirmed every ruling and the OKs in a few seconds (2026-09-26).
- Hypothesis: "silence means the recommendations stand" works inside one session; across sessions the only record of what was recommended is model output, and deletions need an approval the maintainer can be seen to give.
- Rule: at the start of a run that continues past the plan review, restate the rulings and the deletion OKs as one question (AskUserQuestion, with "yes, all", "yes, but no deletions" and "I meant something else" options) unless the maintainer wrote them into the plan or the kickoff prompt themselves; then write the answer into the plan's Status with the date.
- Evidence: is-an-image-url ai-docs/log.md and plan Status (2026-09-26); C-20260926-1
- Scope: skill
- Status: promoted (C-20260926-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-023 · 2026-09-26 · A test fixture server that destroys its sockets must wait before the next fetch
- Trigger: on Node 20, 22 and 26 (not 24) every other network case failed with `false` and no request logged. The fixture server's `dropConnections()` destroyed the sockets after each case, and the next fetch went out at once on a pooled keep-alive socket undici had not yet seen close (2026-09-26).
- Hypothesis: undici notices a server-side close asynchronously; a request issued in the same tick reuses the dead socket and fails without a retry.
- Rule: after destroying server sockets in a test, wait (30 ms was enough) before the next request, through one helper every suite uses; run the network suites on every Node line locally before trusting a pass on one.
- Evidence: is-an-image-url test/golden/golden.test.js and test/functional (`dropConnections`), plan Risks; C-20260926-1
- Scope: skill
- Status: promoted (C-20260926-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-024 · 2026-09-26 · Inlining a dependency: copy its behaviour exactly, flags and platform included, and its licence from the tarball
- Trigger: three slips while inlining is-url and is-image into is-an-image-url (2026-09-26). The xo rule that requires the `u` flag would have changed is-url's `\S{2,}`, because with `u` an astral character counts once instead of twice. is-image used Node's platform `path.extname`, which splits on backslashes on Windows only, so the POSIX rewrite changed Windows answers. That went unnoticed until the review, because the golden capture had no backslash cases. The first draft of the MIT notice named a copyright holder ("2015 Segment.io") that is-url's LICENSE-MIT does not contain.
- Hypothesis: an inlined dependency looks like new code, so lint rules and memory get applied to it; its behaviour depends on the regex flags and the runtime platform it ran on.
- Rule: download the exact version's tarball (`npm pack name@version`) and copy the code and the licence text from it; keep the original regex flags, with a lint disable that gives the reason; list the platform-dependent calls it makes (`path`, `os`, `process.platform`), name in the plan which platform the new code follows, and add golden or unit cases for the difference; record the capture's platform in the golden header.
- Evidence: is-an-image-url src/url-pattern.ts, src/image-extensions.ts, LICENSE, review finding 1; C-20260926-1
- Scope: skill
- Status: promoted (C-20260926-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-025 · 2026-09-26 · xo --fix changes public types and comments; read its diff of src/ line by line
- Trigger: `xo --fix` on is-an-image-url removed `| null` from the public overloads (`@typescript-eslint/no-restricted-types`, an API change: 1.0.4 took null), rewrote `http://` as `https://` inside a comment (`unicorn/prefer-https`), capitalised a package name at the start of a comment (`capitalized-comments`), and turned a string with backslashes into `String.raw` (2026-09-26).
- Hypothesis: the fixers are safe for style and unsafe for meaning, and a large diff hides the few that matter.
- Rule: stage before `xo --fix`, then `git diff src/` and restore any change to a signature, a type or a comment's facts; keep an intended `null` with a disable comment that gives the reason. A `String.raw` template cannot end in a backslash (it escapes the closing backtick); write that string as an ordinary quoted string with a doubled backslash.
- Evidence: is-an-image-url commits on v2; references/npm.md Traps; C-20260926-1
- Scope: skill
- Status: promoted (C-20260926-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-026 · 2026-09-26 · Network packages: clamp user timeouts, and never offer an input allow-list as SSRF protection
- Trigger: the review of is-an-image-url found that a timeout above 2147483647 ms overflows `setTimeout` to 1 ms, so the answer was an instant `false`. It also found that README and SECURITY.md advised checking user URLs against an allow-list, which a redirect to an internal host bypasses. A redirect to a URL with credentials also changed its answer under fetch (2026-09-26).
- Hypothesis: timeouts and redirects are where fetch-based rewrites differ from `request` and from what the docs say.
- Rule: for every package that takes a timeout, clamp it to 2147483647 or reject larger values, and test it with 3e9. For every package that follows redirects, the docs say an input allow-list is not enough and point to network-level egress control. The functional suite includes a redirect to another port and a redirect to a credentialed URL. A shared `AbortSignal` has 0 listeners after the calls settle (`getEventListeners`). A one-call process exits long before the default timeout.
- Evidence: is-an-image-url review findings 2, 3, 4, 8; C-20260926-1
- Scope: skill
- Status: promoted (C-20260926-1) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-027 · 2026-09-26 · Read the merge method and SHA after the maintainer merges; the plan's "squash" is a wish
- Trigger: the is-an-image-url plan said squash-merge; the maintainer merged PR #25 with a merge commit (d9e246b), and the ruleset that would have pinned the method was still waiting for the merge (2026-09-26).
- Hypothesis: the maintainer merges from the web UI with whatever button is the default; nothing in the run enforced the method.
- Rule: after the merge, read `gh pr view N --json mergeCommit,mergedAt` and cite that SHA in the bot pull request comments and the log; accept the method used unless the maintainer asks otherwise. Apply the ruleset before the merge (it gates the merge on `ci`); if squash matters, also set the repository to allow only squash merges in the Phase 4 settings.
- Evidence: is-an-image-url log 2026-09-26, plan Phase 4; C-20260926-2
- Scope: skill
- Status: promoted (C-20260926-2) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-028 · 2026-09-26 · Under automatic permission modes, take the go for GitHub writes in the session and hand over the commands
- Trigger: after the merge of is-an-image-url, 17 `gh pr close --delete-branch` calls and a branch deletion went through; the next step (the ruleset) was refused by Claude Code's auto-mode classifier as an external system write, and the refusal covered the same outcome by any route. The deletion OKs were recorded in the plan by an earlier session (2026-09-26).
- Hypothesis: the classifier judges a burst of outward writes on its own evidence; OKs written in repository files by an earlier session do not count as the user's authorization in this one.
- Rule: before the post-merge cleanup, list every GitHub write in one message (closures with their comment, branch deletions, ruleset, settings, tag push) and take the maintainer's go in that session. Write the exact commands (ruleset JSON included) into the HANDOFF so the maintainer can run whatever gets refused. Stop at a refusal; never re-route it. The release tag push (`npm version` plus `git push --follow-tags`) starts a publish and was refused as "Create Public Surface" even after an in-session "go" that did clear the ruleset; it went through once the maintainer said in so many words to run it ("you run it"). The maintainer does not want to be told to run commands; ask for the explicit instruction, then run them.
- Evidence: is-an-image-url HANDOFF.md and log 2026-09-26 (ruleset 24042507 created after the go; tag push refused); C-20260926-2, C-20260926-3
- Scope: skill
- Status: promoted (C-20260926-2) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-029 · 2026-09-26 · The release workflow needs a `## [X.0.0]` changelog heading; lint after every edit before tagging
- Trigger: is-an-image-url's first beta tag failed in release.yml because CHANGELOG.md's section was `## [Unreleased]` (Keep a Changelog style), which the notes step cannot map to 2.0.0. The one-line heading fix left `[Unreleased]:` as an unused link definition, and the second tag failed on xo's markdown/no-unused-definitions. Two burned prerelease numbers (beta.1, beta.2); beta.3 staged (2026-09-26).
- Hypothesis: the template AGENTS.md says a prerelease uses the section of the release it leads to, but nothing in Phase 2 said the heading must name that version; and a docs-only edit felt too small to lint.
- Rule: write the new section as `## [X.0.0] - Unreleased` from Phase 2 on, with its link definition `[X.0.0]:`; before any `npm version`, run lint, typecheck and tests on the exact tree being tagged.
- Evidence: is-an-image-url release runs 36247863837 (no section), 36247959799 (xo), 36248115597 (staged); C-20260926-4
- Scope: skill
- Status: promoted (C-20260926-4) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-030 · 2026-09-26 · actionlint without shellcheck checks no shell; a truncated test line reached a live verify run
- Trigger: is-an-image-url's verify-published.yml had `[ "$answer" = "true"` with no closing bracket in the Bun job (a Phase 2 edit cut the line); actionlint 1.7.12 passed it because shellcheck was not installed, `bash -n` passes it too (`[` is a command), and it failed only in verify run 36249319506 after 2.0.0-beta.3 was approved. Re-run 36249497972 green after the fix (2026-09-26).
- Hypothesis: "actionlint clean" was taken to cover the shell inside `run:` blocks; it silently skips that without shellcheck.
- Rule: run `scripts/check-workflow-shell.py` (shellcheck at error level per block, through `uvx --from shellcheck-py` when not on PATH; dedents the YAML block first) with actionlint on every workflow change, and verify a checker catches a planted bug before trusting its pass.
- Evidence: is-an-image-url commit "verify-published: close the Bun CLI test bracket"; the script flags the pre-fix file and passes both templates and five repositories; C-20260926-5
- Scope: skill
- Status: promoted (C-20260926-5) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-031 · 2026-09-26 · A placeholder in a command shown to the maintainer can become the live registry state
- Trigger: the agent wrote the 1.x deprecation as `npm deprecate is-an-image-url@"<2" "..."` in a chat reply, meaning "the message from D4"; the maintainer ran it verbatim and every 1.x version went live with the deprecation message `...` (2026-09-26). The agent's attempt to correct it was refused by auto mode as a change to a shared resource.
- Hypothesis: a maintainer copies commands; shorthand that is obvious in the transcript is invisible at the terminal.
- Rule: every command shown to the maintainer is complete and runnable, messages included; after any registry change the maintainer makes, read it back (`npm view PACKAGE@OLD deprecated`, `verify-registry-npm.sh`) before logging it done.
- Evidence: is-an-image-url log 2026-09-26; `npm view is-an-image-url@1.0.4 deprecated` printed "..."; C-20260926-6
- Scope: skill
- Status: promoted (C-20260926-6) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-032 · 2026-09-26 · Script any command chain a run repeats, and prove the script on a replay of the real mistake
- Trigger: the release and verification steps of is-an-image-url took about 25 ad-hoc calls (finding runs, digging logs for the stage id, the failing step, dist-tags, attestations, audit, smoke, release view) and two failed tags that a pre-tag check would have caught (2026-09-26).
- Hypothesis: each step is short, so nobody scripts it; across seven packages the chain costs more than the scripts, and every retyping risks a slip.
- Rule: when a phase needs the same three or more commands in every run, write a script under scripts/ that prints only the evidence, and test it against the run that motivated it (a known failed run, a replayed commit, a dry run on the merged pull request) before relying on it. Scripts added: preflight-tag-npm.sh, watch-run.sh, verify-registry-npm.sh, post-merge-cleanup.sh, check-workflow-shell.py.
- Evidence: scripts tested 2026-09-26 on is-an-image-url runs 36247959799 (failure shown in 7 lines) and 36248115597 (stage id shown), a replay of f2bf891~1 (FAIL on the changelog), 2.0.0 (VERIFIED) and 1.0.4 (FAIL: deprecated, no provenance), and a dry run on PR #25; C-20260926-6
- Scope: skill
- Status: promoted (C-20260926-6) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-033 · 2026-09-26 · Eval evidence must accept every spelling of the action; re-judge stored runs after fixing a check
- Trigger: the first pass of action-canary graded run 1 as a failure. The run had planted `<=` in src/index.js, seen 10 of 15 golden cases fail, reverted with `git checkout -- src/` and logged it, but it ran the suite as `npm --prefix "<dir>" test`, which the sequence regex `npm (run )?test` did not match (2026-09-26).
- Hypothesis: a regex written from one imagined command misses the forms an agent actually uses (`--prefix`, `-C`, PowerShell instead of Bash); the grade then measures the regex, not the skill.
- Rule: write trace checks for the effect (`\bnpm\b.*\btest\b`, Bash or PowerShell), prefer file and command checks over command spelling, and run `run-headless.mjs --selftest` so every fixture case fails on an idle run. When a check turns out wrong, fix it and `--rejudge` the stored transcripts and case directories instead of spending new runs; record both gradings in TESTS.md.
- Evidence: T-20260926-1; evals/run-headless.mjs (`--rejudge`, `--selftest`); C-20260926-7
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-034 · 2026-09-26 · A case that passes without the skill is a regression guard, not proof the skill works
- Trigger: the baseline (skill junction moved out of ~/.claude/skills) failed action-canary (it ran the suite on four Node lines and never planted a break) but passed action-golden-untouched: the fixture's plan says in D1 that every 1.x answer stays exact, so any careful agent fixes src/ (2026-09-26).
- Hypothesis: the fixture spells out the ruling the skill exists to supply; RepoRescue's test editing happens when the right answer is not written down next to the failing test.
- Rule: run a baseline for every new action case and record in evals.json what the skill-less run did. A case the baseline passes stays as a guard against regressions, labelled so; to measure the skill, the fixture must leave the rule to the skill (for golden-untouched: a plan that states the promise only generally, or a divergence that looks like a fix of an old bug).
- Evidence: T-20260926-1 baseline runs; evals.json `baseline` fields of both cases
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-035 · 2026-09-26 · A kickoff's claim about an error path is a hypothesis until the capture records it
- Trigger: the stack-exchange-markdown-retriever kickoff (written from a reading of index.js) said an API `error_message` throws an uncaught exception that crashes the caller, and planned a named exception for its fix. The capture showed the throw sits inside the `try` around `JSON.parse`, so the callback gets `(null, Error)`; the same `try` also calls a callback that throws a second time, which nobody had noticed (2026-09-26).
- Hypothesis: reading a small file for control flow misses which `try` encloses a throw; only running the published version against each error route shows where an exception lands.
- Rule: for every error-path claim in a kickoff or survey, add a capture case that exercises it (an API error, a malformed body, a callback that throws) and write the plan's exceptions from the recording. A claimed exception that the capture refutes is dropped, not implemented; say so in the plan and the kickoff's corrections.
- Evidence: stack-exchange-markdown-retriever test/golden/1.1.7.json cases "API error 400 (bad_parameter)", "callback that throws"; its survey note
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-036 · 2026-09-26 · Search old package.json scripts and published versions for tokens, not only config files
- Trigger: the kickoff expected no secrets; `git log -p` showed `snyk auth <uuid>` in package.json's test script, removed in 2017, and `npm view PACKAGE@1.1.5 scripts` still shows it (masked as `***`) in two published versions (2026-09-26).
- Hypothesis: the survey looked at dotfiles and workflows; 2016 to 2017 packages often put CLI logins straight into npm scripts, and the registry keeps every version's package.json.
- Rule: grep history for `auth [0-9a-f]{8}-`, `_authToken` and `token`, and read `scripts` of every published version; a masked `***` in npm's output means a token was there. Name the provider for the maintainer to revoke; never copy the token into docs.
- Evidence: stack-exchange-markdown-retriever commit ee6e4b0; references/npm.md Phase 0 "Leaked credentials" (C-20260926-10)
- Scope: skill
- Status: promoted (C-20260926-10) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-037 · 2026-09-26 · npm deprecate cannot finish from an agent's shell: EOTP without a TTY
- Trigger: in the stack-exchange-markdown-retriever run, `npm deprecate` from the agent shell exited with EOTP. There is no TTY, `--auth-type=web` does not wait for the browser approval, and the auth URL is masked in the output. The overlay's note that the agent may run 2FA-gated commands did not hold (2026-09-26).
- Hypothesis: npm's web-auth flow needs an interactive terminal to print the link and poll for the approval. A piped shell gets neither.
- Rule: never try `npm deprecate` or `npm dist-tag` from the agent. Hand Mark the complete command, with the full message and never a placeholder, for his own terminal, and afterwards check the result with `npm view PACKAGE@OLD deprecated`.
- Evidence: stack-exchange-markdown-retriever ai-docs/log.md 2026-09-26; references/npm.md Phases 5 and 6 (C-20260926-11)
- Scope: skill
- Status: promoted (C-20260926-11) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-038 · 2026-09-26 · Tag pushes run in the main session; a subagent's refusal is not a reason to ask the maintainer
- Trigger: in a subagent, the permission classifier refused `npm version 2.0.0-beta.1 && git push --follow-tags` as "Create Public Surface", and the run asked Mark for "run it". The main session then ran the same step without trouble under Mark's standing authorization (2026-09-26).
- Hypothesis: a subagent's classifier judges a tag push without the maintainer's context. The main session holds his standing authorization.
- Rule: when a subagent is refused a tag push or another release step, it stops and reports to the main session, and the main session runs the step. Do not ask Mark for "run it" on tag pushes. The same goes for deleting a merged branch the go already covered.
- Evidence: stack-exchange-markdown-retriever log 2026-09-26 (beta.1 tag 9cac49c pushed by the main session)
- Scope: skill
- Status: promoted (C-20260926-11) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-039 · 2026-09-27 · The generated release-notes.md fails lint in release.yml
- Trigger: format-json-files v2.0.0-beta.1: release.yml wrote release-notes.md from CHANGELOG.md, then `npm run lint` linted it, and xo failed on the unused `[2.0.0]` link definition (run 36281331934). Nothing was staged, and the tag was burned. stack-exchange-markdown-retriever passed only because its section happened to use the definition (2026-09-27).
- Hypothesis: the template writes the notes into the checkout before the lint step, and xo lints Markdown.
- Rule: the xo config ignores `release-notes.md`, and .gitignore lists it (templates/npm/xo.config.js and .gitignore, fixed 2026-09-27). A package written before the fix: check its xo ignores before the first tag.
- Evidence: format-json-files pull request #3 (50ff9f1); beta.2 staged in run 36281483946
- Scope: skill
- Status: promoted (templates fixed 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-040 · 2026-09-27 · xo's cache hides lint errors in edited files; CI finds them
- Trigger: format-json-files: local `npx xo` was clean, and CI's lint failed on two rules in src/require.ts. The cache in node_modules/.cache/xo-linter predated the edit (2026-09-26).
- Rule: `rm -rf node_modules/.cache` before the last local lint before a push (or add it to preflight-tag-npm.sh and the Phase 2 exit).
- Evidence: format-json-files CI runs 36277483722 (fail) and 36277589680
- Scope: skill
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-041 · 2026-09-26 · A golden capture made on Windows lacks file symlinks; CI runners make them
- Trigger: the format-json-files capture could not create file symbolic links (EPERM without developer mode). The golden test then failed on every CI runner, including windows-latest, because there the link existed and 2.x reported it (2026-09-26).
- Rule: a filesystem capture records which links it could not make (`unavailable`), and the golden test names the link behaviour as an exception by reason, not by the recording. Or capture on Linux (CI or WSL) when links matter.
- Evidence: format-json-files test/golden/golden.test.js (SKIPPED_LINK), capture-fixtures.cjs
- Scope: skill
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-042 · 2026-09-26 · export = with a namespace: two tsdown declaration traps
- Trigger: format-json-files' CommonJS entry, the function plus types under `export =`. (1) Aliasing imported types under their own names inside the merged namespace became `type FormatOptions = FormatOptions`. (2) `fn.default = fn` became `var formatJsonFiles: typeof formatJsonFiles` inside the namespace, which is TS2502 for every CommonJS consumer; attw did not catch it, and the consumer fixtures did (2026-09-26).
- Rule: declare the types under short internal names and export them under the public ones. Write `declare namespace fn { export {fn as default, fn}; export type X = Y; }` and set the properties with Object.assign. Keep the four TypeScript consumer fixtures: they are the check that caught it.
- Evidence: format-json-files src/require.ts, dist/index.d.cts
- Scope: skill (references/npm.md export shape)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-043 · 2026-09-26 · Filesystem packages: capture recipe and review lessons
- Trigger: format-json-files was the first package that writes files.
- Rule:
  - Trees are data in a committed capture-fixtures.cjs; each case builds a fresh temporary tree.
  - Every file is stamped with a fixed mtime, so `written` is recorded without comparing bytes.
  - `{{root}}` stands in for the tree's path in the arguments and outputs.
  - The CLI's stderr is recorded as its error lines only (stack traces carry the Node version and paths).
  - Deep-nesting fixtures inflate the golden file: a 2000-deep array formats into 16 MB, so use about 40.
  - The review found a regex backtrack-stack overflow at about 10M characters, and exact doubles above 2^53 that JSON.stringify writes with other digits. Scan strings with indexOf loops, and test sizes in the millions.
- Evidence: format-json-files test/golden/, the Phase 3 comment on pull request #2
- Scope: skill (references/npm.md Phase 0, the recipe asked for in continuation-2 item F)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-044 · 2026-09-27 · `npm --prefix DIR init -y` writes package.json in the working directory, not DIR
- Trigger: markdown-plain-link-replacer Phase 0: a scratch project was made with `npm --prefix <scratch> init -y` after an earlier shell call had cd'd into the repository. npm init ignored the prefix, normalised the repository's own package.json (git+ URL, bin object, directories, type), and the change went into the Phase 0 commit (87e88c6, restored in 8b977db). It also made the tarball diff report package.json as different when it was identical (2026-09-27).
- Hypothesis: npm init, like npm exec, works on the current directory; `--prefix` only moves install targets.
- Rule: make a scratch project with `mkdir DIR && cd DIR && npm init -y` inside a subshell `( ... )`, never with `--prefix`; run `git status --short` before every Phase 0 commit and account for each modified tracked file.
- Evidence: markdown-plain-link-replacer ai-docs/log.md "package.json restored"
- Scope: skill (references/npm.md Traps)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-045 · 2026-09-27 · Guard the capture at the socket, not by counting requests per case
- Trigger: markdown-plain-link-replacer's capture, adapted from stack-exchange-markdown-retriever's, aborted three times on cases that legitimately make no request (a www link that throws first, ftp and mailto links, a non-ASCII path request refuses). Marking them one by one guessed at behaviour the capture exists to record (2026-09-27).
- Hypothesis: "every case must reach the proxy" is a proxy for the real rule, "nothing leaves 127.0.0.1".
- Rule: in a network capture, wrap `net.Socket.prototype.connect` so any host but 127.0.0.1 or localhost throws, list the cases without a request on stderr for review, and grep the golden file for the guard's message (0 expected). For many hosts, request 2.88 honours HTTP_PROXY for http links (absolute-form requests) as well as HTTPS_PROXY (CONNECT), so one fixture proxy routed by path serves every host with no DNS changes; an `x-fixture-url` header lets the new code's fetch wrapper reach the same routes directly.
- Evidence: markdown-plain-link-replacer test/golden/capture-1.1.16.cjs and fixture-server.cjs (164 cases, guard never fired, two runs byte-identical)
- Scope: skill (references/npm.md Phase 0)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-046 · 2026-09-27 · A package whose output passes through a dependency's new major needs a mechanical exception, not a re-recording
- Trigger: markdown-plain-link-replacer writes the title get-title-at-url returns; 3.0.0 extracts titles differently from 1.1.8 (article-title), so almost every golden output would differ in the title alone (2026-09-27).
- Hypothesis: when a consumer adopts its dependency's new major, the dependency's own changelog is the exception, and the golden test can apply it by computing both answers for each fixture (the old extractor as a test-only dev dependency, the new one's exported function) and swapping them in the recorded output, so every other byte stays under test.
- Rule: plan it as one named exception with the swap described in D1; confirm in Phase 2 that the swap covers every changed case and nothing else. Proven in Phase 2 without the old extractor: every ordinary fixture page gave the same old title ("Page"), so the swap replaces that fixed string with the new dependency's answer for each URL, fetched by the golden test itself, and the pages whose reading changed in other ways became named exceptions with explicit outputs. Before planning the swap, run every recorded case through the first build in a scratch script and list the differences: each must map to a plan item or be a bug (three new items, E15 to E17, came from that list).
- Evidence: markdown-plain-link-replacer test/golden/golden.test.js (swapTitles, exceptions), log "Phase 2: rewrite, golden test, canary"
- Scope: skill (SKILL.md Golden capture)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-047 · 2026-09-27 · The canary's `git checkout -- src/` reverts nothing while src/ is untracked
- Trigger: markdown-plain-link-replacer Phase 2: the canary was planted before src/ had ever been committed, so `git checkout -- src/` left the plant in place and the "reverted" run was still red; the plant came out by hand (2026-09-27).
- Hypothesis: the recipe assumes a rewrite on top of a tracked src/; a first rewrite has none.
- Rule: commit src/ (a work-in-progress commit on the branch is fine) before planting the canary, and check `git status --short src` is empty after the revert.
- Evidence: markdown-plain-link-replacer log "Phase 2: rewrite, golden test, canary" (38fd6d4 then the canary)
- Scope: skill (references/npm.md Phase 2 canary)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-048 · 2026-09-27 · Taking a young dependency past the cooldown: add it alone, after the tree is locked under the cooldown
- Trigger: markdown-plain-link-replacer depends on the maintainer's own new majors, released one and two days earlier. One `npm install --min-release-age=0 <four packages>` resolved the whole tree past the cooldown: 35 locked versions younger than three days, 32 of them dev tools. CI's `npm audit signatures` then failed with notarget, because it applies min-release-age to locked versions too (2026-09-27).
- Hypothesis: `--min-release-age=0` applies to every package that command resolves, not only the ones named.
- Rule: install everything else under the cooldown first (without the young packages in package.json), then `npm install --min-release-age=0 <young packages>` alone; check the lockfile for versions younger than the cooldown (a packument time per locked version). In ci.yml pass `--min-release-age=0` to `npm audit signatures` while a runtime dependency is younger than the cooldown, with the reason in a comment; `npm install` in a clone fails with notarget until then (`npm ci` works).
- Evidence: markdown-plain-link-replacer cb59a48, log "Phase 2: verification"
- Scope: skill (references/npm.md Phase 1 install cooldown)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-049 · 2026-09-27 · xo --fix can bring in APIs newer than the Node floor
- Trigger: xo --fix rewrote a test's `new Promise(resolve => ...)` into `Promise.withResolvers()` (Node 22+); every golden case failed on Node 20 (304 failures) while Node 22 to 26 passed (2026-09-27).
- Rule: after `xo --fix`, run the suites on the floor Node line (`npx -p node@20`) before pushing; turn unicorn/prefer-promise-with-resolvers off in the template's xo config while the floor is Node 20 (Array#toSorted and friends are fine on 20; Iterator helpers and Promise.withResolvers are not).
- Evidence: markdown-plain-link-replacer xo.config.js, log "Phase 2: verification"
- Scope: skill (templates/npm/xo.config.js, references/npm.md Traps)
- Status: promoted (templates/npm/xo.config.js, references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-050 · 2026-09-27 · Editor-tool content decodes `\u` escapes; `a && grep | b && git commit` commits after failures
- Trigger: markdown-plain-link-replacer: comments written as `[a-z\u00a1-\uffff]` through the Write tool landed as the literal characters; and a chain `npm run test:dist | grep ... && git commit` committed and pushed while 8 tests had failed, because grep's exit status passed (2026-09-27).
- Rule: after writing source with the editor tools, grep new files for non-ASCII (`grep -nP '[^\x00-\x7F]'`) and restore escapes written doubled; never gate a commit on a pipeline whose last command is grep: run the tests, check the summary, then commit in a separate call.
- Evidence: markdown-plain-link-replacer src/scan-links.ts comments; 17b3578 (the failures did not recur in three reruns or CI)
- Scope: skill (SKILL.md Windows line; references/npm.md Traps)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-051 · 2026-09-27 · A package with runtime dependencies: tests route fetch by URL, and oracles for inlined pieces are recorded, not installed
- Trigger: markdown-plain-link-replacer is the first run whose new major keeps runtime dependencies (the maintainer's three packages and tldts) and inlines two old ones (url-regex, hogan.js) (2026-09-27).
- Rule: route the dependencies' fetches in tests through a globalThis.fetch wrapper that sends every URL to the fixture server with the meant URL in a header, following redirects itself; stub fetch in-process for unit suites. For an inlined old dependency, record its answers in a scratch project into a committed JSON oracle with its capture script (hogan.js 3.0.2: 128 entries), or write its own expression into the test as the oracle (url-regex 4.1.1, 3000 generated texts), rather than installing it as a dev dependency (old trees bring alerts). The shape test lists the allowed require() names of the CommonJS build and runs it in a bare vm context with a require that serves only those.
- Evidence: markdown-plain-link-replacer test/helpers/web.js, stub-fetch.js, test/unit/hogan/, test/unit/find-links.test.js, test/package/shape.test.js
- Scope: skill (references/npm.md Phase 2)
- Status: promoted (references/npm.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-052 · 2026-09-27 · After the review, fuzz against the published package itself, not a restated oracle
- Trigger: markdown-plain-link-replacer's Phase 3 reviewer found 3 bugs. A later offline differential of the published 1.1.16 (installed in a scratch folder, network modules replaced through Module._load, setTimeout forced to 0, a marker template) against dist/ on 13 000 generated texts found two more: whitespace such as U+3000 that the old code trimmed from its match, and a dot before `)`. The in-repo differential restated the rules and missed both (2026-09-27).
- Rule: before the release rehearsal, run the published old version and the new build side by side on generated input, with the old side's network stubbed at the module level. Seed the generator with whole links (random pieces almost never form one; the first 2000 texts had 0 links). Group the differences by cause, filter out the numbered exceptions, and read every remaining group. The old code's checks apply to its own trimmed values, so a restated rule is easy to get subtly wrong.
- Evidence: markdown-plain-link-replacer 7146f05, log "Phase 3: every review finding fixed or recorded"
- Scope: skill (references/npm.md Phase 3)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-053 · 2026-09-27 · Staggered-timer tests measure from the first event
- Trigger: a test asserting each title lookup came at least 90 ms after the previous one failed intermittently (86 ms). The code schedules lookup i at i * 100 ms from one start, so one late timer shortens the next gap (2026-09-27).
- Rule: assert each event against the first (>= i * interval - tolerance), not against the previous one.
- Evidence: markdown-plain-link-replacer test/functional/replace-plain-links.test.js
- Scope: skill (references/npm.md Traps)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-054 · 2026-09-27 · Run the GitHub-writing scripts from the agent, and get an allow rule first
- Trigger: Claude Code's auto-mode classifier blocked post-merge-cleanup.sh, even its dry run, as an external write, despite the maintainer's "run everything". The maintainer's own run from PowerShell failed with "gh: command not found" (PowerShell's `bash` is not Git Bash) and read the PR state as empty. Adding "Bash" to permissions.allow in ~/.claude/settings.json cleared it (2026-09-27).
- Rule: at Phase 4, if the harness classifies GitHub writes as blocked, ask the maintainer once for a Bash allow rule rather than handing the script over; if they run it themselves, give the Git Bash path and the repository directory. verify-registry-npm.sh takes PACKAGE VERSION [OWNER/REPO]; passing the version first gives a 404.
- Evidence: markdown-plain-link-replacer HANDOFF 2026-09-27
- Scope: skill (SKILL.md Phase 4; overlay for the settings detail)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-055 · 2026-09-27 · Latest tooling, widest audience
- Trigger: maintainer's direction during the TrailerClipper run (2026-09-27): update everything to latest, but the widest audience the package or repository can work for is desirable.
- Rule: tooling, language level, dependencies and CI move to current; the floor and the target list stay as wide as costs nothing in safety or upkeep (for NuGet keep netstandard2.0 beside the current TFM; for npm the lowest supported Node line; every OS the code can run on). Each dropped runtime, platform or framework needs a named reason in the plan's decisions table. Width is measured among current users: prefer newer tools and trends over stale or forgotten ones (a live, maintained dependency or channel over an abandoned one, even if the abandoned one once had more users; maintainer's follow-up the same day).
- Evidence: user request, TrailerClipper session 2026-09-27
- Scope: skill (SKILL.md Plan paragraph)
- Status: promoted (SKILL.md, 2026-09-27) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-056 · 2026-09-27 · Capture a .NET Framework package on net48, and a package that runs a program against real fixtures
- Trigger: TrailerClipper 1.1.0 (net40, JavaScriptSerializer from System.Web.Extensions, MediaToolkit's ffmpeg) could not be loaded by the template's net10.0 console; its behaviour is files written by ffmpeg, not return values (2026-09-27).
- Hypothesis: the capture template assumed a pure library on modern .NET.
- Rule: capture on net48 when the old assembly needs a Framework-only reference; for a package that shells out, run each case in a fresh fixture copy, record the file tree with a measured property per output file, keep console output, replace the scratch path with a token, and run the capture twice to prove it deterministic. Read the old nupkg's file list for bundled third-party DLLs.
- Evidence: TrailerClipperLib tests/Golden/Capture/Program.cs, commit 8e59145; ai-docs/log.md Phase 0
- Scope: skill (references/nuget.md Phase 0; scripts/golden-capture-nuget.template.cs header)
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-057 · 2026-09-27 · A heredoc through Git Bash still breaks backslash escapes inside a Python script
- Trigger: a quoted `<<'EOF'` Python heredoc that wrote `"\r\n"` into a C# file produced real line breaks and a CS1010 build error, although memory already warned about heredocs (2026-09-27).
- Rule: any edit whose text holds a backslash escape goes through the editor tool; Python heredocs are fine only for text without backslashes. SKILL.md's Windows line already says so; follow it for script-driven edits too.
- Evidence: TrailerClipper capture Program.cs build error, session 2026-09-27
- Scope: skill (SKILL.md shape of a run, Windows line; already covered)
- Status: active · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-058 · 2026-09-27 · The editor tools decode backslash-u escapes too
- Trigger: in the TrailerClipper run, a C# escape for "<" written through the Write and Edit tools, and through a Python heredoc, arrived as a literal "<" three times; the config text escaping it was meant to restore became a no-op that compiled and passed the unit build (2026-09-27).
- Hypothesis: the tool layer unescapes JSON-style sequences in the text it is handed, and Git Bash heredocs halve backslashes; both happen before the file is written.
- Rule: any text holding a backslash followed by u and four hex digits (C# or JSON escapes, markdown that quotes them) is written through Python with chr(92), then grepped in the file. A test that asserts the escaped output (built with (char)92 in the test source) catches the silent version.
- Evidence: TrailerClipperLib d033b12 (TrailerClipper.ConfigText, ReviewTests.Config_text_escapes_what_JavaScriptSerializer_escaped)
- Scope: skill (references/nuget.md Traps); memory note bash-tool-heredoc-apostrophes
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-059 · 2026-09-27 · Generate the golden replay from the capture program
- Trigger: TrailerClipper's golden test needed the capture's 148 cases, their arguments and recording rules against the new build (2026-09-27).
- Rule: produce the test's runner from the committed capture program by a mechanical rewrite with a header saying how, mark it generated for the formatter, compare case by case, and keep every allowed difference in one exception table keyed by method, culture and arguments, with a test that each key matches a recorded case. First build: 138 of 150; the 12 were one real named exception (E9) and a test-side key order.
- Evidence: TrailerClipperLib tests/TrailerClipperLib.Tests/GoldenRunner.cs, GoldenTests.cs (f0f9c94)
- Scope: skill (references/nuget.md Phase 2)
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-060 · 2026-09-27 · A reflection baseline of the old public API, with parameter names
- Trigger: the Phase 3 review found that the class method RemoveTrailers(string directoryPath, decimal milliseconds) had taken the interface's parameter names; the golden replay calls by position and could not see it, and package validation could not use the net40 1.1.0 as a baseline (2026-09-27).
- Rule: when package validation has no usable baseline, list the published DLL's public members with parameter names by reflection into a committed file and test that 2.x keeps every line.
- Evidence: TrailerClipperLib tests/TrailerClipperLib.Tests/PublicApi-1.1.0.txt, ReviewTests.cs PublicApiTests (d033b12)
- Scope: skill (references/nuget.md Phase 2)
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-061 · 2026-09-27 · CI for a package that measures an external program: current build on every OS, sorted listings, resolved temp paths
- Trigger: the first CI run of TrailerClipper v2 passed on Windows and failed on Ubuntu (apt ffmpeg 6.1 measures MP3 files differently) and macOS (directory order, /private temp prefix) (2026-09-27).
- Rule: install the same current major of the external program on every runner (checksum-verified when it comes from a release page), sort directory listings in the library when their order is observable, and resolve the working directory before replacing it in recorded text.
- Evidence: CI runs 36334471273 (failed) and 36335032052 (green); TrailerClipperLib 127f399
- Scope: skill (references/nuget.md Traps)
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-062 · 2026-09-27 · verify-published waits for both nuget.org indexes (`verify-waits-both-indexes`)
- Trigger: TrailerClipper 2.0.0-beta.1's verify-published passed on Windows and failed on Linux and macOS: `dotnet tool install` said the version was not found although the wait loop had seen it in the flat container; the registration index committed it at 17:23:35, after those steps (2026-09-27).
- Rule: the wait loop polls the flat container and the registration index for every package id before any restore or tool install; a failure right after publishing is rerun once before it is treated as real.
- Evidence: verify-published 36336494800 (failed, then green on rerun); TrailerClipperLib #4 (b4c6b9d)
- Scope: skill (references/nuget.md Traps)
- Status: promoted (references/nuget.md, 2026-09-27) · helpful 1 · harmful 0 · last_confirmed 2026-09-27
