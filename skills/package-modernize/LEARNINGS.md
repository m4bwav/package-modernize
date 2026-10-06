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
- Rule: npm's release.yml waits for the `ci` check run on the tagged commit (bounded, fails on a missing, red or timed-out check, L-121) before it builds; the alternative is `npm version --no-git-tag-version`, push, wait for green, then tag. Confirmed by the 2.0.1-beta.2 and 2.0.1 release runs (the beta.1 run failed later, for L-132); ready to promote at the next consolidation.
- Evidence: m4bwav/seeded-random-utilities ai-docs/plans/2026-09-29-retrofit-and-2.0.1-release.md (R3); release runs 36615374214 (2.0.1-beta.2) and 36619659747 (2.0.1), each waiting for ci's push run on its tagged commit and then green (2026-09-29)
- Scope: skill (templates/npm/.github/workflows/release.yml, references/npm.md Phases 5 and 6)
- Status: active · extends L-120 · helpful 2 · harmful 0 · last_confirmed 2026-09-29

### L-125 · 2026-09-29 · A capture's proxy setup is one function that the recording and the replay both call (`replayable-proxy-setup`)
- Trigger: markdown-plain-link-replacer's 2026-09-29 replay of the 1.1.16 capture against 2.0.0 needed four patched copies; two of them were proxy setup spread through the capture: undici's agent installed after the capture set the variables (it set them only once its server listened, too late for `NODE_USE_ENV_PROXY`, which Node reads at startup), and a fixture `connect` handler that sent port 80 to the plain server. wikiwright met the same pattern twice the same day: L-116 `by-host-name-proxy` (a proxy that routes by port, variables set before each child starts) and L-117 `guard-normalised-args` (the guard that let plain http out). Writing the setup as one function and running it with request 2.88 and a real TLS fixture found one more thing: with `NO_PROXY` empty and `NODE_USE_ENV_PROXY=1` (children on Node 24) or `http.setGlobalProxyFromEnv` (this process), Node 24.18.0 also proxied request 2.88's own connection to the proxy, and its http request line arrived as `http://host:<proxy port>/path` instead of `http://host/path`.
- Hypothesis: a capture is written for the old version's transport (request 2.88 reads the proxy variables per call), so its setup happens whenever the capture gets round to it; a fetch-based major needs the same setup done before anything starts and routed by port. Setup that lives in one function, called first, is the same for both, and a probe at start says which route each process got instead of letting an unrouted `fetch` record errors as behaviour.
- Rule: a capture that records through its own proxy calls `startCaptureProxy()` from scripts/capture-proxy.cjs first, before it requires the package and before any child starts: guard (L-124 form, tested on `.invalid` hosts), a proxy routing CONNECT by port (443 to TLS, any other to plain), the variables in `process.env` with `NO_PROXY` set to the loopback names only, and `fetch` routed here and in children (undici's `EnvHttpProxyAgent`, `http.setGlobalProxyFromEnv`, or `NODE_USE_ENV_PROXY=1`, picked by probe). Print `report()` to stderr, and treat the guard's message in the golden output as a failure.
- Evidence: wikiwright L-116 and L-117 and its templates/npm/host-fixture.mjs; markdown-plain-link-replacer's 2026-09-29 replay (wikiwright references/npm.md, "Golden captures that record through a proxy with TLS"); `node capture-proxy.cjs --selftest` 23 of 23 on Node 24.18.0 (undici 7 and none) and 20.20.2 with undici, 21 of 21 plus two skips on 20.20.2 without undici; the same self-test with `NO_PROXY` empty failed its two absolute-form checks on Node 24.18.0 (`plain GET http://selftest.invalid:49188/abs-self`); request 2.88.2 and `fetch` through the function with a real TLS fixture (2026-09-29)
- Scope: skill (scripts/capture-proxy.cjs, scripts/golden-capture-npm.template.cjs, references/npm.md)
- Status: active · extends L-123 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-132 · 2026-09-29 · publint reads dist/ from disk, so a job that checks before it builds fails, and a local preflight cannot see it (`build-before-publint`)
- Trigger: seeded-random-utilities' 2.0.1-beta.1 release run (36614300884) failed in `npm run check`: publint reported that `dist/index.mjs`, `index.cjs` and `index.d.cts` do not exist. C-20260929-5 had moved check ahead of `npm test` (so the tested dist/ is the one packed), and `npm test` was the job's only build. `preflight-tag-npm.sh` had printed READY, because the clone's dist/ was already on disk. Nothing was staged; the tag v2.0.1-beta.1 stays with no npm version, and the rehearsal went out as 2.0.1-beta.2 after the fix (pull request #19). The template had the same order (2026-09-29).
- Hypothesis: every step of a release job is checked locally in the working tree, never in the job's own order from a fresh checkout, so a reorder that only breaks on a clean tree passes every local check. ci.yml builds before check, which is why the pull request was green.
- Rule: the npm release.yml's build job runs `npm run build` before `npm run check` (template fixed). After any change to a release job's steps, rehearse them before the tag: `git clone` the branch into scratch, `npm ci --ignore-scripts`, then the job's `run:` lines in order. One failing command there costs a minute; a failing release run costs a prerelease number.
- Evidence: m4bwav/seeded-random-utilities release runs 36614300884 (failure) and 36615374214 (success), pull request #19 (3f0a841); in a clean clone `npm run check` failed without the build and passed with it, and `npm test` passed 2255 of 2255 (2026-09-29)
- Scope: skill (templates/npm/.github/workflows/release.yml, references/npm.md Phases 5 and 6)
- Status: active · extends L-120 · helpful 0 · harmful 0 · last_confirmed 2026-09-29

### L-133 · 2026-09-29 · `gh run watch --exit-status` can exit non-zero before the run ends (`watch-exits-early`)
- Trigger: `verify-registry-npm.sh seeded-random-utilities 2.0.1-beta.2 m4bwav/seeded-random-utilities` dispatched verify-published and printed `conclusion:` empty, every job with no result, and NOT VERIFIED; the same run (36618478939) finished green in all 15 jobs a few minutes later (2026-09-29).
- Hypothesis: watch-run.sh took `gh run watch`'s exit status as the verdict; watching a run dispatched seconds earlier, gh returned non-zero while jobs were still queued. Its output was thrown away, so the cause is not recorded.
- Rule: a run's verdict is its `conclusion` once `status` is `completed`, never the watcher's exit code. watch-run.sh now watches again (up to six times) until the run is completed, stops on a gh error, and exits 0 only for `success`. Tested on a green run (exit 0), a failed run (exit 1) and a run id that does not exist (exit 1).
- Evidence: verify-published run 36618478939 of m4bwav/seeded-random-utilities; the fixed script against runs 36621026089 and 36614300884 and run id 1 (2026-09-29)
- Scope: skill (scripts/watch-run.sh, and through it verify-registry-npm.sh)
- Status: active · extends L-121 · helpful 0 · harmful 0 · last_confirmed 2026-09-29

### L-134 · 2026-09-29 · An `npm login` from days earlier is gone, and the agent's shell cannot log in (`npm-login-expires`)
- Trigger: the overlay said the maintainer stays logged in since 2026-09-26 and the agent may run `npm deprecate` and `npm dist-tag`. On 2026-09-29 `npm whoami` answered 401. `npm login --auth-type=web`, started in the background from the agent's shell, printed a login URL, then fell back to a `Username:` prompt and exited 1, so the URL it had printed was dead. After the maintainer logged in in his own terminal, the agent's `npm deprecate` still failed with EOTP and the auth URL masked as `https://www.npmjs.com/auth/cli/***`, as L-037 already said (2026-09-29).
- Hypothesis: npm's CLI logins are short-lived session tokens, not the long-lived tokens of before, so a login does not last from one run to the next (not confirmed against npm's documentation in this run). The overlay's line predated L-037 or ignored it.
- Rule: plan the 2FA-gated npm commands as the maintainer's, in his terminal, from the start: give him `npm login` (when `npm whoami` fails), then the exact `npm deprecate` and `npm dist-tag` commands together, and read the results back. Never start `npm login` from the agent's shell. The overlay line was corrected the same day.
- Evidence: m4bwav/seeded-random-utilities ai-docs/log.md (2026-09-29); npm 11.16.0 on Windows 11
- Scope: skill (references/npm.md, the line on EOTP) and the maintainer's overlay
- Status: active · extends L-037 · helpful 0 · harmful 0 · last_confirmed 2026-09-29

