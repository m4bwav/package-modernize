#!/usr/bin/env node
// Counts carriage returns (byte 13) in text files, because Git Bash's grep on Windows cannot see them and repositories
// modernized by package-modernize are LF through .gitattributes. Exit 1 when any listed file has one.
// Usage: node check-line-endings.mjs <file or directory>...   (directories are walked; node_modules, .git, dist, bin, obj skipped)
import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'bin', 'obj', 'artifacts']);
const BINARY = /\.(?:png|jpg|jpeg|gif|ico|woff2?|ttf|zip|tgz|nupkg|snupkg|pdf|dll|exe)$/iu;

function* walk(target) {
  const stats = statSync(target);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (!SKIP.has(entry)) {
        yield* walk(path.join(target, entry));
      }
    }
  } else if (!BINARY.test(target)) {
    yield target;
  }
}

let failures = 0;
for (const target of process.argv.slice(2)) {
  for (const file of walk(target)) {
    const bytes = readFileSync(file);
    let count = 0;
    for (const byte of bytes) {
      if (byte === 13) {
        count++;
      }
    }

    if (count > 0) {
      failures++;
      console.log(`${file}: ${count} carriage return(s)`);
    }
  }
}

if (failures === 0) {
  console.log('no carriage returns');
}

process.exitCode = failures > 0 ? 1 : 0;
