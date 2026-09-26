# Scripts

Deterministic helpers the skill runs; each prints the command it ran above its output, so the output is evidence for `ai-docs/log.md`. Bash scripts run in Git Bash on Windows and in any POSIX shell; the Node scripts need Node 20 or later; nothing here installs anything or writes to a registry.

- [survey-npm.sh](survey-npm.sh): run first in Phase 0 for an npm package; registry metadata, versions, attestations, downloads, dependents, the published tarball's file list, every runtime dependency's distance from current, then the GitHub side.
- [survey-nuget.sh](survey-nuget.sh): the same for a NuGet package id; flat-container versions, search entry (downloads, owners, deprecation), registration index (listed flags, target frameworks, dependencies per version), the nupkg's file list and nuspec, then the GitHub side.
- [survey-github.sh](survey-github.sh): the shared GitHub part (called by the two above, or alone): settings, security features, branches, rulesets, issues, pull requests, Dependabot alerts, webhooks, secrets, environments, workflows, forks, releases, dead-service files and badges.
- [golden-capture-npm.template.cjs](golden-capture-npm.template.cjs): copy into a scratch project that installed the published old version; records every public method's answers, odd inputs included, as the JSON the golden test asserts.
- [golden-capture-nuget.template.cs](golden-capture-nuget.template.cs): the same as a console Program.cs for a NuGet package (unverified by a run).
- [check-line-endings.mjs](check-line-endings.mjs): counts byte 13 in files, since Git Bash's grep cannot; run before every commit on Windows.

Related: builds on [../SKILL.md](../SKILL.md); see also [../templates/README.md](../templates/README.md).
