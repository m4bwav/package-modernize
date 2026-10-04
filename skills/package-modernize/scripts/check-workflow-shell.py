#!/usr/bin/env python3
"""Check every multi-line `run: |` block in GitHub Actions workflows with shellcheck (errors only).

actionlint only checks shell when shellcheck is on PATH; without it a truncated line
(`[ "$a" = "true"` with no closing bracket) passes, and `bash -n` passes it too because
`[` is a command. It then fails only in the workflow run (L-030).

shellcheck comes from PATH, else `uvx --from shellcheck-py==0.11.0.1 shellcheck` (no install; pinned, as
lint-workflows.sh pins shellcheck 0.11.0).
Without either, the script falls back to `bash -n` and says it cannot see this class of bug.

Usage: python check-workflow-shell.py [REPO_DIR]   (default: the current directory)
Exit 0 when every block passes, 1 otherwise.
"""
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile

root = sys.argv[1] if len(sys.argv) > 1 else "."
# Given workflow files instead of the repository, it used to find nothing and exit 0 (FizzBuzzPlus, 2026-09-29).
if len(sys.argv) > 2 or not os.path.isdir(os.path.join(root, ".github", "workflows")):
    print(f"usage: python check-workflow-shell.py [REPO_DIR]; no .github/workflows under {root!r}")
    sys.exit(2)


SHELLCHECK_PY = "shellcheck-py==0.11.0.1"  # pinned: the package uvx runs (2026-10-03)


def find_checker():
    if shutil.which("shellcheck"):
        return ["shellcheck", "-S", "error", "-s", "bash"]
    if shutil.which("uvx"):
        probe = subprocess.run(["uvx", "--from", SHELLCHECK_PY, "shellcheck", "--version"], capture_output=True, text=True)
        if probe.returncode == 0:
            return ["uvx", "--from", SHELLCHECK_PY, "shellcheck", "-S", "error", "-s", "bash"]
    return None


checker = find_checker()
if not checker:
    print("warning: no shellcheck (PATH or uvx); falling back to bash -n, which misses unclosed [ tests")

failed = 0
for path in sorted(glob.glob(os.path.join(root, ".github", "workflows", "*.y*ml"))):
    lines = open(path, encoding="utf8").read().split("\n")
    i = checked = 0
    while i < len(lines):
        m = re.match(r"^(\s*)(- )?run: [|>][-+]?\s*$", lines[i])
        if not m:
            i += 1
            continue
        indent = len(m.group(1)) + (2 if m.group(2) else 0)
        start = i + 1
        body = []
        i += 1
        while i < len(lines) and (lines[i].strip() == "" or len(lines[i]) - len(lines[i].lstrip()) > indent):
            body.append(lines[i])
            i += 1
        # YAML removes the block's indentation (that of its first line) before the shell sees it.
        first = next((line for line in body if line.strip()), "")
        cut = len(first) - len(first.lstrip())
        text = "\n".join(line[cut:] for line in body)
        # Expressions become a quoted word so the shell sees a plain argument.
        src = re.sub(r"\$\{\{.*?\}\}", '"X"', text) + "\n"
        checked += 1
        if checker:
            with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False, encoding="utf8", newline="\n") as f:
                f.write(src)
            result = subprocess.run(checker + [f.name], capture_output=True, text=True)
            os.unlink(f.name)
            output = result.stdout.strip()
        else:
            result = subprocess.run(["bash", "-n"], input=src, text=True, capture_output=True)
            output = result.stderr.strip()
        if result.returncode:
            failed += 1
            print(f"{path}: run block starting at line {start}:\n{output}\n")
    print(f"{path}: {checked} run blocks checked")
sys.exit(1 if failed else 0)
