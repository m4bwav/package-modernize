# Kickoff prompt skeleton

The prompt that starts a run in a fresh session. One file per package, kept outside the package repository (the maintainer's private record), with a status line at the top: **ready to paste**, **started <date>** (so nobody pastes it twice), **done <date>**. The facts in it come from the survey; the run re-verifies what it relies on, because a survey claim can be wrong (the seeded-random-utilities kickoff said the empty string was no seed; the golden capture proved it was one). Its last section is written by the run: what the prompt got wrong, for the next prompt writer.

Sections, in order:

```text
Modernize the <system> package <name> with the package-modernize skill: fix every bug, settle every pull request and issue with a real answer, move to current tooling and dependencies, make the library more useful, check everything for security problems, and leave the process better documented than you found it.

Repository: <URL> (<visibility>, default branch <name>; <system> package <name>, latest <version> from <date>, about <n> downloads a month, <n> dependents). Clone it to <local path>.

Read first, in this order:
1. The package-modernize skill (it loads by itself when you start; if not, read its SKILL.md), then <system>'s reference file in it.
2. <The reference run for this system: repo path, its AGENTS.md, ai-docs/HANDOFF.md and plan.>
3. <The maintainer's inventory or overlay, if any: where this package sits among the others.>

What the survey found on <date> (verify before relying on it):
- Code: <files, build, test runner, language level, package.json or csproj shape, entry points, how the old README says to call it>.
- Bugs and oddities: <misspellings, odd argument orders, wrong README claims, unbounded loops, dead branches, tests asserting the wrong bound, untested public methods>.
- Dependencies: <each runtime dependency, wanted range, latest, deprecated or not, and whether the package's observable behaviour depends on its internals>.
- Community: <issues, pull requests by author and kind, forks>.
- Security: <leaked tokens and where, webhooks with ids, security features off, alert counts, dead services with their badge, config file, webhook and OAuth app>.

Decisions the plan must settle (recommendation first; the maintainer rules in the plan review, and silence means the recommendation stands):
- <The compatibility promise: what the golden capture must prove, and the rule for fixes that would change an old result.>
- <Dependencies: keep, inline or replace, with the licence check.>
- <API: names kept, deprecated aliases, additions to propose with one sentence of why each; do not gold-plate. Check each requested fix against the promise before asking for both.>
- <Whether a major is warranted at all, and what a patch could do instead.>
- Everything else takes the skill's defaults for <system>.
- Version <n.0.0>, rehearsed as <n.0.0-beta.1>.

Work through the skill's phases in order, with its stops: the plan, the pull request, the trusted publisher, each staged approval. <Any extra stop or any stop the maintainer waives.>

Rules:
- Nothing reaches the registry without the maintainer. Never publish from this machine, never create or store a registry token, never approve anything on the registry's site. Workflows only stage or wait for approval.
- No AI attribution anywhere: no Co-Authored-By trailers, no "generated with" lines in commits, pull requests or files.
- Ask before anything the plan does not cover, before deleting anything on GitHub, and when a phase's verification fails twice.
- Keep ai-docs current: a log line with evidence per step, the plan's checkboxes, HANDOFF.md at every stop. Lessons go to the skill's LEARNINGS.md.
- <Platform notes: the skill's Windows traps apply; anything machine-specific from the overlay.>
- When your context passes about 60 percent, write HANDOFF.md and say to continue in a new session.

Remind the maintainer when one of their own tasks blocks you: <revoke tokens, remove OAuth apps, enable secret scanning, add the trusted publisher, approve staged versions>.

At the end: <the deliverables: release verified or stopped cleanly at a stop, HANDOFF.md, the inventory row, lessons in the skill, the next package>.
```

## What the run found wrong in this prompt

Written by the run, dated, one bullet per correction. Read it before writing the next prompt.

Related: builds on [../SKILL.md](../SKILL.md); see also [review-subagent.md](review-subagent.md), [../references/plan-skeleton.md](../references/plan-skeleton.md).
