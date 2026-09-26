// Every answer the published 1.0.2 gave must come back unchanged from the new build.
// Deliberate differences are named here, and only with the maintainer's ruling in the plan. None so far.
const assert = require('node:assert/strict');
const {test} = require('node:test');
const golden = require('./1.0.2.json');
const padLite = require('../../dist/index.cjs');

const EXCEPTIONS = new Map();

for (const [index, {args, result}] of golden.cases.entries()) {
  test(`case ${index}: padLite(${args.map(argument => JSON.stringify(argument) ?? 'undefined').join(', ')})`, () => {
    const expected = EXCEPTIONS.has(index) ? EXCEPTIONS.get(index) : result;
    assert.equal(padLite(...args), expected);
  });
}
