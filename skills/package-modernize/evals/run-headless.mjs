#!/usr/bin/env node
// Runs the cases in evals.json through the Claude Code CLI headlessly (`claude -p --output-format stream-json`), each in a
// fresh scratch directory, and judges them on evidence: a Skill tool call naming this skill in the trace for trigger cases
// (none for decoys), the named tool call or file for action cases, the regex expectations for outcome cases. It never grades
// on the reply's wording. A case with `fixture` runs in a git repository copied from evals/fixtures/ and can be judged on
// an `evidence.all` list (ordered tool calls, files unchanged or changed, a command's exit code). The skill must be installed where the CLI finds it (a junction in ~/.claude/skills); for a baseline
// run, remove or rename that junction first and pass --baseline so the report says so. With --skill-dir DIR the run tests that
// copy instead (a branch or worktree): each case's directory gets `.claude/skills/<skill>` linked to DIR and the CLI loads
// project settings only, so the installed copy and the user's other skills stay out of the run.
//
// Usage: node run-headless.mjs [--case id[,id]] [--runs N] [--concurrency N] [--out DIR] [--baseline] [--model MODEL] [--skill-dir DIR] [--selftest]
// Output: <out>/results.json and one <out>/<case>-<run>.jsonl transcript per run; a summary on stdout for TESTS.md.
import {spawn, spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, readdirSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const suite = JSON.parse(readFileSync(path.join(here, 'evals.json'), 'utf8'));
const skillName = suite.skill;

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const only = option('--case', '')?.split(',').filter(Boolean) ?? [];
const runsOverride = option('--runs', undefined);
const concurrency = Number(option('--concurrency', '3'));
const out = option('--out', path.join(tmpdir(), `${skillName}-evals-${Date.now()}`));
const baseline = args.includes('--baseline');
const model = option('--model', undefined);
const skillDir = option('--skill-dir', undefined);
mkdirSync(out, {recursive: true});

// Tools each kind may use. Trigger cases need only the Skill tool and a few reads; action and outcome cases need the
// tools the skill's action uses. Nothing here grants publishing or git writes.
const TOOLS = {
  trigger: ['Skill', 'Read', 'Glob', 'Grep'],
  action: ['Skill', 'Read', 'Glob', 'Grep', 'Write', 'Bash(bash *)', 'Bash(sh *)', 'Bash(gh *)', 'Bash(npm view*)', 'Bash(npm pack*)', 'Bash(curl *)', 'Bash(node *)', 'Bash(ls*)', 'Bash(cat *)', 'Bash(mkdir *)'],
  outcome: ['Skill', 'Read', 'Glob', 'Grep', 'Write'],
};
const MAX_TURNS = {trigger: 4, action: 40, outcome: 12};

// The executable, spawned without a shell so prompts with quotes and tool patterns with spaces survive. On Windows the
// `claude` on PATH is a .cmd shim around node_modules/@anthropic-ai/claude-code/bin/claude.exe; CLAUDE_BIN overrides.
function claudeBinary() {
  if (process.env.CLAUDE_BIN) {
    return process.env.CLAUDE_BIN;
  }

  if (process.platform === 'win32') {
    for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
      if (existsSync(path.join(dir, 'claude.cmd'))) {
        const exe = path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
        if (existsSync(exe)) {
          return exe;
        }
      }
    }
  }

  return 'claude';
}

