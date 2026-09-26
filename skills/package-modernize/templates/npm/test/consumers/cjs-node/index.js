// TEMPLATE (package-modernize): a consumer written in CommonJS: require() of the installed package, used the way the
// old version's callers used it. This fixture is what proves the require() promise the plan made (a callable module,
// or an object whose .default is the class), so write the old call pattern here exactly as the old README showed it.
'use strict';

const assert = require('node:assert/strict');
const library = require('{{PACKAGE}}');

assert.match(require.resolve('{{PACKAGE}}'), /[/\\]dist[/\\]index\.cjs$/u, 'require resolves to the CommonJS build');

// TEMPLATE, one of the two shapes:
// 1. The old version did `module.exports = function`; the new CommonJS build must still be callable:
//    assert.equal(typeof library, 'function');
//    assert.equal(library('222', '2', '3', 1), '232');
// 2. The old version exported an object or a class: default and the named export are the same thing:
//    assert.equal(library.default, library.Named);
//    assert.equal(typeof require('{{PACKAGE}}').default, 'function');

console.log('cjs-node ok');
