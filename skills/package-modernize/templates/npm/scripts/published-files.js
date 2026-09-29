// TEMPLATE (package-modernize, from seeded-random-utilities 2.0.1): edit the list and the budget for the package.
// What the npm tarball holds, shared by test/package/shape.test.js (a dry-run pack of the checkout) and check-tarball.mjs (the tarball release.yml stages).
export const PUBLISHED_FILES = [
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.mts',
  'dist/index.mjs',
  'dist/index.mjs.map',
  'package.json',
];

// Set from the first build and written in the plan; the two source maps are usually most of it. Add dist/cli.mjs for a package with a bin.
export const TARBALL_BUDGET = 50_000;
