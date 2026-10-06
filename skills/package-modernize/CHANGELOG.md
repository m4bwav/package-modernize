# Changelog: package-modernize

Every change to [SKILL.md](SKILL.md) and its companions, newest first, each with the reason. Reasons cite findings in [RESEARCH.md](RESEARCH.md) (`R-`), lessons in [LEARNINGS.md](LEARNINGS.md) (`L-`), and test runs in [TESTS.md](TESTS.md) (`T-`). State in `evergreen.json`. Protocol: [MAINTENANCE.md](MAINTENANCE.md).

Entry shape: `### C-YYYYMMDD-n · date · one-line summary`, then `because:` (IDs or "user request"), `files:` (file and section), and a sentence on what changed. Cite section headings, not line numbers.

### C-20261006-1 · 2026-10-06 · SECURITY.md invites issues, pull requests and discussions; private reporting kept for exploitable problems; variants for tools and old code (`security-md-tiered`)
- because: user request (a SECURITY.md in every public repository, reporters sent to issues, pull requests or Discussions); the OpenSSF maintainer guide and GitHub's docs both say exploitable vulnerabilities should not be disclosed in public, so the private form stays for those
- files: templates/npm/SECURITY.md and templates/nuget/SECURITY.md (Reporting a problem), templates/security/SECURITY-tool.md and SECURITY-example.md (new), templates/README.md (Security policy), references/security.md (the SECURITY.md sentence)
- The old templates sent every report to the private form and asked for no public issue. The maintainer prefers issues, pull requests and discussions, so those are now the default and the private form is for problems that could hurt users before a fix. Repositories released before this keep their old policy until a retrofit touches them.

### C-20261005-1 · 2026-10-05 · Lessons from listing the plugins in awesome-copilot (`awesome-copilot-listings`)
- because: user request (list the Claude-directory plugins in github/awesome-copilot); L-152 to L-155
- files: LEARNINGS.md (L-152 to L-155)
- Learnings only; SKILL.md is unchanged.

### C-20261003-1 · 2026-10-03 · Ready for the Claude plugin directory: plugin manifest, Privacy, pinned launchers, private names removed (`directory-prep`)
- because: user request (submission to the Claude plugin directory and its pre-submission checklist)
- files: ../../.claude-plugin/plugin.json and marketplace.json (new; version 1.0.0 as in package.json), ../../README.md (plugin install, Privacy), ../../package.json (licence MIT and author, matching LICENSE), scripts/check-workflow-shell.py (`shellcheck-py==0.11.0.1`), references/npm.md (publint 0.3.25, @arethetypeswrong/cli 0.18.5, zizmor 1.30.1, node 20.20.2), references/nuget.md (Fantomas 8.0.6), templates/README.md (zizmor 1.30.1), RESEARCH.md (actions-up 1.21.0), scripts/add-self-hosted-runner.ps1 and scripts/README.md and references/private-repo-ci.md (runner folder default `%SystemDrive%`, example repository generic), LEARNINGS.md (L-135 without the private repository, runner host name or quotes about payment), ../../ai-docs (private companion repository named generically; a 92-character decision file name shortened)
- The directory wants every package a launcher runs pinned, a privacy policy and no private names in a public plugin. Each pinned path was run on 2026-10-03 (`uvx --from shellcheck-py==0.11.0.1 shellcheck --version`, `uvx zizmor@1.30.1 --version`, `npx -y publint@0.3.25 --help`, `npx -y -p @arethetypeswrong/cli@0.18.5 attw --version`, `npx -y actions-up@1.21.0 --version`, `dotnet tool install fantomas --version 8.0.6` in a scratch manifest, `npx -y -p node@20.20.2 node -p process.version`), and check-workflow-shell.py passed the npm templates through the pinned uvx route. `claude plugin validate .` passes, and an install from the local marketplace into an empty CLAUDE_CONFIG_DIR listed 1.0.0 enabled. Git history still holds the old text.

