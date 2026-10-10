Read before writing code in Phase 2, and before starting the independent review in Phase 3. Phases, stops and the rules that hold everywhere: [../SKILL.md](../SKILL.md).

# Rewrite and independent review (Phases 2 and 3)

## Rewrite (Phase 2)

Golden test first. Tests import the built output, never the source, and run against every build. Every published name keeps working. The library uses no runtime-specific API unless it is a CLI entry. Replace O(n) allocations driven by a caller's number with algorithms bounded by the output. `npm test` and its equivalents never touch the network. README: what it does, install, usage per module system and runtime, API, behaviour at the edges, migration, limits and what the package is not; near the end (before the licence), a "Package page" section with one link per registry page the package has (npm, nuget.org, PyPI, crates.io, Maven Central, pkg.go.dev; every package when the repository publishes several), even when a badge at the top already links there; three live badges (version, CI, downloads), and every other badge and image handled as [readme-images.md](readme-images.md) says. CHANGELOG follows Keep a Changelog; a release heading carries its date. Open the pull request with a "For review" list of departures from the plan and unruled questions.

## Independent review (Phase 3)

The prompt in `prompts/review-subagent.md`: read-only, differential fuzzing of old against new, correctness, security, public types, test gaps; at most twelve verified findings. In the second npm run it found twelve real issues that 905 passing tests had missed. Fix or answer every one before asking the maintainer to review.

Related: builds on [../SKILL.md](../SKILL.md); see also [readme-images.md](readme-images.md), [security.md](security.md), [../prompts/review-subagent.md](../prompts/review-subagent.md).
