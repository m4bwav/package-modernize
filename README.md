# package-modernize

![An old dusty wooden shipping crate being rebuilt by robotic arms into a sleek modern metal container, left half old and weathered, right half new and gleaming, workshop](https://raw.githubusercontent.com/m4bwav/package-modernize/master/.github/images/banner.jpg)

An agent skill that takes an old, published library from "last touched years ago" to a verified new release: survey and baseline, a golden capture of the published version's behaviour, a plan with a decisions table, a rewrite on a branch with tests for every artifact, an independent review, CI and repository cleanup (dead webhooks and badges, stale bot pull requests, unanswered issues, leaked tokens), a release rehearsal through the registry's trusted publishing with a human approval, verification from the registry, a GitHub wiki whose examples are verified against the release (written or updated with the [wikiwright](https://github.com/m4bwav/wikiwright) skill), and a handoff. The eight phases are the same for every package system; how each phase is done per system is a reference file. npm is complete, from two finished runs; NuGet is written from two runs plus current docs; PyPI, crates.io, Maven Central and Go modules are documented and marked unverified until a run uses them.

The skill is [skills/package-modernize/SKILL.md](skills/package-modernize/SKILL.md), an evergreen unit (research refresh on a schedule, changelog, learnings, eval suite) in pointer mode, maintained with the [evergreen plugin](https://github.com/m4bwav/evergreen-protocol). Nothing in the skill publishes: workflows stage or wait for an approval, and the maintainer approves each version on the registry.

## Layout

- `skills/package-modernize/SKILL.md`: the phases, the stops, the rules, the shared checklists, and the per-system table.
- `skills/package-modernize/references/`: one file per package system (npm, nuget, pypi, crates, maven, go) and the plan skeleton.
- `skills/package-modernize/scripts/`: survey scripts (npm, NuGet, GitHub), golden-capture templates, a line-ending check.
- `skills/package-modernize/templates/`: workflows, Dependabot, lint and build configs, AGENTS.md, SECURITY.md, the CLAUDE.md and Copilot pointers, and test scaffolds per system, with `{{PLACEHOLDER}}` tokens.
- `skills/package-modernize/prompts/`: the kickoff prompt skeleton and the review-subagent prompt.
- `ai-docs/`: session knowledge for agents (handoff, log, decisions); `AGENTS.md` holds the rules, `CLAUDE.md` imports it.

## Install (Claude Code)

As a plugin, from a clone:

```
git clone https://github.com/m4bwav/package-modernize
claude plugin marketplace add ./package-modernize
claude plugin install package-modernize@package-modernize
```

Or link the skill folder into the user skills folder, then start a new session:

```
mklink /J %USERPROFILE%\.claude\skills\package-modernize <this repo>\skills\package-modernize
```

On macOS or Linux: `ln -s <this repo>/skills/package-modernize ~/.claude/skills/package-modernize`. Other agents that read `.agents/skills/` can link the same folder there.

## Private overlay

Your own values (registry user, GitHub owner, author line, standing decisions, machine notes, the inventory of your packages) stay out of this repository. Put them in a markdown file and point the skill at it with the environment variable `PACKAGE_MODERNIZE_OVERLAY`, or place it at `~/.package-modernize/OVERLAY.md`. The skill reads it at the start of every run and it wins over the defaults.

## Privacy

package-modernize collects nothing for itself: there is no server, account or telemetry of its own. The skill is instructions for your agent, and its scripts run on your machine. A modernization run does go online, because its job is to read a package's public record and change the repository and registry entries you own. Each route below runs only in the phase that needs it.

GitHub, as you. The survey and cleanup scripts use the GitHub CLI with your own `gh` login. They read the repository's settings, branches, rulesets, issues, pull requests, webhooks and Dependabot alerts, and the names (never the values) of its Actions secrets and variables. With your approval, `post-merge-cleanup.sh --apply` closes pull requests, deletes dead webhooks and creates rulesets. `git` pushes branches and tags with your own git credentials, and `watch-run.sh` starts (when asked) and follows workflow runs. For a private repository, `add-self-hosted-runner.ps1` asks GitHub for a runner registration token through `gh` and downloads the official runner from GitHub's releases.

Package registries. `survey-npm.sh`, `check-next-tag-npm.sh` and `verify-registry-npm.sh` read registry.npmjs.org and api.npmjs.org, and install the published package into a scratch folder. `survey-nuget.sh` and `nuget-latest.py` read api.nuget.org and NuGet's search service. These reads are anonymous. Publishing happens in your repository's own workflows through the registry's trusted publishing, after you approve each version on the registry; the skill holds no npm or NuGet token and never asks for one. Commands that need your registry login, such as `npm deprecate`, are run by you or with the login you already have.

Tools fetched on first use, each at a pinned version: `lint-workflows.sh` downloads actionlint 1.7.12 and shellcheck 0.11.0 from their GitHub releases into `~/.cache/package-modernize/tools` and checks their sha256 digests, and runs zizmor 1.30.1 through `uvx`, which fetches it from PyPI. The references show other pinned launchers (`npx publint@0.3.25`, `npx -p @arethetypeswrong/cli@0.18.5 attw`, `npx -y -p node@20.20.2`, Fantomas 8.0.6) that download from npm or nuget.org when a run uses them. `check-readme-images.mjs` requests each image and badge URL in the README it checks, which go to whatever hosts that README names.

Golden captures stay local. When an old version makes requests, `capture-proxy.cjs` records them through a proxy on 127.0.0.1 with throwaway certificates.

Credentials and settings read: your `gh` login (through `gh` itself), your git credentials (through `git`), and the environment variables `PACKAGE_MODERNIZE_OVERLAY` (the path of your private overlay) and `PACKAGE_MODERNIZE_TOOLS` (the tool cache folder). The repository's own eval runner, `evals/run-headless.mjs`, starts headless Claude Code sessions with your existing Claude Code login; it is for developing the skill, not part of a run.

When the skill's research is due, the agent runs web searches and fetches public documentation with its own web tools; those requests carry search terms about package tooling, not your code. What is kept: the plan, survey output, notes and handoff in the target repository's `ai-docs/`, your overlay where you put it, and the tool cache. Whatever your AI app does with the conversation is covered by that app's own privacy policy.

## License

MIT, see [LICENSE](LICENSE).
