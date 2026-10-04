---
title: "Release hardening from Evil Martians' secure-npm-package: split id-token job, tag ruleset, install cooldown"
kind: decision
status: active
date: 2026-09-26
verified: 2026-09-26
stale_after: 2026-12-26
tags: [release, npm, security, ruleset, cooldown, workflows, evil-martians]
summary: "read before changing templates/npm release.yml, .npmrc or the tag ruleset: which secure-npm-package items were adopted, the evidence for each, and what was left out (immutable releases, ignore-scripts in .npmrc)"
---

# Release hardening from Evil Martians' secure-npm-package: split id-token job, tag ruleset, install cooldown

## Context

R-20260926-1 found Evil Martians' `secure-npm-package` skill (evilmartians/agent-skills, SKILL.md at commit a2a83b2, 2026-08-12) to be the closest prior art for the gated release. The continuation prompt of 2026-09-26 (item C) asked for three of its items to be checked against the npm templates and adopted only where they hold: no third-party actions and no dependency install in the `id-token: write` job, a `min-release-age` cooldown, and an admins-only tag ruleset.

## Decision

1. **The id-token job: adopted with a change.** The template's publish job already installed nothing and used only `actions/setup-node` and `actions/download-artifact`, pinned to SHAs, so the item held. But it also had `contents: write` and created the GitHub Release; secure-npm-package moves such extras "into separate jobs without id-token". release.yml now has `publish` (`contents: read`, `id-token: write`, `npm stage publish ... --ignore-scripts`) and a `github-release` job (`contents: write`, no `id-token`) after it. actionlint 1.7.12, `check-workflow-shell.py` and zizmor 1.30.1 are clean on the template. Not yet run for real: the first package that uses it (stack-exchange-markdown-retriever) proves it at its beta.
2. **Install cooldown: adopted as `templates/npm/.npmrc` with `min-release-age=3`.** Checked on npm 11.16 on 2026-09-26 with is-an-image-url 2.0.0, published that day: `npm install is-an-image-url@2.0.0` and `@^2` fail with `notarget ... with a date before 9/23/2026`, while `npm ci` and `npm install` from a lockfile that already holds 2.0.0 succeed. So CI, Dependabot (its own 7-day cooldown) and the verify workflows, which install in temporary projects outside the checkout, are unaffected; the protection lands where it matters, at the Phase 2 lockfile regeneration. npm added the key in 11.10.0; npm 10 on Node 20 and 22 warns about it. The escape is `--min-release-age=0` on one command with a reason, needed for markdown-plain-link-replacer's run, which consumes the maintainer's own fresh majors.
3. **Tag ruleset: adopted as `templates/rulesets/tags-admins-only.json`**, applied by `post-merge-cleanup.sh --tag-ruleset` with the rest of Phase 4's go. secure-npm-package restricts creation only; this ruleset also restricts update and deletion, since nothing in the process moves or deletes a tag except an admin, who bypasses the rules. The dry run on is-an-image-url reads correctly; the JSON has not yet been accepted by the API (first real use: the next run's Phase 4, or the four finished repositories with the maintainer's go).

## Reasons

- Every job that holds `id-token: write` can publish; a write token beside it widens what a compromised step could do, and the Release step needs no OIDC.
- The cooldown test showed where the setting acts (resolution, not lockfile installs), which is the difference between a safe default and one that would break CI on the day of a release.
- With staged publishing the maintainer's approval already gates npm, but a tag push still spends a version number and starts a staging run; a leaked token or a workflow's `GITHUB_TOKEN` should not be able to do that.

## Alternatives rejected

- **`ignore-scripts=true` in `.npmrc`** (secure-npm-package step 3e): it also skips the project's own lifecycle scripts, and the templates already block dev-only install scripts through `allowScripts` (npm 12 blocks them by default).
- **Immutable releases**: not in the prompt's list. release.yml creates the GitHub Release when the version is staged, before the maintainer's approval; how an immutable release behaves when the staged version is rejected has not been checked. Left for the next refresh.
- **Moving the build to a dependency-free publish without artifacts**: the template already packs in the build job and stages the tested tarball; nothing to change.

Related: builds on [2026-09-25-skill-layout-public-repo-private-overlay.md](2026-09-25-skill-layout-public-repo-private-overlay.md)
