# Learnings: package-modernize

Procedural lessons for [SKILL.md](SKILL.md). Research findings live in [RESEARCH.md](RESEARCH.md); every change is logged in [CHANGELOG.md](CHANGELOG.md); test runs in [TESTS.md](TESTS.md); state in `evergreen.json`. Format and write-time gate: [MAINTENANCE.md](MAINTENANCE.md) (LEARNINGS-FORMAT). Promoted and retired entries live in full in [LEARNINGS-ARCHIVE.md](LEARNINGS-ARCHIVE.md), each with its reason.

Write an entry the moment a real signal happens: a user correction, the same error twice, a discovered workaround, an environment fact, a stated preference, a failed test or a failure in use. Check existing entries first, by meaning (`evergreen.py search "<the lesson>" --kinds learnings` finds near-duplicates in every registered unit): add / update / retire / none. Trigger and Hypothesis are required. Promote after three confirmations; retire when harmful > helpful.

The first twelve entries were seeded on 2026-09-25 from the three runs that preceded the skill (get-title-at-url, seeded-random-utilities, the two NuGet libraries); their evidence is those repositories' `ai-docs/` and the playbook the skill was built from. They are promoted into SKILL.md or a reference already, so their status says so. The consolidation pass C-20260928-1 (2026-09-28) merged 13 near-duplicates into their lowest ID, moved every promoted and merged entry to the archive, and left one index line per ID below, so every ID cited elsewhere still resolves. The second pass C-20260929-4 (2026-09-29) moved 29 more promoted entries (L-090 to L-124) to the archive, 16 of them marked promoted there because a later change had already written their rule into SKILL.md, a reference or a template.

## Active

### L-013 · 2026-09-25 · The overlay folder is a junction, and file globbing does not see it; the harness must also spot usage-limit replies
- Trigger: in the first eval run the skill's Glob for `.package-modernize/OVERLAY.md` under the home folder returned nothing although the junction existed (3 of 3 action runs); and three runs ended with "You've hit your session limit", judged as failures until the transcripts were read (2026-09-25).
- Hypothesis: Glob skips hidden folders and reparse points; a usage-limit reply is a normal `result` event with no tool calls.
- Rule: Step 0 tells the skill to Read the overlay at its full path; the harness reports a run whose final text mentions a session limit as `environment`, not as a skill failure, and the suite is re-run after the limit resets.
- Evidence: SKILL.md Step 0; evals/run-headless.mjs; T-20260925-1
- Scope: env:windows, harness
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-014 · 2026-09-25 · An eval that only sees the script call passes a script that dies halfway
- Trigger: the first real run (replace-string-at-position Phase 0) found `survey-npm.sh` exiting on "url: unbound variable" whenever OWNER/REPO was passed, so the whole GitHub half (issues, webhooks, alerts) never ran; action-1 had passed 3 of 3 because its evidence was the call in the trace (2026-09-25). Merged L-033 (2026-09-26): the first pass of action-canary graded run 1 as a failure although the run had planted `<=` in src/index.js, seen 10 of 15 golden cases fail, reverted with `git checkout -- src/` and logged it; it ran the suite as `npm --prefix "<dir>" test`, which the sequence regex for `npm test` and `npm run test` did not match.
- Hypothesis: `set -u` plus a variable set only on one branch; the eval grades that the script ran, not that it finished. A regex written from one imagined command misses the forms an agent actually uses (`--prefix`, `-C`, PowerShell instead of Bash); the grade then measures the regex, not the skill (L-033).
- Rule: action evidence for a script also checks the saved file for a fact only the script's late section produces (`and: file_contains`, for example a webhook id), never for a heading, because the agent may save its own report instead of the raw output (T-20260925-2); run each script once end to end on a real package before calling it tested. Write trace checks for the effect (npm and test as whole words, in Bash or PowerShell), prefer file and command checks over command spelling, and run `run-headless.mjs --selftest` so every fixture case fails on an idle run. When a check turns out wrong, fix it and `--rejudge` the stored transcripts and case directories instead of spending new runs; record both gradings in TESTS.md (L-033).
- Evidence: C-20260925-3; evals/evals.json action-1; evals/run-headless.mjs; T-20260925-2; L-033: T-20260926-1, evals/run-headless.mjs (`--rejudge`, `--selftest`), C-20260926-7
- Scope: skill, harness
- Status: active · merged: L-033 · helpful 2 · harmful 0 · last_confirmed 2026-09-26

