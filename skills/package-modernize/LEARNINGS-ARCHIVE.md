# Learnings archive: package-modernize

Promoted and retired entries from [LEARNINGS.md](LEARNINGS.md), each with the reason: retired ones were merged into another entry (the Status line names it); promoted ones now live in [SKILL.md](SKILL.md), a reference, a template or a script (the `promoted:` change and the parenthesis say where). Kept as the reasoning lineage so a retired rule is not re-added without cause. Format: the evergreen plugin's protocol/LEARNINGS-FORMAT.md, via [MAINTENANCE.md](MAINTENANCE.md).

## Retired

### L-033 · 2026-09-26 · Eval evidence must accept every spelling of the action; re-judge stored runs after fixing a check
- Trigger: the first pass of action-canary graded run 1 as a failure. The run had planted `<=` in src/index.js, seen 10 of 15 golden cases fail, reverted with `git checkout -- src/` and logged it, but it ran the suite as `npm --prefix "<dir>" test`, which the sequence regex `npm (run )?test` did not match (2026-09-26).
- Hypothesis: a regex written from one imagined command misses the forms an agent actually uses (`--prefix`, `-C`, PowerShell instead of Bash); the grade then measures the regex, not the skill.
- Rule: write trace checks for the effect (`\bnpm\b.*\btest\b`, Bash or PowerShell), prefer file and command checks over command spelling, and run `run-headless.mjs --selftest` so every fixture case fails on an idle run. When a check turns out wrong, fix it and `--rejudge` the stored transcripts and case directories instead of spending new runs; record both gradings in TESTS.md.
- Evidence: T-20260926-1; evals/run-headless.mjs (`--rejudge`, `--selftest`); C-20260926-7
- Scope: skill
- Status: retired 2026-09-28 · merged into L-014 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-035 · 2026-09-26 · A kickoff's claim about an error path is a hypothesis until the capture records it
- Trigger: the stack-exchange-markdown-retriever kickoff (written from a reading of index.js) said an API `error_message` throws an uncaught exception that crashes the caller, and planned a named exception for its fix. The capture showed the throw sits inside the `try` around `JSON.parse`, so the callback gets `(null, Error)`; the same `try` also calls a callback that throws a second time, which nobody had noticed (2026-09-26).
- Hypothesis: reading a small file for control flow misses which `try` encloses a throw; only running the published version against each error route shows where an exception lands.
- Rule: for every error-path claim in a kickoff or survey, add a capture case that exercises it (an API error, a malformed body, a callback that throws) and write the plan's exceptions from the recording. A claimed exception that the capture refutes is dropped, not implemented; say so in the plan and the kickoff's corrections.
- Evidence: stack-exchange-markdown-retriever test/golden/1.1.7.json cases "API error 400 (bad_parameter)", "callback that throws"; its survey note
- Scope: skill
- Status: retired 2026-09-28 · merged into L-001 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-037 · 2026-09-26 · npm deprecate cannot finish from an agent's shell: EOTP without a TTY
- Trigger: in the stack-exchange-markdown-retriever run, `npm deprecate` from the agent shell exited with EOTP. There is no TTY, `--auth-type=web` does not wait for the browser approval, and the auth URL is masked in the output. The overlay's note that the agent may run 2FA-gated commands did not hold (2026-09-26).
- Hypothesis: npm's web-auth flow needs an interactive terminal to print the link and poll for the approval. A piped shell gets neither.
- Rule: never try `npm deprecate` or `npm dist-tag` from the agent. Hand Mark the complete command, with the full message and never a placeholder, for his own terminal, and afterwards check the result with `npm view PACKAGE@OLD deprecated`.
- Evidence: stack-exchange-markdown-retriever ai-docs/log.md 2026-09-26; references/npm.md Phases 5 and 6 (C-20260926-11)
- Scope: skill
- Status: retired 2026-09-28 · merged into L-031 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-039 · 2026-09-27 · The generated release-notes.md fails lint in release.yml
- Trigger: format-json-files v2.0.0-beta.1: release.yml wrote release-notes.md from CHANGELOG.md, then `npm run lint` linted it, and xo failed on the unused `[2.0.0]` link definition (run 36281331934). Nothing was staged, and the tag was burned. stack-exchange-markdown-retriever passed only because its section happened to use the definition (2026-09-27).
- Hypothesis: the template writes the notes into the checkout before the lint step, and xo lints Markdown.
- Rule: the xo config ignores `release-notes.md`, and .gitignore lists it (templates/npm/xo.config.js and .gitignore, fixed 2026-09-27). A package written before the fix: check its xo ignores before the first tag.
- Evidence: format-json-files pull request #3 (50ff9f1); beta.2 staged in run 36281483946
- Scope: skill
- Status: retired 2026-09-28 · merged into L-029 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-049 · 2026-09-27 · xo --fix can bring in APIs newer than the Node floor
- Trigger: xo --fix rewrote a test's `new Promise(resolve => ...)` into `Promise.withResolvers()` (Node 22+); every golden case failed on Node 20 (304 failures) while Node 22 to 26 passed (2026-09-27).
- Rule: after `xo --fix`, run the suites on the floor Node line (`npx -p node@20`) before pushing; turn unicorn/prefer-promise-with-resolvers off in the template's xo config while the floor is Node 20 (Array#toSorted and friends are fine on 20; Iterator helpers and Promise.withResolvers are not).
- Evidence: markdown-plain-link-replacer xo.config.js, log "Phase 2: verification"
- Scope: skill (templates/npm/xo.config.js, references/npm.md Traps)
- Status: retired 2026-09-28 · merged into L-025 in the consolidation pass C-20260928-1 · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-054 · 2026-09-27 · Run the GitHub-writing scripts from the agent, and get an allow rule first
- Trigger: Claude Code's auto-mode classifier blocked post-merge-cleanup.sh, even its dry run, as an external write, despite the maintainer's "run everything". The maintainer's own run from PowerShell failed with "gh: command not found" (PowerShell's `bash` is not Git Bash) and read the PR state as empty. Adding "Bash" to permissions.allow in ~/.claude/settings.json cleared it (2026-09-27).
- Rule: at Phase 4, if the harness classifies GitHub writes as blocked, ask the maintainer once for a Bash allow rule rather than handing the script over; if they run it themselves, give the Git Bash path and the repository directory. verify-registry-npm.sh takes PACKAGE VERSION [OWNER/REPO]; passing the version first gives a 404.
- Evidence: markdown-plain-link-replacer HANDOFF 2026-09-27
- Scope: skill (SKILL.md Phase 4; overlay for the settings detail)
- Status: retired 2026-09-28 · merged into L-028 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-057 · 2026-09-27 · A heredoc through Git Bash still breaks backslash escapes inside a Python script
- Trigger: a quoted `<<'EOF'` Python heredoc that wrote `"\r\n"` into a C# file produced real line breaks and a CS1010 build error, although memory already warned about heredocs (2026-09-27).
- Rule: any edit whose text holds a backslash escape goes through the editor tool; Python heredocs are fine only for text without backslashes. SKILL.md's Windows line already says so; follow it for script-driven edits too.
- Evidence: TrailerClipper capture Program.cs build error, session 2026-09-27
- Scope: skill (SKILL.md shape of a run, Windows line; already covered)
- Status: retired 2026-09-28 · merged into L-008 in the consolidation pass C-20260928-1 · helpful 2 · harmful 0 · last_confirmed 2026-09-27 (hit twice more in CachingServiceWithAOPSupport: a printf format in run.sh and a template generator; both fixed by writing the script with the editor tool)

### L-058 · 2026-09-27 · The editor tools decode backslash-u escapes too
- Trigger: in the TrailerClipper run, a C# escape for "<" written through the Write and Edit tools, and through a Python heredoc, arrived as a literal "<" three times; the config text escaping it was meant to restore became a no-op that compiled and passed the unit build (2026-09-27).
- Hypothesis: the tool layer unescapes JSON-style sequences in the text it is handed, and Git Bash heredocs halve backslashes; both happen before the file is written.
- Rule: any text holding a backslash followed by u and four hex digits (C# or JSON escapes, markdown that quotes them) is written through Python with chr(92), then grepped in the file. A test that asserts the escaped output (built with (char)92 in the test source) catches the silent version.
- Evidence: TrailerClipperLib d033b12 (TrailerClipper.ConfigText, ReviewTests.Config_text_escapes_what_JavaScriptSerializer_escaped)
- Scope: skill (references/nuget.md Traps); memory note bash-tool-heredoc-apostrophes
- Status: retired 2026-09-28 · merged into L-050 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-062 · 2026-09-27 · verify-published waits for both nuget.org indexes (`verify-waits-both-indexes`)
- Trigger: TrailerClipper 2.0.0-beta.1's verify-published passed on Windows and failed on Linux and macOS: `dotnet tool install` said the version was not found although the wait loop had seen it in the flat container; the registration index committed it at 17:23:35, after those steps (2026-09-27).
- Rule: the wait loop polls the flat container and the registration index for every package id before any restore or tool install; a failure right after publishing is rerun once before it is treated as real.
- Evidence: verify-published 36336494800 (failed, then green on rerun); TrailerClipperLib #4 (b4c6b9d)
- Scope: skill (references/nuget.md Traps)
- Status: retired 2026-09-28 · merged into L-012 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-074 · 2026-09-27 · Commit the rewrite before planting the canary (`commit-before-canary`)
- Trigger: in IsImageUrlDotNet Phase 2 the first canary was planted while the new `src/` was uncommitted; SKILL.md says to revert with `git checkout -- src/`, which would have restored the 2016 source file over the whole rewrite. It was reverted with the inverse edit instead (2026-09-27).
- Hypothesis: the rule was written for runs whose source was already committed when the canary ran.
- Rule: commit the rewrite before the canary, then revert the plant with `git checkout -- <file>`; if the source is not committed, revert with the inverse edit and check `git diff` shows no change in that line.
- Evidence: IsImageUrlDotNet ai-docs/log.md "Phase 2: rewrite on v2"
- Scope: skill (SKILL.md golden capture)
- Status: retired 2026-09-28 · merged into L-047 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-077 · 2026-09-27 · Apply the repository settings when the pull request opens, not after the review (`settings-before-the-pull-request`)
- Trigger: IsImageUrlDotNet's plan put the rulesets in Phase 4 "before the merge"; the maintainer reviewed and merged pull request #1 himself (a merge commit, not the squash the skill expects) as soon as he read it, so the rulesets and the required `ci` check never gated that merge (2026-09-27).
- Hypothesis: the stop at the pull request hands the merge to the maintainer; anything meant to gate it has to be in place when the stop message goes out.
- Rule: at the end of Phase 3, before the stop message, apply the branch ruleset (required check `ci`), the tag ruleset and the security settings, and say in the stop message that the merge is gated; accept whatever merge method the maintainer used and read it back.
- Evidence: IsImageUrlDotNet ai-docs/log.md "Phase 4 and the Phase 5 stop" (merge e9e1eb7 at 20:08:58Z, rulesets 24084842 and 24084845 after it)
- Scope: skill (SKILL.md phases table, Phase 3 and 4)
- Status: retired 2026-09-28 · merged into L-027 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-082 · 2026-09-27 · The everlast lint reads C# generics as placeholders (`lint-reads-csharp-generics`)
- Trigger: `everlast.py lint` flagged "template placeholder text" on notes naming `EnableCacheInterception<TLimit, TActivatorData, TRegistrionStyle>` and a "privacy @handle" on `@AGENTS.md` in a plan (2026-09-27).
- Hypothesis: the lint's placeholder pattern `<[A-Z][^>]{10,}>` matches any generic parameter list over ten characters that starts with a capital.
- Rule: in ai-docs, name type parameters in words and write "the AGENTS.md import line"; the plan skeleton says so.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phases 0 and 1)
- Scope: skill (references/plan-skeleton.md)
- Status: retired 2026-09-28 · merged into L-010 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-086 · 2026-09-27 · A rewrite that reimplements a dependency is tested against the real one (`differential-against-the-original`)
- Trigger: CachingServiceWithAOPSupport 2.0.0 reimplements JavaScriptSerializer (Framework-only) for its cache keys; the 50 golden key cases and 37 unit tests passed, and the Phase 3 review's differential fuzz against the real serializer on net48 still found seven differences (IntPtr, double.MaxValue on .NET Framework, DateTimeOffset, Uri escaping, __type order, long enums, TimeSpan depth) (2026-09-27).
- Hypothesis: a golden capture samples the old package's own inputs; a reimplemented dependency has a far larger input space, which only a comparison with the original covers.
- Rule: when the rewrite replaces a dependency's behaviour, add a test that compares the two over edge cases and seeded random inputs on a runtime where the original still runs (net48 for a .NET Framework assembly), and keep it in the suite.
- Evidence: CachingServiceWithAOPSupport ai-docs/notes/2026-09-27-phase-3-review-findings.md, tests ReviewTests.R12
- Scope: skill (SKILL.md golden capture; references/nuget.md Phase 2)
- Status: retired 2026-09-28 · merged into L-052 in the consolidation pass C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

## Promoted

### L-001 · 2026-09-25 · Survey claims can be wrong; the golden capture is the arbiter
- Trigger: the seeded-random-utilities kickoff said the empty string was no seed; the capture of the published 1.1.4 showed it was one (2026-09-25). A NuGet run rewrote a test expectation file to the new serializer's output instead of preserving the old. Merged L-035 (2026-09-26): the stack-exchange-markdown-retriever kickoff said an API `error_message` throws an uncaught exception that crashes the caller; the capture showed the throw sits inside the `try` around `JSON.parse`, so the callback gets `(null, Error)`, and the same `try` calls a throwing callback a second time.
- Hypothesis: a survey reads code and docs; only running the published artifact shows what callers actually get. Reading a small file for control flow misses which `try` encloses a throw (L-035).
- Rule: capture the published version's answers to normal and odd inputs before any change, and check every survey and kickoff claim against the capture; write the corrections into the kickoff prompt's last section. For every error-path claim, add a capture case that exercises it (an API error, a malformed body, a callback that throws) and write the plan's exceptions from the recording; a claimed exception the capture refutes is dropped, not implemented, and the plan and the kickoff's corrections say so (L-035).
- Evidence: SKILL.md "Golden capture"; the playbook's section 2 (2nd run); L-035: stack-exchange-markdown-retriever test/golden/1.1.7.json and survey note, references/npm.md Phase 0 (C-20260926-10)
- Scope: skill
- Status: promoted: C-20260925-1, C-20260926-10 (SKILL.md "Golden capture"; references/npm.md Phase 0 error paths) · merged: L-035 · helpful 3 · harmful 0 · last_confirmed 2026-09-26

### L-002 · 2026-09-25 · Two wishes in a kickoff can conflict; the plan says so instead of satisfying both badly
- Trigger: "bounded by the amount" and "bit for bit the same sequences" could not both hold for one method (seeded-random-utilities D6, 2026-09-25).
- Hypothesis: a prompt writer lists fixes without testing each against the compatibility promise.
- Rule: in Phase 1 test every requested fix against the promise; when they clash, recommend keeping the old name exact and adding the fix under a new name, and let the maintainer rule.
- Evidence: SKILL.md "Plan"; seeded-random-utilities plan D6
- Scope: skill
- Status: promoted: C-20260925-1 (SKILL.md "Plan") · helpful 2 · harmful 0 · last_confirmed 2026-09-27 (IsImageUrlDotNet: 10 findings after every test passed)