### C-20261002-1 · 2026-10-02 · Lessons from the first brand-new package's Stages 0 to 2 (`galaxy-run-stage-0-to-2`)
- because: L-148, L-149, L-150, L-151; the galaxy generator kickoff (lessons the same day)
- files: LEARNINGS.md (L-148 to L-151); evergreen.json (counts)
- Four lessons from extracting a Unity game's generator into the new package UniverseGenerator: survey what the application saves before ruling on compatibility; Unity's Mono computes floats in double precision and its "R" format is not round-trip; Unity repositories ignore csproj files and batchmode rewrites settings; research as a knowledge base with a generated feature matrix. No skill text changes yet; each names where it goes once confirmed.

### C-20260930-1 · 2026-09-30 · Body split into on-demand references: 8,883 to 3,988 tokens, phase table and every stop kept (`body-split-on-demand`)
- because: evergreen-worth (evergreen-protocol PR #6) flagged the body at 8,883 tokens (96 lines, 82% specific) and `prompts/kickoff-skeleton.md` as never named; after compaction Claude Code re-attaches only the first 5,000 tokens of an invoked skill, and runs are long sessions that compact, so the tail of the old body dropped out mid-run; user request (the maintainer's kickoff prompt, 2026-09-30); T-20260930-1
- files: SKILL.md (Phases table gains a "Read first" column; new "Package systems" routing table; two one-line rules in "The shape of a run"; removed: What every run does the same way, How each phase is done per system, Tools and prior art), references/survey-and-golden.md, references/rewrite-and-review.md, references/readme-images.md, references/community.md, references/security.md, references/wrap-up.md (new), references/npm.md and references/nuget.md (Phase 5 and 6: first line), references/plan-skeleton.md (new section "The questions every plan settles"), references/README.md (index lines for the new files; the per-system table), RESEARCH.md (Current understanding: "Tools and prior art as the skill applies them"), evals/evals.json (pointer-phase-5), evals/run-headless.mjs (`--skill-dir`, `allowed_tools`, `no_trace`, wider `--selftest`)
- Moved whole, not rewritten. "What every run does the same way" went paragraph by paragraph to the reference for the phase that uses it: Survey and Golden capture to survey-and-golden.md; Plan into plan-skeleton.md; Rewrite and Independent review to rewrite-and-review.md; Badges and images to readme-images.md; Community to community.md; Security to security.md (maintainer's ruling, 2026-09-30); Documents, Wiki, the hand-over with wikiwright (text kept identical to wikiwright's copy) and Wrap-up to wrap-up.md. The per-system table went whole into references/README.md; its Coverage and Reference rows are repeated in the body's Package systems table. Tools and prior art went to RESEARCH.md.
- Edited in moved text (headings and links only): each bold run-in title became a `##` heading; Plan's opening "`references/plan-skeleton.md`." became "The skeleton is below."; Rewrite's "as "Badges and images" below says" now links readme-images.md; Documents' "(Phase 7, "Wiki")" says "below"; the table's `references/x.md` links became sibling links; the Phase 7 row's "(below, "Wiki")" names references/wrap-up.md. Deleted: nothing.
- New in the body: the Read first cells (Phase 5: `references/security.md` and the system's reference); "When the golden test fails, fix `src/` or name an exception the maintainer ruled on; never edit the recording (R-20260926-2)"; "Delegate to tools rather than reinventing" pointing at RESEARCH.md; `scripts/` named once so its helpers stay reachable.
- The Phase 5 and 6 sections of references/npm.md and references/nuget.md now open with a line pointing at security.md, because one eval run went straight to npm.md's Phase 5 section and skipped it (L-147 `repeat-pointer-where-the-run-lands`).
- Harness: `--skill-dir DIR` links DIR as `.claude/skills/<skill>` in each case's directory and runs the CLI with `--setting-sources project`, so a branch is tested without moving the installed junction (the HANDOFF dead end of renaming it). `allowed_tools` replaces a case's tool list; `no_trace` passes when no matching call happened.
- Body after: 3,988 tokens, 61 lines, 83% specific, no unnamed bundled files (`evergreen.py worth --against origin/master`).

### C-20260929-11 · 2026-09-29 · One-call workflow lint and .NET version bump; a Release made by a workflow dispatches its verify (`token-savers-fizzbuzzplus-phase-5`)
- because: L-144, L-145, L-146; user request ("Update the skills and docs with processes and scripts that will net-save tokens", 2026-09-29)
- files: scripts/lint-workflows.sh (new), scripts/bump-version-dotnet.sh (new), scripts/check-workflow-shell.py (refuses a path without workflows), scripts/README.md, SKILL.md (Phase 2 exit criteria), references/npm.md and references/nuget.md (the actionlint lines; Phases 5 and 6 version line), LEARNINGS.md (L-144 to L-146), evergreen.json (counts)
- FizzBuzzPlus Phase 5 spent about ten calls on two chores every run repeats: linting workflows (tools hunted in old scratchpads, three separate checks, one of which silently checked nothing) and bumping a .NET version (lock files). Each is now one script call, tested red and green. L-144 records that a Release created with the GITHUB_TOKEN never fires `on: release`, for the repository variant.

### C-20260929-10 · 2026-09-29 · Hand-over text: NuGet golden recordings are per runtime and OS from a capture project (`handover-nuget-golden`)
- because: wikiwright's seventh run (IsImageUrlDotNet's wiki, its report); L-143
- files: SKILL.md (the hand-over paragraph, the same text as wikiwright's); LEARNINGS.md (L-143); evergreen.json (counts)
- The hand-over promised compare reports in `tests/Golden/upgrade/` for every NuGet package; IsImageUrlDotNet has none, only its recordings per runtime and OS and the capture project that made them. The text now names both, and the reports only where a run wrote them.

### C-20260929-9 · 2026-09-29 · A .NET console app detects a closed pipe itself (`console-stream-swallows-epipe`)
- because: L-142
- files: references/nuget.md (Phase 2, the console app line), LEARNINGS.md (L-142), evergreen.json (counts)
- FizzBuzzPlus's independent review found a program that ran forever after `| head` closed the pipe, on Linux and, checked afterwards, on Windows as well. The reference now says how a console app or dotnet tool writes its output and which exit codes it gives for a broken pipe and for other write failures, and asks for process-level tests.

### C-20260929-8 · 2026-09-29 · FizzBuzzPlus Phase 0: CPU and ICU capture traps, two script fixes, the repository variant's first lessons (`fizzbuzzplus-phase-0`)
- because: L-136, L-137, L-138, L-139, L-140, L-141
- files: references/nuget.md (Phase 0: architecture and ICU culture lines), scripts/watch-run.sh (argument checks), scripts/survey-github.sh (Dependabot alerts probe), LEARNINGS.md (L-136 to L-141), evergreen.json (counts)
- The first run on a repository that was never published (FizzBuzzPlus) reached its plan review. Its Phase 0 found three things worth a reference line: the capture header needs the CPU architecture (arm64 raises arithmetic exceptions from CoreLib); .NET's ICU data changes how five cultures write negative numbers; and gh's scope hint makes a disabled Dependabot look like a failed webhook query. watch-run.sh now refuses swapped arguments instead of retrying gh errors for a minute. The repository variant itself (frozen source as the reference, per-OS recordings from a scratch workflow) is recorded as L-139 and is proposed as references/repository.md when the run ends.

### C-20260929-7 · 2026-09-29 · Private repositories run their CI on the maintainer's own runner (`private-repo-ci`)
- because: L-135; user request ("make that part of the modernization skill sets", 2026-09-29)
- files: SKILL.md (Rules, the private repositories line), references/private-repo-ci.md (new), references/README.md, scripts/add-self-hosted-runner.ps1 (new), scripts/README.md, LEARNINGS.md (L-135)
- A repository that is or will be private gets a self-hosted runner on the maintainer's Windows machine from one script, with workflow rules for it, because GitHub bills private repositories' hosted minutes and storage and blocks jobs at the allowance. The script was run against a private website repository's runner (already registered: it kept the registration, rewrote start.cmd, replaced the logon task and brought the runner back online). The reference records the volatile billing claims and npm's hosted-runner-only trusted publishing.

### C-20260929-6 · 2026-09-29 · The npm release job builds before publint; watch-run.sh judges a run by its conclusion (`sru-release-fixes`)
- because: L-132, L-133, L-134; L-127 confirmed (seeded-random-utilities 2.0.1-beta.2 and 2.0.1 released through the new gate, 2026-09-29)
- files: templates/npm/.github/workflows/release.yml (build job: `npm run build` before `npm run check`), scripts/watch-run.sh (watch until completed, verdict from the conclusion, quoted status), references/npm.md (Phases 5 and 6: rehearse a changed release job in a fresh clone; the EOTP line: the maintainer logs in and runs the 2FA commands), LEARNINGS.md (L-127 confirmed; L-132 to L-134)
- C-20260929-5's reorder put publint before any build in the release job, so the first rehearsal on it (2.0.1-beta.1) failed before staging; the job now builds first, as ci.yml does. watch-run.sh reported a dispatched verify-published run as failed while it was still running; it now waits for the run to complete and reads its conclusion.

### C-20260929-5 · 2026-09-29 · The retrofit path's first npm run: registry-neutral retrofit.md, the npm release gate in the templates (`sru-retrofit`)
- because: the seeded-random-utilities retrofit (2.0.0 to 2.0.1, m4bwav/seeded-random-utilities pull request #18; its independent review: 977,328 comparisons per Node line, 0 differences, 12 findings); L-106, L-112, L-126 to L-131; user request (kickoff: make retrofit.md registry-neutral with the npm specifics in npm.md, bring the npm templates to the NuGet templates' L-120 standard)
- files: references/retrofit.md (rewritten registry-neutral: runs table, gap audit steps 1 to 11 with the existing-recordings and reproducible-build steps, shared traps, the three reviews), references/nuget.md (new Retrofit section: the NuGet specifics moved from retrofit.md), references/npm.md (new Retrofit section; two traps), templates/npm (.github/workflows/release.yml and ci.yml, scripts/check-tarball.mjs, scripts/published-files.js, test/golden/check-untouched.sh, test/package/shape.test.js, test/consumers/consumers.test.js), templates/README.md, scripts/check-golden-untouched.sh (fails in a shallow clone and on recordings deleted or renamed in history), prompts/review-subagent.md (stop processes by PID only), SKILL.md (the Windows line: never commit in the call of a piped check, L-129; Badges and images: `--registry nuget`, L-106), scripts/golden-capture-npm.template.cjs (the ASCII writer, L-112), LEARNINGS.md (L-126 to L-131 added: L-127 active until the rehearsal, the rest promoted; L-106 and L-112 promoted; `helpful` raised on L-108, L-111 and L-121, which this run confirmed)
- The npm release.yml now waits for ci.yml's push run on the tagged master commit, runs check before test so the tested dist/ is the one packed, packs once, checks the tarball and runs the consumers on it on Linux (Node 24 and 20) and Windows, and stages exactly that tarball after checking its SHA-512; ci.yml gives every non-pull-request run its own concurrency group and checks the golden files unchanged. L-127 stays active until the 2.0.1-beta.1 rehearsal proves the gate.

### C-20260929-4 · 2026-09-29 · Second learnings consolidation, L-090 to L-124 (`consolidate-learnings-2`)
- because: consolidation pass (the session-start audit flagged 26 active entries against consolidate_every 25; LEARNINGS.md was 411 lines against a 200-line budget)
- files: LEARNINGS.md (Active: 10 entries; index lines for L-090 to L-124), LEARNINGS-ARCHIVE.md (Promoted: full text of the 29 moved entries), SKILL.md (Windows line: escapes in any written text, `--` in any MSBuild comment), references/plan-skeleton.md (the lint note: MSBuild elements in prose), evergreen.json (last_consolidated)
- 13 entries already marked promoted moved to the archive. 16 still marked active had their rule written into SKILL.md, a reference or a template by a later change and are now marked promoted with that change and place: L-093, L-094, L-101 (C-20260928-3), L-107 (C-20260928-5), L-109 (C-20260928-6), L-110, L-113, L-117, L-118, L-119, L-120 (C-20260928-7), L-123 (C-20260929-1), L-124 (C-20260929-2), and L-122, whose 60-minute wait landed in e4f2be7 without a C- entry (recorded here). Two proven recurrences were finished: L-115 (the fifth slip of the escape and MSBuild-comment traps) now sits in the Windows line, which had carried only the heredoc and cd halves since L-102; L-114 joins L-082 and L-097 in the plan skeleton's lint note. Active: L-013, L-014, L-018, L-034, L-106, L-108, L-111, L-112, L-116, L-121. No merges (no two active entries say the same thing), no renumbering, and no rule's meaning changed.
### C-20260929-3 · 2026-09-29 · A network capture takes its proxy setup from one function (`replayable-proxy-setup`)
- because: L-125; wikiwright L-116 `by-host-name-proxy` and L-117 `guard-normalised-args`; user request (wikiwright 0.5.0 follow-up)
- files: scripts/capture-proxy.cjs (new: `startCaptureProxy()` and `--selftest`), scripts/golden-capture-npm.template.cjs (header note, `fixtures`, `main()` calls the setup before requiring the package, guard-message check), references/npm.md (Phase 0: new bullet "One proxy setup for the recording and the replay", last sentences of "Replaying a capture against the next major"), scripts/README.md, templates/README.md, LEARNINGS.md (L-125), evergreen.json (counts)
- The guard, the stand-in proxy that routes CONNECT by port, the proxy variables and the `fetch` routes for this process and its children now come from one call made before the package loads, so the recording against the old version and the replay against a fetch-based major run the same file. `NO_PROXY` lists the loopback names instead of being empty, because Node 24's own proxy support otherwise rewrote request 2.88's http request line.

### C-20260929-2 · 2026-09-29 · The capture's socket guard reads normalised arguments (`guard-normalised-args`)
- because: L-124 (found by the markdown-plain-link-replacer wiki run)
- files: references/npm.md (Phase 0, "A package that looks up links found in its input"), LEARNINGS.md (L-124), evergreen.json (counts)
- The recommended guard read `args[0].host`, which `net.connect()` hands over inside an array, so plain http connections passed it on Node 20 and 24. The reference now reads the options from the array and says how to test a guard safely.

### C-20260929-1 · 2026-09-29 · Golden captures replay against the next major without hand patches (`replayable-capture`)
- because: L-123 (from wikiwright L-113 and the markdown-plain-link-replacer wiki run); user request (wikiwright 0.4.0 kickoff)
- files: scripts/golden-capture-npm.template.cjs (header note, `manifestPath()`, `binPath()`, `dependency()`, the dependencies line), references/npm.md (new bullet "Replaying a capture against the next major" in Phase 0), scripts/README.md, LEARNINGS.md (L-123), evergreen.json (counts)
- The template now reads the bin's path from package.json, records `none` for a dependency the replayed version lacks, and finds package.json behind an exports map, so the wiki's replay runs the capture unchanged in a project with the new version installed. The reference records what a proxy-routed network capture needed against a fetch-based major (an undici proxy agent after the variables are set, CONNECT to port 80 served in plain HTTP) and how to compare the replay.

### C-20260928-7 · 2026-09-28 · The retrofit path's second run: old versions through the capture, a release path that checks what it pushes, the wiki hand-over (`jpp-retrofit`)
- because: the JsonPrettyPrinter retrofit (3.0.1 to 3.0.2, m4bwav/DotNetJsonPrettyPrinter pull requests #8 and #10; its independent review: 525,778 comparisons per runtime, 0 differences, 9 findings); L-110 to L-121; user request (kickoff: correct references/retrofit.md, make Phase 7 and wikiwright say the same thing)
- files: SKILL.md (the hand-over paragraph after "Wiki (Phase 7, first)"), references/retrofit.md (gap audit steps 2, 5, 7 to 9, "Templates over an existing layout", traps), references/nuget.md (Traps, dated), templates/nuget (.github/workflows/ci.yml and release.yml, verify-published.yml, tests/GoldenTests.cs.template, tests/Golden/ApiList/Program.cs), templates/README.md, LEARNINGS.md (L-110 to L-121; L-094 confirmed)
- release.yml now requires ci on the tagged commit and runs the content check and consumers on the package it pushes; ci.yml keeps master runs and checks the golden files; the capture records old versions for the upgrade story; the lister marks init accessors; the replay notes lone surrogates; retrofit.md says what its second run found missing; SKILL.md and wikiwright's SKILL.md carry the same hand-over paragraph.

### C-20260928-6 · 2026-09-28 · Phase 6 leaves the wiki on; the golden capture feeds the wiki (`golden-capture-wiki`)
- because: L-109 `golden-capture-feeds-the-wiki`; wikiwright 0.2.0's second run (seeded-random-utilities)
- files: references/npm.md (Phase 6 cleanup, `gh repo edit`), SKILL.md ("Wiki (Phase 7, first)"), references/retrofit.md (phases table row 7), LEARNINGS.md (L-109)
- The npm cleanup line switched the wiki off, which Phase 7 then had to undo; it now leaves it on. The wiki step says that enabling the feature does not create the wiki repository, and that the golden capture is the Versions page's evidence.

### C-20260928-5 · 2026-09-28 · A wiki step in Phase 7 (`wiki-step`)
- because: user request (every modernization run adds a wiki to a repository that can have one and does not yet); L-107 `wiki-after-release`, L-108 `run-old-majors-for-docs`
- files: SKILL.md (phases table row 7; "Documents"; new "Wiki (Phase 7, first)"; Output), references/retrofit.md (phases table, gap audit item and step 7), prompts/kickoff-skeleton.md (survey "Wiki" line, the wiki paragraph, deliverables), LEARNINGS.md (L-107, L-108), README.md
- The wiki is the first item of Phase 7, not a step of its own: it must follow Phase 6 because its examples are verified against the published package, and it must precede the handoff because the shipped-doc errors it finds belong in HANDOFF.md and the kickoff corrections. A new wiki is written with the wikiwright skill (m4bwav/wikiwright); an existing one gets wikiwright's update mode for the new version.

### C-20260928-4 · 2026-09-28 · Log maintainer statements as quotes (`log-maintainer-quotes`)
- because: L-105 `log-maintainer-quotes`, L-106 `readme-images-registry-flag` (RandomNameGeneratorLibrary 2.3.0 released and verified, m4bwav/DotNetRandomNameGenerator#14 and #15)
- files: SKILL.md (the shape of a run: rules that hold everywhere), LEARNINGS.md
- The evidence rule now says the maintainer's words go into the log as a quote and anything they did not confirm stays marked unconfirmed until the run proves it.

### C-20260928-3 · 2026-09-28 · The retrofit path and the lessons of its first run (`retrofit-path`)
- because: user request (a retrofit path for packages modernized before the skill); L-098 `record-process-bitness`, L-099 `ruled-exception-file`, L-100 `template-adaptation-traps`, L-101 `ci-command-locally`, L-102 `known-traps-repeated`, L-103 `empty-dependency-group`, L-104 `consumer-source-mapping` (RandomNameGeneratorLibrary 2.3.0, pull request m4bwav/DotNetRandomNameGenerator#13)
- files: references/retrofit.md (new), SKILL.md (the shape of a run: retrofit pointer; Windows line; Phase 2 exit criteria), references/nuget.md (Phase 0 bitness; Traps), templates/nuget/.github/dependabot.yml (seven days everywhere), templates/nuget/.github/workflows/ci.yml (C-locale note; greps tolerate empty dependency groups), templates/nuget/.github/workflows/verify-published.yml (provenance line), templates/nuget/tests/consumers/run.sh (source mapping, whole-line checks), templates/README.md (placeholder grep), LEARNINGS.md (L-098 to L-104)
- A package modernized by hand before the skill existed now has its own path: which phases apply, the gap audit (every version's files, data provenance, the popular version's drift), how a ruled fix becomes one guarded exception to the golden contract, and when a release is warranted. The run's CI failures and review findings became template fixes.

### C-20260928-2 · 2026-09-28 · Lessons from the RandomNameGeneratorLibrary retrofit, Phases 0 and 1 (`rng-retrofit-lessons-1`)
- because: L-090 `pull-without-cd`, L-091 `prose-escapes-decode-too`, L-092 `api-list-protected-members`, L-093 `data-provenance-check`, L-094 `diff-the-popular-version`, L-095 `portable-path-token`, L-096 `helpers-say-none-plainly`, L-097 `lint-reads-lazy`
- files: LEARNINGS.md (L-090 to L-097), prompts/kickoff-skeleton.md (read-first list), references/plan-skeleton.md (lint note), references/nuget.md (Phase 0 bullet, Traps), scripts/nuget-latest.py (usage, unknown ids), scripts/survey-github.sh (rulesets and protection lines), templates/nuget/tests/Golden/ApiList (new), templates/README.md
- The first retrofit of a package modernized before the skill: two of the agent's own slips against promoted rules (a cd before the skill was read, a quoted escape in prose), a lister gap, two helper scripts that printed errors as findings, and two Phase 0 checks (data provenance, the popular version's drift) that the retrofit path will carry.

### C-20260928-1 · 2026-09-28 · First learnings consolidation, L-001 to L-089 (`consolidate-learnings-1`)
- because: consolidation pass (LEARNINGS-FORMAT, budgets and consolidation): LEARNINGS.md was 710 lines against a 200-line budget, 4 active entries lacked a Hypothesis, and it had never been consolidated
- files: LEARNINGS.md (rewritten as 4 active entries plus a one-line index per archived ID), LEARNINGS-ARCHIVE.md (new: full text of every promoted and merged entry), evergreen.json (counts, last_consolidated)
- Merged 13 near-duplicates into their lowest ID, the absorbed trigger, hypothesis and rule appended to the survivor and the absorbed entry retired as merged: L-035 into L-001, L-057 into L-008, L-082 into L-010, L-062 into L-012, L-033 into L-014, L-049 into L-025, L-077 into L-027, L-054 into L-028, L-039 into L-029, L-037 into L-031, L-074 into L-047, L-058 into L-050, L-086 into L-052. L-052, L-053 and L-066 were still marked active although references/npm.md Phase 3 and references/nuget.md "F# packages" carry them; they are now promoted. Every promoted status names its C- change and where the rule lives. Active: L-013, L-014, L-018, L-034. No rule's meaning changed, no ID was renumbered, and every code name is kept (L-058 `tool-unescapes-backslash-u` and L-059 `golden-replay-from-capture`, cited only in the references until now, appear in the index).

### C-20260927-16 · 2026-09-27 · Release-phase traps and the cd rule (`release-traps`)
- because: L-087 `tag-bypass-message`, L-088 `attestation-verify-silent`, L-089 `cd-only-in-a-subshell`; L-057 confirmed twice (CachingServiceWithAOPSupport Phases 5 and 6)
- files: SKILL.md (Windows line), references/nuget.md (Phase 5 rehearsal line, Traps), LEARNINGS.md
- Two messages that looked like failures were not, and a rule without its alternative was broken three times.

### C-20260927-15 · 2026-09-27 · Differential test against a reimplemented dependency (`differential-against-the-original`)
- because: L-086 `differential-against-the-original` (CachingServiceWithAOPSupport Phase 3: 12 review findings, 7 in the reimplemented key writer)
- files: references/nuget.md (Phase 2), LEARNINGS.md (L-086)
- The golden capture covers the old package's inputs, not those of a dependency the rewrite reimplements.

### C-20260927-14 · 2026-09-27 · NuGet workflow, consumer and golden-test templates from proven runs (`nuget-templates-current`)
- because: L-083 `bcl-shape-differs-by-runtime`, L-084 `blame-hang-names-the-test`, L-085 `templates-marked-unverified`; the maintainer's request in the CachingServiceWithAOPSupport kickoff
- files: templates/nuget/.github/workflows/ci.yml, release.yml, verify-published.yml (replaced), templates/nuget/.github/dependabot.yml, templates/nuget/Directory.Build.props (updated), templates/nuget/tests/consumers/run.sh, Program.cs and templates/nuget/tests/GoldenTests.cs.template (new), templates/README.md, references/nuget.md (Traps; what it still lacks), LEARNINGS.md (L-083 to L-085)
- The NuGet templates were the unverified drafts of 2026-09-25; runs copied TrailerClipper's and IsImageUrlDotNet's workflows instead. They are now CachingServiceWithAOPSupport's CI-proven files (run 36363389674 green on Ubuntu and Windows) with placeholders.

### C-20260927-13 · 2026-09-27 · Every version's nupkg, old tests against the published package, the cooldown helper (`survey-every-version`)
- because: L-078 `survey-every-version-nupkg`, L-079 `old-tests-against-published`, L-080 `net10-record-of-failure`, L-081 `nuget-latest-cooldown`, L-082 `lint-reads-csharp-generics` (CachingServiceWithAOPSupport Phases 0 and 1)
- files: scripts/survey-nuget.sh (newest ten versions' files, warning for assemblies outside lib/), scripts/nuget-latest.py (new), scripts/README.md, references/nuget.md (Phase 0 bullets; Traps), references/plan-skeleton.md (lint note), LEARNINGS.md (L-078 to L-082)
- A 2015 package whose first version installed nothing and whose old projects cannot build on the .NET 10 SDK: the survey missed the first, the baseline had nothing to run for the second.

### C-20260927-12 · 2026-09-27 · Settings before the pull request; F# coverage complete (`settings-before-pr`)
- because: L-077 `settings-before-the-pull-request`; IsImageUrlDotNet 2.0.0 released and verified
- files: SKILL.md (phases table, Phase 3 exit), references/nuget.md (coverage line; what it still lacks), LEARNINGS.md (L-077)
- The maintainer merged the pull request as soon as he had read it, before Phase 4's rulesets existed; the settings now go on at the Phase 3 stop.

### C-20260927-11 · 2026-09-27 · F# Phases 2 and 3, package icons, .NET Framework consumers (`fsharp-phase-2-and-icons`)
- because: L-070 `generate-missing-icon` (user request), L-071 `netfx-needs-system-net-http`, L-072 `golden-alone-in-process`, L-073 `windows-paths-for-dotnet-nuget`, L-074 `commit-before-canary`, L-075 `recording-names-the-drive`, L-076 `fsharp-analyzers-verified`; L-003 confirmed again (IsImageUrlDotNet Phases 2 and 3)
- files: SKILL.md (golden capture canary; badges and images: icon), references/nuget.md (coverage line; Phase 0 network capture; F# packages: analyzers verified, tests, Dependabot, APIs that make requests; Phase 1 target frameworks and metadata rows; Traps; what it still lacks), scripts/make-icon.py (new), scripts/README.md, LEARNINGS.md (L-070 to L-076, L-003)
- The first F# package through the rewrite and the review: the review found that .NET Framework consumers could not compile against the netstandard2.0 build, the golden test needed a process of its own, and the canary instruction could destroy an uncommitted rewrite; the maintainer asked that every package that can show an icon gets one.

### C-20260927-10 · 2026-09-27 · F# on NuGet, one golden recording per runtime, cloud sessions (`fsharp-and-cloud-runs`)
- because: L-063 `pin-fsharp-core`, L-064 `dotnet-format-skips-fsharp`, L-065 `golden-per-runtime`, L-066 `shared-cases-file`, L-067 `fixture-server-as-proxy`, L-068 `fsharp-ignores-fsharp-extensions`, L-069 `cloud-session-access-check` (IsImageUrlDotNet Phases 0 and 1)
- files: references/nuget.md (coverage line; Phase 0: recordings per runtime, capturing on Linux, the .NET fixture proxy; new section "F# packages"; Phase 1 defaults row F#; Traps; what it still lacks), SKILL.md (cloud-session line in the shape of a run; NuGet golden-capture and lint cells), scripts/survey-github.sh (stops with exit 2 without a logged-in gh), scripts/survey-nuget.sh (says when the search host is unreachable), scripts/golden-capture-nuget.template.cs (header points at the F# route), LEARNINGS.md (L-063 to L-069)
- The first F# package: the reference had no F# at all, its format gate is a no-op on F#, the NuGet capture cell still said "unverified", and a Linux cloud session showed the survey scripts reporting "(none)" for checks that never ran.

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