// A case with `fixture` starts from a copy of evals/fixtures/<fixture>, with `fixture_replace` files ({dest: source under
// evals/}) laid over it, committed as one git commit on branch v2, so the run can use git and file_unchanged has a baseline.
function prepareFixture(entry, cwd) {
  if (!entry.fixture) {
    return;
  }

  cpSync(path.join(here, 'fixtures', entry.fixture), cwd, {recursive: true});
  for (const [dest, source] of Object.entries(entry.fixture_replace ?? {})) {
    cpSync(path.join(here, source), path.join(cwd, dest));
  }

  const git = (...gitArgs) => spawnSync('git', ['-c', 'user.name=eval', '-c', 'user.email=eval@example.invalid', '-c', 'core.autocrlf=false', ...gitArgs], {cwd});
  git('init', '-q', '-b', 'v2');
  // `fixture_phase0` paths go in a first commit of their own, so "unchanged since the Phase 0 commit" has a commit to name.
  if (entry.fixture_phase0) {
    git('add', '--', ...entry.fixture_phase0);
    git('commit', '-q', '-m', 'Phases 0 and 1: golden capture of the published version, plan');
  }

  git('add', '-A');
  git('commit', '-q', '-m', entry.fixture_phase0 ? 'Phase 2 so far: rewrite' : 'Phases 0 and 1, Phase 2 so far');
}

function runOnce(entry, run) {
  const cwd = mkdtempSync(path.join(tmpdir(), `${skillName}-${entry.id}-${run}-`));
  prepareFixture(entry, cwd);
  if (skillDir) {
    mkdirSync(path.join(cwd, '.claude', 'skills'), {recursive: true});
    symlinkSync(path.resolve(skillDir), path.join(cwd, '.claude', 'skills', skillName), process.platform === 'win32' ? 'junction' : 'dir');
  }

  const kind = entry.kind;
  const cliArgs = ['-p', entry.prompt, '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
    '--max-turns', String(entry.max_turns ?? MAX_TURNS[kind]), '--allowedTools', ...(entry.allowed_tools ?? [...TOOLS[kind], ...(entry.tools ?? [])])];
  if (skillDir) {
    cliArgs.push('--setting-sources', 'project');
  }

  if (model) {
    cliArgs.push('--model', model);
  }

  return new Promise(resolve => {
    const started = Date.now();
    const child = spawn(claudeBinary(), cliArgs, {cwd, env: {...process.env}});
    let output = '';
    let errors = '';
    child.stdout.on('data', chunk => {
      output += chunk;
    });
    child.stderr.on('data', chunk => {
      errors += chunk;
    });
    child.on('close', code => {
      const transcript = path.join(out, `${entry.id}-${run}.jsonl`);
      writeFileSync(transcript, output);
      resolve({...judge(entry, output, cwd), code, seconds: Math.round((Date.now() - started) / 1000), cwd, transcript, stderr: errors.slice(-500)});
    });
  });
}

function toolUses(output) {
  const uses = [];
  for (const line of output.split('\n')) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    const content = event?.message?.content;
    if (event.type === 'assistant' && Array.isArray(content)) {
      for (const block of content) {
        if (block.type === 'tool_use') {
          uses.push({name: block.name, input: JSON.stringify(block.input ?? {})});
        }
      }
    }
  }

  return uses;
}

// One check of an `evidence.all` list. Types: trace (a tool call whose name matches `tool` and input matches `input_match`),
// no_trace (no such call anywhere in the run), sequence (`steps`, each a trace check, found in this order), file_contains (`path`, `match`), file_unchanged and
// file_changed (`paths`, compared with the fixture as prepared, carriage returns ignored), command (`run` in the case's
// directory after the session ends, through a shell; passes on exit 0).
function matchesStep(use, step) {
  return new RegExp(`^(?:${step.tool})$`, 'u').test(use.name) && (!step.input_match || new RegExp(step.input_match, 'iu').test(use.input));
}

function fixtureText(entry, relative) {
  const replaced = entry.fixture_replace?.[relative];
  const source = replaced ? path.join(here, replaced) : path.join(here, 'fixtures', entry.fixture, relative);
  return readFileSync(source, 'utf8').replaceAll('\r', '');
}