### L-003 · 2026-09-25 · An independent read-only review finds what hundreds of passing tests miss
- Trigger: a fresh subagent reviewing the seeded-random-utilities branch for 37 minutes found 12 real issues after 905 tests passed (2026-09-25).
- Hypothesis: the author's tests encode the author's assumptions; a differential fuzz against the published version does not.
- Rule: run `prompts/review-subagent.md` in a fresh context before the pull request is reviewed; fix or answer every finding.
- Evidence: SKILL.md Phase 3; seeded-random-utilities pull request #17
- Scope: skill
- Status: promoted: C-20260925-1 (SKILL.md Phase 3) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-004 · 2026-09-25 · Golden fixtures cover only the draws they record; read ported arithmetic line by line
- Trigger: mulberry32's counter in the old package was never wrapped, so it departed from the algorithm after about 4.9 million draws, far past any fixture (2026-09-25).
- Hypothesis: fixtures pin outputs, not invariants.
- Rule: for any algorithmic code, write oracles from the authors' reference implementation and read each ported expression for unwrapped sums, float multiplies and signed versus unsigned words.
- Evidence: seeded-random-utilities D2b and test/unit/generators.test.js
- Scope: skill
- Status: promoted: C-20260925-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-005 · 2026-09-25 · Tag only after the default branch is green; a tag on a failing commit burns the version
- Trigger: DotNetJsonPrettyPrinter tagged v2.1.0 and v3.0.0 with the release push; both landed on failing commits; force-pushing tags was refused; 2.1.1 and 3.0.1 were released instead (2026-09-25). DotNetRandomNameGenerator tagged after green and published first time.
- Hypothesis: a tag-triggered release workflow runs whatever the tag points at; the registry keeps the burned number.
- Rule: merge, wait for `ci` green on the default branch, then tag; the release workflow checks the tag against the version before packing anything.
- Evidence: references/nuget.md Phases 5 and 6; templates/nuget release.yml
- Scope: skill
- Status: promoted: C-20260925-1 (references/nuget.md Phases 5 and 6; templates/nuget release.yml) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-006 · 2026-09-25 · A locked lock file for a multi-OS matrix must not depend on anything the SDK infers per OS
- Trigger: `dotnet restore --locked-mode` failed on Windows (reference assemblies present only locally) and on Linux (a Windows-only default runtime identifier on a net48 test exe) in the two NuGet runs (2026-09-25).
- Hypothesis: NuGet writes into the lock file whatever the SDK inferred on the machine that ran restore.
- Rule: reference `Microsoft.NETFramework.ReferenceAssemblies` explicitly with `PrivateAssets="all"`, pin `RuntimeIdentifier` and `SelfContained false` on net48 test executables, and give every project (benchmarks too) a lock file.
- Evidence: references/nuget.md Phase 1 defaults
- Scope: skill
- Status: promoted: C-20260925-1 (references/nuget.md Phase 1 defaults) · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-007 · 2026-09-25 · Old bot pull requests are closed with one comment after the regenerated lockfile merges, never merged one by one
- Trigger: 12 Dependabot and several Snyk pull requests on 2019-era lockfiles in the npm runs; merging them would have churned a lockfile consumers never install (2026-09-25).
- Hypothesis: the rewrite removes the tools that brought the packages in, so the alerts close with the new lockfile.
- Rule: after the merge, confirm the alert count is 0, then close each pull request with a comment naming the merge commit and the removed tool.
- Evidence: SKILL.md "Community"; seeded-random-utilities plan D17
- Scope: skill
- Status: promoted: C-20260925-1 (SKILL.md "Community") · helpful 2 · harmful 0 · last_confirmed 2026-09-25

### L-008 · 2026-09-25 · Windows shell tools mangle files; write with editor tools and check line endings by counting byte 13
- Trigger: Bash heredocs dropped backslashes and failed on nested quoting in every run; Git Bash's grep never sees carriage returns; the Write tool produced CRLF on one host; a sed edit in this skill's build dropped the backslashes of a Windows path (2026-09-24 to 25). Merged L-057 (2026-09-27): a quoted Python heredoc that wrote a CR LF escape into a C# file produced real line breaks and a CS1010 build error in the TrailerClipper run, although memory already warned about heredocs; it hit twice more in CachingServiceWithAOPSupport (a printf format in run.sh and a template generator), each fixed by writing the script with the editor tool.
- Hypothesis: three layers of quoting (tool, bash, the command) each consume escapes.
- Rule: write and edit files with the editor tools; use `scripts/check-line-endings.mjs` before committing; never `cd` in a shell call; spawn npm through a shell from Node. Any edit whose text holds a backslash escape goes through the editor tool, script-driven edits included; Python heredocs are fine only for text without backslashes (L-057; for backslash-u escapes see L-050).
- Evidence: SKILL.md "The shape of a run" (Windows); references/npm.md traps; L-057: TrailerClipper capture Program.cs build error, C-20260927-6, C-20260927-16
- Scope: env:windows
- Status: promoted: C-20260925-1, C-20260927-16 (SKILL.md "The shape of a run", Windows line; references/npm.md Traps) · merged: L-057 · helpful 6 · harmful 0 · last_confirmed 2026-09-27

