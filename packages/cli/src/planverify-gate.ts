// Inlined planverify gate (was scripts/bash/planverify-gate.sh + planverify-lib.sh).
//
// Phase-boundary gate before /che-compound-implement: when the gate mode is
// "block", refuses to proceed until the feature's planverify report exists and
// its verdict is acceptable. The mode is read in this order:
//   1. SKC_PLANVERIFY_GATE env ("block" / "off")
//   2. planverify_gate: in <repoRoot>/.che/config.yml (same value set)
//   3. default off (no-op — consistent with every other compound command)
// An invalid value is an error (exit 1): a typo must not silently disable an
// explicitly requested block, so the gate fails closed on configuration.
//
// Under "block":
//   - docs/intents/<slug>.planverify.md missing  -> exit 1 (run planverify first)
//   - verdict: BLOCKED_DRIFT                     -> exit 1 (replan first)
//   - verdict: PASS | REPLAN_ALLOWED (any other) -> exit 0 (proceed)

import { readFileSync } from 'node:fs';
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

export const PLANVERIFY_GATE_USAGE = `Usage: che planverify-gate [<slug>] [--json] [--feature <slug>] [--session <id>]

  <slug>            Task slug; optional when --feature/--session resolves one
  --feature <slug>  Resolve this task explicitly (overrides session binding)
  --session <id>    Resolve via the session's task binding
  --json            Output results in JSON format
  --help            Show this help message
`;

const GATE_MODES: Record<string, boolean> = { block: true, off: true };

function findProjectRoot(): string {
  const root = findSpecifyRoot(process.cwd());
  if (root === null) {
    throw new FeatureResolutionError(
      `ERROR: not in an SDD project (.git not found in any parent of ${process.cwd()})`,
    );
  }
  return root;
}

function stripQuotesAndTrim(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    value = value.slice(1, -1).trim();
  }
  return value.replace(/\r$/, '');
}

/** Env wins over .che/config.yml; default off. Invalid values throw. */
export function resolvePlanVerifyGateMode(repoRoot: string): 'block' | 'off' {
  let raw = (process.env.SKC_PLANVERIFY_GATE ?? '').trim();
  let source = 'SKC_PLANVERIFY_GATE';
  if (raw === '') {
    raw = readCheConfigValue(repoRoot, 'planverify_gate').trim();
    source = '.che/config.yml planverify_gate';
  }
  if (raw === '') return 'off';
  const value = stripQuotesAndTrim(raw).toLowerCase();
  if (!GATE_MODES[value]) {
    throw new FeatureResolutionError(
      `ERROR: invalid planverify_gate mode "${raw}" from ${source} (expected block/off)`,
    );
  }
  return value as 'block' | 'off';
}

/** First `verdict:` line in the planverify report, or '' when absent. */
export function readPlanVerifyVerdict(reportPath: string): string {
  let raw: string;
  try {
    raw = readFileSync(reportPath, 'utf-8');
  } catch {
    return '';
  }
  for (const line of raw.split('\n')) {
    const match = /^verdict:[ \t]*(.*)$/.exec(line);
    if (match !== null) return match[1].replace(/[ \t\r]+$/, '');
  }
  return '';
}

function missingReportMessage(slug: string): string {
  return (
    '\n' +
    `  ⚠  SKC_PLANVERIFY_GATE=block but no planverify report exists for '${slug}'.\n` +
    '\n' +
    `  Run /che-compound-planverify for '${slug}' before /che-compound-implement.\n` +
    '\n'
  );
}

function driftMessage(): string {
  return (
    '\n' +
    '  ⛔ Plan verdict is BLOCKED_DRIFT.\n' +
    '\n' +
    '  The proposed plan drifts outside locked intent. Replan before\n' +
    '  implementing: re-run /che-compound-plan, then /che-compound-planverify.\n' +
    '\n'
  );
}

export function runPlanVerifyGate(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(PLANVERIFY_GATE_USAGE);
    return 0;
  }

  let values: Record<string, unknown>;
  let positionals: string[];
  try {
    const parsed = parseArgs({
      args: argv,
      options: {
        json: { type: 'boolean' },
        feature: { type: 'string' },
        session: { type: 'string' },
      },
      allowPositionals: true,
      strict: true,
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(PLANVERIFY_GATE_USAGE);
    return 2;
  }

  if (positionals.length > 1) {
    process.stderr.write('ERROR: expected at most one <slug> positional\n');
    process.stderr.write(PLANVERIFY_GATE_USAGE);
    return 2;
  }
  const positionalSlug = positionals[0];

  let repoRoot: string;
  let mode: 'block' | 'off';
  try {
    repoRoot = findProjectRoot();
    mode = resolvePlanVerifyGateMode(repoRoot);
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }

  // Resolve the task: explicit positional wins; otherwise the standard
  // chain (--feature > env > session binding > auto). Resolution runs even
  // in off mode only for the JSON report; off mode itself never blocks.
  let task: TaskDir;
  try {
    task = resolveTask(repoRoot, {
      feature: positionalSlug ?? (typeof values.feature === 'string' ? values.feature : ''),
      session: typeof values.session === 'string' ? values.session : '',
    });
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      if (values.json) {
        process.stdout.write(
          JSON.stringify({
            REPO_ROOT: repoRoot,
            SLUG: positionalSlug ?? '',
            MODE: mode,
            REPORT: null,
            VERDICT: null,
            PROCEED: mode !== 'block',
          }) + '\n',
        );
      }
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }
  const slug = task.slug;

  // Report lives inside the task directory (rename-safe: resolved per run).
  const report = join(task.path, 'planverify.md');
  let reportExists = false;
  let verdict = '';
  if (mode === 'block') {
    reportExists = isFile(report);
    verdict = reportExists ? readPlanVerifyVerdict(report) : '';
  }

  const proceed = mode !== 'block' || (verdict !== '' && verdict !== 'BLOCKED_DRIFT');

  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        REPO_ROOT: repoRoot,
        SLUG: slug,
        MODE: mode,
        REPORT: reportExists ? report : null,
        VERDICT: verdict === '' ? null : verdict,
        PROCEED: proceed,
      }) + '\n',
    );
  }

  // Gate off: silent no-op (mirrors require-intent's off mode).
  if (mode !== 'block') return 0;

  if (verdict === '') {
    process.stderr.write(missingReportMessage(slug));
    return 1;
  }

  if (verdict === 'BLOCKED_DRIFT') {
    process.stderr.write(driftMessage());
    return 1;
  }

  if (!values.json) {
    process.stdout.write(
      `✓ planverify verdict for '${slug}': ${verdict} — /che-compound-implement may proceed.\n`,
    );
  }
  return 0;
}
