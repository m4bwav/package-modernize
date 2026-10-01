Read in Phase 0 when setting up the repository's documents, and at the start of Phase 7 (wiki, handoff, lessons). Phases, stops and the rules that hold everywhere: [../SKILL.md](../SKILL.md).

# Documents, wiki and wrap-up

## Documents (every phase)

In the package repository: AGENTS.md (rules, commands, layout, traps), CLAUDE.md whose first line is `@AGENTS.md`, `.github/copilot-instructions.md` pointing at AGENTS.md, `ai-docs/` (everlast: INDEX, HANDOFF, log, decisions, solutions, plans, notes), README, CHANGELOG, SECURITY.md. Outside it, the maintainer's record: the inventory row, the kickoff prompt with its status line and its corrections section, and this skill's LEARNINGS.md and references. The repository's GitHub wiki is the long form of the README (Phase 7, "Wiki" below). Templates in `templates/<system>/` (read `templates/README.md`); copy and adapt.

## Wiki (Phase 7, first)

After the release is verified from the registry, give the repository its wiki: if the host supports wikis (GitHub: `gh repo view OWNER/REPO --json hasWikiEnabled`, switched on with `gh repo edit --enable-wiki`) and the repository has none, run the wikiwright skill (m4bwav/wikiwright) for a new wiki; if it has one, run wikiwright's update mode for the new version. It comes after Phase 6 because every example on the wiki is verified against the published package, and before the handoff because it finds errors in the shipped README and CHANGELOG (each of the first three wikis found some): list them in the kickoff prompt's corrections and in HANDOFF.md for the next release, since the README reaches the registry page only with a release. The one stop it can add is GitHub's first-page click: the wiki repository exists only after a first page is saved in the web UI, and switching the feature on does not create it (wikiwright, tested 2026-09-28). Ask for it at the start of Phase 7 and keep going. The Phase 1 golden capture is the wiki's best evidence for Versions and upgrading: wikiwright replays the capture script against the old version installed today and against the new one and puts the differing cases on the page, so keep capture scripts runnable outside the repository (L-109 `golden-capture-feeds-the-wiki`). Without wikiwright installed, the run writes the pages by its procedure (m4bwav/wikiwright, SKILL.md). The maintainer's overlay may list the repositories that still owe a wiki (L-107 `wiki-after-release`).

## Hand-over between package-modernize and wikiwright

(the same text is in both skills). A package-modernize run reaches the wiki in Phase 7: after the release is verified from the registry, or, in a retrofit without a release, against the latest published version. A wiki that exists takes wikiwright's Update mode; a hand-written wiki without a saved verification output is adopted first (run its program against the version its footer names, save the output, fix every `outputs` finding), then updated. Versions and upgrading takes its evidence from the repository's golden recordings: `test/golden/` (npm), or `tests/Golden/` with the old versions' recordings per runtime and OS and the capture project that made them, plus compare reports in `tests/Golden/upgrade/` where a run wrote them (NuGet), each replayed or compared today, never trusted alone. Inaccuracies the wiki finds in the shipped README or CHANGELOG go to the kickoff prompt's corrections and to HANDOFF.md for the next release. The repository's `ai-docs/notes/<date>-github-wiki.md` records the program, its saved output and the pages that name the version.

## Wrap-up (Phase 7)

HANDOFF.md says what is standing work and when (dates absolute). Every lesson lands in one of three places: a trap or default in `references/<system>.md` with the date, a procedural lesson in LEARNINGS.md with Trigger and Hypothesis, or a correction in the kickoff prompt. Recommend the next package and say what its run can rely on.

Related: builds on [../SKILL.md](../SKILL.md); see also [../prompts/kickoff-skeleton.md](../prompts/kickoff-skeleton.md).