### L-009 · 2026-09-25 · The published tarball can hold files the repository does not
- Trigger: replace-string-at-position 1.0.4's tarball holds an unregistered `cli.js`, `.travis.yml`, `.vscode/launch.json` and `test.js` (checked 2026-09-25); the Claude Code 2.1.88 tarball shipped a full source map (2026-03-31).
- Hypothesis: without a `files` allowlist, `npm pack` takes everything `.npmignore` does not exclude.
- Rule: survey the published artifact, not only the clone; the new version uses a `files` allowlist and a test that asserts the exact pack list.
- Evidence: SKILL.md "Survey" and "Security"; templates/npm shape.test.js
- Scope: skill
- Status: promoted: C-20260925-1 (SKILL.md "Survey" and "Security"; templates/npm shape.test.js) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-010 · 2026-09-25 · The everlast doc lint has three habits to write around
- Trigger: it read JSDoc tags, the `@AGENTS.md` import and npm scopes as social handles, wanted a `## Reasons` heading in decisions and a `## Next single action` in the handoff, and reported paths of files that did not exist yet as dead (2026-09-25). The first run with the skill got 23 findings on its plan and survey note: 16 backticked future paths (the skeleton's rule, not followed), a missing `## Status` in the plan and `## Summary` in the note (not in the skeleton), JSDoc tags in the API sketch, `id-token: write` read as a credential, and the maintainer's email in the survey output (2026-09-25). Merged L-082 `lint-reads-csharp-generics` (2026-09-27): `everlast.py lint` flagged "template placeholder text" on CachingServiceWithAOPSupport notes naming a C# generic method with a long type parameter list, and a "privacy @handle" on the AGENTS.md import line in a plan.
- Hypothesis: the privacy and dead-path checks are regex-based. The placeholder pattern `<[A-Z][^>]{10,}>` matches any generic parameter list over ten characters that starts with a capital (L-082).
- Rule: write paths of not-yet-existing files without backticks, include the four headings, phrase around at-sign words and `token:` in docs, and keep emails out of saved survey output (the script masks them now). In ai-docs, name type parameters in words and write "the AGENTS.md import line" (L-082).
- Evidence: references/npm.md traps; references/plan-skeleton.md; the playbook's section 8; L-082: CachingServiceWithAOPSupport ai-docs/log.md (Phases 0 and 1), references/plan-skeleton.md (C-20260927-13)
- Scope: skill
- Status: promoted: C-20260925-1, C-20260925-3, C-20260927-13 (references/npm.md traps; references/plan-skeleton.md) · merged: L-082 · helpful 4 · harmful 0 · last_confirmed 2026-09-27

### L-011 · 2026-09-25 · Approvals that the registry or GitHub gate must be the maintainer's clicks; the agent stops and waits
- Trigger: approving a NuGet deployment through `gh api .../pending_deployments` was refused for the agent; npm staged approvals need 2FA (2026-09-25).
- Hypothesis: the gate exists so that a person, not the automation, decides what goes live.
- Rule: at each approval the run posts what is staged or waiting and stops; it never looks for a way around the gate.
- Evidence: SKILL.md "The shape of a run"
- Scope: skill
- Status: promoted: C-20260925-1 (SKILL.md "The shape of a run") · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-012 · 2026-09-25 · Registry indexing lags differ per surface; verification waits and re-polls
- Trigger: nuget.org's package page showed a version within minutes while the registration index took about 25 minutes (NU1102 in a consumer meanwhile); Deno refused an npm version under 24 hours old (2026-09-25). Merged L-062 `verify-waits-both-indexes` (2026-09-27): TrailerClipper 2.0.0-beta.1's verify-published passed on Windows and failed on Linux and macOS: `dotnet tool install` said the version was not found although the wait loop had seen it in the flat container; the registration index committed it after those steps.
- Hypothesis: search, flat container, registration and third-party caches update independently.
- Rule: verify-published workflows poll the authoritative endpoint with a bounded wait before the consumer checks, and pass the flags that turn off age policies for the one command that needs it. On nuget.org the wait loop polls the flat container and the registration index for every package id before any restore or tool install; a failure right after publishing is rerun once before it is treated as real (L-062).
- Evidence: templates/npm and templates/nuget verify-published.yml; L-062: verify-published 36336494800 (failed, then green on rerun), TrailerClipperLib #4 (b4c6b9d), references/nuget.md Traps (C-20260927-9)
- Scope: skill
- Status: promoted: C-20260925-1, C-20260927-9 (templates/npm and templates/nuget verify-published.yml; references/nuget.md Traps) · merged: L-062 · helpful 3 · harmful 0 · last_confirmed 2026-09-27

### L-015 · 2026-09-25 · A JSON round trip erases exactly the edge inputs a golden capture is for
- Trigger: the capture template copied arguments with `JSON.parse(JSON.stringify(...))`, so NaN and Infinity positions became null and -0 became 0 before the call; the recorded case would have claimed NaN behaves like null (2026-09-25).
- Hypothesis: the template was written for a package whose inputs were seeds and small integers.
- Rule: store arguments with a tagged codec (`templates/npm/test/golden/codec.cjs`), decode fresh for each call, and record thrown errors with their class, shared by the capture and the golden test.
- Evidence: C-20260925-3; replace-string-at-position test/golden/1.0.4.json (cases 20, 25, 26, 29)
- Scope: skill
- Status: promoted: C-20260925-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-016 · 2026-09-25 · The dependents, not the survey count, decide what a major may refuse
- Trigger: the kickoff and inventory knew one dependent; the registry said 4; `gh search code` found two, a third-party one included, and reading both call sites showed they pass only strings and an in-text index, which is what made refusing every other call safe (2026-09-25).
- Hypothesis: npm's dependents count has no names; an agent that stops at the number cannot judge a break.
- Rule: list the dependents by name in Phase 0 and read each call site; write in the plan's D15 which calls they make and whether the new major keeps them exact.
- Evidence: C-20260925-3; replace-string-at-position survey note, plan D1 and D15
- Scope: skill
- Status: promoted: C-20260925-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-017 · 2026-09-25 · A callable CommonJS build needs its own entry, a strict banner and a TypeScript 5 interop-off fixture
- Trigger: replace-string-at-position kept `require()` returning the function (plan D2). Rolldown's `output.exports: 'default'` failed the declaration build; the working build (a second tsdown config whose lone default export cjsDefault turns into `module.exports =`) had no `'use strict'`, which the Phase 3 review caught through `Object.hasOwn(fn, 'caller')`; TypeScript 6 fixtures cannot turn esModuleInterop off, so `import = require()` users were untested (2026-09-25).
- Hypothesis: tsdown's defaults assume a named-exports CommonJS build; the strict directive comes from ESM semantics that a CommonJS chunk does not inherit.
- Rule: for a `module.exports = function` package use the recipe in references/npm.md (two configs, hand-written entry points, `banner: {js: "'use strict';"}`), and add a TypeScript 5.9 consumer fixture with esModuleInterop off that compiles and runs `import = require()`, `import * as` and the default import.
- Evidence: C-20260925-4; replace-string-at-position pull requests #2 and #3
- Scope: skill
- Status: promoted: C-20260925-4 · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-019 · 2026-09-25 · A network or callback package needs a capture built around a local fixture server
- Trigger: is-an-image-url 1.0.4 answers through a callback after a `request` GET; the capture template is synchronous and records return values only. Written around a fixture server, the capture found non-boolean answers (`undefined`, `''`), a synchronous callback on every no-request path, an uncaught crash for a string callback, the whole body downloaded, and credentials leaked in a Referer header on a cross-host redirect; none of that is visible to a return-value capture or to the old tests, which hit google.com (2026-09-25).
- Hypothesis: the template was written for pure functions; the behaviour of a network package lives in timing, call counts and the requests it makes.
- Rule: follow references/npm.md's recipe (fixture server in the capture, placeholders in the arguments, requests with raw headers, callback timing, uncaught exceptions, CLI runs, run twice and diff), then probe the replacement transport on the same routes before the plan.
- Evidence: is-an-image-url test/golden/ (capture-1.0.4.cjs, fixture-server.cjs, fetch-probe.cjs); C-20260925-6
- Scope: skill
- Status: promoted: C-20260925-6 · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-020 · 2026-09-25 · Run the published bin before planning; a CLI can be broken for years without an issue
- Trigger: the inventory and the kickoff said is-an-image-url "has a CLI (meow)"; the published 1.0.4's CLI fails on every call, `--help` included, because meow 5 no longer accepts `help` as an array; 1.0.3 (meow 3.7.0) worked. No issue was filed in six years (2026-09-25).
- Hypothesis: a survey reads `package.json` and the README, which describe the CLI, not whether it runs; a caret range on a CLI framework moves under the code.
- Rule: in Phase 0 install the published version in a scratch project and run the bin with `--help` and one input; when it fails, run the previous version to learn the contract; record the CLI runs in the golden file and write the refuted claim into the kickoff prompt.
- Evidence: is-an-image-url test/golden/1.0.4.json (`cli`); references/npm.md Phase 0; C-20260925-6
- Scope: skill
- Status: promoted: C-20260925-6 (references/npm.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-021 · 2026-09-25 · everlast's sync push pushes on its own; a run told not to push registers with sync off
- Trigger: the is-an-image-url run was told to commit locally and not push; `everlast.py project register --sync push` reported that the SessionEnd hook would commit and push `ai-docs/` whenever it was safe, which would have pushed master behind the maintainer's back (2026-09-25).
- Hypothesis: the skill's Phase 0 said "sync push" unconditionally, written for runs that push anyway.
- Rule: when a run must not push, register with `--sync off`, say so in the plan's D14, and re-register with `--sync push` once the maintainer has ruled.
- Evidence: is-an-image-url ai-docs/log.md; references/npm.md Phase 0; C-20260925-6
- Scope: skill
- Status: promoted: C-20260925-6 (references/npm.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-022 · 2026-09-26 · Take the plan rulings first-hand from the maintainer, not from a summary of an earlier session
- Trigger: the maintainer wrote "fix all your recommendations and push" in a fresh session; the recommendations were only in the previous session's closing report. Acting on them (18 branch deletions, 3 webhook deletions, a release) was blocked by the auto-mode check as approvals that came from model output, and the run stopped to ask. One multiple-choice question confirmed every ruling and the OKs in a few seconds (2026-09-26).
- Hypothesis: "silence means the recommendations stand" works inside one session; across sessions the only record of what was recommended is model output, and deletions need an approval the maintainer can be seen to give.
- Rule: at the start of a run that continues past the plan review, restate the rulings and the deletion OKs as one question (AskUserQuestion, with "yes, all", "yes, but no deletions" and "I meant something else" options) unless the maintainer wrote them into the plan or the kickoff prompt themselves; then write the answer into the plan's Status with the date.
- Evidence: is-an-image-url ai-docs/log.md and plan Status (2026-09-26); C-20260926-1
- Scope: skill
- Status: promoted: C-20260926-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-023 · 2026-09-26 · A test fixture server that destroys its sockets must wait before the next fetch
- Trigger: on Node 20, 22 and 26 (not 24) every other network case failed with `false` and no request logged. The fixture server's `dropConnections()` destroyed the sockets after each case, and the next fetch went out at once on a pooled keep-alive socket undici had not yet seen close (2026-09-26).
- Hypothesis: undici notices a server-side close asynchronously; a request issued in the same tick reuses the dead socket and fails without a retry.
- Rule: after destroying server sockets in a test, wait (30 ms was enough) before the next request, through one helper every suite uses; run the network suites on every Node line locally before trusting a pass on one.
- Evidence: is-an-image-url test/golden/golden.test.js and test/functional (`dropConnections`), plan Risks; C-20260926-1
- Scope: skill
- Status: promoted: C-20260926-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-024 · 2026-09-26 · Inlining a dependency: copy its behaviour exactly, flags and platform included, and its licence from the tarball
- Trigger: three slips while inlining is-url and is-image into is-an-image-url (2026-09-26). The xo rule that requires the `u` flag would have changed is-url's `\S{2,}`, because with `u` an astral character counts once instead of twice. is-image used Node's platform `path.extname`, which splits on backslashes on Windows only, so the POSIX rewrite changed Windows answers. That went unnoticed until the review, because the golden capture had no backslash cases. The first draft of the MIT notice named a copyright holder ("2015 Segment.io") that is-url's LICENSE-MIT does not contain.
- Hypothesis: an inlined dependency looks like new code, so lint rules and memory get applied to it; its behaviour depends on the regex flags and the runtime platform it ran on.
- Rule: download the exact version's tarball (`npm pack name@version`) and copy the code and the licence text from it; keep the original regex flags, with a lint disable that gives the reason; list the platform-dependent calls it makes (`path`, `os`, `process.platform`), name in the plan which platform the new code follows, and add golden or unit cases for the difference; record the capture's platform in the golden header.
- Evidence: is-an-image-url src/url-pattern.ts, src/image-extensions.ts, LICENSE, review finding 1; C-20260926-1
- Scope: skill
- Status: promoted: C-20260926-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-025 · 2026-09-26 · xo --fix changes public types and comments; read its diff of src/ line by line
- Trigger: `xo --fix` on is-an-image-url removed `| null` from the public overloads (`@typescript-eslint/no-restricted-types`, an API change: 1.0.4 took null), rewrote `http://` as `https://` inside a comment (`unicorn/prefer-https`), capitalised a package name at the start of a comment (`capitalized-comments`), and turned a string with backslashes into `String.raw` (2026-09-26). Merged L-049 (2026-09-27): in markdown-plain-link-replacer xo --fix rewrote a test's `new Promise(resolve => ...)` into `Promise.withResolvers()` (Node 22+); every golden case failed on Node 20 (304 failures) while Node 22 to 26 passed.
- Hypothesis: the fixers are safe for style and unsafe for meaning, and a large diff hides the few that matter.
- Rule: stage before `xo --fix`, then `git diff src/` and restore any change to a signature, a type or a comment's facts; keep an intended `null` with a disable comment that gives the reason. A `String.raw` template cannot end in a backslash (it escapes the closing backtick); write that string as an ordinary quoted string with a doubled backslash. After `xo --fix`, run the suites on the floor Node line (`npx -p node@20`) before pushing; keep unicorn/prefer-promise-with-resolvers off in the template's xo config while the floor is Node 20 (Array#toSorted and friends are fine on 20; Iterator helpers and Promise.withResolvers are not) (L-049).
- Evidence: is-an-image-url commits on v2; references/npm.md Traps; C-20260926-1; L-049: markdown-plain-link-replacer xo.config.js, templates/npm/xo.config.js (C-20260927-3)
- Scope: skill
- Status: promoted: C-20260926-1, C-20260927-3 (references/npm.md Traps; templates/npm/xo.config.js) · merged: L-049 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-026 · 2026-09-26 · Network packages: clamp user timeouts, and never offer an input allow-list as SSRF protection
- Trigger: the review of is-an-image-url found that a timeout above 2147483647 ms overflows `setTimeout` to 1 ms, so the answer was an instant `false`. It also found that README and SECURITY.md advised checking user URLs against an allow-list, which a redirect to an internal host bypasses. A redirect to a URL with credentials also changed its answer under fetch (2026-09-26).
- Hypothesis: timeouts and redirects are where fetch-based rewrites differ from `request` and from what the docs say.
- Rule: for every package that takes a timeout, clamp it to 2147483647 or reject larger values, and test it with 3e9. For every package that follows redirects, the docs say an input allow-list is not enough and point to network-level egress control. The functional suite includes a redirect to another port and a redirect to a credentialed URL. A shared `AbortSignal` has 0 listeners after the calls settle (`getEventListeners`). A one-call process exits long before the default timeout.
- Evidence: is-an-image-url review findings 2, 3, 4, 8; C-20260926-1
- Scope: skill
- Status: promoted: C-20260926-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-027 · 2026-09-26 · Read the merge method and SHA after the maintainer merges; the plan's "squash" is a wish
- Trigger: the is-an-image-url plan said squash-merge; the maintainer merged PR #25 with a merge commit (d9e246b), and the ruleset that would have pinned the method was still waiting for the merge (2026-09-26). Merged L-077 `settings-before-the-pull-request` (2026-09-27): IsImageUrlDotNet's plan put the rulesets in Phase 4 "before the merge"; the maintainer reviewed and merged pull request #1 (a merge commit) as soon as he read it, so the rulesets and the required `ci` check never gated that merge.
- Hypothesis: the maintainer merges from the web UI with whatever button is the default; nothing in the run enforced the method. The stop at the pull request hands the merge to the maintainer; anything meant to gate it has to be in place when the stop message goes out (L-077).
- Rule: after the merge, read `gh pr view N --json mergeCommit,mergedAt` and cite that SHA in the bot pull request comments and the log; accept the method used unless the maintainer asks otherwise. Apply the ruleset before the merge (it gates the merge on `ci`); if squash matters, also set the repository to allow only squash merges in the Phase 4 settings. At the end of Phase 3, before the stop message, apply the branch ruleset (required check `ci`), the tag ruleset and the security settings, and say in the stop message that the merge is gated (L-077).
- Evidence: is-an-image-url log 2026-09-26, plan Phase 4; C-20260926-2; L-077: IsImageUrlDotNet ai-docs/log.md "Phase 4 and the Phase 5 stop" (merge e9e1eb7, rulesets 24084842 and 24084845 after it), C-20260927-12
- Scope: skill
- Status: promoted: C-20260926-2, C-20260927-12 (SKILL.md phases table, Phases 3 and 4; references/npm.md Phase 4) · merged: L-077 · helpful 2 · harmful 0 · last_confirmed 2026-09-27

### L-028 · 2026-09-26 · Under automatic permission modes, take the go for GitHub writes in the session and hand over the commands
- Trigger: after the merge of is-an-image-url, 17 `gh pr close --delete-branch` calls and a branch deletion went through; the next step (the ruleset) was refused by Claude Code's auto-mode classifier as an external system write, and the refusal covered the same outcome by any route. The deletion OKs were recorded in the plan by an earlier session (2026-09-26). Merged L-054 (2026-09-27): in markdown-plain-link-replacer the auto-mode classifier blocked post-merge-cleanup.sh, even its dry run, despite the maintainer's "run everything"; the maintainer's own run from PowerShell failed with "gh: command not found" (PowerShell's `bash` is not Git Bash) and read the PR state as empty; adding "Bash" to permissions.allow in ~/.claude/settings.json cleared it.
- Hypothesis: the classifier judges a burst of outward writes on its own evidence; OKs written in repository files by an earlier session do not count as the user's authorization in this one.
- Rule: before the post-merge cleanup, list every GitHub write in one message (closures with their comment, branch deletions, ruleset, settings, tag push) and take the maintainer's go in that session. Write the exact commands (ruleset JSON included) into the HANDOFF so the maintainer can run whatever gets refused. Stop at a refusal; never re-route it. The release tag push (`npm version` plus `git push --follow-tags`) starts a publish and was refused as "Create Public Surface" even after an in-session "go" that did clear the ruleset; it went through once the maintainer said in so many words to run it ("you run it"). The maintainer does not want to be told to run commands; ask for the explicit instruction, then run them. If the harness classifies GitHub writes as blocked, ask the maintainer once for a Bash allow rule rather than handing the script over; if they run it themselves, give the Git Bash path and the repository directory. verify-registry-npm.sh takes PACKAGE VERSION [OWNER/REPO]; passing the version first gives a 404 (L-054).
- Evidence: is-an-image-url HANDOFF.md and log 2026-09-26 (ruleset 24042507 created after the go; tag push refused); C-20260926-2, C-20260926-3; L-054: markdown-plain-link-replacer HANDOFF 2026-09-27, references/npm.md Phase 4 (C-20260927-4)
- Scope: skill
- Status: promoted: C-20260926-2, C-20260926-3, C-20260927-4 (SKILL.md "The shape of a run", stops; references/npm.md Phase 4) · merged: L-054 · helpful 2 · harmful 0 · last_confirmed 2026-09-27

### L-029 · 2026-09-26 · The release workflow needs a `## [X.0.0]` changelog heading; lint after every edit before tagging
- Trigger: is-an-image-url's first beta tag failed in release.yml because CHANGELOG.md's section was `## [Unreleased]` (Keep a Changelog style), which the notes step cannot map to 2.0.0. The one-line heading fix left `[Unreleased]:` as an unused link definition, and the second tag failed on xo's markdown/no-unused-definitions. Two burned prerelease numbers (beta.1, beta.2); beta.3 staged (2026-09-26). Merged L-039 (2026-09-27): format-json-files v2.0.0-beta.1: release.yml wrote release-notes.md from CHANGELOG.md, then `npm run lint` linted it and xo failed on the unused `[2.0.0]` link definition (run 36281331934); nothing was staged and the tag was burned.
- Hypothesis: the template AGENTS.md says a prerelease uses the section of the release it leads to, but nothing in Phase 2 said the heading must name that version; and a docs-only edit felt too small to lint. The template writes the notes into the checkout before the lint step, and xo lints Markdown (L-039).
- Rule: write the new section as `## [X.0.0] - Unreleased` from Phase 2 on, with its link definition `[X.0.0]:`; before any `npm version`, run lint, typecheck and tests on the exact tree being tagged. The xo config ignores `release-notes.md` and .gitignore lists it (templates/npm, fixed 2026-09-27); for a package written before the fix, check its xo ignores before the first tag (L-039).
- Evidence: is-an-image-url release runs 36247863837 (no section), 36247959799 (xo), 36248115597 (staged); C-20260926-4; L-039: format-json-files pull request #3 (50ff9f1), beta.2 staged in run 36281483946, C-20260927-1
- Scope: skill
- Status: promoted: C-20260926-4, C-20260927-1 (references/npm.md; templates/npm/xo.config.js and .gitignore) · merged: L-039 · helpful 2 · harmful 0 · last_confirmed 2026-09-27

### L-030 · 2026-09-26 · actionlint without shellcheck checks no shell; a truncated test line reached a live verify run
- Trigger: is-an-image-url's verify-published.yml had `[ "$answer" = "true"` with no closing bracket in the Bun job (a Phase 2 edit cut the line); actionlint 1.7.12 passed it because shellcheck was not installed, `bash -n` passes it too (`[` is a command), and it failed only in verify run 36249319506 after 2.0.0-beta.3 was approved. Re-run 36249497972 green after the fix (2026-09-26).
- Hypothesis: "actionlint clean" was taken to cover the shell inside `run:` blocks; it silently skips that without shellcheck.
- Rule: run `scripts/check-workflow-shell.py` (shellcheck at error level per block, through `uvx --from shellcheck-py` when not on PATH; dedents the YAML block first) with actionlint on every workflow change, and verify a checker catches a planted bug before trusting its pass.
- Evidence: is-an-image-url commit "verify-published: close the Bun CLI test bracket"; the script flags the pre-fix file and passes both templates and five repositories; C-20260926-5
- Scope: skill
- Status: promoted: C-20260926-5 (the script flags the pre-fix file and passes both templates and five repositories) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-031 · 2026-09-26 · A placeholder in a command shown to the maintainer can become the live registry state
- Trigger: the agent wrote the 1.x deprecation as `npm deprecate is-an-image-url@"<2" "..."` in a chat reply, meaning "the message from D4"; the maintainer ran it verbatim and every 1.x version went live with the deprecation message `...` (2026-09-26). The agent's attempt to correct it was refused by auto mode as a change to a shared resource. Merged L-037 (2026-09-26): in the stack-exchange-markdown-retriever run, `npm deprecate` from the agent shell exited with EOTP: there is no TTY, `--auth-type=web` does not wait for the browser approval, and the auth URL is masked in the output; the overlay's note that the agent may run 2FA-gated commands did not hold.
- Hypothesis: a maintainer copies commands; shorthand that is obvious in the transcript is invisible at the terminal. npm's web-auth flow needs an interactive terminal to print the link and poll for the approval; a piped shell gets neither (L-037).
- Rule: every command shown to the maintainer is complete and runnable, messages included; after any registry change the maintainer makes, read it back (`npm view PACKAGE@OLD deprecated`, `verify-registry-npm.sh`) before logging it done. Never try `npm deprecate` or `npm dist-tag` from the agent: hand the maintainer the complete command for their own terminal, then check it with `npm view PACKAGE@OLD deprecated` (L-037).
- Evidence: is-an-image-url log 2026-09-26; `npm view is-an-image-url@1.0.4 deprecated` printed "..."; C-20260926-6; L-037: stack-exchange-markdown-retriever ai-docs/log.md 2026-09-26, references/npm.md Phases 5 and 6 (C-20260926-11)
- Scope: skill
- Status: promoted: C-20260926-6, C-20260926-11 (references/npm.md Phases 5 and 6) · merged: L-037 · helpful 2 · harmful 0 · last_confirmed 2026-09-26

### L-032 · 2026-09-26 · Script any command chain a run repeats, and prove the script on a replay of the real mistake
- Trigger: the release and verification steps of is-an-image-url took about 25 ad-hoc calls (finding runs, digging logs for the stage id, the failing step, dist-tags, attestations, audit, smoke, release view) and two failed tags that a pre-tag check would have caught (2026-09-26).
- Hypothesis: each step is short, so nobody scripts it; across seven packages the chain costs more than the scripts, and every retyping risks a slip.
- Rule: when a phase needs the same three or more commands in every run, write a script under scripts/ that prints only the evidence, and test it against the run that motivated it (a known failed run, a replayed commit, a dry run on the merged pull request) before relying on it. Scripts added: preflight-tag-npm.sh, watch-run.sh, verify-registry-npm.sh, post-merge-cleanup.sh, check-workflow-shell.py.
- Evidence: scripts tested 2026-09-26 on is-an-image-url runs 36247959799 (failure shown in 7 lines) and 36248115597 (stage id shown), a replay of f2bf891~1 (FAIL on the changelog), 2.0.0 (VERIFIED) and 1.0.4 (FAIL: deprecated, no provenance), and a dry run on PR #25; C-20260926-6
- Scope: skill
- Status: promoted: C-20260926-6 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-036 · 2026-09-26 · Search old package.json scripts and published versions for tokens, not only config files
- Trigger: the kickoff expected no secrets; `git log -p` showed `snyk auth <uuid>` in package.json's test script, removed in 2017, and `npm view PACKAGE@1.1.5 scripts` still shows it (masked as `***`) in two published versions (2026-09-26).
- Hypothesis: the survey looked at dotfiles and workflows; 2016 to 2017 packages often put CLI logins straight into npm scripts, and the registry keeps every version's package.json.
- Rule: grep history for `auth [0-9a-f]{8}-`, `_authToken` and `token`, and read `scripts` of every published version; a masked `***` in npm's output means a token was there. Name the provider for the maintainer to revoke; never copy the token into docs.
- Evidence: stack-exchange-markdown-retriever commit ee6e4b0; references/npm.md Phase 0 "Leaked credentials" (C-20260926-10)
- Scope: skill
- Status: promoted: C-20260926-10 (references/npm.md Phase 0 "Leaked credentials" (C-20260926-10)) · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-038 · 2026-09-26 · Tag pushes run in the main session; a subagent's refusal is not a reason to ask the maintainer
- Trigger: in a subagent, the permission classifier refused `npm version 2.0.0-beta.1 && git push --follow-tags` as "Create Public Surface", and the run asked Mark for "run it". The main session then ran the same step without trouble under Mark's standing authorization (2026-09-26).
- Hypothesis: a subagent's classifier judges a tag push without the maintainer's context. The main session holds his standing authorization.
- Rule: when a subagent is refused a tag push or another release step, it stops and reports to the main session, and the main session runs the step. Do not ask Mark for "run it" on tag pushes. The same goes for deleting a merged branch the go already covered.
- Evidence: stack-exchange-markdown-retriever log 2026-09-26 (beta.1 tag 9cac49c pushed by the main session)
- Scope: skill
- Status: promoted: C-20260926-11 · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-040 · 2026-09-27 · xo's cache hides lint errors in edited files; CI finds them
- Trigger: format-json-files: local `npx xo` was clean, and CI's lint failed on two rules in src/require.ts. The cache in node_modules/.cache/xo-linter predated the edit (2026-09-26).
- Rule: `rm -rf node_modules/.cache` before the last local lint before a push (or add it to preflight-tag-npm.sh and the Phase 2 exit).
- Evidence: format-json-files CI runs 36277483722 (fail) and 36277589680
- Scope: skill
- Status: promoted: C-20260927-1 (references/npm.md) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-041 · 2026-09-26 · A golden capture made on Windows lacks file symlinks; CI runners make them
- Trigger: the format-json-files capture could not create file symbolic links (EPERM without developer mode). The golden test then failed on every CI runner, including windows-latest, because there the link existed and 2.x reported it (2026-09-26).
- Rule: a filesystem capture records which links it could not make (`unavailable`), and the golden test names the link behaviour as an exception by reason, not by the recording. Or capture on Linux (CI or WSL) when links matter.
- Evidence: format-json-files test/golden/golden.test.js (SKIPPED_LINK), capture-fixtures.cjs
- Scope: skill
- Status: promoted: C-20260927-1 (references/npm.md) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-042 · 2026-09-26 · export = with a namespace: two tsdown declaration traps
- Trigger: format-json-files' CommonJS entry, the function plus types under `export =`. (1) Aliasing imported types under their own names inside the merged namespace became `type FormatOptions = FormatOptions`. (2) `fn.default = fn` became `var formatJsonFiles: typeof formatJsonFiles` inside the namespace, which is TS2502 for every CommonJS consumer; attw did not catch it, and the consumer fixtures did (2026-09-26).
- Rule: declare the types under short internal names and export them under the public ones. Write `declare namespace fn { export {fn as default, fn}; export type X = Y; }` and set the properties with Object.assign. Keep the four TypeScript consumer fixtures: they are the check that caught it.
- Evidence: format-json-files src/require.ts, dist/index.d.cts
- Scope: skill (references/npm.md export shape)
- Status: promoted: C-20260927-1 (references/npm.md export shape) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

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
- Status: promoted: C-20260927-1 (references/npm.md Phase 0, the recipe asked for in continuation-2 item F) · helpful 0 · harmful 0 · last_confirmed 2026-09-26

### L-044 · 2026-09-27 · `npm --prefix DIR init -y` writes package.json in the working directory, not DIR
- Trigger: markdown-plain-link-replacer Phase 0: a scratch project was made with `npm --prefix <scratch> init -y` after an earlier shell call had cd'd into the repository. npm init ignored the prefix, normalised the repository's own package.json (git+ URL, bin object, directories, type), and the change went into the Phase 0 commit (87e88c6, restored in 8b977db). It also made the tarball diff report package.json as different when it was identical (2026-09-27).
- Hypothesis: npm init, like npm exec, works on the current directory; `--prefix` only moves install targets.
- Rule: make a scratch project with `mkdir DIR && cd DIR && npm init -y` inside a subshell `( ... )`, never with `--prefix`; run `git status --short` before every Phase 0 commit and account for each modified tracked file.
- Evidence: markdown-plain-link-replacer ai-docs/log.md "package.json restored"
- Scope: skill (references/npm.md Traps)
- Status: promoted: C-20260927-2 (references/npm.md Traps) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-045 · 2026-09-27 · Guard the capture at the socket, not by counting requests per case
- Trigger: markdown-plain-link-replacer's capture, adapted from stack-exchange-markdown-retriever's, aborted three times on cases that legitimately make no request (a www link that throws first, ftp and mailto links, a non-ASCII path request refuses). Marking them one by one guessed at behaviour the capture exists to record (2026-09-27).
- Hypothesis: "every case must reach the proxy" is a proxy for the real rule, "nothing leaves 127.0.0.1".
- Rule: in a network capture, wrap `net.Socket.prototype.connect` so any host but 127.0.0.1 or localhost throws, list the cases without a request on stderr for review, and grep the golden file for the guard's message (0 expected). For many hosts, request 2.88 honours HTTP_PROXY for http links (absolute-form requests) as well as HTTPS_PROXY (CONNECT), so one fixture proxy routed by path serves every host with no DNS changes; an `x-fixture-url` header lets the new code's fetch wrapper reach the same routes directly.
- Evidence: markdown-plain-link-replacer test/golden/capture-1.1.16.cjs and fixture-server.cjs (164 cases, guard never fired, two runs byte-identical)
- Scope: skill (references/npm.md Phase 0)
- Status: promoted: C-20260927-2 (references/npm.md Phase 0) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-046 · 2026-09-27 · A package whose output passes through a dependency's new major needs a mechanical exception, not a re-recording
- Trigger: markdown-plain-link-replacer writes the title get-title-at-url returns; 3.0.0 extracts titles differently from 1.1.8 (article-title), so almost every golden output would differ in the title alone (2026-09-27).
- Hypothesis: when a consumer adopts its dependency's new major, the dependency's own changelog is the exception, and the golden test can apply it by computing both answers for each fixture (the old extractor as a test-only dev dependency, the new one's exported function) and swapping them in the recorded output, so every other byte stays under test.
- Rule: plan it as one named exception with the swap described in D1; confirm in Phase 2 that the swap covers every changed case and nothing else. Proven in Phase 2 without the old extractor: every ordinary fixture page gave the same old title ("Page"), so the swap replaces that fixed string with the new dependency's answer for each URL, fetched by the golden test itself, and the pages whose reading changed in other ways became named exceptions with explicit outputs. Before planning the swap, run every recorded case through the first build in a scratch script and list the differences: each must map to a plan item or be a bug (three new items, E15 to E17, came from that list).
- Evidence: markdown-plain-link-replacer test/golden/golden.test.js (swapTitles, exceptions), log "Phase 2: rewrite, golden test, canary"
- Scope: skill (SKILL.md Golden capture)
- Status: promoted: C-20260927-2, C-20260927-3 (SKILL.md Golden capture) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-047 · 2026-09-27 · The canary's `git checkout -- src/` reverts nothing while src/ is untracked
- Trigger: markdown-plain-link-replacer Phase 2: the canary was planted before src/ had ever been committed, so `git checkout -- src/` left the plant in place and the "reverted" run was still red; the plant came out by hand (2026-09-27). Merged L-074 `commit-before-canary` (2026-09-27): in IsImageUrlDotNet Phase 2 the first canary was planted while the new `src/` was uncommitted; `git checkout -- src/` would have restored the 2016 source file over the whole rewrite, so it was reverted with the inverse edit.
- Hypothesis: the recipe assumes a rewrite on top of a tracked src/; a first rewrite has none.
- Rule: commit src/ (a work-in-progress commit on the branch is fine) before planting the canary, and check `git status --short src` is empty after the revert. Revert the plant with `git checkout -- <file>`; if the source is not committed, revert with the inverse edit and check `git diff` shows no change in that line (L-074).
- Evidence: markdown-plain-link-replacer log "Phase 2: rewrite, golden test, canary" (38fd6d4 then the canary); L-074: IsImageUrlDotNet ai-docs/log.md "Phase 2: rewrite on v2", SKILL.md golden capture (C-20260927-11)
- Scope: skill (references/npm.md Phase 2 canary)
- Status: promoted: C-20260927-3, C-20260927-11 (references/npm.md Phase 2 canary; SKILL.md golden capture) · merged: L-074 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-048 · 2026-09-27 · Taking a young dependency past the cooldown: add it alone, after the tree is locked under the cooldown
- Trigger: markdown-plain-link-replacer depends on the maintainer's own new majors, released one and two days earlier. One `npm install --min-release-age=0 <four packages>` resolved the whole tree past the cooldown: 35 locked versions younger than three days, 32 of them dev tools. CI's `npm audit signatures` then failed with notarget, because it applies min-release-age to locked versions too (2026-09-27).
- Hypothesis: `--min-release-age=0` applies to every package that command resolves, not only the ones named.
- Rule: install everything else under the cooldown first (without the young packages in package.json), then `npm install --min-release-age=0 <young packages>` alone; check the lockfile for versions younger than the cooldown (a packument time per locked version). In ci.yml pass `--min-release-age=0` to `npm audit signatures` while a runtime dependency is younger than the cooldown, with the reason in a comment; `npm install` in a clone fails with notarget until then (`npm ci` works).
- Evidence: markdown-plain-link-replacer cb59a48, log "Phase 2: verification"
- Scope: skill (references/npm.md Phase 1 install cooldown)
- Status: promoted: C-20260927-3 (references/npm.md Phase 1 install cooldown) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-050 · 2026-09-27 · Editor-tool content decodes `\u` escapes; `a && grep | b && git commit` commits after failures
- Trigger: markdown-plain-link-replacer: comments written as `[a-z\u00a1-\uffff]` through the Write tool landed as the literal characters; and a chain `npm run test:dist | grep ... && git commit` committed and pushed while 8 tests had failed, because grep's exit status passed (2026-09-27).
- Trigger, merged from L-058 `tool-unescapes-backslash-u` (2026-09-27): in the TrailerClipper run, a C# escape for "<" written through the Write and Edit tools, and through a Python heredoc, arrived as a literal "<" three times; the config text escaping it was meant to restore became a no-op that compiled and passed the unit build.
- Hypothesis: the tool layer unescapes JSON-style sequences in the text it is handed, and Git Bash heredocs halve backslashes; both happen before the file is written (L-058). A pipeline takes the exit status of its last command, so grep decides whether the commit runs.
- Rule: after writing source with the editor tools, grep new files for non-ASCII (`grep -nP '[^\x00-\x7F]'`) and restore escapes written doubled; never gate a commit on a pipeline whose last command is grep: run the tests, check the summary, then commit in a separate call.
- Rule, from L-058: any text holding a backslash followed by u and four hex digits (C# or JSON escapes, markdown that quotes them) is written through Python with chr(92), then grepped in the file; a test that asserts the escaped output (built with (char)92 in the test source) catches the silent version.
- Evidence: markdown-plain-link-replacer src/scan-links.ts comments; 17b3578 (the failures did not recur in three reruns or CI); L-058: TrailerClipperLib d033b12 (TrailerClipper.ConfigText, ReviewTests.Config_text_escapes_what_JavaScriptSerializer_escaped), references/nuget.md Traps (C-20260927-7)
- Scope: skill (SKILL.md Windows line; references/npm.md Traps)
- Status: promoted: C-20260927-3, C-20260927-7 (SKILL.md Windows line; references/npm.md Traps; references/nuget.md Traps and the F# capture) · merged: L-058 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-051 · 2026-09-27 · A package with runtime dependencies: tests route fetch by URL, and oracles for inlined pieces are recorded, not installed
- Trigger: markdown-plain-link-replacer is the first run whose new major keeps runtime dependencies (the maintainer's three packages and tldts) and inlines two old ones (url-regex, hogan.js) (2026-09-27).
- Rule: route the dependencies' fetches in tests through a globalThis.fetch wrapper that sends every URL to the fixture server with the meant URL in a header, following redirects itself; stub fetch in-process for unit suites. For an inlined old dependency, record its answers in a scratch project into a committed JSON oracle with its capture script (hogan.js 3.0.2: 128 entries), or write its own expression into the test as the oracle (url-regex 4.1.1, 3000 generated texts), rather than installing it as a dev dependency (old trees bring alerts). The shape test lists the allowed require() names of the CommonJS build and runs it in a bare vm context with a require that serves only those.
- Evidence: markdown-plain-link-replacer test/helpers/web.js, stub-fetch.js, test/unit/hogan/, test/unit/find-links.test.js, test/package/shape.test.js
- Scope: skill (references/npm.md Phase 2)
- Status: promoted: C-20260927-3 (references/npm.md Phase 2) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-052 · 2026-09-27 · After the review, fuzz against the published package itself, not a restated oracle
- Trigger: markdown-plain-link-replacer's Phase 3 reviewer found 3 bugs. A later offline differential of the published 1.1.16 (installed in a scratch folder, network modules replaced through Module._load, setTimeout forced to 0, a marker template) against dist/ on 13 000 generated texts found two more: whitespace such as U+3000 that the old code trimmed from its match, and a dot before `)`. The in-repo differential restated the rules and missed both (2026-09-27). Merged L-086 `differential-against-the-original` (2026-09-27): CachingServiceWithAOPSupport 2.0.0 reimplements JavaScriptSerializer (Framework-only) for its cache keys; the 50 golden key cases and 37 unit tests passed, and the Phase 3 review's differential fuzz against the real serializer on net48 still found seven differences (IntPtr, double.MaxValue on .NET Framework, DateTimeOffset, Uri escaping, __type order, long enums, TimeSpan depth).
- Hypothesis: a restated oracle carries the restater's reading of the old rules, and a golden capture samples only the old package's own inputs; a reimplemented dependency has a far larger input space, which only a comparison with the original covers (L-086).
- Rule: before the release rehearsal, run the published old version and the new build side by side on generated input, with the old side's network stubbed at the module level. Seed the generator with whole links (random pieces almost never form one; the first 2000 texts had 0 links). Group the differences by cause, filter out the numbered exceptions, and read every remaining group. The old code's checks apply to its own trimmed values, so a restated rule is easy to get subtly wrong. When the rewrite replaces a dependency's behaviour, add a test that compares the two over edge cases and seeded random inputs on a runtime where the original still runs (net48 for a .NET Framework assembly), and keep it in the suite (L-086).
- Evidence: markdown-plain-link-replacer 7146f05, log "Phase 3: every review finding fixed or recorded"; L-086: CachingServiceWithAOPSupport ai-docs/notes/2026-09-27-phase-3-review-findings.md, ReviewTests.R12, references/nuget.md Phase 2 (C-20260927-15)
- Scope: skill (references/npm.md Phase 3)
- Status: promoted: C-20260927-4, C-20260927-15 (references/npm.md Phase 3; references/nuget.md Phase 2) · merged: L-086 · helpful 2 · harmful 0 · last_confirmed 2026-09-27

### L-053 · 2026-09-27 · Staggered-timer tests measure from the first event
- Trigger: a test asserting each title lookup came at least 90 ms after the previous one failed intermittently (86 ms). The code schedules lookup i at i * 100 ms from one start, so one late timer shortens the next gap (2026-09-27).
- Rule: assert each event against the first (>= i * interval - tolerance), not against the previous one.
- Evidence: markdown-plain-link-replacer test/functional/replace-plain-links.test.js
- Scope: skill (references/npm.md Traps)
- Status: promoted: C-20260927-4 (references/npm.md Phase 3), confirmed carried in C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-055 · 2026-09-27 · Latest tooling, widest audience
- Trigger: maintainer's direction during the TrailerClipper run (2026-09-27): update everything to latest, but the widest audience the package or repository can work for is desirable.
- Rule: tooling, language level, dependencies and CI move to current; the floor and the target list stay as wide as costs nothing in safety or upkeep (for NuGet keep netstandard2.0 beside the current TFM; for npm the lowest supported Node line; every OS the code can run on). Each dropped runtime, platform or framework needs a named reason in the plan's decisions table. Width is measured among current users: prefer newer tools and trends over stale or forgotten ones (a live, maintained dependency or channel over an abandoned one, even if the abandoned one once had more users; maintainer's follow-up the same day).
- Evidence: user request, TrailerClipper session 2026-09-27
- Scope: skill (SKILL.md Plan paragraph)
- Status: promoted: C-20260927-5 (SKILL.md Plan paragraph) · helpful 0 · harmful 0 · last_confirmed 2026-09-27

### L-056 · 2026-09-27 · Capture a .NET Framework package on net48, and a package that runs a program against real fixtures
- Trigger: TrailerClipper 1.1.0 (net40, JavaScriptSerializer from System.Web.Extensions, MediaToolkit's ffmpeg) could not be loaded by the template's net10.0 console; its behaviour is files written by ffmpeg, not return values (2026-09-27).
- Hypothesis: the capture template assumed a pure library on modern .NET.
- Rule: capture on net48 when the old assembly needs a Framework-only reference; for a package that shells out, run each case in a fresh fixture copy, record the file tree with a measured property per output file, keep console output, replace the scratch path with a token, and run the capture twice to prove it deterministic. Read the old nupkg's file list for bundled third-party DLLs.
- Evidence: TrailerClipperLib tests/Golden/Capture/Program.cs, commit 8e59145; ai-docs/log.md Phase 0
- Scope: skill (references/nuget.md Phase 0; scripts/golden-capture-nuget.template.cs header)
- Status: promoted: C-20260927-6 (references/nuget.md Phase 0; scripts/golden-capture-nuget.template.cs header) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-059 · 2026-09-27 · Generate the golden replay from the capture program
- Trigger: TrailerClipper's golden test needed the capture's 148 cases, their arguments and recording rules against the new build (2026-09-27).
- Rule: produce the test's runner from the committed capture program by a mechanical rewrite with a header saying how, mark it generated for the formatter, compare case by case, and keep every allowed difference in one exception table keyed by method, culture and arguments, with a test that each key matches a recorded case. First build: 138 of 150; the 12 were one real named exception (E9) and a test-side key order.
- Evidence: TrailerClipperLib tests/TrailerClipperLib.Tests/GoldenRunner.cs, GoldenTests.cs (f0f9c94)
- Scope: skill (references/nuget.md Phase 2)
- Status: promoted: C-20260927-7 (references/nuget.md Phase 2) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-060 · 2026-09-27 · A reflection baseline of the old public API, with parameter names
- Trigger: the Phase 3 review found that the class method RemoveTrailers(string directoryPath, decimal milliseconds) had taken the interface's parameter names; the golden replay calls by position and could not see it, and package validation could not use the net40 1.1.0 as a baseline (2026-09-27).
- Rule: when package validation has no usable baseline, list the published DLL's public members with parameter names by reflection into a committed file and test that 2.x keeps every line.
- Evidence: TrailerClipperLib tests/TrailerClipperLib.Tests/PublicApi-1.1.0.txt, ReviewTests.cs PublicApiTests (d033b12)
- Scope: skill (references/nuget.md Phase 2)
- Status: promoted: C-20260927-7 (references/nuget.md Phase 2) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-061 · 2026-09-27 · CI for a package that measures an external program: current build on every OS, sorted listings, resolved temp paths
- Trigger: the first CI run of TrailerClipper v2 passed on Windows and failed on Ubuntu (apt ffmpeg 6.1 measures MP3 files differently) and macOS (directory order, /private temp prefix) (2026-09-27).
- Rule: install the same current major of the external program on every runner (checksum-verified when it comes from a release page), sort directory listings in the library when their order is observable, and resolve the working directory before replacing it in recorded text.
- Evidence: CI runs 36334471273 (failed) and 36335032052 (green); TrailerClipperLib 127f399
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260927-7 (references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-063 · 2026-09-27 · An F# library pins FSharp.Core; old F# packages often never declared it (`pin-fsharp-core`)
- Trigger: IsImageUrlDotNet 1.0.2's DLL references FSharp.Core 4.4.0.0 (monodis --assemblyref) while its nuspec declares no dependency; in the capture project the SDK's implicit FSharp.Core resolved to 10.0.112, the SDK's own version, where CI's SDK 10.0.4xx would give 10.1.401 (2026-09-27).
- Hypothesis: the implicit FSharp.Core reference follows the SDK feature band, so a library that keeps it publishes a floor chosen by whichever machine packed it; and nuspec-era F# packages relied on callers having FSharp.Core already.
- Rule: in Phase 0 read an F# package's assembly references, not only its nuspec; in Phase 1 pin FSharp.Core (`DisableImplicitFSharpCoreReference` plus an explicit `PackageReference`) at the lowest version the code needs (6.0.7 for `task { }`, 4.7.2 for net45), never bundle it, and take "latest" from the registration index (FSharp.Core 11.0.100 is in the flat container but unlisted).
- Evidence: IsImageUrlDotNet ai-docs/notes/2026-09-27-phase-0-survey-baseline-and-capture.md and plan D5 (commits 57cf1aa, 5e82b7c, local until the repository grants push access); dotnet/fsharp docs/fsharp-core-notes.md
- Scope: skill (references/nuget.md "F# packages", Phase 1 defaults)
- Status: promoted: C-20260927-10 (references/nuget.md "F# packages", Phase 1 defaults) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-064 · 2026-09-27 · `dotnet format` passes F# without checking it; F# needs Fantomas (`dotnet-format-skips-fsharp`)
- Trigger: `dotnet format Capture.fsproj --verify-no-changes` on a file with `let   f  x=x+1` printed "Format currently supports only C# and Visual Basic projects" and exited 0; `dotnet fantomas --check .` 8.0.4 exited 99 on the same folder (2026-09-27).
- Hypothesis: the NuGet reference and templates were written from C# runs; their format gate is a no-op for F#, and the .NET analyzers settings do nothing there either.
- Rule: for an F# package, CI runs Fantomas (`dotnet fantomas --check .`, a local tool, with `.fantomasignore` for the frozen capture) instead of `dotnet format`; treat the analyzer settings as C#-only and try the F# analyzers (G-Research, Ionide through `fsharp-analyzers`) before promising them.
- Evidence: IsImageUrlDotNet ai-docs/log.md "Phase 1" (scratch probe); plan D9
- Scope: skill (references/nuget.md "F# packages", Traps; SKILL.md lint row)
- Status: promoted: C-20260927-10 (references/nuget.md "F# packages", Traps; SKILL.md lint row) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-065 · 2026-09-27 · Record the old package once per runtime; Mono is a reference, not .NET Framework (`golden-per-runtime`)
- Trigger: IsImageUrlDotNet 1.0.2 (lib/net45) restored into a net10.0 console (NU1701) and ran; its answers depend on Path, Uri and WebRequest, and the same capture under Mono 6.8 disagreed with .NET 10 in 12 of 117 results and 48 request lists (2026-09-27).
- Hypothesis: TrailerClipper needed net48 because its DLL could not load on .NET 10; a DLL that does load still answers per runtime, so one recording would force runtime exceptions into the golden test.
- Rule: multi-target the capture (`net10.0;net48`) and commit one recording per runtime and OS, each from the published package by the same program, with the loaded DLL's SHA-256 in the header; the golden test compares each runtime with its own file. On Linux, a Mono recording is a reference only; the .NET Framework recording comes from a windows-latest runner.
- Evidence: IsImageUrlDotNet tests/Golden/1.0.2.net10.0-linux.json and 1.0.2.mono-6.8-linux.reference.json (57cf1aa); the Windows recordings are pending push access
- Scope: skill (references/nuget.md Phase 0)
- Status: promoted: C-20260927-10 (references/nuget.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-066 · 2026-09-27 · An F# capture splits its cases into a file the golden test compiles unchanged (`shared-cases-file`)
- Trigger: the IsImageUrlDotNet capture had to be written in F# (the brief) and the golden replay must ask exactly the capture's questions; TrailerClipper generated its C# runner by a mechanical rewrite (L-059 `golden-replay-from-capture`) (2026-09-27).
- Hypothesis: when the cases touch only public names that the new library keeps, the test can compile the committed case file itself, so there is nothing to generate and nothing to drift.
- Rule: split the capture into Json.fs (hand-written writer), FixtureServer.fs, Cases.fs and Program.fs; put empty Directory.Build.props, Directory.Build.targets and Directory.Packages.props beside it so repository-wide MSBuild changes cannot reach it; plan the golden test to link Cases.fs, FixtureServer.fs and Json.fs. Proven for the capture (117 cases, two runs identical per runtime); the test side is unverified until Phase 2.
- Evidence: IsImageUrlDotNet tests/Golden/Capture (4160a65, 57cf1aa)
- Scope: skill (references/nuget.md "F# packages")
- Status: promoted: C-20260927-10 (references/nuget.md "F# packages": the capture split and the golden test compiling Cases.fs by link), confirmed carried in C-20260928-1 · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-067 · 2026-09-27 · A .NET network capture: the fixture server is the proxy, and every host is a .test name (`fixture-server-as-proxy`)
- Trigger: IsImageUrlDotNet sends a GET through WebRequest for any URL its extension lists do not decide, including ones with query strings, and follows redirects to other hosts; the capture had to see every request without DNS or the internet (2026-09-27).
- Hypothesis: a proxy sees absolute-form requests for every host, so one local server can answer any host name, and .test names fail closed if a runtime bypasses the proxy.
- Rule: a raw TcpListener server on 127.0.0.1 set as `WebRequest.DefaultWebProxy` (and later as the proxy of the test's HttpClient), routes by host and path, CONNECT answered 403, each case's request heads recorded, port, work folder and current directory normalised to tokens, non-HTTP schemes on 127.0.0.1. .NET 10 proxies loopback too.
- Evidence: IsImageUrlDotNet tests/Golden/Capture/FixtureServer.fs, Cases.fs
- Scope: skill (references/nuget.md Phase 0; the .NET counterpart of L-019 and L-045)
- Status: promoted: C-20260927-10 (references/nuget.md Phase 0; the .NET counterpart of L-019 and L-045) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-068 · 2026-09-27 · F# cannot call an F# library's extension methods as extensions (`fsharp-ignores-fsharp-extensions`)
- Trigger: the capture's case `"http://fixture.test/a.png".IsImageUrl()` failed with FS0039 against 1.0.2, whose module and method carry ExtensionAttribute (2026-09-27).
- Hypothesis: F# reads an F# assembly's own signature data, where the member is a module function, and ignores the C#-style attributes.
- Rule: record the extension attributes by reflection in an F# capture, and test the extension form from a small C# project; put C#-friendly additions on a static class, since module functions cannot take optional or overloaded parameters.
- Evidence: IsImageUrlDotNet tests/Golden/Capture/Cases.fs ("extension attributes" case)
- Scope: skill (references/nuget.md "F# packages")
- Status: promoted: C-20260927-10 (references/nuget.md "F# packages") · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-069 · 2026-09-27 · A cloud session can hold a repository read-only, and survey-github.sh printed "(none)" without gh (`cloud-session-access-check`)
- Trigger: in a Claude Code cloud session the package repository was attached, but `git push` returned 403 ("Claude doesn't have GitHub access") while the skill and overlay repositories accepted pushes; the throwaway Windows capture could not run. The same session had no gh, and survey-github.sh printed "(none)" and "(no classic branch protection)" under failed commands. Microsoft's .NET and Mono download hosts and nuget.org's search host were denied by the egress policy (2026-09-27).
- Hypothesis: the survey script's fallbacks assume gh works; the skill assumed a maintainer's machine with gh and full network.
- Rule: check push access with `git push --dry-run` at the start of Phase 0 and put a failure first in the next stop message; survey-github.sh now stops with exit 2 without gh, and survey-nuget.sh says when the search host is unreachable; take GitHub facts from the GitHub tools; install .NET from Ubuntu's archive (`dotnet-sdk-10.0`, `mono-complete`) when the vendor hosts are blocked.
- Evidence: IsImageUrlDotNet ai-docs/log.md "Phase 0"; scripts/survey-github.sh and survey-nuget.sh (this change)
- Scope: skill (SKILL.md shape of a run; scripts)
- Status: promoted: C-20260927-10 (SKILL.md shape of a run; scripts) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-070 · 2026-09-27 · A package that can show an icon and has none gets a generated one (`generate-missing-icon`)
- Trigger: the maintainer's nuget.org profile showed the default icon on four of six packages; only the two modernized with an icon had one, and the maintainer asked that every modernization add one (2026-09-27, during IsImageUrlDotNet Phase 2).
- Hypothesis: the plan skeleton decided badges and images but never asked about the package icon, so runs skipped it unless the package had one.
- Rule: Phase 1 decides the icon with the badges: when the registry shows one (NuGet `PackageIcon`; npm and the others show none) and the package has none, Phase 2 draws a basic one with `scripts/make-icon.py` in the maintainer's style (their overlay names it), 128 by 128 PNG, packed at the package root, and looks at it before committing. Richer art only when the maintainer asks (their generation tools, if the overlay lists any).
- Evidence: IsImageUrlDotNet icon.png (fb93673); scripts/make-icon.py reproduces it byte for byte (`--picture image`)
- Scope: skill (SKILL.md badges and images; references/nuget.md Phase 1 metadata; scripts/make-icon.py)
- Status: promoted: C-20260927-11 (SKILL.md badges and images; references/nuget.md Phase 1 metadata; scripts/make-icon.py) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-071 · 2026-09-27 · A netstandard2.0 library that exposes HttpClient breaks .NET Framework consumers (`netfx-needs-system-net-http`)
- Trigger: IsImageUrlDotNet 2.0.0 with `netstandard2.0;net10.0` passed every test; the independent review built an F# net48 consumer from the package and it failed to compile even the 1.0.2 call (FS1108 "HttpClient is required", then FS0039), and a C# net48 consumer failed on the HttpClient overloads (CS0012). The plan had said "System.Net.Http is in netstandard2.0" (2026-09-27).
- Hypothesis: the tests referenced the project, not the package, and an SDK-style .NET Framework 4.7.2+ project references no System.Net.Http by default; the netstandard2.0 lib carries no framework reference for it.
- Rule: a library whose public API names a type from System.Net.Http (or another assembly .NET Framework does not reference by default) adds a `net462` target with `<Reference Include="System.Net.Http" />`. Pack writes no `frameworkAssembly` for it, because the SDK resolves System.Net.Http for net462 from its own net461 copy (`ResolvedFrom={HintPathFromItem}`) and pack keeps only `{TargetFrameworkDirectory}` references; add a target before `_GetFrameworkAssemblyReferences` that adds a `TfmSpecificFrameworkAssemblyReferences` item, and check the nuspec in CI. F# also adds a System.ValueTuple dependency to .NET Framework builds (`DisableImplicitSystemValueTupleReference`). CI builds C# and F# consumers from the packed package on net48, not only net10.0.
- Evidence: IsImageUrlDotNet a524f02 (src/IsImageUrlDotNet/IsImageUrlDotNet.fsproj, ci.yml "Fresh consumers of the packed package"), CI run 36345678841
- Scope: skill (references/nuget.md Phase 1 target frameworks, Phase 2, F# packages)
- Status: promoted: C-20260927-11 (references/nuget.md Phase 1 target frameworks, Phase 2, F# packages) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-072 · 2026-09-27 · A .NET Framework network golden test runs alone in its own test process (`golden-alone-in-process`)
- Trigger: after new redirect tests joined the IsImageUrlDotNet test project, the net48 golden test failed deterministically in the full suite: two cases after the dropped-connection case lost `Proxy-Connection: Keep-Alive`. It passed alone, failed alone once its fixture server started from an NUnit SetUpFixture, and a server reserved for the whole run did not help (2026-09-27).
- Hypothesis: .NET Framework's HttpWebRequest keeps process-wide connection state whose effect on later request heads depends on what the process did before; the capture ran in a fresh process with the golden cases first.
- Rule: put the golden test of a package that makes requests in a test project of its own, with nothing else in it, so it runs in a fresh process as the capture did; never add tests to that project. Other network tests may still link the fixture server.
- Evidence: IsImageUrlDotNet tests/IsImageUrlDotNet.GoldenTests (a524f02): 5 of 5 runs green on net48 and net10.0; ai-docs/log.md "Phase 2 CI and Phase 3 review"
- Scope: skill (references/nuget.md Phase 0 network capture, Phase 2)
- Status: promoted: C-20260927-11 (references/nuget.md Phase 0 network capture, Phase 2) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-073 · 2026-09-27 · dotnet nuget sources from Git Bash need Windows paths, and a consumer needs its own packages folder (`windows-paths-for-dotnet-nuget`)
- Trigger: a CI step building a consumer from `artifacts/` failed on windows-latest only: `dotnet nuget add source "$PWD/artifacts"` got `/d/a/...` and then `D:/a/...` ("The source specified is invalid"); `D:\a\...` works. Locally, `dotnet restore DIR --source <folder> --source https://api.nuget.org/v3/index.json` on SDK 10.0.401 read the URL as a local folder (NU1301). The review also noted that setup-dotnet's cache can hand the consumer a copy of the same version restored by an earlier run (2026-09-27).
- Hypothesis: MSYS paths reach native programs untranslated in arguments that do not look like paths to MSYS, and NuGet validates a local source strictly.
- Rule: in bash steps on Windows, pass `cygpath -w` paths to dotnet (`if command -v cygpath >/dev/null; then p=$(cygpath -w "$p"); fi`); give a consumer a nuget.config (`dotnet new nugetconfig`, `dotnet nuget add source`) instead of two `--source` flags; set `NUGET_PACKAGES` to a fresh folder for the consumer so a cached package cannot stand in for the one just packed.
- Evidence: IsImageUrlDotNet CI runs 36344049351 and 36344259584 (failed), 36344421229 (green); ci.yml at a524f02
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260927-11 (references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-075 · 2026-09-27 · A Windows recording can name the drive the capture ran on (`recording-names-the-drive`)
- Trigger: IsImageUrlDotNet's `file:///nonexistent-isimageurl/file` case resolves against the current drive on Windows, and 1.0.2's exception message names it: both Windows recordings say `D:\` because this machine's clone and GitHub's windows-latest workspace are both on D:. A clone on C: gets the same answer with C: (2026-09-27).
- Hypothesis: the capture normalises the work folder, the current directory and the port, but not a drive root that appears on its own.
- Rule: after a Windows capture, grep the recording for drive letters; when one appears, name it as an environment entry in the golden test's exception table (swap in the current drive for that case only), prove it from a clone on another drive, and add the drive to the capture's normalisation next time (the recording itself never changes).
- Evidence: IsImageUrlDotNet tests/IsImageUrlDotNet.GoldenTests/GoldenTests.fs exception table; fresh clone on C: green
- Scope: skill (references/nuget.md Phase 0 network capture)
- Status: promoted: C-20260927-11 (references/nuget.md Phase 0 network capture) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-076 · 2026-09-27 · The F# analyzers run with SDK 10; exclude only the frozen file (`fsharp-analyzers-verified`)
- Trigger: the F# section said to try G-Research.FSharp.Analyzers and Ionide.Analyzers before promising them; with fsharp-analyzers 0.39.2 they loaded (13 G-Research analyzers) and ran on SDK 10.0.401. Ionide flagged IONIDE-005 on 1.0.2's kept code and IONIDE-006 on new code (an unsafe `.Value`) (2026-09-27).
- Hypothesis: the tool is pinned to a compiler version, so it can break when the SDK moves; for now it works.
- Rule: run them in CI on Linux: the tool in the local tool manifest, the analyzer packages as `PackageDownload` in the library project (not in the lock file or the package), `--treat-as-error '*'`, and `--exclude-files` only for the file the golden promise freezes; find the packages folder with `dotnet nuget locals global-packages --list`.
- Evidence: IsImageUrlDotNet ci.yml "F# analyzers" (061a7de, a524f02)
- Scope: skill (references/nuget.md F# packages)
- Status: promoted: C-20260927-11 (references/nuget.md F# packages) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-078 · 2026-09-27 · Read every version's nupkg, not only the latest (`survey-every-version-nupkg`)
- Trigger: CachingServiceWithAOPSupport's survey listed only 1.0.1's files (fine: lib/net45); a hash comparison later showed 1.0.0 packed its DLL, the dependencies' DLLs, the source, PDBs and obj/ caches (one naming the 2015 user folder) under bin/Debug and obj/Debug, so 1.0.0 installed no reference at all (2026-09-27).
- Hypothesis: old hand-packed versions differ from the latest in layout and contents, and a version that installs nothing or leaks build files is a deprecation and security item for the plan.
- Rule: survey-nuget.sh lists the files of the newest ten versions and warns on assemblies outside lib/, runtimes/, tools/, build/, ref/ and analyzers/; the plan's deprecation row covers every broken version.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 0), survey-nuget.sh output on 2026-09-27
- Scope: skill (scripts/survey-nuget.sh, references/nuget.md Phase 0)
- Status: promoted: C-20260927-13 (scripts/survey-nuget.sh, references/nuget.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-079 · 2026-09-27 · Run the old tests unchanged against the published package when the old projects cannot build (`old-tests-against-published`)
- Trigger: CachingServiceWithAOPSupport's 2015 projects fail on the .NET 10 SDK (MSB3644, MSTest from Visual Studio QualityTools), so "run the old build and tests as they are" gave only a failure (2026-09-27).
- Hypothesis: the old test files still compile against the published DLL with a current MSTest, which turns them into behaviour evidence for the baseline.
- Rule: record the failing old build, then link the old test files unchanged (`Compile Include` with the clone's path) into a scratch SDK-style net48 project with MSTest 4.x, `GenerateAssemblyInfo false` and the published package; log the result. It passed 13 of 13.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 0)
- Scope: skill (references/nuget.md Phase 0)
- Status: promoted: C-20260927-13 (references/nuget.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-080 · 2026-09-27 · A recording can be a record of failure; then net48 is the contract everywhere (`net10-record-of-failure`)
- Trigger: CachingServiceWithAOPSupport 1.0.1 restores into net10.0 (NU1701) but every proxy fails there (Castle.Core 3.2.2 needs System.Security.Permissions); comparing v2 on .NET 10 with that recording would demand the failure back (2026-09-27).
- Hypothesis: "one recording per runtime" (L-065 `golden-per-runtime`) fits a package whose answers differ by runtime, not one that does not work on a runtime at all.
- Rule: still capture the net10.0 recording (it proves the failure and shows which plain classes answered), then name it a record of failure in the plan and compare every runtime with the net48 recording, with the ArgumentException suffix ` (Parameter 'x')` as a named exception.
- Evidence: CachingServiceWithAOPSupport tests/Golden/1.0.1.net10.0-windows.json, plan E1 and E3
- Scope: skill (references/nuget.md Phase 0)
- Status: promoted: C-20260927-13 (references/nuget.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-081 · 2026-09-27 · Check the cooldown with the registration index before every package reference (`nuget-latest-cooldown`)
- Trigger: NUnit 5.0.0 was published on 2026-09-27, the day of CachingServiceWithAOPSupport's plan; the search API shows only the version, not its age (2026-09-27).
- Hypothesis: a one-line check of listed stable version, publish date and age for every id a run adds removes the guesswork from the three-day cooldown.
- Rule: run `scripts/nuget-latest.py ID ...` for every PackageReference a run adds or bumps; take the previous version it prints when the latest is inside the cooldown, and log the output.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 1)
- Scope: skill (scripts/nuget-latest.py, references/nuget.md Traps)
- Status: promoted: C-20260927-13 (scripts/nuget-latest.py, references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-083 · 2026-09-27 · Public BCL shapes differ between .NET Framework and .NET (`bcl-shape-differs-by-runtime`)
- Trigger: CachingServiceWithAOPSupport's golden replay passed on net48 and failed one case on net10.0: the cache key of a TimeSpan argument, written by reflection over public properties, had four more properties (.NET 7 added Microseconds and Nanoseconds totals) and TotalHours 0.025 instead of 0.024999999999999998 (2026-09-27).
- Hypothesis: anything that serializes BCL types by reflection inherits every runtime's changes to their public surface and arithmetic; a net48 recording pins the Framework's.
- Rule: when the contract is the net48 recording on every runtime, write such types in the Framework's shape explicitly, and say in the README which other types may differ between runtimes.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 2), src/CachingServiceWithAOP/CachingServices/ScriptJson.cs
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260927-14 (references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-084 · 2026-09-27 · Let the test host name a hanging test (`blame-hang-names-the-test`)
- Trigger: CachingServiceWithAOPSupport's first unit-test run sat for minutes on both runtimes with no output; `--blame-hang-timeout 30s --blame-hang-dump-type none` named FixTests.A_task_that_faults_later_is_evicted within a minute: the key writer read Task.Result of a pending TaskCompletionSource argument (2026-09-27).
- Hypothesis: a hang gives no output at all, and a piped `dotnet test | grep | sort` hides even the progress lines; the blame collector is the cheapest way to a name.
- Rule: run a new test suite once with `--blame-hang-timeout 60s --blame-hang-dump-type none`; never pipe a first run through `sort`.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 2)
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260927-14 (references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-085 · 2026-09-27 · Existing templates can be stale drafts; read their header before calling them missing (`templates-marked-unverified`)
- Trigger: the CachingServiceWithAOPSupport kickoff said the skill lacked NuGet release and verify templates; templates/nuget held both, marked "unverified by a run as of 2026-09-25", older than the three NuGet runs that each wrote better ones (2026-09-27).
- Hypothesis: a template that no run has used drifts behind the worked examples, and later runs copy the examples instead, so nobody updates the template.
- Rule: when a run's workflows are proven by CI, replace the templates they came from in the same run, and keep the "from which run, which date" header on every template.
- Evidence: package-modernize C-20260927-14
- Scope: skill (templates/README.md)
- Status: promoted: C-20260927-14 (templates/README.md) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-087 · 2026-09-27 · "Cannot create ref due to creations being restricted" on a tag push is the admin bypass, not a failure (`tag-bypass-message`)
- Trigger: pushing v2.0.0-beta.1 to CachingServiceWithAOPSupport printed "remote: - Cannot create ref due to creations being restricted." after the admins-only tag ruleset was on; the tag was created and release.yml started. The v2.0.0 push printed the same line under "Bypassed rule violations for refs/tags/v2.0.0" (2026-09-27).
- Hypothesis: GitHub reports every rule an admin bypasses; the first push's output was cut before the "Bypassed" header by a tail.
- Rule: after a tag push, read `gh api repos/OWNER/REPO/git/refs/tags/TAG` and the release run, not the push's remote lines; never retag on that message.
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phases 5 and 6)
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260927-16 (references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-088 · 2026-09-27 · `gh attestation verify` prints nothing on success outside a terminal (`attestation-verify-silent`)
- Trigger: verifying the 2.0.0-beta.1 nupkg from the GitHub Release printed nothing and exited 0 (gh 2.100, Git Bash through the agent's shell) (2026-09-27).
- Rule: verify with `--format json --jq '.[0].verificationResult.statement.predicate.buildDefinition.externalParameters.workflow'` and log the workflow path and ref it names (release.yml at refs/tags/vX); verify the file attached to the GitHub Release or the run artifact, not the nuget.org download (repository-signed, other hash).
- Evidence: CachingServiceWithAOPSupport ai-docs/log.md (Phase 5)
- Scope: skill (references/nuget.md Phase 5 and 6)
- Status: promoted: C-20260927-16 (references/nuget.md Phase 5 and 6) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-089 · 2026-09-27 · Put a needed working directory in a subshell (`cd-only-in-a-subshell`)
- Trigger: in CachingServiceWithAOPSupport three shell calls started with `cd DIR;` despite the rule in SKILL.md, and the session's working directory moved each time (to /, to TrailerClipperLib, to a scratch folder); one later glob then resolved in the wrong repository (2026-09-27).
- Hypothesis: the rule says what not to do but not what to do when a tool needs a working directory (actionlint, zizmor, a relative glob).
- Rule: use `(cd DIR && cmd)` (a subshell, the session stays where it was), a tool flag (`git -C`, `--project`), or absolute paths; a bare `cd` never starts a call.
- Evidence: CachingServiceWithAOPSupport session, 2026-09-27
- Scope: skill (SKILL.md Windows line)
- Status: promoted: C-20260927-16 (SKILL.md Windows line) · helpful 1 · harmful 0 · last_confirmed 2026-09-27

### L-090 · 2026-09-28 · Pull the skill with git -C; its shell rules are not loaded yet (`pull-without-cd`)
- Trigger: the RandomNameGeneratorLibrary kickoff said "pull master first"; the first shell call was `cd <skill> && git pull`, which moved the session's working directory into the skill repository before SKILL.md (and its rule L-089 `cd-only-in-a-subshell`) had been read. A second `cd /` followed a few calls later (2026-09-28).
- Hypothesis: a rule inside the skill cannot govern the commands a kickoff asks for before the skill is read; the promoted rule held in the previous run only once it was loaded.
- Rule: the kickoff skeleton names the pull as `git -C <skill repository> pull --ff-only`; runs use `git -C` for every repository they do not work in.
- Evidence: RandomNameGeneratorLibrary retrofit session, 2026-09-28 (the harness reported the working directory change)
- Scope: skill (prompts/kickoff-skeleton.md)
- Status: promoted: C-20260928-2 (kickoff skeleton) · recurrence of L-089 · helpful 0 · harmful 0 · last_confirmed 2026-09-28

### L-091 · 2026-09-28 · Backslash-u in prose is decoded too; name code points as U+XXXX (`prose-escapes-decode-too`)
- Trigger: a Phase 0 note written with the Write tool quoted the recorded string "Mu", then a backslash-u escape for U+FFFD, then "oz"; the file held the replacement character itself, although the rule (L-050, which absorbed L-058) was known and followed in the code written the same hour (2026-09-28).
- Hypothesis: the rule reads as a code rule; markdown that quotes an escape is text like any other to the tool layer.
- Rule: in documents, write code points as U+FFFD and never quote a backslash-u escape; in code, build it from (char)92. Check a written file with Python for chr(0xFFFD) and for chr(92)+"u" when the text mentions encodings.
- Evidence: DotNetRandomNameGenerator ai-docs/notes/2026-09-28-phase-0-gap-audit.md (fixed before commit bdb53b3)
- Scope: skill (references/nuget.md Traps)
- Status: promoted: C-20260928-2 (nuget.md Traps) · recurrence of L-050 · helpful 0 · harmful 0 · last_confirmed 2026-09-28

### L-092 · 2026-09-28 · The public API list includes protected members and class kinds (`api-list-protected-members`)
- Trigger: the ApiList program copied from CachingServiceWithAOPSupport listed public members only; RandomNameGeneratorLibrary's public abstract BaseNameGenerator has protected constructors and a protected readonly field that callers' subclasses use, and the list did not say "abstract" (2026-09-28).
- Hypothesis: the first package that needed the lister had no public unsealed base class, so the gap never showed.
- Rule: the lister takes constructors and fields with IsPublic, IsFamily or IsFamilyOrAssembly, marks them "protected", and writes the kind as static, abstract, sealed or plain class; templates/nuget/tests/Golden/ApiList is the corrected program.
- Evidence: DotNetRandomNameGenerator 84dbc6b (tests/Golden/ApiList; PublicApi-2.2.0.txt 101 lines, 98 before the fix)
- Scope: skill (templates/nuget/tests/Golden/ApiList)
- Status: promoted: C-20260928-2 (template) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-093 · 2026-09-28 · Rebuild embedded data from its source with the old tool's logic (`data-provenance-check`)
- Trigger: RandomNameGeneratorLibrary embeds a place list that 2.1.0 hand-fixed; running the 2014 stripper's logic on the Census 2000 file reproduced the list exactly, and a correct strip showed 150 entries that are not names ("Feli" from Felicity, "Hagers" from Hagerstown) and 246 missing names. Neither the golden capture (it records what is there) nor 146 unit tests (counts, blanks, U+FFFD, duplicates, Title case) could see it (2026-09-28).
- Hypothesis: a data file is the output of a program; integrity tests check its shape, not whether the program that made it was right.
- Rule: in Phase 0, for every embedded data file, find its source and rebuild it with the old tool's logic; equal output proves provenance, and a corrected rebuild beside it lists the defects. A data fix changes seeded or indexed output, so it is a plan decision (fix under a new name or at the next major), never a chore.
- Evidence: DotNetRandomNameGenerator ai-docs/notes/2026-09-28-phase-0-gap-audit.md
- Scope: skill (SKILL.md survey; the retrofit path)
- Status: promoted: C-20260928-3 (references/retrofit.md, gap audit step 4) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-094 · 2026-09-28 · Compare the most-downloaded old version with the contract, not only the latest (`diff-the-popular-version`)
- Trigger: RandomNameGeneratorLibrary's contract is 2.2.0, but 1.2.2 has 3.79 million of its 3.89 million downloads; a scratch program on 1.2.2 showed seeded person names unchanged and every seeded place name different since 2.1.0, which the changelog never said (2026-09-28).
- Hypothesis: the retrofit's contract protects the next upgrade; the callers who matter most upgrade from the popular version, whose drift nobody recorded.
- Rule: in a retrofit, run the capture's seeded or deterministic cases (as far as the old API allows) against the version with the most downloads and state every difference in the changelog of the next release.
- Evidence: DotNetRandomNameGenerator ai-docs/log.md (Phase 0)
- Scope: skill (the retrofit path)
- Status: promoted: C-20260928-3 (references/retrofit.md, gap audit step 5) · helpful 2 · harmful 0 · last_confirmed 2026-09-28 (JsonPrettyPrinter: 2.0.0 swapped the serializer and rewrote its expectation file; the CHANGELOG named two of about fifteen changes)

### L-095 · 2026-09-28 · A path token in a recording also needs forward slashes (`portable-path-token`)
- Trigger: the first RandomNameGeneratorLibrary recordings held `{WORK}` followed by a Windows separator and a file name in FileNotFoundException messages; the replay on Ubuntu would have failed on every path case (2026-09-28, caught before the Phase 0 commit).
- Hypothesis: the work-folder token hides the machine, not the OS's separator.
- Rule: when a recorded text contains the work folder, replace it with the token and replace the directory separator in the same text with "/", inside the case, so the replay normalises the same way.
- Evidence: DotNetRandomNameGenerator tests/Golden/Capture/Cases.cs (Normalize)
- Scope: skill (references/nuget.md Phase 0)
- Status: promoted: C-20260928-2 (nuget.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-096 · 2026-09-28 · Two survey helpers printed errors as findings (`helpers-say-none-plainly`)
- Trigger: `nuget-latest.py --help` looked up a package called "--help" and died with an HTTPError traceback; `survey-github.sh` printed GitHub's 404 JSON before "(no classic branch protection)" and nothing at all for an empty ruleset list (2026-09-28).
- Hypothesis: both were written against packages that had the thing asked about.
- Rule: helpers print a usage on no argument or -h, a one-line "not on nuget.org" with exit 1 for an unknown id, and "(no rulesets)" or "(no classic branch protection)" instead of an API error body.
- Evidence: scripts/nuget-latest.py, scripts/survey-github.sh (C-20260928-2)
- Scope: skill (scripts)
- Status: promoted: C-20260928-2 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-097 · 2026-09-28 · The everlast lint also reads the C# lazy type as an opinion about people (`lint-reads-lazy`)
- Trigger: `everlast.py lint` flagged "privacy: opinion about people or politics" on two notes that named the lazily initialised name lists by their C# type (2026-09-28).
- Hypothesis: the privacy pattern matches the word as an adjective about a person.
- Rule: in ai-docs, describe such fields as "lazily initialised"; the plan skeleton's lint note lists it with the other false positives.
- Evidence: DotNetRandomNameGenerator bdb53b3 (lint clean after rewording)
- Scope: skill (references/plan-skeleton.md)
- Status: promoted: C-20260928-2 · extends L-082 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-098 · 2026-09-28 · Record the process bitness; run the replay the same way (`record-process-bitness`)
- Trigger: RandomNameGeneratorLibrary's net48 golden replay, pinned to win-x86 like the unit tests, differed from the 2.2.0 recording in 16 cases: "Exception of type 'System.OutOfMemoryException' was thrown." where the AnyCPU (64-bit) capture had "Array dimensions exceeded supported range." for a count of int.MaxValue (2026-09-28).
- Hypothesis: the lock-file rule (pin a RuntimeIdentifier for a net48 test exe) chose x86 without regard to how the capture ran; allocation failures are worded by the process, not the library.
- Rule: the capture header records the process bitness; the replay pins the matching RuntimeIdentifier (win-x64 for an AnyCPU capture).
- Evidence: DotNetRandomNameGenerator 64ebdf3 (GoldenTests csproj)
- Scope: skill (references/nuget.md Phase 0; references/retrofit.md)
- Status: promoted: C-20260928-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-099 · 2026-09-28 · A ruled change to golden answers goes in a guarded exception file beside the replay (`ruled-exception-file`)
- Trigger: the maintainer ruled the place-list fix in place; 35 recorded cases per runtime had to change without touching tests/Golden or loosening the replay (2026-09-28).
- Hypothesis: an inline exception table does not scale past a dozen cases, and a file under tests/Golden would make the untouched check (`git diff --exit-code <phase-0> -- tests/Golden`) meaningless.
- Rule: replay green and canary first; then the fix; the replay writes the differing cases on request (an environment variable) into `Exceptions/<version>.<topic>.<runtime>.json` beside the replay project; the test pins the exact set of allowed keys (a topic regex also matched 26 cases that must never change, the review found) and refuses an exception equal to the old answer; an oracle independent of the library checks every exception, and in a mixed case every answer outside the topic must equal the old recording.
- Evidence: DotNetRandomNameGenerator 8bebf10 (GoldenTests.cs, Exceptions/)
- Scope: skill (references/retrofit.md)
- Status: promoted: C-20260928-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-100 · 2026-09-28 · Adapting templates: C-locale content list, placeholder regex, seven-day cooldown, eol=lf re-checkout (`template-adaptation-traps`)
- Trigger: four template traps in one adaptation (2026-09-28): the ci.yml content list put the nuspec before README.md, but `LC_ALL=C sort` puts README.md first for an id starting with "Ra" (CI would fail); the instruction to grep for `{{` matched every GitHub expression; zizmor 1.30.1 flagged the template's three-day Dependabot cooldown and the dotnet-sdk ecosystem with none; switching an autocrlf clone to `eol=lf` left CRLF working files and 150 ENDOFLINE errors from dotnet format.
- Hypothesis: the templates were proven on packages whose ids sort after README.md and in clones created with LF, and zizmor's cooldown audit is newer than the template.
- Rule: the ci.yml template says to list files in C-locale order; templates/README says to grep `{{[A-Z_]+}}`; the Dependabot template uses seven days on every ecosystem; after adopting eol=lf, commit, then `git rm -r --cached . && git reset --hard`.
- Evidence: DotNetRandomNameGenerator 3398d5c, 4457d01; C-20260928-3
- Scope: skill (templates/nuget, templates/README.md, references/nuget.md Traps)
- Status: promoted: C-20260928-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-101 · 2026-09-28 · Run CI's exact test command locally before pushing (`ci-command-locally`)
- Trigger: the first CI run of RandomNameGeneratorLibrary's pull request failed on both OSes with exit code 5 and "Zero tests ran": ci.yml passes `--coverage`, which Microsoft.Testing.Platform rejects in a test project without Microsoft.Testing.Extensions.CodeCoverage, and the new golden project had none. Locally the agent had run `dotnet test` without the flag (2026-09-28).
- Hypothesis: "verified locally" meant the same tools, not the same command line; a flag applies to every test project, including the one just added.
- Rule: before pushing, run each workflow's test and pack commands exactly as written in the workflow; a new test project gets every extension the workflow's flags need.
- Evidence: CI run 36372933350 (failed), fix 35b7655
- Scope: skill (SKILL.md Phase 2 verification)
- Status: promoted: C-20260928-3 (SKILL.md, phases table, Phase 2 exit criteria) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-102 · 2026-09-28 · Three known traps repeated in one session (`known-traps-repeated`)
- Trigger: in the RandomNameGeneratorLibrary retrofit the agent (a) wrote `--coverage` inside an MSBuild XML comment (MSB4025, a trap listed in nuget.md since 2026-09-25), (b) ran Python through Bash heredocs three times with backslashes in the text, which were halved (a regex `\|` and two replacement patterns; the SKILL.md Windows line says to write files with the editor tools), and (c) used `sed` with `\|`, which GNU sed reads as alternation (2026-09-28).
- Hypothesis: the rules are phrased per tool ("heredocs", "XML comment in Directory.Build.props"); a Python heredoc or a csproj comment did not look like the case the rule names.
- Rule: any script with a backslash in it goes to the scratchpad through the Write tool and runs from there; never `--` in any MSBuild comment (csproj, props, targets); edit with Python or the Edit tool, not sed, when the text has a backslash or a pipe.
- Evidence: this session's log; DotNetRandomNameGenerator 35b7655
- Scope: skill (SKILL.md Windows line)
- Status: promoted: C-20260928-3 (SKILL.md Windows line) · recurrence of L-050 · recurred once more the same session, minutes after it was written (a Python heredoc halved a backslash in a replacement pattern; the assertion caught it before any write) · helpful 0 · harmful 0 · last_confirmed 2026-09-28

### L-103 · 2026-09-28 · The package content check died silently on a package without dependencies (`empty-dependency-group`)
- Trigger: RandomNameGeneratorLibrary's second CI run failed on Ubuntu in "The package holds exactly what it should" with exit 1 and no message: its nuspec writes each empty dependency group as a self-closing element, so the template's `grep -o "<group targetFramework=...>.*"` matched nothing, and under bash's -e and pipefail the command substitution ended the step (2026-09-28). The worked examples all had dependencies.
- Hypothesis: a template proven only on packages with dependencies never ran the no-match path; a grep without a match is an error under pipefail.
- Rule: every grep in a check that may legitimately match nothing is wrapped as `{ grep ... || true; }`; run a workflow step locally with `bash -e -o pipefail` on the real artifact, once with the right expectation and once with a wrong one (it must fail with its ::error line).
- Evidence: CI run 36373102418 (failed), fix 1e4e416; templates/nuget/.github/workflows/ci.yml (C-20260928-3)
- Scope: skill (templates/nuget ci.yml; references/retrofit.md)
- Status: promoted: C-20260928-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-104 · 2026-09-28 · A consumer of the packed package needs source mapping (`consumer-source-mapping`)
- Trigger: the review of RandomNameGeneratorLibrary PR #13 found that tests/consumers/run.sh added the local folder beside nuget.org in a fresh nuget.config; once the same version is on nuget.org (after the beta), NuGet may restore that copy and the consumer cannot tell (2026-09-28).
- Hypothesis: a separate packages folder stops the cache from standing in, but not a second source holding the same id and version.
- Rule: with a local source, the consumer's nuget.config maps the package id to the local folder only (`packageSourceMapping`) and everything else to nuget.org; version lines are compared as whole lines (`grep -qxF`), so 2.3.0 cannot pass on 2.3.0-beta.1. The template does both.
- Evidence: DotNetRandomNameGenerator 355af8b; templates/nuget/tests/consumers/run.sh (C-20260928-3)
- Scope: skill (templates/nuget)
- Status: promoted: C-20260928-3 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-105 · 2026-09-28 · Log only what the maintainer said, quoted (`log-maintainer-quotes`)
- Trigger: after Mark said "I merged everything", the RandomNameGeneratorLibrary log recorded that he had also edited the nuget.org Trusted Publishing policy, which he had not said; a later entry corrected it (2026-09-28). The beta's push job was the real evidence.
- Hypothesis: a stop lists several maintainer actions, and a short "done" reads as covering all of them.
- Rule: log the maintainer's words as a quote; any action they did not name stays unconfirmed in the log, with the step that will prove it (here: the push job's NuGet login).
- Evidence: DotNetRandomNameGenerator ai-docs/log.md, 881ddec
- Scope: skill (SKILL.md, the rules that hold everywhere)
- Status: promoted: C-20260928-4 · helpful 0 · harmful 0 · last_confirmed 2026-09-28

### L-107 · 2026-09-28 · The wiki comes after the release is verified, and it audits the shipped docs (`wiki-after-release`)
- Trigger: Mark asked for GitHub wikis on the packages. Written by hand for RandomNameGeneratorLibrary 2.3.0 and JsonPrettyPrinter 3.0.1, then with the new wikiwright skill for get-title-at-url 3.0.0 (all 2026-09-28). Each found errors in the README or CHANGELOG that the modernization runs had shipped: a thread-safety sentence true on one runtime, a comment claim the printer breaks, a changelog escape System.Text.Json never writes, a NOT_HTML row that misses the no-Content-Type case, an exit-code line. Mark then asked that every run add a wiki when the repository has none.
- Hypothesis: the wiki verifies every example against the published package, so it runs after Phase 6; writing the long form forces reading every claim against a run, which the release checks do not do for prose.
- Rule: Phase 7 starts with the wiki (wikiwright new or update mode); its inaccuracies go to the kickoff prompt's corrections and HANDOFF.md for the next release.
- Evidence: SKILL.md (phases table row 7; "Wiki (Phase 7, first)"), references/retrofit.md, prompts/kickoff-skeleton.md, C-20260928-5; get-title-at-url ai-docs/notes/2026-09-28-github-wiki.md; the two DotNet repositories' wiki notes
- Scope: skill
- Status: promoted: C-20260928-5 (SKILL.md, "Wiki (Phase 7, first)") · helpful 3 · harmful 0 · last_confirmed 2026-09-28

### L-109 · 2026-09-28 · The golden capture feeds the wiki, and cleanup must not switch the wiki off (`golden-capture-feeds-the-wiki`)
- Trigger: the seeded-random-utilities wiki (wikiwright's second run) replayed `test/golden/capture-1.1.4.cjs` against 1.1.4 from npm (322 of 322 cases identical to the recording) and against 2.0.0 (316 of 322; the six are the documented emoji exception), and `capture-2.0.0.cjs` against the published build (150 of 150): the Versions and upgrading page's evidence. The same repository's Phase 6 cleanup had switched the wiki off, following references/npm.md ("wiki and projects off"), so Phase 7 had to switch it back on (2026-09-28).
- Hypothesis: a capture recorded for the rewrite's tests is also the most exact upgrade documentation the package has; the cleanup line predates the wiki step (C-20260928-5).
- Rule: Phase 6 leaves the wiki on (or switches it on); capture scripts stay runnable from a scratch folder (the build path as an argument, no import from the repository), so the wiki run can replay them.
- Evidence: seeded-random-utilities ai-docs/notes/2026-09-28-github-wiki.md and its log (Stage 2 settings); wikiwright L-020 `replay-the-golden-capture`
- Scope: skill
- Status: promoted: C-20260928-6 (references/npm.md Phase 6 cleanup; SKILL.md "Wiki (Phase 7, first)") · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-110 · 2026-09-28 · One capture program records every published version (`one-capture-many-versions`)
- Trigger: JsonPrettyPrinter's retrofit needed 3.0.1 (the contract), 2.1.1 and the popular 1.0.1.1 recorded with the same cases (L-094). An `OldVersion` MSBuild property (`Version="[$(OldVersion)]"`) and a define for the oldest API (`JPP_V1` when the version starts with "1.") let one Cases.cs compile against all three; same case names, so a 90-line compare script diffs versions case by case. 1.0.0 and 1.0.1 then took two seconds each and answered all 446 cases as 1.0.1.1 did, so one deprecation message covers all three. A hidden 2.x constructor overload made `new JsonPrettyPrinter(null)` ambiguous against 2.1.1 only (2026-09-28).
- Hypothesis: the popular-version check was written as a separate scratch program; putting it in the capture makes it exact, repeatable and reusable by the wiki (L-109).
- Rule: write the capture with a version property and `#if` blocks for older APIs; record the popular and the latest old major on every runtime into an `upgrade/` folder beside the contract, never replayed; cast every null argument to its parameter type; run every version of the popular major once before writing a deprecation message.
- Evidence: DotNetJsonPrettyPrinter 08b777a (tests/Golden/Capture, tests/Golden/upgrade)
- Scope: skill (references/retrofit.md, references/nuget.md Phase 0, scripts/golden-capture-nuget.template.cs)
- Status: promoted: C-20260928-7 (references/retrofit.md, gap audit step 5) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-113 · 2026-09-28 · The API lister shows init accessors as set (`api-list-init-accessors`)
- Trigger: JsonPrettyPrintOptions has init-only properties; the template ApiList wrote `{ get; set; }`, which would let a later change from init to set pass the API test unnoticed (2026-09-28).
- Hypothesis: RandomNameGeneratorLibrary had no init accessors.
- Rule: the lister writes `init;` when the setter's return parameter has the IsExternalInit required modifier, marks static properties and const fields, and loads the assembly by name so an `OldVersion` property lists any published version.
- Evidence: DotNetJsonPrettyPrinter tests/Golden/ApiList/Program.cs
- Scope: skill (templates/nuget/tests/Golden/ApiList)
- Status: promoted: C-20260928-7 (templates/nuget/tests/Golden/ApiList/Program.cs; references/retrofit.md gap audit step 2) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-114 · 2026-09-28 · The everlast lint reads an MSBuild element in prose as a placeholder (`lint-reads-msbuild-elements`)
- Trigger: the converted wiki note named the baseline property as an XML element with its value; `everlast.py lint` reported "template placeholder text still present" (its pattern is a capital letter and ten characters inside angle brackets) (2026-09-28).
- Hypothesis: same family as L-082 (C# generics) and L-097 (the lazy type).
- Rule: in ai-docs, write "the PackageValidationBaselineVersion property set to X", never the element.
- Evidence: DotNetJsonPrettyPrinter 366b93a
- Scope: skill (references/plan-skeleton.md lint note)
- Status: promoted: C-20260929-4 (references/plan-skeleton.md, the lint note; references/retrofit.md gap audit step 8) · extends L-082 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-115 · 2026-09-28 · Three known traps again in the first hour (`known-traps-first-hour`)
- Trigger: in the JsonPrettyPrinter retrofit, after reading SKILL.md and LEARNINGS.md: (a) a one-off lookup `cd <records repo>; grep ...` moved the session's working directory (L-089, L-090); (b) the first csproj written had a usage line with the double dash before the program arguments inside an XML comment, MSB4025 (L-102); (c) a Phase 0 note quoted the CHANGELOG's escape for a quote, and the Write tool decoded it into a bare quote (L-091) (2026-09-28).
- Hypothesis: each rule is read as a rule about a kind of task (a pull, a props file, a code string), and the first hour's small writes do not look like that task.
- Rule: never start a shell command with `cd`; never write a usage line in an MSBuild comment (say "then the arguments"); never type an escape sequence in any text a tool writes, code or prose: name it (U+0022) or build it with chr(92). After writing a doc that mentions escapes, grep it for the intended text, not only for chr(92)+"u".
- Evidence: this session; DotNetJsonPrettyPrinter tests/Golden/ApiList/ApiList.csproj (fixed before commit); ai-docs/notes/2026-09-28-phase-0-gap-audit.md (fixed before commit)
- Scope: skill (SKILL.md Windows line)
- Status: promoted: C-20260929-4 (SKILL.md Windows line) · recurrence of L-089, L-102, L-091 · helpful 0 · harmful 0 · last_confirmed 2026-09-28

### L-117 · 2026-09-28 · The template replay's string comparison throws on a recorded lone surrogate (`raw-text-for-lone-surrogates`)
- Trigger: JsonPrettyPrinter's golden replay, adapted from templates/nuget/tests/GoldenTests.cs.template, failed on net48 with InvalidOperationException "Cannot read incomplete UTF-16 JSON text as string with missing low surrogate": JsonElement.GetString() refuses the lone surrogates the capture recorded (2026-09-28).
- Hypothesis: earlier packages recorded no invalid UTF-16; the template compares strings through GetString() so it can strip the .NET parameter suffix.
- Rule: with one recording per runtime, compare strings by raw JSON text (both sides come from the capture's writer, which escapes every character outside ASCII); keep GetString() only where the suffix must be stripped, and never for a package whose inputs include lone surrogates.
- Evidence: DotNetJsonPrettyPrinter 7cbc419 (GoldenTests.cs); template comment added (C-20260928-7)
- Scope: skill (templates/nuget/tests/GoldenTests.cs.template)
- Status: promoted: C-20260928-7 (templates/nuget/tests/GoldenTests.cs.template; references/nuget.md Traps) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-118 · 2026-09-28 · actionlint found nothing in shell because shellcheck was missing; with it, a template bug (`actionlint-needs-shellcheck`)
- Trigger: actionlint and shellcheck are not installed here; with both release zips in the scratchpad (actionlint 1.7.12, shellcheck 0.11.0, passed by absolute path with `-shellcheck`; a PATH entry written as C:/... does not work in Git Bash) actionlint reported SC2034 in templates/nuget verify-published.yml (an unused loop variable), which the earlier NuGet runs had linted without shellcheck (2026-09-28).
- Hypothesis: L-030 said so for npm; the NuGet template never met shellcheck.
- Rule: download both zips (`gh release download -R rhysd/actionlint -p '*windows_amd64.zip'`, `gh release download -R koalaman/shellcheck -p '*.zip'`), run `actionlint.exe -shellcheck <abs path>/shellcheck.exe` from the repository root, and log both versions. The template loop now uses `_`.
- Evidence: DotNetJsonPrettyPrinter 613cc69; templates/nuget/.github/workflows/verify-published.yml (C-20260928-7)
- Scope: skill (references/nuget.md Phase 4; the template)
- Status: promoted: C-20260928-7 (references/nuget.md Traps; templates/nuget verify-published.yml) · recurrence of L-030 · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-119 · 2026-09-28 · A dependency's default can write the OS newline into a recording (`os-newline-through-a-dependency`)
- Trigger: the first Ubuntu CI run of JsonPrettyPrinter's replay failed one case of 1174: `ToJson` with `JsonSerializerOptions { WriteIndented = true }`, whose System.Text.Json output uses Environment.NewLine; the recording made on Windows holds CRLF. The capture had avoided Environment.NewLine in its own option cases but not inside a dependency (2026-09-28).
- Hypothesis: a Windows capture replays on Linux only when no answer holds the OS newline, and a dependency's defaults are easy to miss.
- Rule: before the Phase 0 commit, grep the recordings for CRLF (the ASCII writer shows it as an escape pair) and ask of each case whether the OS chose it; either record it with a token (as RandomNameGeneratorLibrary's {NL}) or, once frozen, add one exactly keyed exception (compare with CRLF read as LF off Windows) with a test that the key exists and holds a CRLF. Run the replay on Linux before calling it green (CI does, so push early).
- Evidence: CI run 36489418546 (failed), fix on pull request m4bwav/DotNetJsonPrettyPrinter#8
- Scope: skill (references/nuget.md Phase 0; the capture template)
- Status: promoted: C-20260928-7 (references/nuget.md Traps; references/retrofit.md gap audit step 9) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-120 · 2026-09-28 · The release workflow pushed a package no check had run on (`release-checks-what-it-pushes`)
- Trigger: the independent review of JsonPrettyPrinter's retrofit (pull request #8) found that the template release.yml packs in its Linux job and pushes that nupkg after approval, while nothing checked its contents or ran the consumers on it (test-windows tested its own build), the "on master" check was ancestry only, and ci.yml cancelled master runs, so a tag on a commit whose ci was cancelled would publish unchecked. It also found that no workflow enforced the untouched golden files (2026-09-28). Its differential: 525,778 comparisons per runtime, 0 differences.
- Hypothesis: the template was proven by releases that happened to follow a green master; the gate checks who approves, not what is approved.
- Rule: release.yml requires a successful `ci` check run on the tagged SHA (check-runs API, checks read), runs the content check and the consumers on the artifact it will push (Linux, and Windows with net48 after downloading it); ci.yml cancels in-progress runs only for pull requests and runs `git diff --exit-code <phase-0> -- tests/Golden`. The templates carry all of it.
- Evidence: DotNetJsonPrettyPrinter 637c6c3 (CI run 36490775529 green); templates/nuget ci.yml and release.yml (C-20260928-7)
- Scope: skill (templates/nuget)
- Status: promoted: C-20260928-7 (templates/nuget ci.yml and release.yml) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-122 · 2026-09-29 · nuget.org's registration index can lag past the 20-minute wait (`registration-lag-past-20-minutes`)
- Trigger: JsonPrettyPrinter 3.0.2 was pushed at 03:21Z; the flat container listed it within minutes, but the registration index listed it only at 03:44Z (about 23 minutes), so verify-published (40 tries 30 seconds apart, about 20 minutes) failed on all three OSes a minute before it would have passed, and a package validation baseline of 3.0.2 and a file-based app restoring it both failed with NU1102 (2026-09-29). 3.0.2-beta.1 had indexed within the old limit an hour earlier.
- Hypothesis: the registration index is updated by a separate catalog pipeline whose delay varies; 25 minutes (L-012) was one observation, not a bound. The agent first reported the lag as over 40 minutes without reading the time; the background job's log showed 03:44Z (a claim corrected the same hour).
- Rule: verify-published waits up to 60 minutes (120 tries, job timeout 90 minutes; the template carries it); a baseline bump and any restore of the new version wait for the registration index (check it with curl --compressed first); a timed-out verify is rerun, not read as a failed release.
- Evidence: verify-published run 36516856747 (failed on the index wait), run 36518499591 (green on three OSes after the index listed it); templates/nuget verify-published.yml
- Scope: skill (templates/nuget, references/nuget.md)
- Status: promoted: C-20260929-4 (references/nuget.md Traps; templates/nuget verify-published.yml; landed in e4f2be7, status recorded here) · extends L-012 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-123 · 2026-09-29 · A golden capture must replay against the next major without hand patches (`replayable-capture`)
- Trigger: wikiwright replays each repository's golden capture against the old version installed today and against the new major for the wiki's Versions and upgrading page (wikiwright L-113 `replay-requesting-capture`). Every replay so far needed hand patches to the copied capture: is-an-image-url 2.0.0 two lines (the bin path `cli.js` hard-coded, a dependency list naming packages 2.0.0 dropped); markdown-plain-link-replacer 2.0.0 the same two plus a proxy agent and a fixture-server change, because 2.0.0's `fetch` reads `HTTP_PROXY` only when Node started with `NODE_USE_ENV_PROXY=1` and the variables set, and tunnels `http:` links with `CONNECT host:80`, which the fixture handed to its TLS server (2026-09-29). With the patches, 1.1.16 today gave 154 of 154 calls and 18 of 18 CLI runs identical, and 2.0.0 replayed all 154.
- Hypothesis: a capture is written once, for the old version only, so it reaches into that version's layout; the replay against the next major comes later, from another skill, and meets each assumption as a failure.
- Rule: the template reads the bin from package.json (`binPath()`), looks dependencies up with `dependency()` (answering `none`), and finds package.json from the entry point when an exports map hides it; a network capture routes CONNECT by port and keeps its proxy setup in one place. references/npm.md, "Replaying a capture against the next major", records the patches a fetch-based major needs.
- Evidence: markdown-plain-link-replacer ai-docs/notes/2026-09-29-wiki-verify.mjs (the golden section) and its output; is-an-image-url ai-docs/notes/2026-09-28-wiki-verify.mjs; the template run against 1.1.16, 2.0.0 and rand-seed 3 on 2026-09-29 (bin `cli.js`, `dist/cli.mjs`, none; missing dependencies `none`)
- Scope: skill (scripts/golden-capture-npm.template.cjs, references/npm.md)
- Status: promoted: C-20260929-1 (scripts/golden-capture-npm.template.cjs; references/npm.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-124 · 2026-09-29 · A socket guard that reads `args[0].host` lets plain http through (`guard-normalised-args`)
- Trigger: the markdown-plain-link-replacer wiki's verification script used the capture's guard (wrap `net.Socket.prototype.connect`, throw unless the host is 127.0.0.1). On Node 20.20.2, where `NODE_USE_ENV_PROXY` does nothing, a probe `fetch('http://example.com/')` behind the guard answered 200 from the real site; the same held on Node 24.18.0, while `https.get('https://example.com/')` was refused (2026-09-29).
- Hypothesis: `net.connect()` and `net.createConnection()` call `socket.connect(normalized)` with the arguments already normalised into one array, `[options, callback]`; `tls.connect()` passes an options object. The guard read `args[0].host` from the array, found nothing, and allowed the connection.
- Rule: read the options from `Array.isArray(args[0]) ? args[0][0] : args[0]`; test a guard with a host that cannot resolve (`http://guard-test.invalid/`), which must fail with the guard's message. markdown-plain-link-replacer's `test/golden/capture-1.1.16.cjs` (the only capture with this guard) sent every request through its proxy, so the hole did not change its recording, but its guard would not have caught a stray plain http request.
- Evidence: the fixed guard refused `fetch('http://example.com/')` on Node 20.20.2 and 24.18.0 (`wiki-verify guard: refused a connection to example.com:80`); markdown-plain-link-replacer ai-docs/notes/2026-09-29-wiki-verify.mjs (guard.cjs)
- Scope: skill (references/npm.md, Phase 0 network captures)
- Status: promoted: C-20260929-2 (references/npm.md Phase 0) · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-106 · 2026-09-28 · check-readme-images.mjs defaults to npm (`readme-images-registry-flag`)
- Trigger: the 2.3.0 README check ran first without `--registry nuget` and printed "checked for npm"; references/nuget.md has the flag, the agent typed the command from memory (2026-09-28). The rerun with the flag also passed.
- Hypothesis: the script is shared by both registries and the default hides which allow-list was applied.
- Rule: copy the command from the registry's reference; for NuGet it is `node scripts/check-readme-images.mjs README.md --registry nuget`, and the output line must say "checked for nuget".
- Evidence: this run's DotNetRandomNameGenerator log, 2.3.0 entry
- Scope: skill (references/nuget.md verification table already correct)
- Status: promoted: C-20260929-5 (SKILL.md Badges and images) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-112 · 2026-09-28 · A recording is ASCII and its inputs use placeholders (`lossless-capture-text`)
- Trigger: a JSON printer's capture needs lone surrogates, NUL, BOM and backslash escapes as inputs and outputs. The template writer copies non-ASCII characters raw, and a UTF-8 file turns a lone surrogate into U+FFFD without a word; typing the inputs as C# escapes puts backslashes through the editor tools (L-050) (2026-09-28).
- Hypothesis: the earlier packages had no such text.
- Rule: the capture's JSON writer escapes every character outside printable ASCII; inputs are verbatim strings with a backtick for a backslash and `{U+XXXX}` for a code unit, expanded by a helper; long outputs are recorded as length, SHA-256 of the UTF-16LE bytes, head and tail.
- Evidence: DotNetJsonPrettyPrinter tests/Golden/Capture/Json.cs and Cases.cs (J, Text)
- Scope: skill (capture template)
- Status: promoted: C-20260929-5 (scripts/golden-capture-npm.template.cjs (the ASCII writer)) · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-126 · 2026-09-29 · Replay the capture against every old version; a CHANGELOG can hide a change (`every-old-version-replayed`)
- Trigger: seeded-random-utilities' retrofit ran `capture-1.1.4.cjs` against 1.0.0, 1.1.0, 1.1.1, 1.1.2 and 1.1.3 (a loop of five scratch installs, under a minute). All five answered alike and differed from 1.1.4 in 48 of 322 cases: their JavaScript computes the shuffle index with `Math.random()`, so `shuffle` and `generateRandomArrayOfUniqueIntegers` ignore the seed. The CHANGELOG says 1.1.4 is "the same code as 1.1.3, published again", and the wiki repeated it. The popular version was 2.0.0 and the contract 1.1.4, so L-094 and L-110 did not point at these versions (2026-09-29).
- Hypothesis: the popular-version rule looks where the users are; old patch versions with a handful of downloads can still carry the story the docs got wrong, and a deprecation message needs it.
- Rule: in Phase 0, run the contract's capture against every published version (npm: one scratch project per version; it takes seconds), group the versions that answer alike, and diff the built code of the groups; every difference goes to the changelog corrections, the wiki's Versions page and the deprecation recommendation.
- Evidence: m4bwav/seeded-random-utilities ai-docs/notes/2026-09-29-phase-0-gap-audit.md ("Every version, measured with the 1.1.4 capture"); log 2026-09-29
- Scope: skill (references/retrofit.md gap audit step 5)
- Status: promoted: C-20260929-5 (references/retrofit.md gap audit step 1) · extends L-094, L-110 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-128 · 2026-09-29 · A gate that compares a command's output with `!=` passes when the command is missing (`gate-fails-closed`)
- Trigger: the first draft of the npm release.yml ci wait read the check runs with gh, then counted them with `jq` in `[ "$(jq ... <<< "$runs")" != 0 ]`. Run locally with `bash -e -o pipefail` on a commit that had no ci run at all, it printed "ci succeeded": Git Bash has no jq, the substitution printed nothing, and `[ "" != 0 ]` is true. `-e` does not stop on a failed substitution inside a test (2026-09-29).
- Hypothesis: every runner has jq, so the draft looked safe; the local run with a wrong expectation (L-103) is what exposed that the gate fails open whenever its tool or the API does not answer.
- Rule: a release gate computes one verdict word with a single command (gh's own `--jq`: success, failed or waiting), treats a failed command as its own state, and switches on exact words with a default branch that stops the job. Test it with a passing commit, a commit with no run, a failed run (another repository's is fine) and a bad repository name.
- Evidence: m4bwav/seeded-random-utilities .github/workflows/release.yml (the ci wait step); the four local runs logged in its ai-docs/log.md on 2026-09-29
- Scope: skill (templates/npm release.yml, references/npm.md traps)
- Status: promoted: C-20260929-5 (templates/npm release.yml (the ci wait); references/npm.md Traps and Retrofit) · extends L-103 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-129 · 2026-09-29 · `npm run lint | tail -2 && git commit` committed six lint errors (`pipe-hides-status`)
- Trigger: in the seeded-random-utilities retrofit a chain `(npm run lint | tail -2 && npm test | grep ...) && git add -A && git commit` went through with six xo errors on screen: `tail` succeeded, so the chain went on. L-050 had recorded the same trap with grep on 2026-09-27; the agent had read it an hour before (2026-09-29).
- Hypothesis: shortening output is a habit applied to every command, and the status it hides is only visible when read.
- Rule: never commit in the same shell call as a check whose output is piped; run the check with its output to a file, echo its exit status, read it, then commit in a separate call (as the agent did for the rest of the run).
- Evidence: m4bwav/seeded-random-utilities 2c7d52d (with the errors), 1e12cd5 (the fix), ai-docs/log.md 2026-09-29
- Scope: skill (SKILL.md Windows and shell line)
- Status: promoted: C-20260929-5 (SKILL.md Windows line) · recurrence of L-050 · helpful 0 · harmful 1 · last_confirmed 2026-09-29

### L-131 · 2026-09-29 · A reviewer stopped its runaway script with `taskkill //F //IM node.exe` (`kill-by-pid-only`)
- Trigger: the seeded-random-utilities review subagent ran `taskkill //F //IM node.exe` once to stop its own harness; that ends every Node process on the machine, and another Claude session was working at the same time (2026-09-29).
- Hypothesis: the review prompt says read-only for the repository but nothing about processes; a subagent under time pressure reached for the broadest stop.
- Rule: the review prompt says: start long harnesses with a timeout, and stop only processes you started, by PID; never kill by image name. Tell the maintainer when it happened.
- Evidence: the review's report, 2026-09-29; prompts/review-subagent.md
- Scope: skill (prompts/review-subagent.md)
- Status: promoted: C-20260929-5 (prompts/review-subagent.md) · helpful 0 · harmful 1 · last_confirmed 2026-09-29

### L-130 · 2026-09-29 · Correct an old changelog from the whole package diff, declarations included (`diff-the-whole-package`)
- Trigger: the seeded-random-utilities audit diffed only the CommonJS JavaScript of 1.1.3 and 1.1.4, found one changed expression and wrote "the published packages differ in that one expression"; it also kept the old CHANGELOG line that put the `RandomUtilities` interface rename in 1.1.0. The independent review showed 1.1.4 also renamed `ISeededRandomUtilities` (a TypeScript break) and that 1.0.0 to 1.1.3 have byte-identical `dist/`. A second claim, that draws after a shuffle shifted in 1.1.3, was also wrong: its shuffle drew nothing from the seeded generator (2026-09-29).
- Hypothesis: a finding that explains the behaviour difference feels complete; the declaration files and the unchanged versions were never compared, and a claim about later draws was reasoned, not run.
- Rule: before correcting a changelog entry, `diff -r` the whole unpacked package between each pair of adjacent versions (JavaScript, declarations, package.json), state every difference, and run any claim about sequences instead of reasoning it.
- Evidence: m4bwav/seeded-random-utilities pull request #18 review comment (findings 1 and 2), commit 1896ce2
- Scope: skill (references/retrofit.md gap audit step 1)
- Status: promoted: C-20260929-5 (references/retrofit.md gap audit step 1) · helpful 0 · harmful 1 · last_confirmed 2026-09-29