function checkEvidence(check, uses, cwd, entry) {
  const current = relative => {
    const file = path.join(cwd, relative);
    return existsSync(file) ? readFileSync(file, 'utf8').replaceAll('\r', '') : undefined;
  };

  switch (check.type) {
    case 'trace': {
      return uses.some(use => matchesStep(use, check));
    }

    case 'no_trace': {
      return !uses.some(use => matchesStep(use, check));
    }

    case 'sequence': {
      let from = 0;
      for (const step of check.steps) {
        const found = uses.findIndex((use, index) => index >= from && matchesStep(use, step));
        if (found === -1) {
          return false;
        }

        // Inclusive: one Bash call may both plant and test (`sed -i ... && npm test`).
        from = found;
      }

      return true;
    }

    case 'file_contains': {
      const text = current(check.path);
      return text !== undefined && new RegExp(check.match, 'iu').test(text);
    }

    case 'file_unchanged': {
      return check.paths.every(relative => current(relative) === fixtureText(entry, relative));
    }

    case 'file_changed': {
      return check.paths.every(relative => current(relative) !== undefined && current(relative) !== fixtureText(entry, relative));
    }

    case 'command': {
      return spawnSync(check.run, {cwd, shell: true, stdio: 'ignore', timeout: 120_000}).status === 0;
    }

    default: {
      throw new Error(`unknown evidence type ${check.type}`);
    }
  }
}

function judge(entry, output, cwd) {
  const uses = toolUses(output);
  const invoked = uses.some(use => use.name === 'Skill' && use.input.includes(skillName));
  const finalText = (() => {
    for (const line of output.split('\n').reverse()) {
      try {
        const event = JSON.parse(line);
        if (event.type === 'result') {
          return event.result ?? '';
        }
      } catch {}
    }

    return '';
  })();

  if (entry.kind === 'trigger') {
    return {invoked, passed: entry.decoy ? !invoked : invoked, tools: uses.map(use => use.name)};
  }

  if (entry.kind === 'action' && entry.evidence?.all) {
    const checks = entry.evidence.all.map(check => ({type: check.type, why: check.why, passed: checkEvidence(check, uses, cwd, entry)}));
    return {invoked, passed: checks.every(check => check.passed), checks, tools: uses.map(use => `${use.name}:${use.input.slice(0, 80)}`)};
  }

  if (entry.kind === 'action') {
    const evidence = entry.evidence ?? {};
    const byTrace = evidence.type === 'trace' && uses.some(use => use.name === evidence.tool && (!evidence.input_match || new RegExp(evidence.input_match, 'u').test(use.input)));
    const byFile = evidence.or?.type === 'file' && existsSync(path.join(cwd, evidence.or.path));
    // `and`: the action must also have produced complete output (a script that dies halfway still shows up in the trace).
    const andPath = evidence.and?.type === 'file_contains' ? path.join(cwd, evidence.and.path) : undefined;
    const byContent = !evidence.and || (andPath !== undefined && existsSync(andPath) && new RegExp(evidence.and.match, 'u').test(readFileSync(andPath, 'utf8')));
    return {invoked, passed: (byTrace || byFile) && byContent, byTrace, byFile, byContent, tools: uses.map(use => `${use.name}:${use.input.slice(0, 80)}`)};
  }

  // Outcome: regexes in the expectations (written as "regex: ..." or "(regex: ...)") against the files the run wrote plus the final text.
  const written = readdirSync(cwd).filter(name => name.endsWith('.md') || name.endsWith('.txt')).map(name => readFileSync(path.join(cwd, name), 'utf8')).join('\n');
  const haystack = `${written}\n${finalText}`;
  const checks = [];
  for (const expectation of entry.expectations) {
    const match = expectation.match(/regex:\s*(.+?)\)?\s*$/u);
    if (match) {
      let pattern = match[1].trim();
      if (pattern.endsWith(')') && !pattern.includes('(')) {
        pattern = pattern.slice(0, -1);
      }

      checks.push({expectation, passed: new RegExp(pattern, 'iu').test(haystack)});
    }
  }

  return {invoked, passed: checks.length > 0 && checks.every(check => check.passed), checks, files: readdirSync(cwd)};
}

const entries = suite.evals.filter(entry => only.length === 0 || only.includes(entry.id));

