// TEMPLATE (package-modernize): a consumer written as an ES module: default and named imports of the installed package.
// Runs under Node, Bun and Deno. Replace the assertions with two or three calls whose answers the golden capture recorded.
import assert from 'node:assert/strict';
import defaultExport, {/* TEMPLATE: named exports */} from '{{PACKAGE}}';

assert.equal(typeof defaultExport, 'function');
if (typeof import.meta.resolve === 'function') {
  assert.match(import.meta.resolve('{{PACKAGE}}'), /\/dist\/index\.mjs$/u, 'import resolves to the ESM build');
}

// TEMPLATE: a call with a known answer from the golden capture of the old version.
// assert.equal(defaultExport('222', '2', '3', 1), '232');

console.log('esm-node ok');
