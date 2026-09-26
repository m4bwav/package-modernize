/*
TEMPLATE (package-modernize): compile-time checks on the published declaration files. The runner copies this file into each
TypeScript fixture as index.ts, so it is checked under that fixture's module and resolution settings (ESM and CommonJS under
nodenext, bundler, node10). Write one check per public type promise: the default export equals the named one, option fields
are optional, return types, overloads, deprecated names still compiling, and any interface a consumer may augment.
*/
import defaultExport, {/* TEMPLATE: named exports and types */} from '{{PACKAGE}}';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

// Compiles only when the argument is assignable to T, so expectType<string>(value) fails when value can be undefined.
declare function expectType<T>(value: T): void;

export type Checks = [
  // TEMPLATE: Expect<Equal<typeof defaultExport, typeof namedExport>>,
  Expect<Equal<typeof defaultExport, typeof defaultExport>>,
];

// TEMPLATE: calls that must type-check, and calls that must not:
// const ok: string = defaultExport('abc', 'b', 'x', 1);
// // @ts-expect-error -- a position must be a number
// defaultExport('abc', 'b', 'x', '1');

export {defaultExport};
