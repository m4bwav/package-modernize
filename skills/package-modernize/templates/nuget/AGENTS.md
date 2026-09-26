# AGENTS.md

Rules for any AI agent (Claude Code, Copilot, Cursor, Codex) working in this repository. `CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The NuGet package `{{PACKAGE_ID}}` (namespace `{{PROJECT}}`): {{ONE_LINE_DESCRIPTION}}. Library in `{{PROJECT}}/`, tests in `{{TESTS}}/`. {{OLD_VERSION}} ({{OLD_VERSION_DATE}}, {{OLD_STACK}}) is the published version until {{NEW_VERSION}} ships. The plan is `ai-docs/plans/{{PLAN_FILE}}`; start with `ai-docs/HANDOFF.md`.

## Rules

- **{{THE_PROMISE}}.** {{ONE_PARAGRAPH: the compatibility promise (the same output for every input the old version handled), where the proof lives (tests/Golden), and the rule that a fix which would change an old result goes under a new name with a decision entry and a changelog line. Package validation guards the API shape against the baseline version; the golden tests guard the behaviour.}}
- **Targets.** The library multi-targets `netstandard2.0` and `net10.0`: no net5+ APIs (`ArgumentNullException.ThrowIfNull`, `HashCode`) without an `#if` or a polyfill. The net10.0 build is trim and AOT compatible; reflection-based paths carry `RequiresUnreferencedCode` and `RequiresDynamicCode` and get a source-generated overload beside them.
- **Tests cover every artifact.** Golden, unit, package validation at pack time, a fresh consumer project in `verify-published.yml`. A behaviour change lands with its test. Tests never touch the network.
- **Nothing reaches nuget.org without the maintainer.** No API key is stored anywhere; `release.yml` publishes through Trusted Publishing from a job that waits at the `nuget` environment for the maintainer's approval. Never push a package from a machine.
- **Releases follow one ritual.** Update `CHANGELOG.md` (a release heading carries its date), set `<Version>` in `{{PROJECT}}/{{PROJECT}}.csproj`, merge, wait for `ci` to be green on `master`, then tag `v<version>` and push the tag. `release.yml` builds, tests, packs, attests, waits for the approval, pushes and creates the GitHub Release. Then run `verify-published` with the version. Tag only after green: a tag on a failing commit burns the version number, because tags are not force-pushed here.
- **Dependencies.** Lock files are committed (`RestorePackagesWithLockFile`); run plain `dotnet restore` after changing a PackageReference and commit the lock file; CI restores with `--locked-mode`. Dependabot opens weekly pull requests (nuget, dotnet-sdk, github-actions); merge when `ci` is green. Actions are pinned to commit SHAs; keep it that way.
- **Research beats recall.** SDK, package and action versions change; re-verify any version older than three months.
- **Document for handoff.** Anything learned, decided or built goes into `ai-docs/` before you finish; rewrite `ai-docs/HANDOFF.md` when work is left unfinished.
- **No AI attribution anywhere.**
- **Line endings.** Files are LF (`.gitattributes` and `.editorconfig`), so `dotnet format` agrees on every OS; check new files before committing (count byte 13 with node on Windows).

## Commands

```
dotnet restore --locked-mode
dotnet format --verify-no-changes
dotnet build -c Release
dotnet test -c Release                              # net10.0 and net48 (net48 executes only on Windows)
dotnet restore -p:AuditPipeline=true --force        # fails on any NuGetAudit finding, as CI does
dotnet pack {{PROJECT}} -c Release -o artifacts     # package validation against PackageValidationBaselineVersion
```

## Layout and traps

- {{SOURCE_LAYOUT}}
- `tests/Golden/{{OLD_VERSION}}.json` was captured from the published {{OLD_VERSION}} by the program beside it, in a scratch project. Never regenerate it from this repository's code.
- A locked-mode lock file for a multi-OS matrix must not depend on anything the SDK infers per OS: `Microsoft.NETFramework.ReferenceAssemblies` is referenced explicitly with `PrivateAssets="all"`, and the net48 test exe pins `RuntimeIdentifier win-x86` with `SelfContained false`.
- The publish job has no checkout, so it pins `dotnet-version` instead of reading `global.json`.
- After a release, set `PackageValidationBaselineVersion` to the released version.

{{EVERLAST_BLOCK}}
