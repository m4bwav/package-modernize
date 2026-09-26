# Agent rules for pad-lite

- Being modernized with the package-modernize skill; the plan is in `ai-docs/plans/`, the evidence in `ai-docs/log.md`.
- `npm test` builds (`scripts/build.cjs` copies `src/index.js` to `dist/index.cjs`) and runs the golden test against `dist/`.
- `test/golden/1.0.2.json` is the recording of the published 1.0.2, made by `test/golden/capture-1.0.2.cjs`.
- Never push, publish or tag from this checkout.
