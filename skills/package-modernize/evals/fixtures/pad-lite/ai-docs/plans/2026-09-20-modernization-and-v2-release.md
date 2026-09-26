---
title: pad-lite modernization and 2.0.0 release
status: in progress
summary: Plan for the v2 rewrite of pad-lite; Phase 2 in progress.
---

# pad-lite: modernization and 2.0.0 release

## Status

- 2026-09-20: Phases 0 and 1 done; the maintainer ruled on every decision below ("the recommendations stand").
- 2026-09-21: Phase 2 in progress on branch v2.

## Decisions

| # | Question | Recommendation | Why | Alternative |
|---|---|---|---|---|
| D1 | The compatibility promise | Every answer 1.0.2 gave stays exact in 2.x, the overshoot with a multi-character filler and `String(null)` as a filler included; the golden file proves it; any fix goes under a new name | 214 dependents' code relies on these answers; nobody asked for a fix | Adopt `padStart` semantics in a major (rejected by the maintainer, 2026-09-20) |
| D2 | Export shape | `module.exports = padLite`, unchanged | plain `require()` keeps working | Named export only |
| D3 | Runtime floor | Node 20 | the oldest line still supported | Node 18 |

## Phases

### Phase 0: survey and baseline (2026-09-20)
- [x] Golden capture from the published 1.0.2 committed under test/golden/ with its script
### Phase 1: plan
- [x] This plan. The maintainer ruled 2026-09-20.
### Phase 2: rewrite on branch v2
- [x] Golden test first, green on the first build; then src/
- [ ] Verified on every supported runtime line (log)
- [ ] Pushed; pull request opened with a "For review" list. **Stop.**
