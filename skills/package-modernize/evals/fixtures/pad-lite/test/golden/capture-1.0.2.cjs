// Golden capture of the published pad-lite 1.0.2, run on 2026-09-20 in a scratch project after `npm install pad-lite@1.0.2`.
// Usage: node capture-1.0.2.cjs > 1.0.2.json
const padLite = require('pad-lite');

const inputs = [
  ['abc', 5],
  ['abc', 5, '0'],
  ['abc', 2],
  ['', 3],
  ['abc', 5, 'xy'],
  ['abc', 6, 'xy'],
  ['abc', 6, ''],
  ['abc', 5, null],
  ['abc', 5, 0],
  [null, 6],
  [true, 6],
  [42, 5, '0'],
  ['abc', '6'],
  ['abc', -1],
  ['😀', 3, '*'],
];

const cases = inputs.map(args => ({args, result: padLite(...args)}));
process.stdout.write(JSON.stringify({package: 'pad-lite', version: '1.0.2', node: process.version, cases}, null, 2) + '\n');
