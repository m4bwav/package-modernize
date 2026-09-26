# PyPI: how each phase is done

Coverage: **unverified until a run uses it.** Facts below were read on the primary pages (docs.pypi.org, packaging.python.org, peps.python.org, docs.astral.sh, docs.github.com) on 2026-09-25; RESEARCH.md keeps the sources. The phases and shared rules are in [../SKILL.md](../SKILL.md); only the PyPI column is here.

| Concern | PyPI |
|---|---|
| Survey | `https://pypi.org/pypi/PROJECT/json` (releases, per-file `yanked`, `requires_python`, `upload_time`), `https://pypi.org/pypi/PROJECT/VERSION/json`; downloads through pypistats.org or the BigQuery dataset; the GitHub side with `scripts/survey-github.sh`. |
| Baseline | `python -m venv`, install the old project in editable mode, run its tests (pytest or unittest); record which Python versions it claims and which it still imports on. |
| Golden capture | A scratch venv with `pip install PROJECT==OLD`; a script that calls every public function with normal, edge and odd inputs and writes JSON (the npm template's shape translates directly). |
| Package shape | `pyproject.toml` with PEP 621 `[project]` metadata (`name`, `version` or `dynamic`, `requires-python`, PEP 639 `license = "MIT"` plus `license-files`), one build backend (hatchling `>= 1.26`, setuptools `>= 77.0.3`, flit_core `>= 3.12.0, <5`, or pdm-backend `>= 2.4.0`); `src/` layout; type hints and a `py.typed` marker. |
| Python floor | Supported on 2026-09-25: 3.15 in prerelease (2026-10-01), 3.14 and 3.13 bugfix, 3.12 and 3.11 security, 3.10 security until 2026-10, 3.9 ended 2025-10-31. Floor `>=3.10` now, `>=3.11` defensible; test the matrix on every supported line. |
| Build and check | `python -m build` or `uv build` (`uv build --no-sources` before publishing); `twine check --strict dist/*`; smoke test `uv run --with PROJECT --no-project -- python -c "import PROJECT"`. |
| Lint and format | ruff (check and format) and a type checker (mypy or pyright); pre-commit optional. |
| Dependency audit | Dependabot `pip` (requirements, pyproject, Pipfile.lock, poetry.lock) or `uv` (uv.lock; version updates GA 2025-03-13); `pip-audit` (PyPI advisory data, `-r requirements.txt`, `--fix`) or `pypa/gh-action-pip-audit@v1.1.0`. |
| CI matrix | Ubuntu, Windows, macOS on every supported Python; `actions/setup-python@v6`. |
| Release trigger | A `v*` tag; a build job uploads `dist/` as an artifact; a publish job downloads it. |
| Trusted publishing | Exists, called Trusted Publishing; OIDC exchange for a 15-minute token. Fields on pypi.org (project, Publishing): repository owner, repository name, workflow filename, environment name (optional, strongly recommended). A project not yet on PyPI uses a "pending publisher" under the account, converted on first use (it does not reserve the name). Publish with `pypa/gh-action-pypi-publish@release/v1` in a job with `permissions: id-token: write` and `environment: pypi` (Linux runner; one call per job; not from a reusable workflow), or `uv publish` with `--trusted-publishing automatic`. |
| Human gate | None on PyPI itself. Use the GitHub environment's required reviewers on the publish job, and rehearse on TestPyPI (`repository-url: https://test.pypi.org/legacy/`) first. |
| Provenance | PEP 740 attestations: the publish action generates and uploads them by default since v1.11.0 (only through Trusted Publishing); consumers verify with `pypi-attestations verify pypi --repository REPO_URL WHEEL_URL` or read `GET /integrity/PROJECT/VERSION/FILENAME/provenance`. |
| Verify from the registry | `https://pypi.org/pypi/PROJECT/VERSION/json` lists the files; a fresh venv `pip install PROJECT==VERSION` on each Python line, then the golden answers; the provenance URL above. |
| Deprecate, yank, delete | Yank a release (installers skip it unless pinned with `==`; whole releases only; un-yank not documented); deletion is permanent and filenames are never reusable; no registry deprecation flag (the `Development Status :: 7 - Inactive` classifier is the convention). |
| Account | 2FA mandatory since 2024-01-01; Trusted Publishing removes stored tokens. |
| Dependabot | `package-ecosystem: pip` or `uv`; `github-actions` too. |

The verbatim publish step from the PyPI docs (checked 2026-09-25):

```yaml
jobs:
  pypi-publish:
    name: upload release to PyPI
    runs-on: ubuntu-latest
    environment: pypi
    permissions:
      id-token: write
    steps:
      # retrieve your distributions here (actions/download-artifact into dist/)
      - name: Publish package distributions to PyPI
        uses: pypa/gh-action-pypi-publish@release/v1
```

Open points for the first run: the exact `dist/` artifact names for attestation, whether `uv publish` or the action fits the repository better, and how `verify-published` reads the attestation.

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md).
