# Handoff

Updated 2026-09-25: the skill is built, tested (8/8, TESTS.md T-20260925-1) and committed locally; no GitHub repository exists yet. Read [log.md](log.md) for evidence and the decision entry under decisions/ for the layout.

## Current state

- `skills/package-modernize/`: SKILL.md (eight phases, shared checklists, per-system table, tools and prior art), references (npm complete; nuget from two runs plus docs; pypi, crates, maven, go unverified; plan-skeleton), scripts (survey-npm, survey-nuget, survey-github, two golden-capture templates, check-line-endings), templates/npm and templates/nuget, prompts (kickoff-skeleton, review-subagent), evergreen companions (tier fast, next due 2026-10-09), evals with the headless harness.
- Installed through the junction `~/.claude/skills/package-modernize`. The private overlay is read from `~/.package-modernize/OVERLAY.md` (a junction into the private companion repository, package-modernization).
- This repository is meant to be public (m4bwav/package-modernize). Before creating it: grep for owner names, user names, local paths and email addresses; the templates carry placeholders and the maintainer's values live in the overlay.

## Standing work

1. Create the GitHub repository when the maintainer says so, push `master`, and add the remote so everlast's sync can push the docs.
2. The first run of the skill (replace-string-at-position, npm) is its real test: fix the skill where it is silent, wrong or clumsy, and log each fix as a `C-` entry with the run's date.
3. The NuGet templates `release.yml`, `verify-published.yml` and the new `ci.yml` are unverified until a .NET run uses them; the two existing .NET libraries are the candidates.
4. Refresh due 2026-10-09 (`evergreen-refresh`); the research tracks are in RESEARCH.md.

## Next single action

Wait for the maintainer's decision on creating the two GitHub repositories; then run Part 2 of the 2026-09-25 kickoff (replace-string-at-position) from a fresh session with this skill.

## Dead ends hit

- A `sed -i` replacement containing Windows paths dropped their backslashes; the Edit tool restored them (L-008 in the skill).
- A YAML value starting with a `{{PLACEHOLDER}}` token parses as a flow mapping; the template quotes it.
- The evergreen `init` did not append its Maintenance section because SKILL.md already mentioned evergreen.json; the section was written by hand.
- Renaming the skill junction for the baseline made this session's roster show a skill named `package-modernize.off`; move the junction out of the skills folder instead next time.
