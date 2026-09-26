// Stand-in for the real build (tsdown in a template repository): copies src/index.js to dist/index.cjs, so the tests
// exercise the built output and a change in src/ reaches them only after a build.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
fs.mkdirSync(path.join(root, 'dist'), {recursive: true});
fs.copyFileSync(path.join(root, 'src', 'index.js'), path.join(root, 'dist', 'index.cjs'));
