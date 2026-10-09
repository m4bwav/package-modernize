Read in Phase 4 before answering any issue, closing or merging any pull request, or touching a branch or fork. Phases, stops and the rules that hold everywhere: [../SKILL.md](../SKILL.md).

# Community (Phase 4)

Issues: a comment with the accurate history (cause, the version that fixed it, what the new release does), then close; read old closed issues for behaviour the tests should pin. Old Dependabot or Snyk pull requests on the old lockfile: never merge one by one; after the regenerated lockfile merges and the alert count is 0, close each with one comment naming the merge commit and the removed tool that brought the package in. Human pull requests: read the diff and the discussion; merge what is right with credit in the changelog, otherwise close with the reason and what the new version does instead. Forks: list them; one that only carried a merged pull request needs nothing. Branches with no open pull request (a bot's leftovers, an abandoned fix) get a disposition too; deleting them waits for the maintainer's OK. Expect AI-written pull requests in an old inbox; do not add an unreviewed one.

## Topics

Every repository the run touches leaves with its topics set, a package or not: they are how people find it on GitHub (github.com/topics, search, a profile), and an empty list is the most common gap in the maintainer's repositories (L-167 `topics-on-every-repo`). Rules:
- 5 to 12 topics as a habit; GitHub allows 20, each lowercase letters, digits and hyphens, at most 50 characters.
- Cover four things: the language (GitHub's featured spellings: `csharp`, `fsharp`, `typescript`, `javascript`, `python`, `powershell`), the ecosystem (`dotnet`, `nodejs`, `npm-package`, `nuget`, `pypi`, `unity`, `claude-code`), what it does (two to five domain terms a person would search for: `json`, `pretty-print`, `image-url`), and the kind of thing it is (`library`, `cli`, `example`, `sample-app`, `agent-skills`, `claude-code-plugin`, `game`).
- The registry keywords (package.json `keywords`, `PackageTags`, pyproject `keywords`, plugin.json `keywords`) and the topics carry the same terms; the next release brings the manifest in line when they differ.
- No owner name, no vanity terms (`awesome`, `best`), no version numbers, nothing the repository does not do.
- Topic names are public even on a private repository: a private one gets generic terms only, never a client, person, host or internal project name.

Procedure: `scripts/topics.py suggest OWNER/REPO` prints the evidence (description, languages, manifest keywords, README title) and the language and keyword candidates; the plan's decisions table carries the chosen list; in Phase 4 `gh repo edit OWNER/REPO --add-topic a,b,c` (remove a wrong one with `--remove-topic`), then `scripts/topics.py check OWNER/REPO` exits 0 and its output goes to the log. `scripts/topics.py audit OWNER` lists every source repository under the minimum, for a sweep across the maintainer's account.

Related: builds on [../SKILL.md](../SKILL.md); see also [security.md](security.md).
