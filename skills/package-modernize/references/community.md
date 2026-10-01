Read in Phase 4 before answering any issue, closing or merging any pull request, or touching a branch or fork. Phases, stops and the rules that hold everywhere: [../SKILL.md](../SKILL.md).

# Community (Phase 4)

Issues: a comment with the accurate history (cause, the version that fixed it, what the new release does), then close; read old closed issues for behaviour the tests should pin. Old Dependabot or Snyk pull requests on the old lockfile: never merge one by one; after the regenerated lockfile merges and the alert count is 0, close each with one comment naming the merge commit and the removed tool that brought the package in. Human pull requests: read the diff and the discussion; merge what is right with credit in the changelog, otherwise close with the reason and what the new version does instead. Forks: list them; one that only carried a merged pull request needs nothing. Branches with no open pull request (a bot's leftovers, an abandoned fix) get a disposition too; deleting them waits for the maintainer's OK. Expect AI-written pull requests in an old inbox; do not add an unreviewed one.

Related: builds on [../SKILL.md](../SKILL.md); see also [security.md](security.md).
