# Templates

Files a run copies into the package repository and adapts; do not write them from memory. Placeholders are `{{NAME}}` tokens; a `TEMPLATE:` comment marks a block that needs the package's own content. After copying, grep the repository for `{{` and `TEMPLATE` before the first commit. Each template was taken from a finished run named below, with the package-specific parts replaced.

## npm (from get-title-at-url 3.0.0 and seeded-random-utilities 2.0.0, 2026-09-24 and 25)

- [npm/package.json.template](npm/package.json.template): read when writing the new package.json; the exports map, scripts and devDependency versions verified on 2026-09-25 (tsdown pinned exactly).
- [npm/tsconfig.json](npm/tsconfig.json), [npm/tsdown.config.ts](npm/tsdown.config.ts): the build. tsdown rewrites `main`, `module`, `types` and `exports` on every build.
- [npm/xo.config.js](npm/xo.config.js): lint, every override with a reason.
- [npm/.github/workflows/ci.yml](npm/.github/workflows/ci.yml): lint, shape, coverage, Node 20 to 26 on Linux plus Windows and macOS, Bun, Deno, and the final `ci` job the ruleset requires.
- [npm/.github/workflows/release.yml](npm/.github/workflows/release.yml): on a `v*` tag, build, test, stage on npm through trusted publishing (the only `id-token` job: no install, `--ignore-scripts`, first-party actions), then the GitHub Release in its own job. The trusted publisher on npmjs.com names this file.
- [npm/.github/workflows/verify-published.yml](npm/.github/workflows/verify-published.yml): after the approval, the registry package on every platform, Bun and Deno, signatures and attestation. Fill the `{{SMOKE_*}}` one-liners; add the npx, bunx and deno CLI steps from get-title-at-url for a package with a bin.
- [npm/.github/workflows/live.yml](npm/.github/workflows/live.yml): optional weekly live smoke for a package that talks to the internet; delete for a pure library.
- [npm/.npmrc](npm/.npmrc): `min-release-age=3`, a three-day cooldown on resolving new dependency versions (npm 11.10 and later; `npm ci` from the lockfile is unaffected).
- [npm/.github/dependabot.yml](npm/.github/dependabot.yml): weekly, Monday, minor and patch grouped, a 7-day cooldown, held majors with dated comments.
- [npm/.github/zizmor.yml](npm/.github/zizmor.yml): zizmor's one deliberate exception (verify-published installs the version just published); run `uvx zizmor --offline .` from the repository root.
- [npm/AGENTS.md](npm/AGENTS.md), [npm/CLAUDE.md](npm/CLAUDE.md), [npm/.github/copilot-instructions.md](npm/.github/copilot-instructions.md): the agent rules and the two pointers to them.
- [npm/SECURITY.md](npm/SECURITY.md), [npm/README.template.md](npm/README.template.md): reporting, supported versions, three live badges.
- [npm/.editorconfig](npm/.editorconfig), [npm/.gitattributes](npm/.gitattributes), [npm/.gitignore](npm/.gitignore): LF everywhere.
- `npm/test/`: [helpers/builds.js](npm/test/helpers/builds.js) (both builds), [package/shape.test.js](npm/test/package/shape.test.js) (tarball, exports, portability, bare engine), [golden/golden.test.template.js](npm/test/golden/golden.test.template.js) (the contract; the capture script is [../scripts/golden-capture-npm.template.cjs](../scripts/golden-capture-npm.template.cjs); both use [golden/codec.cjs](npm/test/golden/codec.cjs), which keeps NaN, -0, Infinity, undefined and wrapper objects through JSON and records thrown errors with their class), [consumers/consumers.test.js](npm/test/consumers/consumers.test.js) with the `esm-node`, `cjs-node` and four TypeScript fixtures and [consumers/types/assertions.ts](npm/test/consumers/types/assertions.ts).

## Rulesets

- [rulesets/tags-admins-only.json](rulesets/tags-admins-only.json): a tag ruleset (create, update, delete any tag; repository admins bypass), applied in Phase 4 by `scripts/post-merge-cleanup.sh --tag-ruleset`. Any package system: whoever can push a `v*` tag starts the release workflow.

## NuGet (from DotNetJsonPrettyPrinter 3.0.0 and DotNetRandomNameGenerator 2.1.0, 2026-09-25)

- [nuget/Library.csproj.template](nuget/Library.csproj.template): read when writing the library project; multi-target, analyzers, package metadata, SourceLink, snupkg, deterministic build, package validation.
- [nuget/Directory.Build.props](nuget/Directory.Build.props), [nuget/global.json](nuget/global.json): lock files on, SDK pin with rollForward.
- [nuget/.github/workflows/ci.yml](nuget/.github/workflows/ci.yml): as the run had it: build and test on Ubuntu and Windows, pack, and a publish job gated by the `nuget` environment that trades the OIDC token for a NuGet key. See [../references/nuget.md](../references/nuget.md) for what the skill changes (a separate release workflow, pinned actions, a verify-published workflow).
- [nuget/.github/dependabot.yml](nuget/.github/dependabot.yml), [nuget/.editorconfig](nuget/.editorconfig), [nuget/.gitattributes](nuget/.gitattributes), [nuget/.gitignore](nuget/.gitignore), [nuget/CLAUDE.md](nuget/CLAUDE.md), [nuget/.github/copilot-instructions.md](nuget/.github/copilot-instructions.md).

Related: builds on [../SKILL.md](../SKILL.md); see also [../references/npm.md](../references/npm.md), [../references/nuget.md](../references/nuget.md).
