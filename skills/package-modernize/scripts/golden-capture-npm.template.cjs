'use strict';
// TEMPLATE (package-modernize): records what the PUBLISHED old version of an npm package returns, so the new major can prove
// what it kept and list what it changed. The seeded-random-utilities run (test/golden/capture-1.1.4.cjs there) is the full
// worked example, with per-instance state and multi-step scripts; replace-string-at-position (test/golden/ there) is the
// small one, with the codec. This template is synchronous: for a callback, Promise or network package, start from
// is-an-image-url's test/golden/capture-1.0.4.cjs and fixture-server.cjs instead (a local server, recorded requests,
// callback timing, uncaught exceptions, CLI runs; references/npm.md, Phase 0).
//
// Run it in a scratch project, never inside the repository, before any code change:
//   mkdir capture && cd capture && npm init -y && npm install {{PACKAGE}}@{{OLD_VERSION}}
//   copy templates/npm/test/golden/codec.cjs next to this file
//   node capture-{{OLD_VERSION}}.cjs > {{OLD_VERSION}}.json
// Commit the JSON, this script (as run) and codec.cjs under test/golden/. Lint ignores all three.
//
// Caret ranges: a fresh install may resolve a newer dependency than the old lockfile pinned; record every dependency version
// in the header (below) and test each version the range covers if a dependency shapes the output.
//
// Write the cases as JavaScript values: NaN, -0, Infinity, undefined, new String('x'), new Set([1]) and holes are all fine.
// codec.cjs stores them in a JSON form that keeps them (a plain JSON round trip turns NaN into null and -0 into 0) and
// decodes them fresh for every call; results and thrown errors are stored the same way.
//
// Replaying it against the next major (the wiki's Versions page, wikiwright L-113): the script loads the package by name,
// so copy it, codec.cjs and any helper it requires into a scratch project with the NEW version installed and run it
// there unchanged; the header's `package` line says which version answered. Keep it replayable: take the bin's path from
// package.json with binPath() (a rewrite moves it, `cli.js` to `dist/cli.mjs`), look dependencies up with dependency()
// (the new major drops some), and never reach into the package's files by path. A network capture has more to keep
// replayable; references/npm.md, "Replaying a capture against the next major".
//
// A capture that records the package's requests through its own proxy with TLS takes the whole proxy setup from ONE
// call, startCaptureProxy() in capture-proxy.cjs (copy it beside this file; L-125 `replayable-proxy-setup`): the socket
// guard, a stand-in proxy that routes CONNECT by port (443 to the TLS fixture, any other to the plain one), and the proxy
// variables set before the package loads and before any child starts. That is why main() requires the package only
// after it. Fill `fixtures` below and the same script records the old version and replays the new major unchanged; on
// Node 20 a fetch-based major also needs `npm install undici@7` in the scratch project (the report on stderr says so).

const path = require('node:path');
const fs = require('node:fs');
const {encode, decode, capture} = require('./codec.cjs');

// TEMPLATE (network captures only): the fixture servers the proxy hands requests to; they need not listen.
//   fixtures = {plain: http.createServer(handler), secure: https.createServer({key, cert}, handler), ca: 'tls/cert.pem'}
// The handler sees `http://host/path` for requests sent to the proxy directly and `/path` through CONNECT, so route by
// new URL(request.url, `http://${request.headers.host}`). Leave it undefined for a package that makes no requests.
const fixtures = undefined;

// The package's own package.json, found from its entry point when an `exports` map hides `{{PACKAGE}}/package.json`.
function manifestPath() {
  try {
    return require.resolve('{{PACKAGE}}/package.json');
  } catch {
    let dir = path.dirname(require.resolve('{{PACKAGE}}'));
    while (!fs.existsSync(path.join(dir, 'package.json')) || JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name !== '{{PACKAGE}}') {
      dir = path.dirname(dir);
    }

    return path.join(dir, 'package.json');
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath(), 'utf8'));
const packageVersion = manifest.version;

// The bin as package.json names it (a string, or an object keyed by command), or undefined without one. Spawn it with
// process.execPath and record stdout, the exit status and the first error line of stderr per case.
// eslint-disable-next-line no-unused-vars
function binPath(command) {
  const {bin} = manifest;
  if (!bin) {
    return undefined;
  }

  const file = typeof bin === 'string' ? bin : bin[command] ?? Object.values(bin)[0];
  return path.join(path.dirname(manifestPath()), file);
}

// A runtime dependency's installed version, or 'none' when the installed version of the package does not have it.
const dependency = name => {
  try {
    return require(`${name}/package.json`).version;
  } catch {
    return 'none';
  }
};

// The callable under test: the module itself for `module.exports = function`, or a named export (set in main()).
let target;

function runCase(method, args, calls = 1) {
  const encoded = encode(args);
  const results = [];
  for (let index = 0; index < calls; index++) {
    results.push(capture(() => target[method](...decode(encoded))));
  }

  return {method, args: encoded, calls, results};
}

// TEMPLATE: every public method, several argument shapes, and the odd inputs the old version accepted:
// empty strings, numbers where strings go, null and undefined, NaN, negative and out-of-range numbers, huge values,
// array-likes and Sets where arrays go, wrapper objects, characters outside the Basic Multilingual Plane (emoji).
// Include every claim the kickoff prompt or the survey made about the package, so the capture can confirm or refute it.
const methodCases = [
  // ['methodName', [arg1, arg2], calls],
];

// TEMPLATE: quirks worth recording as evidence but not asserting as golden values (behaviour the new major changes on purpose).
const quirks = {};

async function main() {
  // The proxy first, then the package: nothing may read the proxy variables before they are set.
  const proxy = fixtures ? await require('./capture-proxy.cjs').startCaptureProxy(fixtures) : undefined;
  const library = require('{{PACKAGE}}');
  target = typeof library === 'function' ? {[library.name || 'default']: library} : library;

  const cases = methodCases.map(([method, args, calls]) => runCase(method, args, calls));

  const header = {
    package: `{{PACKAGE}}@${packageVersion}`,
    // TEMPLATE: the runtime dependencies of the old version; dependency() records 'none' for any the replayed version lacks.
    dependencies: Object.fromEntries([].map(name => [name, dependency(name)])),
    node: process.version,
    captured: new Date().toISOString().slice(0, 10),
    note: 'Golden outputs of the published {{OLD_VERSION}}; see test/golden/capture-{{OLD_VERSION}}.cjs and codec.cjs for the format.',
    quirks,
  };

  // One case per line keeps the file diffable.
  const lines = cases.map(entry => JSON.stringify(entry));
  const output = `${JSON.stringify(header, null, '\t').slice(0, -2)},\n\t"cases": [\n\t\t${lines.join(',\n\t\t')}\n\t]\n}\n`;
  process.stdout.write(output);

  if (proxy) {
    // The routes and the guard check belong in the log, not in the golden file.
    process.stderr.write(proxy.report());
    if (output.includes(proxy.guardMessage)) {
      process.stderr.write(`a case hit the socket guard ("${proxy.guardMessage}"): a request went around the proxy\n`);
      process.exitCode = 1;
    }

    await proxy.close();
  }
}

main().catch(error => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
