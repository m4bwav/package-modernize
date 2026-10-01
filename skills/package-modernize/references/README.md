# References

One file per package system, the same phases in each, plus the plan skeleton. [../SKILL.md](../SKILL.md) holds what is shared; read the system's file when a run reaches a phase.

- [npm.md](npm.md): read for any npm package; complete, from two finished runs (2026-09-24 and 25): survey, baseline traps, golden capture, the decision defaults with verified versions, tests per artifact, CI pins, trusted publishing in staged mode with the exact npmjs.com fields, verification, traps.
- [nuget.md](nuget.md): read for any NuGet package; from two runs plus current docs (2026-09-25): target frameworks, lock files across OSes, package metadata, Source Link and symbols, package validation, NuGetAudit, Trusted Publishing with a GitHub environment as the human gate, verification, what the reference still lacks.
- [pypi.md](pypi.md): read for a PyPI package; unverified until a run: pyproject and build backends, Trusted Publishing and PEP 740 attestations, TestPyPI rehearsal, yank and delete policy.
- [crates.md](crates.md): read for a crate; unverified until a run: edition 2024 and MSRV, cargo semver-checks, trusted publishing with the auth action, yank policy.
- [maven.md](maven.md): read for a Maven Central artifact; unverified until a run: the Central Publisher Portal (user tokens, no OIDC), GPG signing, the registry's own VALIDATED gate, immutability.
- [go.md](go.md): read for a Go module; unverified until a run: no publish step, the checksum database, retract and Deprecated directives, tag protection as the gate.
- [private-repo-ci.md](private-repo-ci.md): read in Phases 0 and 2 when the repository is or will be private; why its CI runs on the maintainer's own runner (GitHub bills private repositories' hosted minutes and storage), the runner setup, the workflow rules (`RUNS_ON`, setup actions only on hosted runners, `--ignore-scripts`, short artifacts, containers without Docker), and why npm publishing stays on a hosted runner.
- [plan-skeleton.md](plan-skeleton.md): read in Phase 1; the questions every plan settles, then the living plan's sections, the decisions table, the phase checkboxes.
- [survey-and-golden.md](survey-and-golden.md): read at the start of Phase 0 and before the golden capture; what the survey records, and how the published version's behaviour is captured and protected.
- [readme-images.md](readme-images.md): read in Phases 0, 1 and 2 and at the verification; every badge and image in the README, found, decided and checked.
- [security.md](security.md): read in Phases 0, 1 and 2 and before Phase 5; leaked tokens, publishing hardening, workflow permissions, what the library must not do.
- [rewrite-and-review.md](rewrite-and-review.md): read before writing code in Phase 2 and before the Phase 3 review.
- [community.md](community.md): read in Phase 4 before answering issues or closing pull requests, branches and forks.
- [wrap-up.md](wrap-up.md): read in Phase 0 for the repository's documents and at the start of Phase 7; the wiki, the hand-over to wikiwright, the handoff and where lessons go.

The table below (moved from SKILL.md on 2026-09-30) compares the systems concern by concern; each system's file has the detail.

## How each phase is done, per system

