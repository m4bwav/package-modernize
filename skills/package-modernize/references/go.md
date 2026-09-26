# Go modules: how each phase is done

Coverage: **unverified until a run uses it.** Facts read on go.dev (modules reference, publishing guide, checksum database), pkg.go.dev, proxy.golang.org and docs.github.com on 2026-09-25; RESEARCH.md keeps the sources. Phases and shared rules: [../SKILL.md](../SKILL.md). Go has no registry account, token or publish step: the module proxy fetches from the repository when a tag is requested, so "release" is a tag push and the gate is whoever may push tags.

| Concern | Go modules |
|---|---|
| Survey | `https://proxy.golang.org/MODULE/@v/list` (versions the proxy has seen), `@v/VERSION.info`, `.mod`, `.zip`, `MODULE/@latest`; pkg.go.dev for importers and documentation; the GitHub side with `scripts/survey-github.sh`. |
| Baseline | `go build ./...`, `go vet ./...`, `go test ./...` with the toolchain the `go` directive names; record the directive and the Go versions the code compiles on. |
| Golden capture | A scratch module requiring the exact old version, a `main` that calls every exported function with normal, edge and odd inputs and writes JSON. |
| Package shape | `go.mod` with the module path (a `/v2` suffix for major 2 and up, the subdirectory strategy recommended), the mandatory `go` directive (the minimum version; keep it at most 1.26 in September 2026), optional `toolchain`; doc comments on every exported identifier; examples in `_test.go` files; no `vendor/` unless needed. Supported Go on 2026-09-25: 1.27 (1.27.1) and 1.26 (1.26.8); 1.25 out of support. |
| Build and check | `gofmt -l`, `go vet`, `staticcheck`, `golangci-lint`; `go test -race ./...`; `gorelease` (`golang.org/x/exp/cmd/gorelease`) for the API-compatibility and version suggestion against the previous tag. |
| Dependency audit | Dependabot `gomod` (go.mod and go.sum); `govulncheck ./...` (reachable vulnerabilities only, from vuln.go.dev; `golang/govulncheck-action@v1`). |
| CI matrix | The two supported Go lines on Ubuntu, Windows, macOS (`actions/setup-go` with `go-version-file: go.mod`). |
| Release trigger | `go mod tidy`, `go test ./...`, a dated changelog, then `git tag vX.Y.Z` and `git push origin vX.Y.Z` after `master` is green. Never move or reuse a tag. |
| Trusted publishing | Not applicable: nothing to publish to. The trust model is the repository host plus the checksum database. |
| Human gate | Tag protection: a ruleset that lets only the maintainer create `v*` tags, or a tag-creating workflow behind an environment with a required reviewer. |
| Provenance | `sum.golang.org` records every `go.sum` line in a transparency log (Merkle tree); `GOSUMDB` verification is on by default since Go 1.13; `GOFLAGS=-mod=mod` is never needed for consumers. GitHub artifact attestations apply only to binaries a release ships, not to the module. |
| Verify from the registry | `GOPROXY=proxy.golang.org go list -m MODULE@VERSION` (the proxy serves a new version within about a minute, up to 30 minutes if it was requested before the tag existed); `https://proxy.golang.org/MODULE/@v/list`; pkg.go.dev adds versions every few minutes (the Request button or fetching the `.info` URL triggers it); `https://sum.golang.org/lookup/MODULE@VERSION` returns the checksum lines; a fresh module requiring the version builds and gets the golden answers. |
| Retract, deprecate | A new higher version whose `go.mod` carries `retract ( vX.Y.Z // reason )` hides the bad version from `@latest` and `go list -m -versions`; a `// Deprecated: use MODULE/v2 instead.` comment above the `module` line is shown by `go get` and `go list -m -u` (Go 1.17+); the proxy never deletes a version it has cached. |
| Account | None; protect the repository (2FA on GitHub, signed tags optional, tag rulesets). |
| Dependabot | `package-ecosystem: gomod`, plus `github-actions`. |

Open points for the first run: gorelease's verdict as the major-version decision input, the `/v2` subdirectory versus branch strategy for a small library, and whether to ship a release binary (which would bring attestations back in).

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md).
