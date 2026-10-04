---
title: "Skill layout: public skill repository, private overlay, eight phases, one reference per system, tier fast"
kind: decision
status: active
date: 2026-09-25
verified: 2026-09-25
stale_after: never
tags: [layout, evergreen, overlay, phases, public-private]
summary: "read before moving the skill, changing the phase list or the overlay mechanism: why the skill is public with a private overlay, why eight phases, why one reference per system, why tier fast, and what was rejected"
---

# Skill layout: public skill repository, private overlay, eight phases, one reference per system, tier fast

## Context

Two npm packages had been modernized by hand from a playbook (get-title-at-url 3.0.0 and seeded-random-utilities 2.0.0, 2026-09-24 and 25) and two NuGet libraries separately; the playbook's section 10 judged the method ready to become a skill, and the kickoff prompt of 2026-09-25 asked for one that covers npm, NuGet and other systems, to be tested first on the smallest package. The maintainer added, mid-session, that the skill should be evergreen, that similar skills should be studied first, and that they wanted a public repository for most of the skill and a private one for details they did not want public.

## Decision

The skill lives in its own public repository, package-modernize (skill folder skills/package-modernize, junctioned into the user skills folder), and everything about the maintainer stays in a private companion repository (the inventory, the kickoff prompts, the playbook as the record, and an overlay the skill reads at run time through ~/.package-modernize/OVERLAY.md or the PACKAGE_MODERNIZE_OVERLAY variable). The skill is one SKILL.md with eight phases that hold for every package system, one reference file per system (npm complete, NuGet from two runs plus docs, PyPI, crates.io, Maven Central and Go documented and marked unverified), scripts for the survey and the golden capture, templates per system with placeholder tokens, and the two prompts. It is an evergreen unit in pointer mode, tier fast (14 days to start). Neither GitHub repository exists yet; both are local until the maintainer says which to create.

## Reasons

- The maintainer asked for a public skill and a private companion: the templates and phases are general, while the identities, an old unrevoked token, the package inventory and the machine notes are not. An overlay file read at Step 0 keeps one skill text for both cases and lets another user supply their own overlay.
- Eight phases rather than the playbook's five stages, because the two npm runs stopped at the plan, the pull request, the trusted publisher and each approval, and the review before the merge was where twelve issues were found; the phases put each stop and the review where they happened.
- One reference per system instead of one file with columns, because the npm column is 200 lines and the others are short; the per-system table in SKILL.md is the column view.
- Tier fast: npm staged publishing (May 2026), the NuGet key-lifetime change (August 2026) and tsdown's pre-1.0 releases changed the method within months; a two-week refresh is cheaper than a wrong default in a run.
- Templates copied from the finished runs with placeholders rather than rewritten, because the runs verified them; the NuGet release, verify and CI workflows are new and say so.

## Alternatives rejected

- One private repository holding everything: the skill would not be shareable and the tooling survey showed nothing else covers the producer-side chain.
- A public repository plus a private fork, as evergreen does: a fork carries the whole history and makes it easy to push private text upstream by mistake; an overlay file cannot.
- Keeping the playbook as SKILL.md: it is npm-only and written for one maintainer; it stays as the record.
- Tier moderate: plausible, but three registry changes in five months argue for fast; the schedule lengthens by itself if refreshes stay quiet.

Related: builds on the playbook in the private repository (the private companion repository's playbook.md); see also the kickoff prompt of 2026-09-25 there.
