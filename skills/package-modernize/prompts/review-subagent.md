# Review subagent prompt (Phase 3, before the merge)

An independent, read-only review of the rewrite by a fresh context, before the pull request is merged. In the seeded-random-utilities run (2026-09-25) a general-purpose subagent worked about 37 minutes and found 12 real issues that 905 passing tests had missed: behaviour drift on odd inputs, missing bounds, crashes on huge inputs, type breaks and test gaps. Run it in the background while writing the pull request description; fix or answer every finding before asking the maintainer to review. Fill in the angle-bracket parts; keep the rules about read-only work and verified findings.

For a NuGet package replace the npm specifics: `dotnet pack` for `npm pack`, `dotnet add package <id> --version <old>` in a scratch console project for the comparison, the public API surface (`PublicAPI.Shipped.txt` or package validation output) for the type declarations.

```text
You are reviewing a pull-request-to-be in the git repository <repo path> (branch `<branch>`, compared with `master`). Do NOT modify, stage, commit or push anything; read only. Use absolute paths (never `cd` in Bash; use `git -C <repo>`).

Context: the <npm|NuGet> package <name> <old version> (on master: <old source files>, which used <old dependencies>) is rewritten on <branch> as version <new version>: <new layout>, built by <tsdown into dist/ (ESM and CommonJS) | dotnet pack into a multi-target nupkg>. The central promise: <the compatibility promise, for example "every old call with inputs the old version handled returns exactly the same value, and plain require() still returns a callable function">. Deliberate, documented exceptions are listed in CHANGELOG.md: <list>. The published old version can be installed in a temp dir under <scratchpad path>/review if you need to compare (<npm install <name>@<old version> | dotnet add package>). The tests (<test files>) all pass on <Node 20, 22, 24, 26 | net10.0 and net48>.

Review for, in this order of importance:
1. Any input that the old version handled for which the new one returns different values or behaves differently, other than the CHANGELOG's listed exceptions. Compare the old and new sources method by method, and fuzz both packages with odd inputs (empty, null, numbers, NaN, negative and out-of-range positions, array-likes, Sets, wrapper objects, huge values, characters outside the Basic Multilingual Plane).
2. Correctness bugs in the new code and any new methods: off-by-one, wrong validation, state that does not round-trip, numbers beyond 2^53, surrogate pairs cut in half.
3. Security: unsafe property access or prototype pollution, unbounded loops or allocations on caller input, regular expressions with catastrophic backtracking, anything that makes the library non-portable (Node or DOM globals).
4. Public type declarations (build with `npm run build` if dist/ is missing; it writes only dist/, which is gitignored) that are wrong or break common old usage beyond what CHANGELOG.md lists: default-import and require() patterns, optional flags forwarded to overloads, interface augmentation, Records and exhaustive switches over unions.
5. Test gaps that matter: a behaviour the tests would not catch if it changed.

Verify each finding before reporting it (run a small script against the built output if needed; put any scratch file in the scratchpad path above, never in the repo). Report at most 12 findings, most severe first, each as: severity (bug / risk / nit), file:line, one-sentence problem, the concrete input and the wrong result, and a suggested fix. Say explicitly if you found nothing in a category. Keep the whole report under 60 lines.
```

Related: builds on [../SKILL.md](../SKILL.md) (Phase 3); see also [kickoff-skeleton.md](kickoff-skeleton.md).