### L-018 · 2026-09-25 · The maintainer may merge before ruling; treat the merge as the recommendations standing and keep going
- Trigger: the maintainer merged the v2 pull request while the plan's questions (D3c, D4) were open and the review was still running; the review's fixes went into a second pull request (2026-09-25).
- Hypothesis: the pull request stop is where a busy maintainer looks; "silence means the recommendations stand" extends to a merge.
- Rule: after an early merge, record in the plan that the recommendations stand, put the review fixes on a new branch and pull request, and never treat the merge as the OK for a deletion the plan asked about separately (webhooks).
- Evidence: replace-string-at-position ai-docs/log.md
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-25

### L-034 · 2026-09-26 · A case that passes without the skill is a regression guard, not proof the skill works
- Trigger: the baseline (skill junction moved out of ~/.claude/skills) failed action-canary (it ran the suite on four Node lines and never planted a break) but passed action-golden-untouched: the fixture's plan says in D1 that every 1.x answer stays exact, so any careful agent fixes src/ (2026-09-26).
- Hypothesis: the fixture spells out the ruling the skill exists to supply; RepoRescue's test editing happens when the right answer is not written down next to the failing test.
- Rule: run a baseline for every new action case and record in evals.json what the skill-less run did. A case the baseline passes stays as a guard against regressions, labelled so; to measure the skill, the fixture must leave the rule to the skill (for golden-untouched: a plan that states the promise only generally, or a divergence that looks like a fix of an old bug).
- Evidence: T-20260926-1 baseline runs; evals.json `baseline` fields of both cases
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-26

