#!/usr/bin/env node
// Lists every image and badge in a README and says, for each, whether it still works where the README is shown:
// on GitHub, on the registry's package page (npmjs.com, nuget.org), or neither.
//
// Usage: node check-readme-images.mjs README.md [--registry npm|nuget] [--offline]
//   --registry nuget  also flags hosts outside nuget.org's image allow-list (they are not rendered there)
//   --offline         classify only; do not fetch the URLs
// Exit code 1 when any image is dead, relative (broken on the registry page), from a dead service, or not allowed by the registry.
//
// Phase 0: run it on the old README (and on the README inside the published package) to list what to keep, replace or remove.
// Phase 2 and the verification checklist: run it on the new README; it must exit 0.
import {readFileSync} from 'node:fs';
import process from 'node:process';

const argv = process.argv.slice(2);
const file = argv.find(argument => !argument.startsWith('--') && argv[argv.indexOf(argument) - 1] !== '--registry');
const registry = argv.includes('--registry') ? argv[argv.indexOf('--registry') + 1] : 'npm';
const offline = argv.includes('--offline');
if (!file) {
  console.error('usage: node check-readme-images.mjs README.md [--registry npm|nuget] [--offline]');
  process.exit(2);
}

// Services whose badges or images no longer say anything true about a repository, with what replaces them (checked 2026-09-25).
const DEAD_SERVICES = [
  [/travis-ci\.(?:org|com)|img\.shields\.io\/travis\//u, 'Travis CI', 'the GitHub Actions badge: https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg'],
  [/david-dm\.org|img\.shields\.io\/david\//u, 'David (shut down)', 'nothing; Dependabot covers dependency freshness'],
  [/nodei\.co/u, 'nodei.co (unmaintained)', 'shields.io npm version and downloads badges'],
  [/badges\.gitter\.im|gitter\.im/u, 'Gitter', 'nothing, or a link to GitHub Discussions if it is switched on'],
  [/snyk\.io\/test|snyk\.io\/.*badge/u, 'Snyk', 'nothing; Dependabot alerts and the registry audit in CI'],
  [/coveralls\.io|img\.shields\.io\/coveralls\//u, 'Coveralls', 'nothing, unless the plan keeps a coverage service'],
  [/codecov\.io|img\.shields\.io\/codecov\//u, 'codecov', 'nothing, unless the plan keeps a coverage service'],
  [/ci\.appveyor\.com|img\.shields\.io\/appveyor\//u, 'AppVeyor', 'the GitHub Actions badge'],
  [/sonarcloud\.io/u, 'SonarCloud', 'nothing, unless the plan keeps it'],
  [/gemnasium|bithound|greenkeeper|inch-ci|dependencyci|img\.shields\.io\/(?:gemnasium|bithound)\//u, 'retired service', 'nothing'],
];

// nuget.org renders images only from these hosts (learn.microsoft.com/nuget/nuget-org/package-readme-on-nuget-org, updated 2026-07-07).
const NUGET_HOSTS = new Set([
  'api.codacy.com', 'api.codeclimate.com', 'api.dependabot.com', 'api.reuse.software', 'api.travis-ci.com', 'app.codacy.com',
  'app.deepsource.com', 'avatars.githubusercontent.com', 'badgen.net', 'badges.gitter.im', 'camo.githubusercontent.com',
  'caniuse.bitsofco.de', 'cdn.jsdelivr.net', 'cdn.syncfusion.com', 'ci.appveyor.com', 'circleci.com', 'cloudback.it', 'codecov.io',
  'codefactor.io', 'coveralls.io', 'dev.azure.com', 'devpod.sh', 'flat.badgen.net', 'gitlab.com', 'i.imgur.com', 'img.shields.io',
  'infragistics.com', 'isitmaintained.com', 'media.githubusercontent.com', 'opencollective.com', 'raw.github.com',
  'raw.githubusercontent.com', 'snyk.io', 'sonarcloud.io', 'travis-ci.com', 'travis-ci.org', 'user-images.githubusercontent.com',
]);

// A badge service answers 200 with an SVG that says the badge is gone; read the text, not only the status.
const RETIRED_BADGE_TEXT = /no longer available|deprecated|not found|invalid|inaccessible|unknown|repo not found|no builds/iu;

const markdown = readFileSync(file, 'utf8').replaceAll(/```[\s\S]*?```/gu, '');
const definitions = new Map([...markdown.matchAll(/^\s*\[([^\]]+)\]:\s*<?(\S+?)>?(?:\s+["'(].*)?$/gmu)].map(match => [match[1].toLowerCase(), match[2]]));
const images = [];
for (const match of markdown.matchAll(/!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^)]*)?\)/gu)) {
  images.push({alt: match[1], url: match[2]});
}

for (const match of markdown.matchAll(/!\[([^\]]*)\]\[([^\]]*)\]/gu)) {
  const url = definitions.get((match[2] || match[1]).toLowerCase());
  if (url) {
    images.push({alt: match[1], url});
  }
}

for (const match of markdown.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/giu)) {
  images.push({alt: /\balt\s*=\s*["']([^"']*)["']/iu.exec(match[0])?.[1] ?? '', url: match[1]});
}

async function probe(url) {
  try {
    const response = await fetch(url, {redirect: 'follow', signal: AbortSignal.timeout(15_000), headers: {'user-agent': 'check-readme-images'}});
    const type = response.headers.get('content-type') ?? '';
    const body = type.includes('svg') || type.startsWith('text/') ? await response.text() : '';
    return {status: response.status, type, retiredText: RETIRED_BADGE_TEXT.exec(body.replaceAll(/<[^>]+>/gu, ' '))?.[0]};
  } catch (error) {
    return {status: 0, type: '', error: error.cause?.code ?? error.name};
  }
}

let problems = 0;
console.log(`${images.length} image(s) in ${file}, checked for ${registry}${offline ? ' (offline)' : ''}`);
for (const {alt, url} of images) {
  const findings = [];
  if (!/^https?:\/\//iu.test(url)) {
    findings.push(`relative: breaks on the ${registry} package page; use an absolute https://raw.githubusercontent.com/OWNER/REPO/<tag>/path URL, or remove it`);
  } else {
    if (/^http:/iu.test(url)) {
      findings.push('plain http: use https');
    }

    const dead = DEAD_SERVICES.find(([pattern]) => pattern.test(url));
    if (dead) {
      findings.push(`dead service (${dead[1]}): replace with ${dead[2]}`);
    }

    if (registry === 'nuget') {
      const {hostname, pathname} = new URL(url);
      const actionsBadge = hostname === 'github.com' && /\/workflows\/.+\/badge\.svg$/u.test(pathname);
      if (!NUGET_HOSTS.has(hostname) && !actionsBadge) {
        findings.push(`host ${hostname} is not on nuget.org's allow-list: not rendered there`);
      }
    }

    if (!offline) {
      const result = await probe(url);
      if (result.status === 0) {
        findings.push(`unreachable (${result.error})`);
      } else if (result.status >= 400) {
        findings.push(`HTTP ${result.status}`);
      } else if (!/^image\//u.test(result.type)) {
        findings.push(`not an image (${result.type || 'no content-type'})`);
      } else if (result.retiredText) {
        findings.push(`the badge itself says "${result.retiredText}"`);
      }
    }
  }

  problems += findings.length > 0 ? 1 : 0;
  console.log(`${findings.length > 0 ? 'FIX ' : 'ok  '} ${alt ? `[${alt}] ` : ''}${url}${findings.map(finding => `\n       - ${finding}`).join('')}`);
}

console.log(problems > 0 ? `${problems} image(s) to keep-replace-or-remove` : 'every image works');
process.exitCode = problems > 0 ? 1 : 0;
