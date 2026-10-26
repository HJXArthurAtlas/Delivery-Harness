// Inlined require-intent gate (was scripts/bash/require-intent.sh).
//
// Gate before /che-compound-specify: the CURRENT task (session binding or
// explicit --feature, per resolveTask's order) must already have an intent
// doc at <taskDir>/intent.md. The intent step (/che-compound-intent) creates
// the task directory and binds the session, so a missing intent doc means
// intent never ran — specify must not proceed.
//
// The toggle is user-configurable, read in this order:
//   1. CHE_REQUIRE_INTENT env (on/true/1/yes, off/false/0/no)
//   2. require_intent: in <repoRoot>/.che/config.yml (same value set)
//   3. default on
// An invalid value is an error (exit 1): the gate fails closed.
// Gate off is a silent no-op (does not even resolve the task).

import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  findSpecifyRoot,
  resolveTask,
  type TaskDir,
} from './feature-paths.ts';
import { isFile } from './check.ts';
import { readCheConfigValue } from './config.ts';

export const REQUIRE_INTENT_USAGE = `Usage: che require-intent [--json] [--feature <slug>] [--session <id>]
  --json            Output results in JSON format
  --feature <slug>  Resolve this task explicitly (overrides session binding)
  --session <id>    Resolve via the session's task binding
  --help            Show this help message
`;

const TOGGLE_VALUES: Record<string, boolean> = {
  on: true,
  true: true,
  '1': true,
  yes: true,
  off: false,
  false: false,
  '0': false,
  no: false,
};

function findProjectRoot(): string {
  const root = findSpecifyRoot(process.cwd());
  if (root === null) {
    throw new FeatureResolutionError(
      `ERROR: not in an SDD project (.git not found in any parent of ${process.cwd()})`,
    );
  }
  return root;
}

function parseToggle(raw: string): boolean | null {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    value = value.slice(1, -1).trim();
  }
  value = value.replace(/\r$/, '').toLowerCase();
  if (value === '') return null;
  return TOGGLE_VALUES[value] ?? null;
}

/** Env wins over .che/config.yml; default on. Invalid values throw. */
export function resolveRequireIntentGate(repoRoot: string): boolean {
  let raw = (process.env.CHE_REQUIRE_INTENT ?? '').trim();
  let source = 'CHE_REQUIRE_INTENT';
  if (raw === '') {
    raw = readCheConfigValue(repoRoot, 'require_intent').trim();
    source = '.che/config.yml require_intent';
  }
  if (raw === '') return true;
  const parsed = parseToggle(raw);
  if (parsed === null) {
    throw new FeatureResolutionError(
      `ERROR: invalid require_intent toggle "${raw}" from ${source} (expected on/off)`,
    );
  }
  return parsed;
}

function blockedMessage(taskDir: string, intentDoc: string): string {
  return (
    '\n' +
    `  ⚠  Task directory has no intent doc (${taskDir}).\n` +
    '\n' +
    '  Run /che-compound-intent BEFORE /che-compound-specify to capture\n' +
    '  the goal, constraints, and failure conditions for this task.\n' +
    '\n' +
    "  This is mandatory per the che-compound extension's discipline:\n" +
    `  the intent doc must exist at ${intentDoc}.\n` +
    '\n'
  );
}

export function runRequireIntent(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(REQUIRE_INTENT_USAGE);
    return 0;
  }

  let values: Record<string, unknown>;
  try {
    values = parseArgs({
      args: argv,
      options: {
        json: { type: 'boolean' },
        feature: { type: 'string' },
        session: { type: 'string' },
      },
      allowPositionals: false,
      strict: true,
    }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(REQUIRE_INTENT_USAGE);
    return 2;
  }
  const feature = typeof values.feature === 'string' ? values.feature : '';
  const session = typeof values.session === 'string' ? values.session : '';

  let repoRoot: string;
  let gateOn: boolean;
  try {
    repoRoot = findProjectRoot();
    gateOn = resolveRequireIntentGate(repoRoot);
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }

  // Gate off: silent no-op (mirrors planverify-gate's off mode) — the task is
  // not even resolved, matching planverify-gate not reading the report.
  if (!gateOn) {
    if (values.json) {
      process.stdout.write(
        JSON.stringify({
          REPO_ROOT: repoRoot,
          GATE: 'off',
          TASK_DIR: null,
          SLUG: '',
          INTENT_DOC: '',
        }) + '\n',
      );
    }
    return 0;
  }

  let task: TaskDir;
  try {
    task = resolveTask(repoRoot, { feature, session });
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      if (values.json) {
        process.stdout.write(
          JSON.stringify({
            REPO_ROOT: repoRoot,
            GATE: 'on',
            TASK_DIR: null,
            SLUG: '',
            INTENT_DOC: '',
          }) + '\n',
        );
      }
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }

  const intentDoc = join(task.path, 'intent.md');
  const intentDocFound = isFile(intentDoc);

  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        REPO_ROOT: repoRoot,
        GATE: 'on',
        TASK_DIR: task.path,
        SLUG: task.slug,
        INTENT_DOC: intentDoc,
      }) + '\n',
    );
  }

  if (!intentDocFound) {
    process.stderr.write(blockedMessage(task.name, intentDoc));
    return 1;
  }

  if (!values.json) {
    process.stdout.write(
      `✓ Intent doc found for '${task.slug}' — /che-compound-specify may proceed.\n`,
    );
  }
  return 0;
}