| Concern | npm | NuGet | PyPI | crates.io | Maven Central | Go modules |
|---|---|---|---|---|---|---|
| Coverage | complete (two runs, 2026-09-24 and 25) | complete (TrailerClipper, 2026-09-27; two earlier runs) | docs only | docs only | docs only | docs only |
| Survey | `scripts/survey-npm.sh` | `scripts/survey-nuget.sh` | `pypi.org/pypi/NAME/json`, survey-github | `crates.io/api/v1/crates/NAME`, survey-github | `maven-metadata.xml`, search API, survey-github | proxy `@v/list`, pkg.go.dev, survey-github |
| Baseline | old scripts through Git Bash on Windows | old projects often will not build on the .NET 10 SDK; record it | venv, editable install, pytest | `cargo test` on the named toolchain | `mvn verify` on the named JDK | `go test ./...` on the `go` directive |
| Golden capture | `golden-capture-npm.template.cjs` | `golden-capture-nuget.template.cs` (C#; F# route in the reference), one recording per runtime | scratch venv, same shape | scratch crate, same shape | scratch project, same shape | scratch module, same shape |
| Build and language | TypeScript, tsdown dual build with types | multi-target csproj, Source Link, snupkg, deterministic, package validation | pyproject (PEP 621), one backend, `src/`, `py.typed` | edition 2024, MSRV, resolver 3 | POM with sources and javadoc jars, GPG | `go.mod` with `/vN` path, `go` directive |
| Tests per artifact | node:test against both builds, publint, attw, consumer fixtures, Bun and Deno | golden, NUnit or xunit.v3 on net10.0 and net48, package validation | pytest on every supported Python, `twine check` | cargo test, `cargo semver-checks`, `publish --dry-run` | tests plus japicmp or revapi | go test, gorelease |
| Lint and format | xo | dotnet format for C#, Fantomas for F# (dotnet format skips F# and exits 0), warnings as errors | ruff, mypy or pyright | fmt, clippy `-D warnings` | checkstyle or spotless | gofmt, vet, staticcheck |
| Dependency audit | `npm audit signatures`, `npm audit --omit=dev`, Dependabot | NuGetAudit with the audit-pipeline pattern, Dependabot `nuget` and `dotnet-sdk` | pip-audit, Dependabot `pip` or `uv` | cargo audit, cargo deny, Dependabot `cargo` | dependency-check, Dependabot `maven` | govulncheck, Dependabot `gomod` |
| Lockfile | `package-lock.json` v3, regenerated | `packages.lock.json` with `--locked-mode`, OS-independent | uv.lock or pinned requirements | Cargo.lock committed | none for a library | go.sum |
| CI matrix | Node 20, 22, 24, 26 on Linux plus Windows and macOS, Bun, Deno | Ubuntu and Windows, net10.0 and net48 | three OSes, every supported Python | stable, beta, MSRV, three OSes | supported JDKs, three OSes | two supported Go lines, three OSes |
| Release trigger | `v*` tag from `npm version` | `v*` tag equal to the csproj version, after green | `v*` tag | `v*` tag | `v*` tag | the tag is the release |
| Trusted publishing | yes, staged; workflow `release.yml` | yes, `NuGet/login@v1`, policy bound to `release.yml` and environment `nuget` | yes, `pypa/gh-action-pypi-publish` | yes, `crates-io-auth-action@v1` | no; Portal user token and GPG key as secrets | not applicable |
| Human gate before live | npm staged publishing, 2FA approval | GitHub environment with a required reviewer | GitHub environment; TestPyPI first | GitHub environment | the Portal's VALIDATED state | tag protection |
| Provenance and signing | provenance automatic, `npm audit signatures` | repository signing automatic; attest the nupkg; nuget.org shows no provenance yet | PEP 740 attestations by default | `trustpub_data` on the version, checksum | GPG `.asc` mandatory | sum.golang.org checksum log |
| Verify from the registry | `verify-published.yml`: fixtures on every platform, Bun, Deno, signatures, attestation | flat container, registration `listed`, `dotnet nuget verify`, a fresh consumer (workflow unverified) | JSON API, fresh venv, integrity API | API, fresh crate, checksum | `maven-metadata.xml`, fresh project, `gpg --verify` | `go list -m` through the proxy, `sum.golang.org/lookup` |
| Deprecate, unlist, yank | `npm deprecate` (maintainer, 2FA); unpublish limited | unlist or deprecate (maintainer, UI); no deletion | yank; deletion permanent | `cargo yank`; no deletion | immutable; relocation POM | `retract`, `// Deprecated:` |
| Reference | [npm.md](references/npm.md) | [nuget.md](references/nuget.md) | [pypi.md](references/pypi.md) | [crates.md](references/crates.md) | [maven.md](references/maven.md) | [go.md](references/go.md) |

Related: builds on [../SKILL.md](../SKILL.md); see also [../templates/README.md](../templates/README.md), [../scripts/README.md](../scripts/README.md).