// --rejudge DIR: grade a finished run again from its stored transcripts and case directories (after fixing a check that
// was wrong), without new sessions. Rewrites DIR/results.json and prints the summary as a fresh run would.
const rejudge = option('--rejudge', undefined);
if (rejudge) {
  const stored = JSON.parse(readFileSync(path.join(rejudge, 'results.json'), 'utf8'));
  for (const result of stored.results) {
    const entry = suite.evals.find(candidate => candidate.id === result.id);
    Object.assign(result, judge(entry, readFileSync(result.transcript, 'utf8'), result.cwd), {rejudged: new Date().toISOString()});
    console.log(`${result.id} run ${result.run}: ${result.passed ? 'pass' : 'FAIL'} (re-judged)`);
  }

  writeFileSync(path.join(rejudge, 'results.json'), JSON.stringify(stored, null, 2));
  summarize(stored.results, stored.baseline);
  process.exit(0);
}

// --selftest: judge every fixture case and every `evidence.all` case on its untouched fixture (if any) with an empty transcript. Each must fail (a case that
// passes when nothing happened proves nothing); the per-check results show which checks carry the verdict.
if (args.includes('--selftest')) {
  let bad = 0;
  for (const entry of entries.filter(candidate => candidate.fixture || candidate.evidence?.all)) {
    const cwd = mkdtempSync(path.join(tmpdir(), `${skillName}-selftest-${entry.id}-`));
    prepareFixture(entry, cwd);
    const result = judge(entry, '', cwd);
    bad += result.passed ? 1 : 0;
    console.log(`${result.passed ? 'BAD ' : 'ok  '} ${entry.id} fails on an idle run: ${result.checks.map(check => `${check.type}=${check.passed}`).join(' ')} (${cwd})`);
  }

  process.exit(bad === 0 ? 0 : 1);
}
const jobs = [];
for (const entry of entries) {
  const runs = baseline ? 1 : Number(runsOverride ?? entry.runs ?? 3);
  for (let run = 1; run <= runs; run++) {
    jobs.push({entry, run});
  }
}

const results = [];
async function worker() {
  while (jobs.length > 0) {
    const {entry, run} = jobs.shift();
    const result = await runOnce(entry, run);
    results.push({id: entry.id, kind: entry.kind, decoy: Boolean(entry.decoy), run, ...result});
    console.log(`${entry.id} run ${run}: ${result.passed ? 'pass' : 'FAIL'} (invoked=${result.invoked}, ${result.seconds}s, exit ${result.code})`);
  }
}

await Promise.all(Array.from({length: concurrency}, () => worker()));

results.sort((a, b) => a.id.localeCompare(b.id) || a.run - b.run);
writeFileSync(path.join(out, 'results.json'), JSON.stringify({skill: skillName, baseline, date: new Date().toISOString(), results}, null, 2));

summarize(results, baseline);

// Summary per case, judged as TESTING.md §7 says: trigger 2 of 3, decoy 0 of 3, action and outcome every run.
function summarize(results, isBaseline) {
  const byCase = new Map();
  for (const result of results) {
    const list = byCase.get(result.id) ?? [];
    list.push(result);
    byCase.set(result.id, list);
  }

  let passedCases = 0;
  for (const [id, list] of byCase) {
    const entry = suite.evals.find(candidate => candidate.id === id);
    const passes = list.filter(result => result.passed).length;
    const invoked = list.filter(result => result.invoked).length;
    let verdict;
    if (entry.kind === 'trigger' && !entry.decoy) {
      verdict = invoked >= Math.ceil(list.length * 2 / 3);
    } else if (entry.decoy) {
      verdict = invoked === 0;
    } else {
      verdict = passes === list.length;
    }

    passedCases += verdict ? 1 : 0;
    console.log(`${verdict ? 'PASS' : 'FAIL'} ${id} (${entry.kind}${entry.decoy ? ', decoy' : ''}): ${passes}/${list.length} runs passed, skill invoked in ${invoked}/${list.length}`);
  }

  console.log(`\n${passedCases}/${byCase.size} cases passed${isBaseline ? ' (baseline, skill absent)' : ''}. Results: ${path.join(rejudge ?? out, 'results.json')}`);
}
