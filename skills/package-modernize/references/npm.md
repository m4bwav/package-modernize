# npm: how each phase is done

Coverage: **complete**, from two finished runs (get-title-at-url 2.0.0 to 3.0.0, 2026-09-24 and 25, a library with a CLI; seeded-random-utilities 1.1.4 to 2.0.0, 2026-09-25, a deterministic library). Every version number below was verified on 2026-09-24 or 25; re-verify any that is older than three months when you use it (RESEARCH.md carries the dates). The phase list and the shared rules are in [../SKILL.md](../SKILL.md); this file is the npm column.

## Phase 0: survey and baseline

- `scripts/survey-npm.sh PACKAGE [OWNER/REPO]` prints the registry facts (versions, dist-tags, attestations, downloads, dependents, tarball file list, each runtime dependency's distance from current) and the GitHub facts (settings, security features, issues, pull requests, alerts, webhooks, secrets, environments, workflows, forks, dead-service files and badges). Save the output under `ai-docs/notes/` and cite it from the plan.
- In the clone: read every source and test file, `package.json`, the build config, the README, every dotfile, and the published tarball (`npm pack PACKAGE@OLD`; it can hold files the repository does not, such as an unregistered `cli.js`, `.travis.yml` or `.vscode/`).
- Leaked credentials: `.travis.yml`, `.npmrc`, `.env`, workflow files, and history (`git log -S TOKEN_NAME`). A token in history is burned even after the file goes; the maintainer revokes it at the provider.
- Dead services and where each one leaves traces: Travis CI (travis-ci.org and .com badge, `.travis.yml`, webhook), David (david-dm.org badge; the service is gone), Gitter (badge), SonarCloud (`.sonarcloud.properties`, badge, OAuth app), codecov and Coveralls (`codecov.yml`, `.coveralls.yml`, token in `.travis.yml`, badge, webhook, OAuth app), Snyk (`.snyk`, badge, two webhooks, OAuth app, `snyk-fix-*` branches and pull requests under the maintainer's name). List badge, config file, webhook and app for each.
- README images and badges: `node scripts/check-readme-images.mjs README.md` on the clone and on `package/README.md` from the published tarball (they can differ). It flags dead-service badges, including shields.io badges that answer 200 but say "not found", HTTP errors, and relative paths, which break on npmjs.com because the page renders the README from the tarball. Save the output with the survey; the plan's badges-and-images table decides each one (verified 2026-09-25 on replace-string-at-position 1.0.4: 7 of 8 images to fix).
- Baseline: run the old install, build and tests as they are and record the result. Windows trap: 2016 to 2019 scripts that call `./node_modules/.bin/...` fail under cmd.exe, npm's script shell; run `npm --script-shell "C:/Program Files/Git/bin/bash.exe" test`. An old `xo` or `ava` may not install on Node 24 at all; record that too, it is a fact about the package. Do it in a scratch clone (`git clone -q <repo> <scratchpad>/baseline`) so the old install leaves no lockfile in the repository. A test script that starts with `snyk test` stops at a 401 without a Snyk login, so also run each tool alone from inside the scratch clone and record each result (2026-09-25: xo 0.15 crashes on Node 24 with `util.isDate is not a function`; `ava: "*"` resolves to ava 8, which refuses `import x from './'`). When the old suite cannot run at all, say so in the plan: the golden capture is then the only baseline.
- Dependents: the registry gives only a count. `survey-npm.sh` lists the public repositories whose `package.json` names the package (`gh search code`); read each call site, because what the dependents pass decides what the new major may refuse (2026-09-25: the inventory knew one dependent of replace-string-at-position, the search found two).
- Runtime dependencies: `npm view DEP versions time deprecated`. For each major behind: what changed, and whether the package's observable behaviour depends on the dependency's internals (seeded sequences, hashing, sort order, parsing quirks). Test it empirically in two scratch projects before deciding.
- Caret ranges: a fresh `npm install PACKAGE@OLD` can resolve a newer dependency than the old lockfile pinned (`^0.1.2` installed 0.1.5). Record the versions the capture ran against; test every version the range covers if a dependency shapes the output.
- Golden capture: copy `scripts/golden-capture-npm.template.cjs` and `templates/npm/test/golden/codec.cjs` into a scratch project that installed the published old version, fill in every public method with normal, edge and odd inputs (empty strings, numbers where strings go, null and undefined, NaN, negative and out-of-range numbers, huge values, array-likes and Sets, wrapper objects, emoji), run it, commit the JSON and the script under `test/golden/`. Check every claim the kickoff or the survey made against the capture's quirks section.
- Ported arithmetic: golden fixtures only cover the draws they record. Read every ported expression for unwrapped sums, float multiplies and signed-versus-unsigned words; write oracles from the authors' reference code (BigInt versions of the C) for any algorithmic package.
- Docs setup happens here too: `everlast-setup` (mode repo, sync push), AGENTS.md, CLAUDE.md with the `@AGENTS.md` import, the Copilot pointer, the plan from [plan-skeleton.md](plan-skeleton.md).

## Phase 1: plan defaults (the decisions table starts from these)

| Question | Default | Note |
|---|---|---|
| Node floor | `engines.node ">=20"`, CI matrix 20, 22, 24, 26 | Node 20 reached end of life on 2026-04-30 and costs nothing while the code needs nothing newer. Raise to 24 when Node 22 reaches end of life (2027-04-30). Node 26 is Active LTS from 2026-10-28. |
| Language and build | TypeScript ~6.0.3 source, tsdown 0.23.0 (pinned exactly, pre-1.0) to ESM and CommonJS with `.d.mts` and `.d.cts`, `platform: 'neutral'`, `exports: true`, `fixedExtension: true`, source maps, no declaration maps | Fallback is two `tsc` passes. tsdown needs Node 22.18+ or 24 to run; CI installs and builds on 24 in every job, then switches Node for the tests. TypeScript 7 waits until xo supports it (xo 5 and typescript-eslint accept only TypeScript below 6.1 on 2026-09-25). |
| Runtime dependencies | Zero if the code can be inlined or replaced by platform APIs (`fetch`, `URL`, `TextDecoder`, `node:util` `parseArgs` for a CLI) | A runtime dependency needs a decision entry. Small MIT algorithms can be inlined with the notice in a `/*!` header the build keeps and the licence appended to LICENSE; check the licence first. |
| Portability | The library never references `process`, `Buffer`, `require`, `__dirname`, a `node:` module, `window` or `document`; the shape test greps the built output and runs the CommonJS build in a bare `node:vm` context | Only a CLI entry may use Node APIs. No `dom` in `lib` unless the code needs it. |
| Export shape | `exports` map with `import` and `require` conditions plus `./package.json`; `main`, `module` and `types` kept for older resolvers; `sideEffects: false` | publint and attw pass in node10, node16-cjs, node16-esm and bundler modes with this shape. A 2016 `module.exports = function` package needs a decision: keep `require()` callable or document the break. Verified recipe (replace-string-at-position, 2026-09-25): two tsdown configs, an ESM entry with default and named exports and a CommonJS entry whose only export is `export default Object.assign(fn, {default: fn, <exportName>: fn})`; tsdown's `cjsDefault` writes `module.exports =` and the declaration `export =`, attw green in all four modes. Rolldown's `outputOptions.exports: 'default'` fails the declaration build; two configs cannot share `exports: true`, so the entry points are written by hand and pinned by the shape test. Add `banner: {js: "'use strict';"}` to the CommonJS config (the Phase 3 review found the function sloppy-mode without it) and a TypeScript 5.9 consumer fixture with esModuleInterop off (TypeScript 6 cannot turn it off) that compiles and runs `import = require()`, `import * as` and the default import. |
| Tests | `node --test` against `dist/`, both builds, from `test/helpers/builds.js`; layers: golden, unit, functional (a local fixture server, never the internet), CLI, package shape (publint, attw, the pack list, the portability grep, the bare-engine run), consumer fixtures (ESM, CJS, four TypeScript resolution modes, the bin; Bun and Deno opt-in), post-publish verification from the registry; c8 with thresholds 95 percent lines and 90 percent branches, `--exclude-after-remap` | `npm test` never touches the network. The npm scripts name every test file; plain `node --test` would also run helpers, fixtures and capture scripts. |
| Lint | xo ^5.0.1 (`xo.config.js`, every override with a reason) | Biome is the alternative. `xo --fix` rewrites code (spread for `Array.from`, early `continue`); stage first and read its diff. |
| Coverage services, Snyk, SonarCloud | None. Dependabot alerts, `npm audit signatures` and `npm audit --omit=dev` in CI cover it | A full `npm audit` would block every merge whenever a dev tool had an advisory with no fix yet. |
| Lockfile | Keep `package-lock.json`, regenerated as lockfileVersion 3 | The regeneration closes the old alerts. |
| Install scripts | `allowScripts` entries set to `false` for dev-only native fallbacks (unrs-resolver via xo) | npm 12 blocks these by default. |
| Default branch | Keep `master` | |
| Version | The next major when the package shape (exports, `require()` result, Node floor) changes; a minor is not honest about the breaks. The plan says what a patch could do instead and recommends | |
| Release | Dated `CHANGELOG.md` heading, `npm version <major|minor|patch>`, `git push --follow-tags`; `release.yml` builds, tests, stages through trusted publishing and creates the GitHub Release; the maintainer approves on npmjs.com; `verify-published.yml` runs with the version | No npm token anywhere, ever. |
| Dependabot | Weekly, Monday, npm minor and patch grouped, GitHub Actions too; majors the toolchain cannot take yet are ignored with a dated comment | |
| JSR | Optional, after the release; advised against so far | No approval step there. |

Package-specific decisions that recur: every published name keeps working (a misspelled or oddly ordered method gets a new name and stays as a deprecated alias with a JSDoc `@deprecated` tag for one major); fixes to behaviour users may rely on go behind new names; unbounded allocations driven by a caller's number are replaced by algorithms bounded by the output size; never-throw versus typed errors is chosen per package and written in the plan's API section; kickoff wishes can conflict (bounded by the amount versus bit for bit), so the plan tests each requested fix against the promise and says when they clash; the new major's own additions get a second golden file (`2.0.0.json`) captured from the release build so later minors keep them; cheap compatibility shims are worth it (a deprecated static `default` for `new X.default(seed)`, an `interface` rather than a type alias so augmentation compiles).

## Phase 2: rewrite

- Branch `v<major>` from `master`. Remove the dead files (`.travis.yml`, `.snyk`, `.sonarcloud.properties`, `.npmignore`, old lint, build and test configs, `sample/`, the old lockfile) and add the templates from `templates/npm/` (README there says which is which), replacing every `{{...}}` and `TEMPLATE:` block.
- Write the golden test first; the first build must pass every captured case before any new method is written.
- Then `src/`, the rest of `test/`, README (three live badges: npm version, CI, downloads, and every other image as the plan's table decided, with absolute raw.githubusercontent.com URLs pinned to a tag for kept screenshots; install, usage for ESM, CommonJS, TypeScript, Deno, Bun and browsers; API; behaviour at the edges; migration; limits and what the package is not), CHANGELOG (Keep a Changelog; the first paragraph of the new major states the compatibility promise and lists every exception, rare call patterns included), SECURITY.md, AGENTS.md.
- Verify on Node 24 (lint, typecheck, build, test, check, coverage, consumers), then the suites on Node 20, 22 and 26 (portable Node builds in the scratchpad), then from a fresh clone. Record each in the log.
- Push the branch and open the pull request with a "For review" list: departures from the plan and anything the maintainer has not ruled on.

## Phase 3: review

`prompts/review-subagent.md`, filled in, run read-only in a fresh context (background) while the pull request description is written. Fix or answer every finding, commit, note the review's summary on the pull request.

## Phase 4: CI, settings, merge, cleanup

- `ci.yml`, `release.yml`, `verify-published.yml`, `dependabot.yml` from the templates; actions pinned to commit SHAs (checkout v7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1`, setup-node v7.0.0 `820762786026740c76f36085b0efc47a31fe5020`, upload-artifact v7.0.1 `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`, download-artifact v8.0.1 `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c`, setup-bun v2.2.0 `0c5077e51419868618aeaa5fe8019c62421857d6`, setup-deno v2.0.5 `22d081ff2d3a40755e97629de92e3bcbfa7cf2ed`, as of 2026-09-25; re-check with `gh api repos/OWNER/REPO/git/ref/tags/vX`); `actionlint` clean. `permissions: contents: read` at the top, `id-token: write` and `contents: write` only in the publish job, `persist-credentials: false` on every checkout.
- CI green on the pull request; record the run id. Ruleset on `master` (copy get-title-at-url's 24003504: deletion and non-fast-forward blocked, required check `ci`, admin bypass). Squash-merge with `gh pr merge --squash --match-head-commit <full SHA>` after the maintainer's review.
- Cleanup, each with the maintainer's prior OK for deletions: `gh api -X DELETE repos/OWNER/REPO/hooks/ID` for each dead webhook; close each old Dependabot pull request with one comment naming the merge commit and the removed tool that brought the package in (`gh pr close N --delete-branch --comment ...`), after confirming the alert count is 0; answer human pull requests and issues with the accurate history; `gh repo edit` (description, homepage to the npm page, topics, wiki and projects off, delete-branch-on-merge); `gh api -X PATCH repos/OWNER/REPO -f 'security_and_analysis[secret_scanning][status]=enabled' -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'`; `gh api -X PUT repos/OWNER/REPO/private-vulnerability-reporting`; `gh api -X PUT repos/OWNER/REPO/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false`. OAuth apps and GitHub Apps of dead services are the maintainer's (the API refuses the `gh` token).

## Phase 5 and 6: release rehearsal, release, verification

- Trusted publisher, once, by the maintainer in a browser: the package's Settings on npmjs.com, Trusted Publisher, GitHub Actions; organization or user OWNER, repository REPO, workflow filename `release.yml` (filename only; it must exist in `.github/workflows/`), environment blank; "Allow npm publish" unticked so the workflow can only stage; publishing access "Require two-factor authentication and disallow bypass 2fa tokens". The provider and required fields cannot be changed later; renaming the workflow file breaks publishing. `package.json` `repository.url` must be `git+https://github.com/OWNER/REPO.git` exactly.
- Requirements in the workflow: Node 24 in the publish job (Node 22 ships npm 10.9, which can neither exchange an OIDC token, npm 11.5.1, nor stage, npm 11.15), `registry-url: https://registry.npmjs.org`, no `NODE_AUTH_TOKEN`, no `--provenance` (npm adds provenance itself for a public repository and package), always `--tag next` or `--tag latest` (npm 11.19 refuses a prerelease staged without a tag).
- Rehearsal: `npm version X.0.0-beta.1`, `git push --follow-tags`; the run logs "Staging to https://registry.npmjs.org/ with tag next" and a stage id. Stop while the maintainer approves in the Staged Packages tab (2FA). Then `npm view PACKAGE dist-tags` (`latest` unchanged, `next` the beta), `gh workflow run verify-published.yml -f version=X.0.0-beta.1`, and `npm audit signatures` in a scratch project that installed it (one verified signature and one verified attestation).
- Release: date the changelog heading, `npm version X.0.0`, push, stop for the approval, then the same three checks plus `gh release view vX.0.0` and `npm view PACKAGE dist.attestations`.
- Deno within 24 hours of a publish needs `--minimum-dependency-age=0` (Deno 2.9); the template passes it.
- The `next` dist-tag stays on the beta afterwards; removing it needs an npm login with 2FA and the next major's beta moves it anyway.
- Deprecating an old major or a bad version is `npm deprecate PACKAGE@RANGE "message"` from a logged-in CLI with 2FA: the maintainer's task, not the workflow's. Unpublishing is limited to 72 hours and versions with no dependents; do not plan on it.

## Phase 7: wrap-up

HANDOFF.md rewritten around standing work (Dependabot merges when `ci` is green, the next major when the Node floor moves with its date, held majors in `dependabot.yml`, the `next` tag, optional JSR or a tool page); the inventory row; lessons into this skill's LEARNINGS.md and, when a default changed, this file with the date.

## Verification checklist (npm)

| Claim | Command or place | Expected |
|---|---|---|
| Installs clean | `npm ci` in a fresh clone | No deprecation warnings, 0 vulnerabilities |
| Zero runtime dependencies | `npm ls --omit=dev --all` | Nothing under the package |
| Old behaviour kept | `npm test`, CI, verify-published | Every golden case on both builds, every Node line, Bun, Deno and from the registry |
| Old call pattern works | `node -e "..."` with the old README's require line | The captured answer |
| Dual output is correct | `npx publint`, `npx attw --pack .` | No errors in any mode |
| Portable | the shape test | No Node or DOM references in `dist/index.*`; the bare-engine run passes |
| Every Node line | the CI matrix | All green |
| Published with provenance | `npm view PACKAGE dist.attestations`; `npm audit signatures` in a project that installed it | Present and verified |
| Release exists | `gh release view vX.0.0` | Notes from the changelog |
| No alerts | `gh api "repos/OWNER/REPO/dependabot/alerts?state=open" --jq length` | `0` |
| Repo tidy | `gh pr list`, `git ls-remote --heads origin`, `gh api repos/OWNER/REPO/hooks --jq length` | No open pull requests, only `master`, 0 webhooks |
| Badges and images work | `node scripts/check-readme-images.mjs README.md`, and on the README of the published tarball after the release | Exit 0; the npmjs.com page shows every image |
| Tokens dead, scanning on | the maintainer's confirmation; `gh api repos/OWNER/REPO --jq .security_and_analysis` | Revoked; secret scanning and push protection enabled |

## Traps (Windows PC, verified 2026-09-25)

- publint packs without lifecycle scripts, so `npm run check` needs a build first.
- `gh pr merge --match-head-commit` wants the full SHA.
- c8 needs `--exclude-after-remap` to report `src/`; CLI coverage needs `dist/cli.mjs.map` built (kept out of the tarball by `files`).
- With `sourcemap: true`, tsdown 0.23.0 leaves a `sourceMappingURL` comment in the declaration files though no declaration map is written; the template's `build:done` hook strips it.
- The `v` regex flag is a syntax error in Safari 16 and Chrome before 112; the xo config requires `u`.
- rand-seed 3's `exports` map hides its `package.json` from `require()`; a capture script reads it from disk.
- Node's `TextDecoder` decodes windows-1252 bytes 0x80 to 0x9F as C1 controls on Node 20 (from 20.18.3), 22.13.0 to 22.22.0 and 24.0.0 to 24.13.0; decode that family yourself.
- Everlast doc lint: it reads any at-sign word as a social handle (JSDoc tags, the CLAUDE.md import line, npm scopes) and `id-token: write` as a credential, flags email addresses (the survey masks the maintainers' now), wants a `## Reasons` heading in decisions, `## Next single action` in the handoff, `## Status` in a plan and `## Summary` in a note, and wants paths of files that do not exist yet written without backticks (verified 2026-09-25).
- Git Bash's GNU tar reads `C:/...` as a remote host ("Cannot connect to C: resolve failed"); extract with a relative path or `--force-local`.
- Node 20 and 22 print TAP when stdout is not a terminal (`# pass 172`), Node 24 and later the spec reporter (`ℹ pass 172`); grep for both when checking portable Node builds, or an empty grep looks like a pass (2026-09-25).
- zizmor: an inline `# zizmor: ignore[...]` inside a `run: |` block is shell text, not a YAML comment, and is ignored; the template's `.github/zizmor.yml` suppresses `adhoc-packages` for verify-published.yml, whose job is installing the version just published. Run `uvx zizmor --offline .` from the repository root so `dependabot.yml` is audited too (it wants a `cooldown`, now in the template) (2026-09-25).
- `npm exec` and `npx` run in the session's working directory, not the `--prefix` folder; run old tools from a subshell inside the scratch clone.

## Reference runs

- get-title-at-url (public, m4bwav/get-title-at-url): a library with a CLI and a fixture server; its `ai-docs/notes/` hold the dated ecosystem and packaging research and the build traps; `ai-docs/solutions/` the trusted-publishing, Deno and c8 entries.
- seeded-random-utilities (public, m4bwav/seeded-random-utilities): a deterministic library; `test/golden/` is the worked golden capture with per-instance state and scripts; `test/unit/generators.test.js` the BigInt oracles.

Related: builds on [../SKILL.md](../SKILL.md); see also [plan-skeleton.md](plan-skeleton.md), [../templates/README.md](../templates/README.md), [nuget.md](nuget.md).
