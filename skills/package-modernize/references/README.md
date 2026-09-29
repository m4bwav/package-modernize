# References

One file per package system, the same phases in each, plus the plan skeleton. [../SKILL.md](../SKILL.md) holds what is shared; read the system's file when a run reaches a phase.

- [npm.md](npm.md): read for any npm package; complete, from two finished runs (2026-09-24 and 25): survey, baseline traps, golden capture, the decision defaults with verified versions, tests per artifact, CI pins, trusted publishing in staged mode with the exact npmjs.com fields, verification, traps.
- [nuget.md](nuget.md): read for any NuGet package; from two runs plus current docs (2026-09-25): target frameworks, lock files across OSes, package metadata, Source Link and symbols, package validation, NuGetAudit, Trusted Publishing with a GitHub environment as the human gate, verification, what the reference still lacks.
- [pypi.md](pypi.md): read for a PyPI package; unverified until a run: pyproject and build backends, Trusted Publishing and PEP 740 attestations, TestPyPI rehearsal, yank and delete policy.
- [crates.md](crates.md): read for a crate; unverified until a run: edition 2024 and MSRV, cargo semver-checks, trusted publishing with the auth action, yank policy.
- [maven.md](maven.md): read for a Maven Central artifact; unverified until a run: the Central Publisher Portal (user tokens, no OIDC), GPG signing, the registry's own VALIDATED gate, immutability.
- [go.md](go.md): read for a Go module; unverified until a run: no publish step, the checksum database, retract and Deprecated directives, tag protection as the gate.
- [private-repo-ci.md](private-repo-ci.md): read in Phases 0 and 2 when the repository is or will be private; why its CI runs on the maintainer's own runner (GitHub bills private repositories' hosted minutes and storage), the runner setup, the workflow rules (`RUNS_ON`, setup actions only on hosted runners, `--ignore-scripts`, short artifacts, containers without Docker), and why npm publishing stays on a hosted runner.
- [plan-skeleton.md](plan-skeleton.md): read in Phase 1; the living plan's sections, the decisions table with the questions every run must settle, the phase checkboxes.

Related: builds on [../SKILL.md](../SKILL.md); see also [../templates/README.md](../templates/README.md), [../scripts/README.md](../scripts/README.md).
