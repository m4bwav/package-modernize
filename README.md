# package-modernize

An agent skill that takes an old, published library from "last touched years ago" to a verified new release: survey and baseline, a golden capture of the published version's behaviour, a plan with a decisions table, a rewrite on a branch with tests for every artifact, an independent review, CI and repository cleanup (dead webhooks and badges, stale bot pull requests, unanswered issues, leaked tokens), a release rehearsal through the registry's trusted publishing with a human approval, verification from the registry, and a handoff. The eight phases are the same for every package system; how each phase is done per system is a reference file. npm is complete, from two finished runs; NuGet is written from two runs plus current docs; PyPI, crates.io, Maven Central and Go modules are documented and marked unverified until a run uses them.

The skill is [skills/package-modernize/SKILL.md](skills/package-modernize/SKILL.md), an evergreen unit (research refresh on a schedule, changelog, learnings, eval suite) in pointer mode, maintained with the [evergreen plugin](https://github.com/m4bwav/evergreen-protocol). Nothing in the skill publishes: workflows stage or wait for an approval, and the maintainer approves each version on the registry.

## Layout

- `skills/package-modernize/SKILL.md`: the phases, the stops, the rules, the shared checklists, and the per-system table.
- `skills/package-modernize/references/`: one file per package system (npm, nuget, pypi, crates, maven, go) and the plan skeleton.
- `skills/package-modernize/scripts/`: survey scripts (npm, NuGet, GitHub), golden-capture templates, a line-ending check.
- `skills/package-modernize/templates/`: workflows, Dependabot, lint and build configs, AGENTS.md, SECURITY.md, the CLAUDE.md and Copilot pointers, and test scaffolds per system, with `{{PLACEHOLDER}}` tokens.
- `skills/package-modernize/prompts/`: the kickoff prompt skeleton and the review-subagent prompt.
- `ai-docs/`: session knowledge for agents (handoff, log, decisions); `AGENTS.md` holds the rules, `CLAUDE.md` imports it.

## Install (Claude Code)

Link the skill folder into the user skills folder, then start a new session:

```
mklink /J %USERPROFILE%\.claude\skills\package-modernize <this repo>\skills\package-modernize
```

On macOS or Linux: `ln -s <this repo>/skills/package-modernize ~/.claude/skills/package-modernize`. Other agents that read `.agents/skills/` can link the same folder there.

## Private overlay

Your own values (registry user, GitHub owner, author line, standing decisions, machine notes, the inventory of your packages) stay out of this repository. Put them in a markdown file and point the skill at it with the environment variable `PACKAGE_MODERNIZE_OVERLAY`, or place it at `~/.package-modernize/OVERLAY.md`. The skill reads it at the start of every run and it wins over the defaults.

## License

MIT, see [LICENSE](LICENSE).
