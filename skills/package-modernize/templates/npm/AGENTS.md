# AGENTS.md

Rules for any AI agent (Claude Code, Copilot, Cursor, Codex) working in this repository. `CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The npm package `{{PACKAGE}}`: {{ONE_LINE_DESCRIPTION}}. On npm since {{FIRST_PUBLISHED_YEAR}}; {{OLD_VERSION}} ({{OLD_VERSION_DATE}}, {{OLD_STACK}}) is the published version until {{NEW_VERSION}} ships. Version {{MAJOR}} is TypeScript in `src/`, built by tsdown into ESM and CommonJS with a declaration file for each, with no runtime dependencies. The plan is `ai-docs/plans/{{PLAN_FILE}}`; start with `ai-docs/HANDOFF.md` to see how far it has got.

## Rules

- **{{THE_PROMISE}}.** {{ONE_PARAGRAPH: the compatibility promise this package makes (the same results for every input the old version handled, the same require() shape), where the proof lives (test/golden), and the rule that a fix which would change an old result goes under a new name with a decision entry and a changelog line.}}
- **Availability.** The package must stay usable from `import` and `require`, ship types for both, and support every Node line in `engines`. The library stays free of Node and DOM APIs (`process`, `Buffer`, `require`, `__dirname`, `node:` imports, `window`, `document`), so it runs in browsers, Bun, Deno and workers; only a CLI entry may use Node APIs. No runtime dependency without a decision entry in `ai-docs/decisions/`.
- **Tests cover every artifact, not just the code.** The plan's test strategy is the contract: golden, unit, package shape (`publint`, `@arethetypeswrong/cli`), consumer fixtures for ESM, CJS and the type files, Bun and Deno, and post-publish verification from the registry. A behaviour change lands with its test. `npm test` never touches the network.
- **Nothing reaches npm without the maintainer.** Never run `npm publish` or `npm stage publish` from a machine, never create or store an npm token, and never approve anything on npmjs.com. Releases go through `release.yml`, which only stages; the maintainer approves each version with 2FA.
- **Releases follow one ritual.**
  1. Update `CHANGELOG.md`. A release's heading carries its date; `release.yml` refuses "Unreleased" for a release, and a prerelease uses the section of the release it leads to.
  2. Run `npm version <major|minor|patch>`, then `git push --follow-tags`.
  3. `release.yml` builds, tests, stages the npm publish through trusted publishing and creates the GitHub Release.
  4. The maintainer approves the staged version on npmjs.com.
  5. Run the `verify-published` workflow with the version.
- **Dependencies.** Dependabot opens weekly pull requests (npm and GitHub Actions); merge when the `ci` check is green, and read the release notes for a major first. Actions are pinned to commit SHAs with the version in a comment; keep it that way. When npm warns that a package's install script is not covered by `allowScripts`, check that lint, typecheck and the build pass after `npm ci --ignore-scripts`, then add the package to `allowScripts` as `false`.
- **Research beats recall.** Node, npm and tool versions change; the notes under `ai-docs/notes/` carry the date each fact was verified. Re-verify any version number older than three months before relying on it.
- **Document for handoff.** Anything learned, decided or built goes into `ai-docs/` (at minimum a line in `ai-docs/log.md`) before you finish. Rewrite `ai-docs/HANDOFF.md` when work is left unfinished. A fresh session in any tool must be able to continue from disk alone.
- **No AI attribution anywhere**: no Co-Authored-By trailers, no "generated with" lines in commits, pull requests or files.
- **Windows note.** Write files with an editor tool, not shell heredocs (they lose backslashes). Check line endings by counting byte 13 with node; Git Bash's grep cannot see carriage returns. Spawn npm and npx through a shell from Node; they are `.cmd` shims. `.gitattributes` keeps the repository LF.

## Commands

```bash
npm ci
npm run build          # tsdown -> dist/ (index.mjs, index.cjs, index.d.mts, index.d.cts, maps)
npm test               # build, then node --test: golden, unit, package shape
npm run test:dist      # the same suites against the dist/ already built, without building
npm run test:consumers # build, pack, install the tarball into a scratch project, run the ESM, CJS and type fixtures
                       # CONSUMER_RUNTIMES=bun,deno adds Bun and Deno; CONSUMER_PACKAGE={{PACKAGE}}@<version> installs from npm instead
npm run coverage       # c8 over the suites, mapped back to src/; fails under 95% lines or 90% branches
npm run lint           # xo (config and every rule override, with its reason, in xo.config.js)
npm run typecheck      # tsc --noEmit
npm run check          # publint, attw --pack ., npm pack --dry-run
```

tsdown needs Node 22.18+ or 24 to build; the built output and the tests run on Node 20 and up.

## Layout and traps

- {{SOURCE_LAYOUT: one line per file under src/, and what may import what.}}
- `test/golden/{{OLD_VERSION}}.json` was captured from the published {{OLD_VERSION}} by the capture script beside it, in a scratch project. Never regenerate it from this repository's code. Lint ignores the golden files and the capture scripts, which are kept as they were run.
- Tests import `dist/`, never `src/`, and run against both builds (`test/helpers/builds.js`). The npm scripts name every test file, because plain `node --test` would also run the fixtures and the capture scripts.
- `package.json` `main`, `module`, `types` and `exports` are rewritten by tsdown on every build (`exports: true`); edit them in `tsdown.config.ts`, not by hand.
- `xo --fix` rewrites code: stage your work first and read the diff it makes to `src/`.
- CI (`.github/workflows/ci.yml`) installs and builds on Node 24 in every job, because tsdown cannot run on Node 20. It then switches to the job's Node line and runs `npm run test:dist` and the consumer fixtures. The ruleset on `master` requires only the final `ci` job, which passes when every other job passed.
- The npm trusted publisher names `release.yml`, so renaming the file breaks publishing. Its `publish` job, the only one with `id-token` and `contents` set to write, stages the tarball the `build` job tested and runs no dependency code. Within 24 hours of a publish, Deno needs `--minimum-dependency-age=0` to install the new version.

{{EVERLAST_BLOCK: the eight-line "everlast (session knowledge, load on demand)" section that everlast-setup writes.}}
