'use strict';
// TEMPLATE (package-modernize): records what the PUBLISHED old version of an npm package returns, so the new major can prove
// what it kept and list what it changed. The seeded-random-utilities run (test/golden/capture-1.1.4.cjs there) is the full
// worked example, with per-instance state and multi-step scripts.
//
// Run it in a scratch project, never inside the repository, before any code change:
//   mkdir capture && cd capture && npm init -y && npm install {{PACKAGE}}@{{OLD_VERSION}}
//   node capture.cjs > {{OLD_VERSION}}.json
// Commit the JSON and this script (as run) under test/golden/. Lint ignores both.
//
// Caret ranges: a fresh install may resolve a newer dependency than the old lockfile pinned; record every dependency version
// in the header (below) and test each version the range covers if a dependency shapes the output.
//
// JSON cannot hold undefined or a thrown error, so results use {"$undefined": true} and {"$throws": "message"}.

const library = require('{{PACKAGE}}');
const packageVersion = require('{{PACKAGE}}/package.json').version;

const encode = value => (value === undefined ? {$undefined: true} : value);
const copy = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

// The callable under test: the module itself for `module.exports = function`, or a named export.
const target = typeof library === 'function' ? {[library.name || 'default']: library} : library;

function call(method, args) {
	try {
		return encode(target[method](...args.map(copy)));
	} catch (error) {
		return {$throws: error.message};
	}
}

function runCase(method, args, calls = 1) {
	const results = [];
	for (let index = 0; index < calls; index++) {
		results.push(call(method, args));
	}

	return {method, args, calls, results};
}

// TEMPLATE: every public method, several argument shapes, and the odd inputs the old version accepted:
// empty strings, numbers where strings go, null and undefined, NaN, negative and out-of-range numbers, huge values,
// array-likes and Sets where arrays go, wrapper objects, characters outside the Basic Multilingual Plane (emoji).
// Include every claim the kickoff prompt or the survey made about the package, so the capture can confirm or refute it.
const methodCases = [
	// ['methodName', [arg1, arg2], calls],
];

const cases = methodCases.map(([method, args, calls]) => runCase(method, args, calls));

// TEMPLATE: quirks worth recording as evidence but not asserting as golden values (behaviour the new major changes on purpose).
const quirks = {};

const header = {
	package: `{{PACKAGE}}@${packageVersion}`,
	// TEMPLATE: the versions of the runtime dependencies a fresh install resolved, from their package.json files.
	dependencies: {},
	node: process.version,
	captured: new Date().toISOString().slice(0, 10),
	note: 'Golden outputs of the published {{OLD_VERSION}}; see test/golden/capture-{{OLD_VERSION}}.cjs for the format.',
	quirks,
};

// One case per line keeps the file diffable.
const lines = cases.map(entry => JSON.stringify(entry));
process.stdout.write(`${JSON.stringify(header, null, '\t').slice(0, -2)},\n\t"cases": [\n\t\t${lines.join(',\n\t\t')}\n\t]\n}\n`);
