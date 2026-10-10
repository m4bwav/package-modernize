# Retrofit: a package modernized before this skill existed

A retrofit brings a package that already has current tooling up to this skill's standard: the golden contract, the gated release path that checks what it publishes, verification from the registry, the repository settings and the docs. It is not a rewrite; the code is presumed sound until the audit says otherwise. This file holds what every package system shares; how each step is done in a system is in that system's reference, under "Retrofit" ([nuget.md](nuget.md#retrofit), [npm.md](npm.md#retrofit)). The phases and rules are in [../SKILL.md](../SKILL.md).

Runs so far:

| Run | System | Result | Records |
|---|---|---|---|
| RandomNameGeneratorLibrary 2.2.0 to 2.3.0 (2026-09-28) | NuGet | a ruled data fix, a minor | m4bwav/DotNetRandomNameGenerator `ai-docs/` |
| JsonPrettyPrinter 3.0.1 to 3.0.2 (2026-09-28) | NuGet | no library change; the capture also records the old versions | m4bwav/DotNetJsonPrettyPrinter `ai-docs/` |
| seeded-random-utilities 2.0.0 to 2.0.1 (2026-09-29) | npm | no library change; a third recording with edge inputs; the release gate for npm | m4bwav/seeded-random-utilities `ai-docs/` |

## When it is a retrofit

The latest published version already builds on the current SDK or runtime, has CI and a changelog, and was released recently, but some of these are missing: a golden recording of the published behaviour that meets the current capture rules, a separate gated release workflow that checks what it publishes, a verify-published workflow, SHA-pinned actions, cooldowns, rulesets and security settings, AGENTS.md and the everlast docs. A package with none of the tooling is a normal run.

## Which phases apply

| Phase | In a retrofit |
|---|---|
| 0 | The gap audit below replaces the fresh survey. Any new golden capture is of the **latest** published version, before any change. Everything else of Phase 0 applies. |
| 1 | The plan's first question is whether any library code changes at all (default: none; a bug found goes to the maintainer with the fix-in-place and new-name options side by side). Decisions on everything the audit found. Recommend a release only for a reason (below). |
| 2 | Templates adapted over the existing files, not a new layout: keep the project folders where they are (moving them breaks links for no caller benefit). Golden replay first, canary after the commit. |
| 3 to 6 | As in SKILL.md. The review's differential compares the new build with the latest published version; review the new tests and workflows as hard as the code (below). |
| 7 | As in SKILL.md, including the wiki: a retrofit without a release still gets it (wikiwright's Update mode, verified against the latest published version); with a release, after it is verified. Corrections the audit found in the shipped docs go on the wiki too. |

## The gap audit (Phase 0)

1. **Every published version.** Run the survey scripts and read every version's package files: old versions of a hand-modernized package can still be broken (RandomNameGeneratorLibrary 1.1.0 shipped sources and no DLL). Then run the contract's capture against every published version, group the versions that answer alike, and diff the built code between the groups (L-126 `every-old-version-replayed`: seeded-random-utilities 1.0.0 to 1.1.3 shuffle with `Math.random()`, which the CHANGELOG called a re-publish). Before correcting a changelog, `diff -r` the whole unpacked package between adjacent versions, declarations included, and run any claim about sequences (L-130 `diff-the-whole-package`). Each broken or misleading version gets a deprecation recommendation with its exact message.
2. **The gap table**: item, current state, standard. Cover the golden capture, the public API list, the workflows and their pins (and third-party jobs the template drops), the release gate and what it checks before publishing (L-120), verify-published, consumers of the packed artifact, Dependabot and the install cooldown, zizmor, rulesets (branch and tag) and security settings, the repository homepage and topics (`scripts/topics.py check`), tags that never published, stale branches, README badges and images, the registry-page and live catalog-listing links near the end of the README and in the wiki footer, icon where the registry shows one, SECURITY.md, AGENTS.md with the import, the everlast docs, and the GitHub wiki (none, a placeholder, pages for an older version, or pages without a saved verification output). The system's reference lists its own items.
3. **Existing golden recordings.** Replay each capture against the published version it recorded, installed today; the recording must come back byte for byte apart from the date. Then judge it against the current capture rules: one recording per runtime where answers can differ, lossless text (a lone surrogate or a CRLF survives, L-112, L-119), each thrown error's class recorded and messages worded by a dependency or the engine marked (L-111), odd inputs through the codec, and replayable against the next major without hand patches (L-123). A recording that falls short stays as it is; add a new capture of the latest published version beside it, commit it before any change, and replay both.
4. **Reproducible build.** Build the published version's source and compare the result with the published package (seeded-random-utilities: `dist/` byte-identical). A difference is a finding: the release path may not publish what its tests saw.
5. **The earlier pass's own notes and changelog**: what it decided, and what it changed without guarding it (RandomNameGeneratorLibrary 2.1.0 changed every seeded place name; its changelog said the list changed, not that seeded output did). Check every changelog claim about an old version against step 1.
6. **Data provenance** (L-093 `data-provenance-check`): rebuild every embedded data file from its source with the old tool's logic. Equal output proves where it came from; a corrected rebuild beside it lists the defects. Integrity tests and the golden capture cannot see a wrong tool. Record the sources' URLs and hashes next to the tool.
7. **The popular version** (L-094 `diff-the-popular-version`): when most downloads are on an old version, run the capture's deterministic cases its API allows against it and write every difference into the next changelog, with the capture itself (L-110 `one-capture-many-versions`).
8. **Baseline**: the current build and tests as they are, from a fresh clone, and the dependency list for outdated and vulnerable packages.
9. **Old majors** (L-108 `run-old-majors-for-docs`): install the latest version of each old major in a scratch folder and load it once on every runtime a caller can have; one that no longer loads is a deprecation recommendation.
10. **ai-docs in the old layout**: register with everlast (mode repo), `git mv` old log files to `notes/` with frontmatter and a Summary heading, give an old plan a dated name with Status, Goal and Next single action headings, fold one-paragraph logs into `log.md`, then `everlast.py index` and `lint` (its false positives: L-082, L-097, L-114; paths outside the repository are written without backticks).
11. Before the Phase 0 commit, look in any new recording for anything the capture's OS chose: a CRLF, a path, a time zone (L-119 `os-newline-through-a-dependency`).

## A ruled data or behaviour fix in a retrofit

When the maintainer rules that a defect is fixed in place (RandomNameGeneratorLibrary: "I consider it a bug, the old behavior wasn't worth preserving"), the golden recording stays untouched and the fix becomes one named exception:

- First make the replay green against the unchanged code, run the canary, commit. Only then make the fix.
- The changed answers go in a separate file beside the replay, not in the recordings' folder, so the untouched check stays meaningful. The replay can write the differences on request (an environment variable, never set in CI); the file is then reviewed like code.
- The replay pins the exact set of allowed exception keys (a topic pattern also matched 26 cases that must never change) and refuses an exception that equals the old answer. An oracle independent of the library checks every exception, and in a case that mixes topics every other answer must equal the old recording.
- Tests pin the fix itself, and the README's seeded examples are regenerated and tested.
- The version is a minor when the API is unchanged and the maintainer accepts the output change (the plan offers the major and the new-name alternative).

## When a release is warranted

- A ruled fix, a README or metadata change the registry page shows (npm and nuget.org render the README from the package), or the first use of a new release workflow or publishing policy. Prove a changed release path with a prerelease first.
- Not for workflow or test changes alone, unless the maintainer wants the release path proven now.
- A trusted publishing policy that names the workflow file keeps working while the file name stays; when the name changes, the maintainer changes the policy after the merge and before the prerelease tag.

## Templates over an existing layout

- Adapt workflow templates with a byte-safe script (they hold sed patterns and `$'...'` strings with backslashes), then grep for `{{[A-Z_]+}}` and `TEMPLATE`.
- Keep the repository's own test and project layout; move only what the linter or the build refuses where it is (npm: helper scripts out of `test/`).
- Run actionlint with shellcheck (L-118) and zizmor. Run each new check locally under `bash -e -o pipefail` on the real artifact with a right and a wrong expectation (L-103), and a release gate also with its tool missing and its API failing: a gate that compares output with `!=` passes when the command is absent (L-128 `gate-fails-closed`).
- Run CI's exact commands from a fresh clone on every runtime line before pushing (L-101).

## What the retrofits' reviews found

- RandomNameGeneratorLibrary: the differential over 5,000 seeds and every call kind on both runtimes (144,891 comparisons per runtime) found no difference outside the ruled list. Its 10 findings were in the new machinery: a CI check that died silently, consumers that could restore the registry's copy of the same version (L-104), an overstated changelog claim, a too-broad exception filter, a partial oracle and wrong commands in AGENTS.md.
- JsonPrettyPrinter: 525,778 comparisons per runtime, 0 differences; 9 findings, among them a release workflow that pushed a package no check had run on (L-120).
- seeded-random-utilities: 977,328 comparisons per Node line on four lines, 0 differences; 12 findings, among them a ci wait that accepted a pull request's check run, a tarball rebuilt by `prepack` after the tests, an untouched check that passed a renamed recording, and two changelog corrections the audit itself had got wrong (the wrong version for an interface rename).

Expect the same in every retrofit: the library is usually sound, and the findings are in the tests, workflows and docs the retrofit adds.

## Traps shared by every system

- The Linux leg is where an OS-dependent answer shows; push early so CI runs the replay on Linux before the review (L-119).
- A recording compared by a tool that decodes text can fail on a lone surrogate (L-117); compare raw text.
- The agent repeats known traps in the first hour (L-102, L-115, L-129): a `cd` in a shell call, an escape sequence typed into a file, a check piped into `tail` before a commit.

Related: builds on [../SKILL.md](../SKILL.md); see also [nuget.md](nuget.md), [npm.md](npm.md), [plan-skeleton.md](plan-skeleton.md).
