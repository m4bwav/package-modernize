#!/usr/bin/env node
// Runs the cases in evals.json through the Claude Code CLI headlessly (`claude -p --output-format stream-json`), each in a
// fresh scratch directory, and judges them on evidence: a Skill tool call naming this skill in the trace for trigger cases
// (none for decoys), the named tool call or file for action cases, the regex expectations for outcome cases. It never grades
// on the reply's wording. The skill must be installed where the CLI finds it (a junction in ~/.claude/skills); for a baseline
// run, remove or rename that junction first and pass --baseline so the report says so.
//
// Usage: node run-headless.mjs [--case id[,id]] [--runs N] [--concurrency N] [--out DIR] [--baseline] [--model MODEL]
// Output: <out>/results.json and one <out>/<case>-<run>.jsonl transcript per run; a summary on stdout for TESTS.md.
import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, readdirSync} from 'node:fs';
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

function runOnce(entry, run) {
  const cwd = mkdtempSync(path.join(tmpdir(), `${skillName}-${entry.id}-${run}-`));
  const kind = entry.kind;
  const cliArgs = ['-p', entry.prompt, '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
    '--max-turns', String(MAX_TURNS[kind]), '--allowedTools', ...TOOLS[kind]];
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

  if (entry.kind === 'action') {
    const evidence = entry.evidence ?? {};
    const byTrace = evidence.type === 'trace' && uses.some(use => use.name === evidence.tool && (!evidence.input_match || new RegExp(evidence.input_match, 'u').test(use.input)));
    const byFile = evidence.or?.type === 'file' && existsSync(path.join(cwd, evidence.or.path));
    return {invoked, passed: byTrace || byFile, byTrace, byFile, tools: uses.map(use => `${use.name}:${use.input.slice(0, 80)}`)};
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

// Summary per case, judged as TESTING.md §7 says: trigger 2 of 3, decoy 0 of 3, action and outcome every run.
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

console.log(`\n${passedCases}/${byCase.size} cases passed${baseline ? ' (baseline, skill absent)' : ''}. Results: ${path.join(out, 'results.json')}`);
