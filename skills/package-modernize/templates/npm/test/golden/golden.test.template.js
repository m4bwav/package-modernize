/*
TEMPLATE (package-modernize): the golden suite. Copy to test/golden/golden.test.js next to the JSON that
scripts/golden-capture-npm.template.cjs produced from the PUBLISHED old version, in a scratch project.

The contract: every case recorded from the old version returns the same values from both builds, compared exactly.
Never regenerate the JSON from this repository's code, and never loosen a comparison. A behaviour the new major
changes on purpose is listed in CHANGELOG.md and handled here as its own named exception (see EXCEPTIONS), so the
test file states every departure from the old version in one place.
*/
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe, test} from 'node:test';
import {builds} from '../helpers/builds.js';

// The capture of the old version. Add a second file for the methods the new major adds (capture-<new>.cjs), so later minors keep them too.
const golden = JSON.parse(readFileSync(new URL('{{OLD_VERSION}}.json', import.meta.url), 'utf8'));

// Cases the new major answers differently on purpose: a predicate over the case, and what to assert instead of equality.
// Each entry names the changelog line that documents it. Empty when the new major reproduces the old version exactly.
const EXCEPTIONS = [
  // {name: 'negative positions throw (CHANGELOG: Changed, breaking)', matches: entry => entry.args[0] < 0, check: (call, entry) => assert.throws(call, RangeError)},
];

// The capture's encoding: JSON has no undefined and no thrown error.
function call(library, method, arguments_) {
  try {
    const value = library[method](...arguments_.map(argument => structuredClone(argument)));
    return value === undefined ? {$undefined: true} : value;
  } catch (error) {
    return {$throws: error.message};
  }
}

// Through JSON, as the capture wrote them, so both sides are compared in the same form (a deep clone would keep what JSON drops).
// eslint-disable-next-line unicorn/prefer-structured-clone
const normalize = values => JSON.parse(JSON.stringify(values));

const label = (index, entry) => `#${index} ${entry.method}(${JSON.stringify(entry.args).slice(1, -1).slice(0, 60)})`;

for (const {name, lib} of builds) {
  describe(`{{OLD_VERSION}} golden cases (${name} build)`, () => {
    for (const [index, entry] of golden.cases.entries()) {
      test(label(index, entry), () => {
        const exception = EXCEPTIONS.find(candidate => candidate.matches(entry));
        if (exception) {
          exception.check(() => lib[entry.method](...entry.args), entry);
          return;
        }

        // TEMPLATE: for a stateful package (a class, a seeded generator) create the instance here from entry.seed or entry.setup.
        const results = Array.from({length: entry.calls ?? 1}, () => call(lib, entry.method, entry.args));
        assert.deepEqual(normalize(results), entry.results);
      });
    }
  });
}
