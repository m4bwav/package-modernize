# Handoff

Updated 2026-09-25: the skill is public at github.com/m4bwav/package-modernize (created 2026-09-25 with the maintainer's OK) and its first real run, on replace-string-at-position, has reached the plan-review stop. The run fixed the skill as C-20260925-3. Read [log.md](log.md) for evidence and the decision entry under decisions/ for the layout.

## Current state

- `skills/package-modernize/`: SKILL.md (eight phases, shared checklists, per-system table, tools and prior art), references (npm complete; nuget from two runs plus docs; pypi, crates, maven, go unverified; plan-skeleton), scripts (survey-npm, survey-nuget, survey-github, two golden-capture templates, check-line-endings), templates/npm (now with test/golden/codec.cjs) and templates/nuget, prompts (kickoff-skeleton, review-subagent), evergreen companions (tier fast, confirmed by the maintainer; next due 2026-10-09), evals with the headless harness.
- Installed through the junction `~/.claude/skills/package-modernize`. The private overlay is read from `~/.package-modernize/OVERLAY.md` (a junction into the private companion repository, github.com/m4bwav/package-modernization).
- C-20260925-3: `survey-npm.sh` never reached its GitHub half when given OWNER/REPO (unbound variable), and eval action-1 could not see it; fixed, and the harness can now require output content (`and: file_contains`). The golden capture lost NaN, Infinity and -0 through a JSON round trip; `codec.cjs` fixes it. Dependents are listed by name; maintainers' emails are masked; lint traps documented.

## Standing work

1. Continue the replace-string-at-position run past the plan review (its HANDOFF has the state); log each skill fix as a `C-` entry with the run's date.
2. action-1 re-graded 2/2 after the evidence change (T-20260925-2); a fresh run of it may copy webhook ids from the package repository's committed survey note, so re-baseline it on another package when convenient.
3. The NuGet templates `release.yml`, `verify-published.yml` and the new `ci.yml` are unverified until a .NET run uses them; the two existing .NET libraries are the candidates.
4. Future scope (maintainer, 2026-09-26): after the packages, the skill will be run on repositories that were never published (example sites). It needs a variant without the registry phases (5 and 6), where the golden capture is screenshots or recorded HTML and the outcome is a deploy or an archive; write it as a reference only after its first real run.
5. Refresh due 2026-10-09 (`evergreen-refresh`); the research tracks are in RESEARCH.md.

## Next single action

When the maintainer has ruled on the replace-string-at-position plan, start its Phase 2 with this skill, beginning with the golden test from `templates/npm/test/golden/golden.test.template.js`.

## Dead ends hit

- A `sed -i` replacement containing Windows paths dropped their backslashes; the Edit tool restored them (L-008 in the skill).
- A YAML value starting with a `{{PLACEHOLDER}}` token parses as a flow mapping; the template quotes it.
- The evergreen `init` did not append its Maintenance section because SKILL.md already mentioned evergreen.json; the section was written by hand.
- Renaming the skill junction for the baseline made this session's roster show a skill named `package-modernize.off`; move the junction out of the skills folder instead next time.
- `ls -R` hides the templates' dotfiles (`.github/`, `.gitignore`); list them with `find -name ".*"`.