### L-135 · 2026-09-29 · A private repository's CI runs on the maintainer's own runner (`private-repo-ci-on-own-runner`)
- Trigger: on 2026-09-29 GitHub stopped starting hosted jobs in a private website repository (GitHub's billing message: "recent account payments have failed or your spending limit needs to be increased"). About 650 minutes had been used that month, and about 1 GB of artifacts was held against a 500 MB allowance. The maintainer ruled that private repositories build on their own machine rather than on paid minutes. A self-hosted runner on that machine ran CI and the preview green the same hour, while hosted jobs stayed blocked.
- Hypothesis: GitHub bills a private repository's hosted minutes and its artifact and package storage, and blocks at the allowance with no budget; self-hosted minutes are free (checked 2026-09-29; a postponed fee may return). Setting up the runner on Windows had three traps: WSL's bash.exe ahead of Git Bash on the normal PATH; azure/login writing into the user's own az profile; and setup-dotnet installing into Program Files.
- Rule: in Phase 0, record the repository's visibility. For a private one, run `scripts/add-self-hosted-runner.ps1` and follow references/private-repo-ci.md: `RUNS_ON` with a self-hosted default, setup actions only on hosted runners, `--ignore-scripts`, short-lived artifacts, containers built by the SDK. Keep an npm publish job on a hosted runner, or make the repository public before the release.
- Evidence: that repository's CI and Preview runs green on the new self-hosted runner (2026-09-29), recorded in its decision notes; GitHub's billing docs and the npm trusted-publishing docs, read 2026-09-29
- Scope: skill (SKILL.md rule, references/private-repo-ci.md, scripts/add-self-hosted-runner.ps1) and the maintainer's overlay (standing decision)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-136 · 2026-09-29 · A piped watcher hid its own failure, and swapped arguments cost a minute (`pipe-hid-the-watcher`)
- Trigger: FizzBuzzPlus Phase 0 ran `bash watch-run.sh 36645300631 m4bwav/FizzBuzzPlus 2>&1 | tail -15`, with the run id first. It printed "failed to determine base repo" twelve times, then "no run of m4bwav/FizzBuzzPlus started since", and the background task reported exit 0, which was tail's (2026-09-29).
- Hypothesis: L-129 `pipe-hides-status` again, this time in a background call. The script took any first argument as OWNER/REPO and treated a gh error as "no run yet".
- Rule: never pipe a script whose exit status is the verdict; read the status. watch-run.sh now exits 2 at once unless the first argument has a slash and the second ends in .yml or .yaml.
- Evidence: m4bwav/FizzBuzzPlus ai-docs/log.md (2026-09-29). The fixed script exits 2 with a usage line for swapped arguments and for a missing workflow file, and exits 0 on run 36645600812.
- Scope: skill (scripts/watch-run.sh), env:any
- Status: active · extends L-129 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-137 · 2026-09-29 · Where an arithmetic exception comes from depends on the CPU (`exception-source-depends-on-cpu`)
- Trigger: FizzBuzzPlus's golden capture records where each exception was thrown (the namespace or assembly of `TargetSite`). On Windows and ubuntu-latest (x64), DivideByZeroException and OverflowException from `long %` came from the library. On macos-latest they came from System.Private.CoreLib, in the same four cases. The header recorded the bitness but not the architecture, so the difference looked like an OS difference (2026-09-29).
- Hypothesis: macos-latest runs on arm64, where the runtime checks 64-bit division in a CoreLib helper instead of relying on a hardware trap.
- Rule: the capture header records `RuntimeInformation.ProcessArchitecture`. When exceptions' sources are recorded, the recordings are per runtime, OS and CPU, and a replay on another architecture compares that field only through a named rule.
- Evidence: m4bwav/FizzBuzzPlus golden-capture runs 36645300631 and 36645600812; tests/Golden/1.0.0.net10.0-macos.json (architecture arm64) against 1.0.0.net10.0-linux.json (x64), commit 2835ec0
- Scope: skill (references/nuget.md Phase 0, the capture templates)
- Status: active · extends L-098 · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-138 · 2026-09-29 · On .NET, ICU writes a negative number differently in five cultures (`icu-minus-sign`)
- Trigger: the same 2014 FizzBuzzPlus source, compiled for net48 and for net10.0, wrote different lines for negative numbers under five cultures. `"Current Number: " + n` formats with the current culture. .NET 10 writes U+2212 (sv-SE, nb-NO), U+200E then "-" (he-IL), U+200E U+2212 (fa-IR), or U+061C then "-" (ar-SA); .NET Framework wrote "-" in all five. Linux gave the same answers as Windows (2026-09-29).
- Hypothesis: .NET 5 moved number formatting to ICU (CLDR) data on every OS. A Framework-era package that formats with the current culture changes its output in the port without any code change, and a capture under invariant and en-US alone never sees it.
- Rule: golden captures of .NET code include negative numbers under sv-SE, nb-NO, he-IL, fa-IR and ar-SA, beside invariant and en-US, on both runtimes. The plan then chooses, per method, invariant formatting (the Framework's answer) or the current culture.
- Evidence: m4bwav/FizzBuzzPlus tests/Golden/1.0.0.net48-windows.json against 1.0.0.net10.0-windows.json and -linux.json, group culture; ai-docs/notes/2026-09-29-phase-0-findings.md
- Scope: skill (references/nuget.md Phase 0)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-139 · 2026-09-29 · A repository that was never published: the frozen source is the reference (`frozen-source-reference`)
- Trigger: FizzBuzzPlus, the first repository run (never published; a 2014 .NET Framework kata), needed a golden reference where the skill says "install the published old version" (2026-09-29).
- Hypothesis: for such a repository the last old commit's source is the only contract, and a capture that compiles files the rewrite will change would end up recording the new code.
- Rule: copy the files the capture needs byte for byte (`git show COMMIT:PATH > tests/Golden/Original/FILE`), let the capture script check `git hash-object` against `git rev-parse COMMIT:PATH` before every run, and mark the folder `-text`. Compile the files unchanged in the capture; rebuild an app from its frozen source in a project of its own and run it as a process. The maintainer's machine gives the Windows recordings; Linux and macOS come from a throwaway workflow on a scratch branch (capture twice, `cmp`, upload, check the artifact's hash against the log). The whole variant is drafted during the run and becomes references/repository.md when the run has proved it.
- Evidence: m4bwav/FizzBuzzPlus branch v2 (tests/Golden with capture.sh; commits 7c455b9 to 2835ec0), ai-docs/notes/2026-09-29-repository-variant.md
- Scope: skill (the repository variant)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-140 · 2026-09-29 · With Dependabot alerts off, gh's scope hint makes the survey look broken (`alerts-off-scope-hint`)
- Trigger: survey-github.sh on FizzBuzzPlus printed "Dependabot alerts are disabled for this repository (HTTP 403)" in the alert sections, with gh's hint "This API operation needs the admin:repo_hook scope". That reads as if the webhooks section had failed, but the hooks call returned `[]` with exit 0 (2026-09-29).
- Hypothesis: gh adds a scope hint to any 403, whether or not a scope would help.
- Rule: the survey first probes `repos/OWNER/REPO/vulnerability-alerts` (success when on, 404 when off) and prints OFF plainly; the hint under the alert sections is to be ignored.
- Evidence: m4bwav/FizzBuzzPlus ai-docs/notes/2026-09-29-survey.txt; the fixed script prints OFF for FizzBuzzPlus, and the probe answers on for TrailerClipperLib, IsImageUrlDotNet and DotNetJsonPrettyPrinter
- Scope: skill (scripts/survey-github.sh)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-141 · 2026-09-29 · A workflow written outside the templates got its action pins from memory (`pins-from-the-templates`)
- Trigger: FizzBuzzPlus's throwaway golden-capture workflow was first written with checkout v6.0.2, setup-dotnet v4.3.1 and upload-artifact v4.6.2 and their SHAs typed from memory. setup-dotnet v4 is a node20 action, which stopped running on 2026-09-23. The pins were replaced from the templates before the first commit (2026-09-29).
- Hypothesis: the templates cover the release workflows, so a one-off workflow gets no template, and recall fills the gap.
- Rule: every workflow a run writes, one-off or not, copies its `uses:` lines from `templates/*/.github/workflows/` (`grep -h "uses:" templates/nuget/.github/workflows/*.yml | sort -u`); an action the templates lack is looked up and pinned to the SHA of its latest release.
- Evidence: m4bwav/FizzBuzzPlus ai-docs/log.md (2026-09-29, Phase 0); the golden-capture workflow on the scratch branch golden-capture
- Scope: skill
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-142 · 2026-09-29 · .NET's console stream swallows a closed pipe on Windows and Unix (`console-stream-swallows-epipe`)
- Trigger: FizzBuzzPlus 2.0.0's program wrote through `Console.OpenStandardOutput()` and treated IOException as "the reader left". The Phase 3 review found that on Linux `fizzbuzzplus 1 9223372036854775807 | head -1` never ends: the Unix console stream ignores EPIPE. The review said Windows was fine, but the same command on Windows also ran until `timeout 20`, because the Windows console stream ignores ERROR_NO_DATA and ERROR_BROKEN_PIPE too. The catch-all also turned a full disk (`> /dev/full`) into exit 0 (2026-09-29).
- Hypothesis: .NET's ConsoleStream drops broken-pipe errors on both systems so that ordinary programs do not crash in pipelines, and the cost is that a program writing a long output never learns the reader has gone. 57 passing tests had missed it, because every app test called `Run` with StringWriters.
- Rule: a command-line program that can write a lot writes to a FileStream on the standard output handle: descriptor 1 on Unix, `GetStdHandle(-11)` through a LibraryImport on Windows (AllowUnsafeBlocks). A broken pipe (EPIPE 32 on Unix; 109 or 232 on Windows) ends quietly with 0, and any other write failure goes to stderr with exit 1. Buffer stderr, so a failing stderr cannot change the exit code. Test the real process: UTF-8 bytes, the exit codes, and a reader that closes the pipe after one line. Check a reviewer's "works on X" claim before relying on it.
- Evidence: m4bwav/FizzBuzzPlus pull request #1 (b901e34; the review comment lists the findings); WSL Ubuntu with the self-contained linux-x64 build: pipe 106 ms exit 0, /dev/full exit 1; Windows: 563 ms (dll) and 1079 ms (trimmed exe), exit 0; ci run 36651132613 green on three OSes with the closed-pipe test
- Scope: skill (references/nuget.md Phase 2, console apps and tools)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-143 · 2026-09-29 · The NuGet capture template's view hides runtime differences a full recording shows (`capture-template-view`)
- Trigger: wikiwright's seventh run replayed IsImageUrlDotNet's 1.0.2 recordings (2026-09-29). They keep each case's request heads, statuses, inner exceptions and culture, per runtime and OS. In the view `golden-capture-nuget.template.cs` records (method, arguments, result, `$throws`), 1.0.2 on net48 differs from net10.0 in 10 of 117 cases; the full recordings differ in 50. The template also keeps no requests (106 heads in 48 cases on net10.0).
- Hypothesis: the template was shaped by offline packages; a package that makes requests or answers per runtime needs the richer record, and only a comment in the template points to one.
- Rule: for a package that makes requests, or whose answers depend on the runtime, start from IsImageUrlDotNet's `tests/Golden/Capture` (per-runtime files, request heads, statuses, inner exceptions, per-case culture, a fixture server) rather than the template's view, and say so in the Phase 1 plan. Builds on L-065 `golden-per-runtime`.
- Evidence: IsImageUrlDotNet `ai-docs/notes/2026-09-29-github-wiki.md` and `2026-09-29-golden-replay.py` (its PR #10); wikiwright's run report
- Scope: skill (scripts/golden-capture-nuget.template.cs, references/nuget.md)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-144 · 2026-09-29 · A Release made with the GITHUB_TOKEN starts no `on: release` workflow (`token-release-fires-nothing`)
- Trigger: FizzBuzzPlus's release.yml creates the GitHub Release with `gh release create` and the job's GITHUB_TOKEN, and its verify-release.yml (written for the repository variant, outside the templates) listened for `release: published`. Read before the first tag: it would never have run (2026-09-29).
- Hypothesis: GitHub starts no workflow from events caused by the GITHUB_TOKEN, apart from `workflow_dispatch` and `repository_dispatch`, so that workflows cannot trigger each other in loops. The npm and NuGet templates dispatch their verify workflow by hand (verify-registry-npm.sh through watch-run.sh), so they never met it.
- Rule: a verify workflow that must follow a Release made by a workflow is started by that workflow: the gated job gets `actions: write` and ends with `gh workflow run verify-release.yml --ref master -f tag="$TAG"`. Keep `release: published` only for Releases made by hand. Never rely on an event another workflow causes through the GITHUB_TOKEN.
- Evidence: m4bwav/FizzBuzzPlus pull request #2 (0408825; the release.yml comment and step); GitHub docs "Triggering a workflow from a workflow"
- Scope: skill (the repository variant's release, references/repository.md when it lands)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-145 · 2026-09-29 · Workflow lint cost six calls and once checked nothing (`one-call-workflow-lint`)
- Trigger: FizzBuzzPlus Phase 5: after a workflow edit, actionlint and shellcheck were not on PATH, so the session searched old scratchpads for copies, then ran actionlint, check-workflow-shell.py and zizmor separately. check-workflow-shell.py was given workflow file paths, took the first as the repository directory, found no workflows and exited 0: a clean result that checked nothing (2026-09-29).
- Hypothesis: tools downloaded into a session scratchpad are lost to the next session, and a check that accepts any argument and reports only failures cannot tell "clean" from "saw nothing".
- Rule: run `scripts/lint-workflows.sh REPO` after every workflow edit. It keeps actionlint and shellcheck in `~/.cache/package-modernize/tools` (downloaded once from pinned releases, sha256 checked), runs all three checks, and prints how many run blocks it checked. check-workflow-shell.py now refuses a path without `.github/workflows` (exit 2).
- Evidence: FizzBuzzPlus `ai-docs/log.md` (Phase 5); the script's clean run on FizzBuzzPlus (10 run blocks) and its red run on a planted `[ "$X" = "y" ; then`, where actionlint and check-workflow-shell.py both failed
- Scope: skill (scripts/lint-workflows.sh, scripts/check-workflow-shell.py, SKILL.md Phase 2, references/npm.md and nuget.md)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-146 · 2026-09-29 · A .NET version bump rewrites the lock files of referencing projects (`version-bump-rewrites-lock-files`)
- Trigger: FizzBuzzPlus 2.0.0 to 2.0.0-beta.1 in Directory.Build.props: the two test projects' packages.lock.json record the library reference as `[2.0.0, )`, so CI's `dotnet restore --locked-mode` would fail with NU1004. `dotnet restore --force-evaluate` fixed them and also rewrote three other lock files with CRLF only. Finding and sorting that took four calls (2026-09-29).
- Hypothesis: NuGet lock files include project references with the referenced project's version, so every version change is a lock file change in each project that references a versioned one.
- Rule: set the version with `scripts/bump-version-dotnet.sh VERSION REPO`: it edits `<Version>`, regenerates and filters the lock files, proves a locked restore and checks the CHANGELOG heading, in one call.
- Evidence: FizzBuzzPlus pull request #2 (two lock files changed); the script on a scratch clone at 7c567fd reproduced the same two files, and refused an undated heading for 2.0.0 (exit 1)
- Scope: skill (scripts/bump-version-dotnet.sh, references/nuget.md Phases 5 and 6)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-29

### L-147 · 2026-09-30 · A pointer in the body's phase table is skipped when the run jumps to the system reference's phase section (`repeat-pointer-where-the-run-lands`)
- Trigger: after the body split (C-20260930-1), eval pointer-phase-5 passed 2 of 3 runs. The failing run read `references/npm.md` from its Phase 5 section (offset 55) and never opened `references/security.md`, which the Phase 5 "Read first" cell names. A first version of the case failed 0 of 3 for another reason: the pad-lite fixture is at Phase 2, so every run refused to start Phase 5 on a checkout that contradicted the prompt (correct behaviour, class `test-defect`).
- Hypothesis: a run that knows its system goes straight to that file's section for the phase, so it sees only the pointers inside that section. A pointer only in the body's table is read once, at invocation, long before the phase begins.
- Rule: when a reference must be read at a phase, put the pointer in the body's Read first cell and again as the first line of the matching phase section in each system reference. After the line was added to npm.md and nuget.md, the case passed 3 of 3.
- Evidence: T-20260930-1 (runs in pm-pointer2 and pm-pointer3)
- Scope: skill (references/npm.md and references/nuget.md, Phase 5 and 6)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-09-30

### L-148 · 2026-10-02 · A package extracted from an app: survey how the app stores the output before ruling on compatibility (`extract-check-what-the-app-saves`)
- Trigger: the first brand-new package id (UniverseGenerator, extracted from the maintainer's private Unity game). The plan assumed the game's saves regenerate galaxies from seeds, so a new PRNG would change the galaxy behind every save and need a save-format bump. Reading the consumers showed the opposite: the game draws a random seed, copies names, positions and star types into the save, never regenerates, and stores no seed at all.
- Rule: for a package lifted out of an application, Phase 0's survey covers the application's consumers and its save or storage format, not only the code being extracted. Decide the compatibility promise from what the application persists (copies or seeds), and record whether the application must start storing something (here the seed) for a later "same as the package" claim to be checkable. The golden capture then records the application's own output in its own host (Unity batchmode here); when the plan changes every output on purpose, the recording is a record of the old behaviour, not a contract.
- Evidence: the run's Stage 0 note in the maintainer's private record; the game repository's capture branch
- Scope: skill (references/survey-and-golden.md when a third extraction confirms it)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-02

### L-149 · 2026-10-02 · Unity's Mono computes float expressions in double precision, and its "R" format is not round-trip (`mono-floats-in-double`)
- Trigger: the same generator code recorded in Unity 6000.6.0f1 (Mono 6.13) and in a .NET harness differed in the last bit in 1,188 values. A stub `Mathf.Lerp` written as `a + (b - a) * t` in single precision did not match; `(float)((double)a + ((double)b - a) * t)` matched all 200 systems. Separately, Mono's `float.ToString("R")` printed 7 significant digits where 9 were needed.
- Rule: a .NET harness that replays Unity code must model Mono's double-precision float evaluation; write floats with `G9` (or round to fixed decimals) on every runtime; compare as float32 values. A library meant to give the same output in the Editor (Mono) and players (IL2CPP) must not let a float expression decide anything or reach output unrounded: integer draws for decisions, maths from + - * / and sqrt only, rounded storage.
- Evidence: the capture harness's Unity stub and comparer on the game repository's capture branch; the Stage 0 note
- Scope: skill (references/nuget.md, a Unity section when OpenUPM is added)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-02

### L-150 · 2026-10-02 · Unity repositories ignore every csproj, and batchmode rewrites project settings (`unity-repo-commit-traps`)
- Trigger: committing a capture harness to the game repository: `git add` skipped `Harness.csproj` (Unity's `.gitignore` ignores `*.csproj`), and the batchmode import had modified `.vscode/settings.json`, `ProjectSettings/*.asset` and a render pipeline asset in the worktree. An IDE also recreated `obj/` folders between commands.
- Rule: in a Unity repository, `git add -f` a non-Unity project file on purpose, revert what the batchmode run changed (`git checkout -- ProjectSettings/ ...`) before committing, and check `git status --short` for `obj/` and `bin/` right before the commit. `unity run <worktree> -- -executeMethod Class.Method` imported a fresh worktree and ran the capture in about 3 minutes, beside an Editor open on the main clone.
- Evidence: the game repository's capture branch
- Scope: skill (the Unity section of references/nuget.md when OpenUPM is added)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-02

### L-151 · 2026-10-02 · Research for a new package becomes a Markdown knowledge base with a generated feature matrix (`research-as-a-knowledge-base`)
- Trigger: the maintainer, mid-run: "The AI should store a knowledge base in md files and/or the repo wiki". Three research subagents had been given one shared vocabulary of feature keys, so their reports could be merged by a script into one matrix (176 sources, 128 features, every feature with a status).
- Rule: for a package whose plan says "out-do every existing X", give every research subagent the same feature-key file and ask for a table with a "feature keys" column; keep the reports, rules and a `status.json` in a knowledge-base folder (`kb/` in the new repository) and generate the matrix from them, never by hand; publish the matrix and rules to the wiki. Record it as a plan decision.
- Evidence: the knowledge base in the maintainer's private record, to move into the new repository's kb/
- Scope: skill (references/plan-skeleton.md for brand-new packages)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-02

### L-152 · 2026-10-05 · awesome-copilot's intake never reads `.claude-plugin/`: add a root `plugin.json` (`awesome-copilot-ignores-claude-plugin-dir`)
- Trigger: listing ten Claude plugins in github/awesome-copilot. Copilot CLI itself falls back to `.claude-plugin/plugin.json`, but the intake gates (`eng/external-plugin-quality-gates.mjs`) look only at `.github/plugin/plugin.json`, `.plugin/plugin.json` and `plugin.json`; issue #4188 (mirrord) failed the version gate for exactly this.
- Rule: give a Claude plugin a root `plugin.json` in the Agent Plugins 1.0 shape (`$schema` https://agent-plugins.org/schemas/1.0.0/plugin.schema.json, name, version, description, author with url, homepage, repository, license, at most 10 keywords matching `^[a-z0-9-]+$`), keep its version equal to `.claude-plugin/plugin.json`, then release a tag at the merge commit. Skills under `skills/NAME/SKILL.md` are found without a field. Before submitting, run `copilot plugin install <path>` (Copilot CLI, `npm install -g @github/copilot`) and `npx @microsoft/vally-cli@0.17.0 lint <path>`.
- Evidence: everwrite PR #2, chartwright #2, threewright #2, unity-agent #2, obsidian-notes #5, wikiwright #5 (all 2026-10-05); awesome-copilot #4529 passed every gate on the first try
- Scope: release (plugins listed outside the Claude directory)
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-05

### L-153 · 2026-10-05 · awesome-copilot pins a release tag and its full SHA, and lints every SKILL.md (`awesome-copilot-wants-tag-and-sha`)
- Trigger: the external-plugin form's version must equal plugin.json's version at both the ref and the SHA, the ref must resolve to the SHA, and `vally lint` fails a SKILL.md over 500 lines or any relative link that leaves the skill folder (everscout's five skills link to `../../kb/*.md`, so it was held back).
- Rule: survey first: tag at the default branch head (a tag behind head means a patch release), keywords cut to 10 and dots removed (`chart.js` becomes `chartjs`), the form's short description at most 500 characters (chartwright's 663-character manifest description failed intake on #4530; write a shorter one for the form, the manifest can stay), vally run locally. Links in inline code are ignored by vally. A plugin with shared `kb/` files linked from skills needs a structural fix before it can be listed; ask the maintainer.
- Evidence: the 2026-10-05 survey in package-modernization ai-docs/plans/2026-10-04-claude-directory-listings.md (Copilot section)
- Scope: release
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-05

### L-154 · 2026-10-05 · Copilot CLI runs Claude-format `hooks/hooks.json` as is (`copilot-runs-claude-hooks`)
- Trigger: context-health ships SessionStart and UserPromptSubmit hooks in Claude's nested format with `${CLAUDE_PLUGIN_ROOT}`; the Copilot docs show a different shape (`{"version":1,...}`).
- Rule: no Copilot-specific hooks file is needed for those two events: Copilot CLI 1.0.92 loaded the plugin, ran both hooks (hook.start and hook.end in its debug log, no errors) and answered the prompt. Test with `copilot -p "..." --log-level debug --log-dir <dir>` before writing a converted hooks file.
- Evidence: local run 2026-10-05, session log in the scratchpad (not kept)
- Scope: env:windows, copilot-cli 1.0.92
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-05

### L-155 · 2026-10-05 · GitHub issue forms prefill from the URL; tick their checkboxes with a DOM click (`issue-form-prefill-dom-click`)
- Trigger: filling the awesome-copilot form in Claude in Chrome: coordinate clicks on the checklist worked once and then stopped registering, and screenshots of the scrolled form timed out (one tab froze).
- Rule: open `issues/new?template=<file>.yml&title=...&<field-id>=<value>` with every field prefilled (newlines as `%0A`), read the values back with javascript, tick the checklist with `element.click()` on each checkbox input and verify `checked`, then click Create the same way and confirm the issue with `gh issue list --author`. Checkboxes cannot be prefilled. Post bot commands such as `/rerun-intake` from PowerShell or with `MSYS_NO_PATHCONV=1`: Git Bash turned the argument into `C:/Program Files/Git/rerun-intake` on #4536, and editing the comment afterwards does not trigger the command (only a new comment does).
- Evidence: awesome-copilot #4529 and #4530 (2026-10-05)
- Scope: browser, github
- Status: active · helpful 1 · harmful 0 · last_confirmed 2026-10-05

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
