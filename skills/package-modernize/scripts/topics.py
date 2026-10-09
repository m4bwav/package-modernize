#!/usr/bin/env python3
"""GitHub topics for a repository (package-modernize, Phases 0, 1 and 4). Read-only; it prints the edit command, never runs it.

Usage:
  topics.py audit OWNER [--min N]   repositories (not forks, not archived) with fewer than N topics (default 5)
  topics.py suggest OWNER/REPO      the evidence for choosing topics: description, languages, manifest keywords,
                                    README title, current topics, and candidate topics from language and manifests
  topics.py check OWNER/REPO        exit 1 unless the topics are valid, 5 to 20 of them, and include the registry keywords

Needs gh (logged in). GitHub's rules (docs.github.com, "Classifying your repository with topics", checked 2026-10-08):
lowercase letters, numbers and hyphens, 50 characters or fewer, at most 20; topic names are public even on a private
repository, so a private one gets generic terms only (no client, person, host or internal project names).
"""
import base64
import json
import re
import subprocess
import sys

TOPIC_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,49}$")
MIN_TOPICS, MAX_TOPICS = 5, 20
# GitHub's featured-topic spellings for the languages it reports.
LANGUAGE_TOPICS = {
    "C#": "csharp", "F#": "fsharp", "JavaScript": "javascript", "TypeScript": "typescript", "Python": "python",
    "PowerShell": "powershell", "HTML": "html", "CSS": "css", "Go": "go", "Rust": "rust", "Java": "java",
    "Shell": "shell", "ShaderLab": "shaders", "HLSL": "hlsl",
}
MANIFESTS = ("package.json", "pyproject.toml", "Cargo.toml", "plugin.json", ".claude-plugin/plugin.json")


def gh(*args, check=True):
    p = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    if check and p.returncode != 0:
        sys.exit(f"gh {' '.join(args)} failed: {p.stderr.strip()}")
    return p.stdout


def file_text(repo, path):
    out = subprocess.run(["gh", "api", f"repos/{repo}/contents/{path}", "--jq", ".content"],
                         capture_output=True, text=True, encoding="utf-8")
    if out.returncode != 0 or not out.stdout.strip():
        return None
    return base64.b64decode(out.stdout.strip()).decode("utf-8", "replace")


def to_topic(word):
    t = re.sub(r"[^a-z0-9]+", "-", word.strip().lower().replace("#", "sharp").replace(".net", "dotnet")).strip("-")
    return t[:50] if t else None


def manifest_keywords(repo):
    """Keywords the registry shows, by manifest. Topics should carry the same terms (L-167 `topics-match-registry`)."""
    found = {}
    tree = gh("api", f"repos/{repo}/git/trees/HEAD?recursive=1", "--jq", ".tree[].path", check=False).splitlines()
    for path in tree:
        name = path.rsplit("/", 1)[-1]
        if path.count("/") > 2 or "node_modules/" in path or "/test" in path.lower():
            continue
        text = None
        if path in MANIFESTS or name in ("package.json", "plugin.json") and path.count("/") <= 1:
            text = file_text(repo, path)
            if text and name.endswith(".json"):
                try:
                    kw = json.loads(text).get("keywords") or []
                except (ValueError, AttributeError):
                    kw = []
                if kw:
                    found[path] = kw
                continue
        if name.endswith((".csproj", ".fsproj")) or name in ("pyproject.toml", "Cargo.toml", "Directory.Build.props"):
            text = text or file_text(repo, path)
            if not text:
                continue
            m = re.search(r"<PackageTags>([^<]*)</PackageTags>", text)
            if m:
                found[path] = [w for w in re.split(r"[\s;,]+", m.group(1)) if w]
            m = re.search(r"(?m)^keywords\s*=\s*\[([^\]]*)\]", text)
            if m:
                found[path] = re.findall(r"\"([^\"]+)\"", m.group(1))
    return found


def view(repo):
    return json.loads(gh("repo", "view", repo, "--json",
                         "name,description,repositoryTopics,isPrivate,isArchived,isFork,homepageUrl"))


def current_topics(info):
    return [t["name"] for t in (info.get("repositoryTopics") or [])]


def audit(owner, minimum):
    rows = json.loads(gh("repo", "list", owner, "--limit", "1000", "--no-archived", "--source", "--json",
                         "nameWithOwner,isPrivate,repositoryTopics,primaryLanguage"))
    short = [(len(r["repositoryTopics"] or []), r) for r in rows if len(r["repositoryTopics"] or []) < minimum]
    for n, r in sorted(short, key=lambda x: (x[0], x[1]["nameWithOwner"].lower())):
        lang = (r.get("primaryLanguage") or {}).get("name", "-")
        print(f"{n:2}  {'private' if r['isPrivate'] else 'public '}  {lang:12}  {r['nameWithOwner']}")
    print(f"\n{len(short)} of {len(rows)} source repositories have fewer than {minimum} topics.")


def suggest(repo):
    info = view(repo)
    langs = json.loads(gh("api", f"repos/{repo}/languages"))
    print(f"# Topics evidence: {repo} ({'private: generic terms only' if info['isPrivate'] else 'public'})")
    print(f"description: {info.get('description') or '(none)'}")
    print(f"homepage: {info.get('homepageUrl') or '(none)'}")
    print(f"current topics: {', '.join(current_topics(info)) or '(none)'}")
    total = sum(langs.values()) or 1
    print("languages: " + (", ".join(f"{k} {100 * v // total}%" for k, v in langs.items()) or "(none)"))
    readme = file_text(repo, "README.md") or ""
    head = [ln.strip() for ln in readme.splitlines() if ln.strip() and not ln.lstrip().startswith(("[!", "<", "!["))][:3]
    print("readme: " + (" | ".join(head) or "(none)"))
    kws = manifest_keywords(repo)
    for path, words in kws.items():
        print(f"keywords in {path}: {', '.join(words)}")
    cands = [LANGUAGE_TOPICS[k] for k, v in langs.items() if k in LANGUAGE_TOPICS and v / total >= 0.1]
    cands += [t for words in kws.values() for t in map(to_topic, words) if t]
    seen, ordered = set(), []
    for t in cands:
        if t and t not in seen and TOPIC_RE.match(t):
            seen.add(t)
            ordered.append(t)
    print("candidates (language, then registry keywords; add what it does and what kind of thing it is): "
          + (", ".join(ordered) or "(none)"))
    print(f"apply: gh repo edit {repo} --add-topic t1,t2,...   then: topics.py check {repo}")


def check(repo):
    info = view(repo)
    topics = current_topics(info)
    problems = [f"invalid topic '{t}'" for t in topics if not TOPIC_RE.match(t)]
    if not MIN_TOPICS <= len(topics) <= MAX_TOPICS:
        problems.append(f"{len(topics)} topics; want {MIN_TOPICS} to {MAX_TOPICS}")
    missing = sorted({t for words in manifest_keywords(repo).values() for t in map(to_topic, words) if t}
                     - set(topics))
    print(f"{repo}: {', '.join(topics) or '(none)'}")
    if missing:
        print("registry keywords not in the topics (add them, or drop them from the manifest at the next release): "
              + ", ".join(missing))
    for p in problems:
        print("FAIL: " + p)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "audit":
        audit(a[1], int(a[a.index("--min") + 1]) if "--min" in a else MIN_TOPICS)
    elif len(a) == 2 and a[0] == "suggest":
        suggest(a[1])
    elif len(a) == 2 and a[0] == "check":
        check(a[1])
    else:
        sys.exit(__doc__)