### L-108 · 2026-09-28 · Old majors without a golden capture can be run for the upgrade story (`run-old-majors-for-docs`)
- Trigger: get-title-at-url was modernized before golden captures existed; its wiki run installed 2.0.0 and 1.1.8 in scratch folders and found that 2.0.0 cannot be imported since cheerio 1.0.0 (August 2024), a fact in the plan but in no shipped doc, and that no old version is deprecated on npm although 2.0.0 still gets about 60 downloads a week (2026-09-28).
- Hypothesis: a broken old major is a deprecation candidate the survey can miss when it reads the changelog instead of installing the version.
- Rule: the Phase 0 survey (and a retrofit's gap audit) installs the latest version of each old major and imports it once; one that fails is a deprecation recommendation with its message.
- Evidence: get-title-at-url ai-docs/notes/2026-09-28-github-wiki.md (facts, recommendation); wikiwright L-011 `run-the-old-majors`
- Scope: skill
- Status: active · helpful 2 · harmful 0 · last_confirmed 2026-09-29

### L-111 · 2026-09-28 · Record the parameter name, the dependency that worded a message, and the time zone (`record-param-and-source`)
- Trigger: on net48 the first line of an ArgumentNullException message is "Value cannot be null." without the parameter, so a renamed parameter would pass the replay; System.Text.Json's messages on net10.0 come from the runner's runtime, not the package, and can move with a patch; 1.x's JavaScriptSerializer read ISO dates as local time, so its recording held "-06:00 Local" (2026-09-28).
- Hypothesis: the first-line rule was written for messages the library words itself.
- Rule: exception records carry `$param` (ParamName) and `$from` when the throwing method's assembly is a dependency (System.Text.Json, System.Web.Extensions); the header records the time zone and the dependency's version; the plan names "dependency-worded message, compared by type when the dependency's version differs" as the one exception class.
- Evidence: DotNetJsonPrettyPrinter tests/Golden/Capture/Cases.cs (AddException), Program.cs (header)
- Scope: skill (references/nuget.md Phase 0, the capture template)
- Status: active · helpful 2 · harmful 0 · last_confirmed 2026-09-29

### L-116 · 2026-09-28 · Python output redirected on Windows is CRLF (`python-redirect-crlf`)
- Trigger: `python compare.py a b > report.txt` from Git Bash wrote CRLF reports into a repository with `eol=lf` (2026-09-28).
- Hypothesis: Python's stdout is in text mode and translates newlines on Windows.
- Rule: a report meant for the repository is written by the script with `newline="\n"`, or normalised by byte before `git add`.
- Evidence: DotNetJsonPrettyPrinter tests/Golden/upgrade/diff-*.txt (normalised before 08b777a)
- Scope: env:windows
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-121 · 2026-09-28 · A wait loop must stop on an empty id or a gh error (`wait-loop-exits`)
- Trigger: after JsonPrettyPrinter's merge, `gh run list -b master -L 1` returned a Dependabot run without the fields asked for, the loop `until [ "$(gh run view $id ...)" = completed ]` polled run id "null" for ten minutes and was stopped by hand (2026-09-28).
- Hypothesis: `until` on a command substitution never ends when the command fails, and a list query can return a run of another workflow.
- Rule: filter the run by workflow and head (`-w release`, headBranch equal to the tag), exit when the id is empty, bound the loop (`for i in $(seq 1 N)`), and exit on a gh error; scripts/watch-run.sh is the tested form.
- Evidence: DotNetJsonPrettyPrinter ai-docs/log.md (2026-09-28, pull request #8 merged)
- Scope: skill
- Status: active · helpful 2 · harmful 0 · last_confirmed 2026-09-29

### L-127 · 2026-09-29 · With `npm version`, the tag's release run starts before ci on the same commit ends (`npm-version-tags-before-ci`)
- Trigger: bringing L-120 to the npm templates: `npm version` makes the version commit and the tag together and `git push --follow-tags` pushes both, so ci.yml and release.yml start on the same commit in the same second, and a plain "ci passed on the tagged commit" check always fails. The NuGet flow tags after a green pull request merge and never meets it (2026-09-29).
- Hypothesis: the npm ritual predates the check; the fix is either a bounded wait for the check run in release.yml or tagging after green.
- Rule: npm's release.yml waits for the `ci` check run on the tagged commit (bounded, fails on a missing, red or timed-out check, L-121) before it builds; the alternative is `npm version --no-git-tag-version`, push, wait for green, then tag. To be confirmed by the 2.0.1-beta.1 rehearsal.
- Evidence: m4bwav/seeded-random-utilities ai-docs/plans/2026-09-29-retrofit-and-2.0.1-release.md (R3)
- Scope: skill (templates/npm/.github/workflows/release.yml, references/npm.md Phases 5 and 6)
- Status: active · extends L-120 · helpful 0 · harmful 0 · last_confirmed 2026-09-29

### L-125 · 2026-09-29 · A capture's proxy setup is one function that the recording and the replay both call (`replayable-proxy-setup`)
- Trigger: markdown-plain-link-replacer's 2026-09-29 replay of the 1.1.16 capture against 2.0.0 needed four patched copies; two of them were proxy setup spread through the capture: undici's agent installed after the capture set the variables (it set them only once its server listened, too late for `NODE_USE_ENV_PROXY`, which Node reads at startup), and a fixture `connect` handler that sent port 80 to the plain server. wikiwright met the same pattern twice the same day: L-116 `by-host-name-proxy` (a proxy that routes by port, variables set before each child starts) and L-117 `guard-normalised-args` (the guard that let plain http out). Writing the setup as one function and running it with request 2.88 and a real TLS fixture found one more thing: with `NO_PROXY` empty and `NODE_USE_ENV_PROXY=1` (children on Node 24) or `http.setGlobalProxyFromEnv` (this process), Node 24.18.0 also proxied request 2.88's own connection to the proxy, and its http request line arrived as `http://host:<proxy port>/path` instead of `http://host/path`.
- Hypothesis: a capture is written for the old version's transport (request 2.88 reads the proxy variables per call), so its setup happens whenever the capture gets round to it; a fetch-based major needs the same setup done before anything starts and routed by port. Setup that lives in one function, called first, is the same for both, and a probe at start says which route each process got instead of letting an unrouted `fetch` record errors as behaviour.
- Rule: a capture that records through its own proxy calls `startCaptureProxy()` from scripts/capture-proxy.cjs first, before it requires the package and before any child starts: guard (L-124 form, tested on `.invalid` hosts), a proxy routing CONNECT by port (443 to TLS, any other to plain), the variables in `process.env` with `NO_PROXY` set to the loopback names only, and `fetch` routed here and in children (undici's `EnvHttpProxyAgent`, `http.setGlobalProxyFromEnv`, or `NODE_USE_ENV_PROXY=1`, picked by probe). Print `report()` to stderr, and treat the guard's message in the golden output as a failure.
- Evidence: wikiwright L-116 and L-117 and its templates/npm/host-fixture.mjs; markdown-plain-link-replacer's 2026-09-29 replay (wikiwright references/npm.md, "Golden captures that record through a proxy with TLS"); `node capture-proxy.cjs --selftest` 23 of 23 on Node 24.18.0 (undici 7 and none) and 20.20.2 with undici, 21 of 21 plus two skips on 20.20.2 without undici; the same self-test with `NO_PROXY` empty failed its two absolute-form checks on Node 24.18.0 (`plain GET http://selftest.invalid:49188/abs-self`); request 2.88.2 and `fetch` through the function with a real TLS fixture (2026-09-29)
- Scope: skill (scripts/capture-proxy.cjs, scripts/golden-capture-npm.template.cjs, references/npm.md)
- Status: active · extends L-123 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

## Archived entries

One line per promoted or merged ID, in order; the full entry (trigger, hypothesis, rule, evidence, where the rule now lives) is in [LEARNINGS-ARCHIVE.md](LEARNINGS-ARCHIVE.md) under the same ID.

- L-001 · Survey claims can be wrong; the golden capture is the arbiter → promoted: C-20260925-1, C-20260926-10 (absorbs L-035)
- L-002 · Two wishes in a kickoff can conflict; the plan says so instead of satisfying both badly → promoted: C-20260925-1
- L-003 · An independent read-only review finds what hundreds of passing tests miss → promoted: C-20260925-1
- L-004 · Golden fixtures cover only the draws they record; read ported arithmetic line by line → promoted: C-20260925-1
- L-005 · Tag only after the default branch is green; a tag on a failing commit burns the version → promoted: C-20260925-1
- L-006 · A locked lock file for a multi-OS matrix must not depend on anything the SDK infers per OS → promoted: C-20260925-1
- L-007 · Old bot pull requests are closed with one comment after the regenerated lockfile merges, never merged one by one → promoted: C-20260925-1
- L-008 · Windows shell tools mangle files; write with editor tools and check line endings by counting byte 13 → promoted: C-20260925-1, C-20260927-16 (absorbs L-057)
- L-009 · The published tarball can hold files the repository does not → promoted: C-20260925-1
- L-010 · The everlast doc lint has three habits to write around → promoted: C-20260925-1, C-20260925-3, C-20260927-13 (absorbs L-082)
- L-011 · Approvals that the registry or GitHub gate must be the maintainer's clicks; the agent stops and waits → promoted: C-20260925-1
- L-012 · Registry indexing lags differ per surface; verification waits and re-polls → promoted: C-20260925-1, C-20260927-9 (absorbs L-062)
- L-015 · A JSON round trip erases exactly the edge inputs a golden capture is for → promoted: C-20260925-3
- L-016 · The dependents, not the survey count, decide what a major may refuse → promoted: C-20260925-3
- L-017 · A callable CommonJS build needs its own entry, a strict banner and a TypeScript 5 interop-off fixture → promoted: C-20260925-4
- L-019 · A network or callback package needs a capture built around a local fixture server → promoted: C-20260925-6
- L-020 · Run the published bin before planning; a CLI can be broken for years without an issue → promoted: C-20260925-6
- L-021 · everlast's sync push pushes on its own; a run told not to push registers with sync off → promoted: C-20260925-6
- L-022 · Take the plan rulings first-hand from the maintainer, not from a summary of an earlier session → promoted: C-20260926-1
- L-023 · A test fixture server that destroys its sockets must wait before the next fetch → promoted: C-20260926-1
- L-024 · Inlining a dependency: copy its behaviour exactly, flags and platform included, and its licence from the tarball → promoted: C-20260926-1
- L-025 · xo --fix changes public types and comments; read its diff of src/ line by line → promoted: C-20260926-1, C-20260927-3 (absorbs L-049)
- L-026 · Network packages: clamp user timeouts, and never offer an input allow-list as SSRF protection → promoted: C-20260926-1
- L-027 · Read the merge method and SHA after the maintainer merges; the plan's "squash" is a wish → promoted: C-20260926-2, C-20260927-12 (absorbs L-077)
- L-028 · Under automatic permission modes, take the go for GitHub writes in the session and hand over the commands → promoted: C-20260926-2, C-20260926-3, C-20260927-4 (absorbs L-054)
- L-029 · The release workflow needs a `## [X.0.0]` changelog heading; lint after every edit before tagging → promoted: C-20260926-4, C-20260927-1 (absorbs L-039)
- L-030 · actionlint without shellcheck checks no shell; a truncated test line reached a live verify run → promoted: C-20260926-5
- L-031 · A placeholder in a command shown to the maintainer can become the live registry state → promoted: C-20260926-6, C-20260926-11 (absorbs L-037)
- L-032 · Script any command chain a run repeats, and prove the script on a replay of the real mistake → promoted: C-20260926-6
- L-033 · Eval evidence must accept every spelling of the action; re-judge stored runs after fixing a check → merged into L-014
- L-035 · A kickoff's claim about an error path is a hypothesis until the capture records it → merged into L-001
- L-036 · Search old package.json scripts and published versions for tokens, not only config files → promoted: C-20260926-10
- L-037 · npm deprecate cannot finish from an agent's shell: EOTP without a TTY → merged into L-031
- L-038 · Tag pushes run in the main session; a subagent's refusal is not a reason to ask the maintainer → promoted: C-20260926-11
- L-039 · The generated release-notes.md fails lint in release.yml → merged into L-029
- L-040 · xo's cache hides lint errors in edited files; CI finds them → promoted: C-20260927-1
- L-041 · A golden capture made on Windows lacks file symlinks; CI runners make them → promoted: C-20260927-1
- L-042 · export = with a namespace: two tsdown declaration traps → promoted: C-20260927-1
- L-043 · Filesystem packages: capture recipe and review lessons → promoted: C-20260927-1
- L-044 · `npm --prefix DIR init -y` writes package.json in the working directory, not DIR → promoted: C-20260927-2
- L-045 · Guard the capture at the socket, not by counting requests per case → promoted: C-20260927-2
- L-046 · A package whose output passes through a dependency's new major needs a mechanical exception, not a re-recording → promoted: C-20260927-2, C-20260927-3
- L-047 · The canary's `git checkout -- src/` reverts nothing while src/ is untracked → promoted: C-20260927-3, C-20260927-11 (absorbs L-074)
- L-048 · Taking a young dependency past the cooldown: add it alone, after the tree is locked under the cooldown → promoted: C-20260927-3
- L-049 · xo --fix can bring in APIs newer than the Node floor → merged into L-025
- L-050 · Editor-tool content decodes `\u` escapes; `a && grep | b && git commit` commits after failures → promoted: C-20260927-3, C-20260927-7 (absorbs L-058)
- L-051 · A package with runtime dependencies: tests route fetch by URL, and oracles for inlined pieces are recorded, not installed → promoted: C-20260927-3
- L-052 · After the review, fuzz against the published package itself, not a restated oracle → promoted: C-20260927-4, C-20260927-15 (absorbs L-086)
- L-053 · Staggered-timer tests measure from the first event → promoted: C-20260927-4
- L-054 · Run the GitHub-writing scripts from the agent, and get an allow rule first → merged into L-028
- L-055 · Latest tooling, widest audience → promoted: C-20260927-5
- L-056 · Capture a .NET Framework package on net48, and a package that runs a program against real fixtures → promoted: C-20260927-6
- L-057 · A heredoc through Git Bash still breaks backslash escapes inside a Python script → merged into L-008
- L-058 · The editor tools decode backslash-u escapes too (`tool-unescapes-backslash-u`) → merged into L-050
- L-059 · Generate the golden replay from the capture program (`golden-replay-from-capture`) → promoted: C-20260927-7
- L-060 · A reflection baseline of the old public API, with parameter names → promoted: C-20260927-7
- L-061 · CI for a package that measures an external program: current build on every OS, sorted listings, resolved temp paths → promoted: C-20260927-7
- L-062 · verify-published waits for both nuget.org indexes (`verify-waits-both-indexes`) → merged into L-012
- L-063 · An F# library pins FSharp.Core; old F# packages often never declared it (`pin-fsharp-core`) → promoted: C-20260927-10
- L-064 · `dotnet format` passes F# without checking it; F# needs Fantomas (`dotnet-format-skips-fsharp`) → promoted: C-20260927-10
- L-065 · Record the old package once per runtime; Mono is a reference, not .NET Framework (`golden-per-runtime`) → promoted: C-20260927-10
- L-066 · An F# capture splits its cases into a file the golden test compiles unchanged (`shared-cases-file`) → promoted: C-20260927-10
- L-067 · A .NET network capture: the fixture server is the proxy, and every host is a .test name (`fixture-server-as-proxy`) → promoted: C-20260927-10
- L-068 · F# cannot call an F# library's extension methods as extensions (`fsharp-ignores-fsharp-extensions`) → promoted: C-20260927-10
- L-069 · A cloud session can hold a repository read-only, and survey-github.sh printed "(none)" without gh (`cloud-session-access-check`) → promoted: C-20260927-10
- L-070 · A package that can show an icon and has none gets a generated one (`generate-missing-icon`) → promoted: C-20260927-11
- L-071 · A netstandard2.0 library that exposes HttpClient breaks .NET Framework consumers (`netfx-needs-system-net-http`) → promoted: C-20260927-11
- L-072 · A .NET Framework network golden test runs alone in its own test process (`golden-alone-in-process`) → promoted: C-20260927-11
- L-073 · dotnet nuget sources from Git Bash need Windows paths, and a consumer needs its own packages folder (`windows-paths-for-dotnet-nuget`) → promoted: C-20260927-11
- L-074 · Commit the rewrite before planting the canary (`commit-before-canary`) → merged into L-047
- L-075 · A Windows recording can name the drive the capture ran on (`recording-names-the-drive`) → promoted: C-20260927-11
- L-076 · The F# analyzers run with SDK 10; exclude only the frozen file (`fsharp-analyzers-verified`) → promoted: C-20260927-11
- L-077 · Apply the repository settings when the pull request opens, not after the review (`settings-before-the-pull-request`) → merged into L-027
- L-078 · Read every version's nupkg, not only the latest (`survey-every-version-nupkg`) → promoted: C-20260927-13
- L-079 · Run the old tests unchanged against the published package when the old projects cannot build (`old-tests-against-published`) → promoted: C-20260927-13
- L-080 · A recording can be a record of failure; then net48 is the contract everywhere (`net10-record-of-failure`) → promoted: C-20260927-13
- L-081 · Check the cooldown with the registration index before every package reference (`nuget-latest-cooldown`) → promoted: C-20260927-13
- L-082 · The everlast lint reads C# generics as placeholders (`lint-reads-csharp-generics`) → merged into L-010
- L-083 · Public BCL shapes differ between .NET Framework and .NET (`bcl-shape-differs-by-runtime`) → promoted: C-20260927-14
- L-084 · Let the test host name a hanging test (`blame-hang-names-the-test`) → promoted: C-20260927-14
- L-085 · Existing templates can be stale drafts; read their header before calling them missing (`templates-marked-unverified`) → promoted: C-20260927-14
- L-086 · A rewrite that reimplements a dependency is tested against the real one (`differential-against-the-original`) → merged into L-052
- L-087 · "Cannot create ref due to creations being restricted" on a tag push is the admin bypass, not a failure (`tag-bypass-message`) → promoted: C-20260927-16
- L-088 · `gh attestation verify` prints nothing on success outside a terminal (`attestation-verify-silent`) → promoted: C-20260927-16
- L-089 · Put a needed working directory in a subshell (`cd-only-in-a-subshell`) → promoted: C-20260927-16
- L-090 · Pull the skill with git -C; its shell rules are not loaded yet (`pull-without-cd`) → promoted: C-20260928-2
- L-091 · Backslash-u in prose is decoded too; name code points as U+XXXX (`prose-escapes-decode-too`) → promoted: C-20260928-2
- L-092 · The public API list includes protected members and class kinds (`api-list-protected-members`) → promoted: C-20260928-2
- L-093 · Rebuild embedded data from its source with the old tool's logic (`data-provenance-check`) → promoted: C-20260928-3
- L-094 · Compare the most-downloaded old version with the contract, not only the latest (`diff-the-popular-version`) → promoted: C-20260928-3
- L-095 · A path token in a recording also needs forward slashes (`portable-path-token`) → promoted: C-20260928-2
- L-096 · Two survey helpers printed errors as findings (`helpers-say-none-plainly`) → promoted: C-20260928-2
- L-097 · The everlast lint also reads the C# lazy type as an opinion about people (`lint-reads-lazy`) → promoted: C-20260928-2
- L-098 · Record the process bitness; run the replay the same way (`record-process-bitness`) → promoted: C-20260928-3
- L-099 · A ruled change to golden answers goes in a guarded exception file beside the replay (`ruled-exception-file`) → promoted: C-20260928-3
- L-100 · Adapting templates: C-locale content list, placeholder regex, seven-day cooldown, eol=lf re-checkout (`template-adaptation-traps`) → promoted: C-20260928-3
- L-101 · Run CI's exact test command locally before pushing (`ci-command-locally`) → promoted: C-20260928-3
- L-102 · Three known traps repeated in one session (`known-traps-repeated`) → promoted: C-20260928-3
- L-103 · The package content check died silently on a package without dependencies (`empty-dependency-group`) → promoted: C-20260928-3
- L-104 · A consumer of the packed package needs source mapping (`consumer-source-mapping`) → promoted: C-20260928-3
- L-105 · Log only what the maintainer said, quoted (`log-maintainer-quotes`) → promoted: C-20260928-4
- L-107 · The wiki comes after the release is verified, and it audits the shipped docs (`wiki-after-release`) → promoted: C-20260928-5
- L-109 · The golden capture feeds the wiki, and cleanup must not switch the wiki off (`golden-capture-feeds-the-wiki`) → promoted: C-20260928-6
- L-110 · One capture program records every published version (`one-capture-many-versions`) → promoted: C-20260928-7
- L-113 · The API lister shows init accessors as set (`api-list-init-accessors`) → promoted: C-20260928-7
- L-114 · The everlast lint reads an MSBuild element in prose as a placeholder (`lint-reads-msbuild-elements`) → promoted: C-20260929-4
- L-115 · Three known traps again in the first hour (`known-traps-first-hour`) → promoted: C-20260929-4
- L-117 · The template replay's string comparison throws on a recorded lone surrogate (`raw-text-for-lone-surrogates`) → promoted: C-20260928-7
- L-118 · actionlint found nothing in shell because shellcheck was missing; with it, a template bug (`actionlint-needs-shellcheck`) → promoted: C-20260928-7
- L-119 · A dependency's default can write the OS newline into a recording (`os-newline-through-a-dependency`) → promoted: C-20260928-7
- L-120 · The release workflow pushed a package no check had run on (`release-checks-what-it-pushes`) → promoted: C-20260928-7
- L-122 · nuget.org's registration index can lag past the 20-minute wait (`registration-lag-past-20-minutes`) → promoted: C-20260929-4
- L-123 · A golden capture must replay against the next major without hand patches (`replayable-capture`) → promoted: C-20260929-1
- L-124 · A socket guard that reads `args[0].host` lets plain http through (`guard-normalised-args`) → promoted: C-20260929-2
- L-106 · check-readme-images.mjs defaults to npm (`readme-images-registry-flag`) → promoted: C-20260929-5
- L-112 · A recording is ASCII and its inputs use placeholders (`lossless-capture-text`) → promoted: C-20260929-5
- L-126 · Replay the capture against every old version; a CHANGELOG can hide a change (`every-old-version-replayed`) → promoted: C-20260929-5
- L-128 · A gate that compares a command's output with `!=` passes when the command is missing (`gate-fails-closed`) → promoted: C-20260929-5
- L-129 · `npm run lint | tail -2 && git commit` committed six lint errors (`pipe-hides-status`) → promoted: C-20260929-5
- L-131 · A reviewer stopped its runaway script with `taskkill //F //IM node.exe` (`kill-by-pid-only`) → promoted: C-20260929-5
- L-130 · Correct an old changelog from the whole package diff, declarations included (`diff-the-whole-package`) → promoted: C-20260929-5
