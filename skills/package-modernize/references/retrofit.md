# Retrofit: a package modernized before this skill existed

A retrofit brings a package that already has current tooling up to this skill's standard: the golden contract, the gated release path, verification from the registry, the repository settings and the docs. It is not a rewrite; the code is presumed sound until the audit says otherwise. First run: RandomNameGeneratorLibrary 2.2.0 to 2.3.0 (NuGet, 2026-09-28; its plan, gap audit and log are under `ai-docs/` in m4bwav/DotNetRandomNameGenerator). The phases and rules are in [../SKILL.md](../SKILL.md); this file says what changes when the package was modernized by hand first.

## When it is a retrofit

The latest published version already builds on the current SDK or runtime, has CI and a changelog, and was released recently, but some of these are missing: a golden recording of the published behaviour, a separate gated release workflow, a verify-published workflow, SHA-pinned actions, rulesets and security settings, AGENTS.md and the everlast docs. A package with none of the tooling is a normal run.

## Which phases apply

| Phase | In a retrofit |
|---|---|
| 0 | Replace the fresh survey with a gap audit (below). The golden capture is of the **latest** published version, one recording per runtime, before any change. Everything else of Phase 0 applies. |
| 1 | The plan's first question is whether any library code changes at all (default: none). Decisions on everything the audit found. Recommend a release only for a reason (below). |
| 2 | Templates adapted over the existing files, not a new layout: keep the project folders where they are (moving them breaks links for no caller benefit). Golden replay first, canary after the commit. |
| 3 to 6 | As in SKILL.md. The review's differential compares the new build with the latest published version. |
| 7 | As in SKILL.md, including the wiki: a retrofit without a release still gets one (wikiwright, verified against the latest published version); with a release, after it is verified. |

## The gap audit (Phase 0)

1. Run the survey scripts and read every version's package files: old versions of a hand-modernized package can still be broken (RandomNameGeneratorLibrary 1.1.0 shipped sources and obj caches and no DLL; 1.1.1 to 1.2.1 had the DLL outside a framework folder). Each gets a deprecation recommendation for the maintainer.
2. List every gap against the phases table and the system's reference: golden capture, API list with parameter and protected names, validation baseline, workflows and pins, consumers, release gate, verify-published, Dependabot, rulesets and security settings, README badges and images, icon, SECURITY.md, AGENTS.md with the import, everlast docs, the GitHub wiki (none, a placeholder, or pages for an older version). A table of item, current state, standard is the note's core.
3. Read the earlier pass's own notes and changelog for what it decided and what it changed without guarding it (RandomNameGeneratorLibrary 2.1.0 changed every seeded place name; its changelog said the list changed, not that seeded output did).
4. **Data provenance** (L-093 `data-provenance-check`): rebuild every embedded data file from its source with the old tool's logic. Equal output proves where it came from; a corrected rebuild beside it lists the defects. Integrity tests (counts, blanks, encoding) and the golden capture cannot see a wrong tool. Record the sources' URLs and hashes next to the tool.
5. **The popular version** (L-094 `diff-the-popular-version`): when most downloads are on an old version, run the capture's deterministic cases that its API allows against it and write every difference into the next changelog.
6. Baseline: the current build and tests as they are, and the package list for outdated and vulnerable dependencies.
7. **Old majors** (L-108 `run-old-majors-for-docs`): install the latest version of each old major in a scratch folder and import it once; one that no longer loads is a deprecation recommendation.

## A ruled data or behaviour fix in a retrofit

When the maintainer rules that a defect is fixed in place (RandomNameGeneratorLibrary: "I consider it a bug, the old behavior wasn't worth preserving"), the golden recording stays untouched and the fix becomes one named exception:

- First make the replay green against the unchanged code, run the canary, commit. Only then make the fix.
- The changed answers go in a separate file beside the replay project (`Exceptions/<new version>.<topic>.<runtime>.json`), not under `tests/Golden`, so `git diff --exit-code <phase-0> -- tests/Golden` stays meaningful. The replay can write the differences on request (an environment variable, never set in CI); the file is then reviewed like code.
- The replay pins the exact set of allowed exception keys (a topic regex also matched 26 cases that must never change) and refuses an exception that equals the old answer. An oracle independent of the library checks every exception (for a seeded list: the new list indexed by the same `Random` draws; the data file against the rebuilt hash), and in a case that mixes topics every other answer must equal the old recording.
- Tests pin the fix itself (restored entries present, defective ones absent), and the README's seeded examples are regenerated and tested.
- The version is a minor when the API is unchanged and the maintainer accepts the output change (the plan offers the major and the new-name alternative).

## When a release is warranted

- A ruled fix, a README or metadata change that the registry page shows (nuget.org and npm render the README from the package), or the first use of a new release workflow or publishing policy. Prove the new path with a prerelease first.
- Not for workflow or test changes alone, unless the maintainer wants the release path proven now.
- The trusted publishing policy usually names the old workflow file: the maintainer changes it after the merge and before the prerelease tag.

## What the first retrofit's review found

The independent review ran a differential of the new package against the published one over 5,000 seeds and every call kind on both runtimes (144,891 comparisons per runtime, no difference outside the ruled list). Its 10 findings were in the new machinery, not the library: a CI check that died silently, consumers that could restore the registry's copy of the same version (L-104 `consumer-source-mapping`), an overstated changelog claim ("every seeded place name differs": 2 percent do not), a too-broad exception filter, a partial oracle and wrong commands in AGENTS.md. Expect the same in a retrofit: review the new tests and workflows as hard as the code.

## Traps from the first retrofit

- The published old version was recorded in a 64-bit .NET Framework process; the replay ran 32-bit and one OutOfMemoryException message differed. Record the process bitness in the capture's header and run the replay the same way.
- Adopting `* text=auto eol=lf` in a clone checked out with autocrlf leaves CRLF working files, and `dotnet format` then reports ENDOFLINE everywhere; after committing, `git rm -r --cached . && git reset --hard` rewrites them.
- The package content check lists files in C-locale order, which depends on the package id (README.md sorts before an id starting with Ra); build the expected list with the same sort.
- `{{` also matches GitHub Actions expressions; grep for `{{[A-Z_]+}}` and `TEMPLATE` after adapting templates.
- zizmor 1.30.1 requires a Dependabot cooldown of at least seven days, for every ecosystem.
- The package content check in ci.yml died without a message on a package with no dependencies: the nuspec's empty groups are self-closing, and a grep with no match ends a step under `-e` and pipefail. Run each new check locally with `bash -e -o pipefail` on the real nupkg, with a right and a wrong expectation (L-103 `empty-dependency-group`).
- A new test project must carry every extension the workflow's test flags need (`--coverage` needs Microsoft.Testing.Extensions.CodeCoverage), or Microsoft.Testing.Platform exits 5 with "Zero tests ran" (L-101 `ci-command-locally`).
- xunit.v3 4.x made `CollectionBehavior(DisableTestParallelization = true)` an error (CS0619); a replay in one test class needs no attribute.

Related: builds on [../SKILL.md](../SKILL.md); see also [nuget.md](nuget.md), [plan-skeleton.md](plan-skeleton.md).
