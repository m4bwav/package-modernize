/*
TEMPLATE (package-modernize): the golden suite. Copy to test/golden/golden.test.js next to the JSON that
scripts/golden-capture-npm.template.cjs produced from the PUBLISHED old version, in a scratch project, and next to the
codec.cjs that capture used.

The contract: every case recorded from the old version returns the same values from both builds, compared exactly.
Never regenerate the JSON from this repository's code, and never loosen a comparison. A behaviour the new major
changes on purpose is listed in CHANGELOG.md and handled here as its own named exception (see EXCEPTIONS), so the
test file states every departure from the old version in one place.
*/
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {describe, test} from 'node:test';
import {builds} from '../helpers/builds.js';

// The encoding the capture used: arguments decoded fresh per call, results and thrown errors encoded (see codec.cjs).
const {decode, capture} = createRequire(import.meta.url)('./codec.cjs');

// The capture of the old version. Add a second file for the methods the new major adds (capture-<new>.cjs), so later minors keep them too.
const golden = JSON.parse(readFileSync(new URL('{{OLD_VERSION}}.json', import.meta.url), 'utf8'));

// Cases the new major answers differently on purpose: a predicate over the case (its args decoded), and what to assert instead of equality.
// Each entry names the changelog line that documents it. Empty when the new major reproduces the old version exactly.
const EXCEPTIONS = [
  // {name: 'negative positions throw (CHANGELOG: Changed, breaking)', matches: (entry, args) => args[0] < 0, check: call => assert.throws(call, RangeError)},
];

const label = (index, entry) => `#${index} ${entry.method}(${JSON.stringify(entry.args).slice(1, -1).slice(0, 60)})`;

for (const {name, lib} of builds) {
  describe(`{{OLD_VERSION}} golden cases (${name} build)`, () => {
    for (const [index, entry] of golden.cases.entries()) {
      test(label(index, entry), () => {
        const exception = EXCEPTIONS.find(candidate => candidate.matches(entry, decode(entry.args)));
        if (exception) {
          exception.check(() => lib[entry.method](...decode(entry.args)), entry);
          return;
        }

        // TEMPLATE: for a stateful package (a class, a seeded generator) create the instance here from entry.seed or entry.setup.
        const results = Array.from({length: entry.calls ?? 1}, () => capture(() => lib[entry.method](...decode(entry.args))));
        assert.deepEqual(results, entry.results);
      });
    }
  });
}
