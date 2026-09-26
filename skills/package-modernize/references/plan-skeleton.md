# Plan skeleton

The living plan a run writes in Phase 1 at `ai-docs/plans/YYYY-MM-DD-modernization-and-vN-release.md`, with everlast frontmatter so it indexes. It is ticked as work lands and the evidence (commit, pull request, workflow run id, registry output) goes in `ai-docs/log.md`. Dates are absolute. Paths of files that do not exist yet are written without backticks, so the doc lint does not report them as dead; they get their backticks when the files land (the first run with the skill forgot this and got 16 dead-path findings, so check before running the lint). The same lint reads JSDoc tags in code blocks as social handles and `id-token: write` as a credential: write the API sketch with plain "Throws a TypeError when" sentences and the permission as "id-token set to write". The decisions table is the part the maintainer reads first: recommendation first, the reason, the alternative; silence means the recommendation stands. Two finished plans to copy from: get-title-at-url's (a library with a CLI) and seeded-random-utilities' (a deterministic library), both under `ai-docs/plans/` in those repositories.

```markdown
---
title: Modernization and vN release
kind: plan
status: active
date: YYYY-MM-DD
verified: YYYY-MM-DD
stale_after: never
tags: [vN, plan, <system>, github-actions, tests, release]
summary: "the living plan for <package> N.0.0: survey, what the old version gets wrong, decisions D1-Dn, the vN API, build and test strategy, phases 0-7 with checkboxes, dispositions, security, verification checklist"
---

# Modernization and vN.0.0 release plan: <package>

<One paragraph: what this is, where the evidence goes, which skill and reference run it follows.>

## Status

<One line: active, the phase reached and the date, and what it waits for. The everlast lint requires this heading in a plan.>

## Goal

<Three to five bullets: what the release must be true of (works from import and require with types; runs on every supported runtime; zero dependencies; the compatibility promise; released through trusted publishing with an approval).>

## Where it stands (survey YYYY-MM-DD)

| Fact | Value | Evidence |
|---|---|---|
| Published version, date, downloads a month, dependents | | survey note |
| Source, build, tests, language level | | |
| Entry points and how the old README says to call it | | |
| Runtime dependencies and distance from current | | |
| Issues, pull requests (by author and kind), forks | | |
| Dependabot alerts, webhooks, secrets, security features | | |
| Dead services (badge, config, webhook, app for each) | | |
| Leaked credentials | | |
| Baseline: old build and tests as they are | | |
| Golden capture: cases, quirks, claims confirmed or refuted | | |

## What the old version gets wrong, confirmed, and what vN does

<Numbered list. Each item: the behaviour, the input that shows it (from the capture), keep, fix or refuse in vN, and the changelog line it becomes.>

## Decisions (recommendation first; the maintainer rules in the plan review, silence means the recommendation stands)

| # | Question | Recommendation | Why | Alternative |
|---|---|---|---|---|
| D1 | The compatibility promise (what stays bit for bit, what the golden file proves, the rule for fixes) | | | |
| D2 | Export shape (require() result, exports map, types) | | | |
| D3 | Behaviour at the edges, per case | | | |
| D4 | Whether a major is warranted, and what a patch could do instead | | | |
| D5 | Runtime dependencies | | | |
| D6 | Names: kept, renamed with deprecated aliases, added (one sentence of why each) | | | |
| D7 | Errors: never throw or typed errors | | | |
| D8 | Node or framework floor and the CI matrix | | | |
| D9 | Language, build, lint, tests, coverage (the system's defaults unless argued otherwise) | | | |
| D10 | Lockfile and the old bot pull requests | | | |
| D11 | Dead services | | | |
| D12 | Old files to remove | | | |
| D13 | Release and version, rehearsal | | | |
| D14 | Default branch and optional extras | | | |
| D15 | Dependents: what the next run can rely on | | | |

## Proposed public API (vN)

<Signatures, types, what each throws; the map from every old name to its vN name; additions for the maintainer to trim.>

## Build and package specifics

<Output files; package.json or csproj shape; source layout; build config; anything the templates need changed.>

## Phases

### Phase 0: survey and baseline (YYYY-MM-DD, no package code changed)
- [ ] Cloned to <path>; survey script output in ai-docs/notes/...
- [ ] Old build and tests run as they are: <result>
- [ ] Golden capture from the published <old version> committed under test/golden/ with its script
- [ ] everlast registered (mode repo, sync push); AGENTS.md, CLAUDE.md (@AGENTS.md import), Copilot pointer
### Phase 1: plan
- [ ] This plan and the decision record. **Stop**: the maintainer rules on the table; questions: <deleting on GitHub, applying repo settings, enabling secret scanning>.
### Phase 2: rewrite on branch vN
- [ ] Remove <dead files>; add the templates; deny dev-only install scripts
- [ ] Golden test first, green on the first build; then src/, the rest of test/, README, CHANGELOG, SECURITY.md, AGENTS.md
- [ ] Verified on every supported runtime line and from a fresh clone (log)
- [ ] Workflows and Dependabot added, actionlint clean
- [ ] Pushed; pull request opened with a "For review" list. **Stop.**
### Phase 3: review
- [ ] Independent read-only review (prompts/review-subagent.md); findings fixed or answered; summary on the pull request
### Phase 4: CI, settings, merge, cleanup
- [ ] CI green (run id); ruleset on master; squash-merge after the maintainer's review (SHA)
- [ ] Alerts 0; old bot pull requests closed with one comment each; issues answered; webhooks removed (with the OK); repo settings; secret scanning and push protection; private vulnerability reporting; workflow permissions read
### Phase 5: release rehearsal
- [ ] The maintainer adds the trusted publisher (fields in the reference). **Stop.**
- [ ] N.0.0-beta.1 tagged and staged; **stop** for the approval; verified from the registry (run id)
### Phase 6: release
- [ ] Changelog dated; N.0.0 tagged and staged; **stop** for the approval; verified from the registry; GitHub Release; provenance
### Phase 7: wrap-up
- [ ] HANDOFF.md around standing work; inventory row; lessons into the skill; what the prompt got wrong

## Test strategy: every artifact, every runtime, and the behaviour itself

| Layer | What it proves | How | Runs where |
|---|---|---|---|

| Artifact | Runtime lines | Other OSes | Other runtimes | Bare engine |
|---|---|---|---|---|

## Pull requests, issues and forks: disposition

| Item | What it is | Disposition | Comment to post |
|---|---|---|---|

## Security

<Leaked tokens and their reach; webhooks; scanning; alerts; workflow permissions and pins; publishing; what the library does not do; private vulnerability reporting.>

## Verification checklist (what "done" means)

| Claim | Command or place | Expected |
|---|---|---|

## Risks and open points

## Appendix: cleanup commands (all paths absolute)

## Next single action
```

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md), [nuget.md](nuget.md), [../prompts/kickoff-skeleton.md](../prompts/kickoff-skeleton.md).
