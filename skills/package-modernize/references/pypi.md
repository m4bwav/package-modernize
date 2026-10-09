# PyPI: how each phase is done

Coverage: **one run through Phase 4** (repo-traffic, 2026-10-08, "First run" below); the release path is unproven until its first tag publishes. Facts below were read on the primary pages (docs.pypi.org, packaging.python.org, peps.python.org, docs.astral.sh, docs.github.com) on 2026-09-25; RESEARCH.md keeps the sources. The phases and shared rules are in [../SKILL.md](../SKILL.md); only the PyPI column is here.

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

## First run: repo-traffic, a single-file command-line tool (2026-10-08)

Proven through Phase 4 (review, CI on three OSes, settings); the release path (Phases 5 and 6) is written and linted, and is proven only when its first tag publishes. Templates from it: [../templates/pypi/](../templates/pypi/) (ci.yml, release.yml, dependabot.yml, requirements-dev.txt, check_size.py).

- **Never published, so the frozen source is the reference** (L-139 `frozen-source-reference`): copy the last old commit's file to `tests/golden/original/`, check its git blob id in the capture script (sha1 of `blob <len>\0<bytes>`; no git needed), mark the folder `-text`, and exclude `tests/golden` from ruff so a format run never touches it.
- **A tool that calls a CLI and HTTPS APIs is captured as a process** (L-160 `python-tool-golden-harness`): a harness runs the script through a shim (`python shim.py SCRIPT ARGS`) that fixes the clock (a copy of the `datetime` module whose `date.today` and `datetime.now` are overridden, put in `sys.modules` before the script runs), records `time.sleep` instead of sleeping, installs a urllib opener whose `https_open` sends every request to a local `http.server` with the original host in a header, and refuses sockets to anything but 127.0.0.1. The CLI (`gh` here) is a fake on PATH: on Windows `subprocess` finds only `.exe` files, so build one with pip's launcher maker (`pip._vendor.distlib.scripts.ScriptMaker(...).make("gh = fakegh:main")`); on POSIX a shebang script. The record per run: exit code, stdout, the last stderr line, every CLI call, every request, every sleep, and every file written, with the work folder replaced by `<WORK>`. The same harness replays the new script, so the golden test is the capture run again.
- **One recording per newline convention**: Python's text mode writes CRLF on Windows and the csv module CRLF everywhere, so record `windows` and `posix` separately (WSL gives Linux locally when it has Python; macOS replays the posix recording, checked in CI). Exceptions to the recording are files per OS too, written by the golden test from its own difference list (an environment variable), reviewed, and compared with each other after normalising CRLF (L-161 `exceptions-per-os`). WSL's distribution Python may lack pip and venv (`ensurepip` missing): write the posix file on GitHub's runners with a throwaway workflow on a scratch branch, upload it as an artifact, check its hash against the log, delete the branch.
- **Single module packaging**: hatchling with `[tool.hatch.build.targets.wheel] only-include = ["MODULE.py"]`, the version read from `__version__` (`[tool.hatch.version] path`), `[project.scripts] NAME = "MODULE:cli"`. A file run (`python MODULE.py`) and the console command can resolve settings differently (the script's folder against the current folder); test both.
- **Python floor 3.9 still has an audience**: macOS's own `/usr/bin/python3` is 3.9 (Xcode command line tools). pytest 9 and coverage 7.11 and later need 3.10: pin `pytest==8.4.2` and `coverage==7.10.7` behind `python_version < "3.10"` markers; ruff, build and twine run only on the newest line (L-162 `pytest9-needs-310`). argparse on 3.9 titles the option list "optional arguments:" (3.10 and later "options:"): build the parser with `add_help=False` and one named group so `--help` is the same everywhere (L-163 `argparse-help-title`). Python 3.10 reached end of life on 2026-10-01.
- **Action pins** (checked 2026-10-08): `actions/setup-python` v7.0.0 `5fda3b95a4ea91299a34e894583c3862153e4b97` (node24), `pypa/gh-action-pypi-publish` v1.14.2 `dc37677b2e1c63e2034f94d8a5b11f265b73ba33`.
- **PyPI account order**: the account's Publishing page redirects to two-factor setup until 2FA is on, and asks for the password again for sensitive pages. Both are the maintainer's hands; ask for 2FA and the pending publisher together at the plan review (L-165 `pypi-2fa-first`).
- **Rehearse on real PyPI with a beta** (`1.0.0b1`, tag `v1.0.0b1`): installers skip prereleases unless pinned, so no TestPyPI account is needed. The release workflow's prerelease test is `(a|b|rc|dev)[0-9]+$` on the version.
- **A Release made with the GITHUB_TOKEN starts no other workflow** (L-144): the verify job lives in release.yml after the GitHub Release job, and polls PyPI for the new version before installing it.

Related: builds on [../SKILL.md](../SKILL.md); see also [npm.md](npm.md).
