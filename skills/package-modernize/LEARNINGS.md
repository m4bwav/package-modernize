# Learnings: package-modernize

Procedural lessons for [SKILL.md](SKILL.md). Research findings live in [RESEARCH.md](RESEARCH.md); every change is logged in [CHANGELOG.md](CHANGELOG.md); test runs in [TESTS.md](TESTS.md); state in `evergreen.json`. Format and write-time gate: [MAINTENANCE.md](MAINTENANCE.md) (LEARNINGS-FORMAT). Promoted and retired entries live in full in [LEARNINGS-ARCHIVE.md](LEARNINGS-ARCHIVE.md), each with its reason.

Write an entry the moment a real signal happens: a user correction, the same error twice, a discovered workaround, an environment fact, a stated preference, a failed test or a failure in use. Check existing entries first, by meaning (`evergreen.py search "<the lesson>" --kinds learnings` finds near-duplicates in every registered unit): add / update / retire / none. Trigger and Hypothesis are required. Promote after three confirmations; retire when harmful > helpful.

The first twelve entries were seeded on 2026-09-25 from the three runs that preceded the skill (get-title-at-url, seeded-random-utilities, the two NuGet libraries); their evidence is those repositories' `ai-docs/` and the playbook the skill was built from. They are promoted into SKILL.md or a reference already, so their status says so. The consolidation pass C-20260928-1 (2026-09-28) merged 13 near-duplicates into their lowest ID, moved every promoted and merged entry to the archive, and left one index line per ID below, so every ID cited elsewhere still resolves.

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
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-094 · 2026-09-28 · Compare the most-downloaded old version with the contract, not only the latest (`diff-the-popular-version`)
- Trigger: RandomNameGeneratorLibrary's contract is 2.2.0, but 1.2.2 has 3.79 million of its 3.89 million downloads; a scratch program on 1.2.2 showed seeded person names unchanged and every seeded place name different since 2.1.0, which the changelog never said (2026-09-28).
- Hypothesis: the retrofit's contract protects the next upgrade; the callers who matter most upgrade from the popular version, whose drift nobody recorded.
- Rule: in a retrofit, run the capture's seeded or deterministic cases (as far as the old API allows) against the version with the most downloads and state every difference in the changelog of the next release.
- Evidence: DotNetRandomNameGenerator ai-docs/log.md (Phase 0)
- Scope: skill (the retrofit path)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

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
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

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

### L-106 · 2026-09-28 · check-readme-images.mjs defaults to npm (`readme-images-registry-flag`)
- Trigger: the 2.3.0 README check ran first without `--registry nuget` and printed "checked for npm"; references/nuget.md has the flag, the agent typed the command from memory (2026-09-28). The rerun with the flag also passed.
- Hypothesis: the script is shared by both registries and the default hides which allow-list was applied.
- Rule: copy the command from the registry's reference; for NuGet it is `node scripts/check-readme-images.mjs README.md --registry nuget`, and the output line must say "checked for nuget".
- Evidence: this run's DotNetRandomNameGenerator log, 2.3.0 entry
- Scope: skill (references/nuget.md verification table already correct)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

### L-107 · 2026-09-28 · The wiki comes after the release is verified, and it audits the shipped docs (`wiki-after-release`)
- Trigger: Mark asked for GitHub wikis on the packages. Written by hand for RandomNameGeneratorLibrary 2.3.0 and JsonPrettyPrinter 3.0.1, then with the new wikiwright skill for get-title-at-url 3.0.0 (all 2026-09-28). Each found errors in the README or CHANGELOG that the modernization runs had shipped: a thread-safety sentence true on one runtime, a comment claim the printer breaks, a changelog escape System.Text.Json never writes, a NOT_HTML row that misses the no-Content-Type case, an exit-code line. Mark then asked that every run add a wiki when the repository has none.
- Hypothesis: the wiki verifies every example against the published package, so it runs after Phase 6; writing the long form forces reading every claim against a run, which the release checks do not do for prose.
- Rule: Phase 7 starts with the wiki (wikiwright new or update mode); its inaccuracies go to the kickoff prompt's corrections and HANDOFF.md for the next release.
- Evidence: SKILL.md (phases table row 7; "Wiki (Phase 7, first)"), references/retrofit.md, prompts/kickoff-skeleton.md, C-20260928-5; get-title-at-url ai-docs/notes/2026-09-28-github-wiki.md; the two DotNet repositories' wiki notes
- Scope: skill
- Status: active · helpful 3 · harmful 0 · last_confirmed 2026-09-28

### L-108 · 2026-09-28 · Old majors without a golden capture can be run for the upgrade story (`run-old-majors-for-docs`)
- Trigger: get-title-at-url was modernized before golden captures existed; its wiki run installed 2.0.0 and 1.1.8 in scratch folders and found that 2.0.0 cannot be imported since cheerio 1.0.0 (August 2024), a fact in the plan but in no shipped doc, and that no old version is deprecated on npm although 2.0.0 still gets about 60 downloads a week (2026-09-28).
- Hypothesis: a broken old major is a deprecation candidate the survey can miss when it reads the changelog instead of installing the version.
- Rule: the Phase 0 survey (and a retrofit's gap audit) installs the latest version of each old major and imports it once; one that fails is a deprecation recommendation with its message.
- Evidence: get-title-at-url ai-docs/notes/2026-09-28-github-wiki.md (facts, recommendation); wikiwright L-011 `run-the-old-majors`
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-28

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
