# crates.io: how each phase is done

Coverage: **unverified until a run uses it.** Facts read on crates.io's docs (the Svelte source of the trusted-publishing and data-access pages), the Cargo book, the crates.io blog and RFC 3691 on 2026-09-25; RESEARCH.md keeps the sources. Phases and shared rules: [../SKILL.md](../SKILL.md).

| Concern | crates.io |
|---|---|
| Survey | `https://crates.io/api/v1/crates/NAME` (max and newest version, per-version `num`, `yanked`, `checksum`, `rust_version`, `edition`, `published_by`, `trustpub_data`); one request a second with an identifying `User-Agent`; the sparse index `https://index.crates.io/`; reverse dependencies on the crate page; the GitHub side with `scripts/survey-github.sh`. |
| Baseline | `cargo build`, `cargo test`, `cargo doc` on the old code with its `rust-version` or the toolchain it names; record the MSRV it actually needs. |
| Golden capture | A scratch binary crate depending on `NAME = "=OLD"` that calls every public item with normal, edge and odd inputs and writes JSON. |
| Package shape | Edition 2024 (default of `cargo new` since Rust 1.85.0, 2025-02-20; `cargo fix --edition`), `rust-version` (MSRV) with resolver 3, required metadata (`license` or `license-file`, `description`, `repository`, `readme`, `keywords`, `categories`); `#![deny(missing_docs)]` for a library; features documented. Stable Rust on 2026-09-25: 1.98.1. |
| Build and check | `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test`, `cargo doc --no-deps`, `cargo publish --dry-run` (same as `cargo package`), `cargo package --list`; `cargo semver-checks` (`obi1kenobi/cargo-semver-checks-action@v2`) against the published version for the API-compatibility check. |
| Dependency audit | Dependabot `cargo` (Cargo.toml and Cargo.lock); `cargo audit` (RustSec; `rustsec/audit-check`), `cargo deny check` (advisories, bans, licences, sources). Cargo.lock is committed for a library too since Cargo tracks it by default; consumers ignore it. |
| CI matrix | stable, beta and the MSRV on Ubuntu, Windows, macOS. |
| Release trigger | A `v*` tag after `master` is green. |
| Trusted publishing | Exists (RFC 3691, launched 2025-07-11; GitLab in beta since 2026-01-21); tokens last 30 minutes. Prerequisites: the crate already exists (first publish uses an API token) and you own it. Fields (crate Settings, Trusted Publishing, Add, GitHub): repository owner, repository name, workflow filename, environment (optional). Workflow: `rust-lang/crates-io-auth-action@v1` (v1.0.5, 2026-06-16) with `permissions: id-token: write`, then `cargo publish` with `CARGO_REGISTRY_TOKEN: ${{ steps.auth.outputs.token }}`; a post step revokes the token. Enforcement mode disables API-token publishing for the crate. |
| Human gate | None on the registry; the docs recommend a `release` environment with required reviewers and tag-only triggers. `cargo publish --dry-run` in the build job is the rehearsal; there is no test registry. |
| Provenance | Out of scope of the RFC; the version records `published_by` and `trustpub_data` (repository, run id) when published through trusted publishing, and a SHA-256 checksum in the API and the index. |
| Verify from the registry | The API URL above shows the version; a fresh crate depending on `NAME = "=VERSION"` builds and gets the golden answers; the checksum matches `cargo package`'s. Index appearance time is not documented; `cargo publish` itself polls the index. |
| Yank, delete, deprecate | `cargo yank --version X` (and `--undo`) hides a version from new resolutions without deleting it; publishing is permanent; owner deletion only within 72 hours, or with a single owner, under 1000 downloads a month and no dependents; no deprecation flag (README and `#[deprecated]` on items are the convention; RustSec for vulnerabilities). |
| Account | GitHub login only, so GitHub's 2FA applies; trusted publishing removes stored tokens. |
| Dependabot | `package-ecosystem: cargo`, plus `github-actions`. |

The verbatim publish workflow from the crates.io docs (checked 2026-09-25; add `contents: read` when checking out):

```yaml
name: Publish to crates.io
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    environment: release
    permissions:
      id-token: write
    steps:
      - uses: actions/checkout@v6
      - uses: rust-lang/crates-io-auth-action@v1
        id: auth
      - run: cargo publish
        env:
          CARGO_REGISTRY_TOKEN: ${{ steps.auth.outputs.token }}
```

Open points for the first run: how `cargo semver-checks` fits the golden layer, whether the first publish of a never-published crate needs a token (yes per the docs), and the index delay for the verify step.

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md).
