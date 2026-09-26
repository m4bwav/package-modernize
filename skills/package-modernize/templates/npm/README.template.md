# {{PACKAGE}}

[![npm version](https://img.shields.io/npm/v/{{PACKAGE}}.svg)](https://www.npmjs.com/package/{{PACKAGE}})
[![CI](https://github.com/{{OWNER}}/{{PACKAGE}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{OWNER}}/{{PACKAGE}}/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/{{PACKAGE}}.svg)](https://www.npmjs.com/package/{{PACKAGE}})

{{ONE_PARAGRAPH: what it does, in the words a searcher would use.}}

- TypeScript types, ES module and CommonJS builds, no dependencies.
- Node 20 and later, browsers, Bun, Deno and workers: the library uses nothing but plain JavaScript.

## Install

```sh
npm install {{PACKAGE}}
```

## Usage

```js
import {{DEFAULT_IMPORT}} from '{{PACKAGE}}';
```

**CommonJS:**

```js
const {{DEFAULT_IMPORT}} = require('{{PACKAGE}}');
```

## API

{{ONE_TABLE_OR_LIST: every export, its signature, what it returns, what it throws.}}

## Behaviour at the edges

{{TABLE: the odd inputs (empty strings, negative or out-of-range numbers, non-string input, emoji) and what the package does with each, matching the golden capture and the changelog.}}

## Migrating from {{OLD_MAJOR}}.x

{{LIST: every break, with the old call and the new one.}}

## Limits and what it is not

{{Three badges above are the only ones; David, Travis, Snyk, Coveralls and Gitter badges were removed because those services no longer serve this repository.}}

## License

MIT, see [LICENSE](LICENSE).
