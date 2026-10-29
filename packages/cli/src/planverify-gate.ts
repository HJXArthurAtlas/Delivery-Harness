// Inlined planverify gate (was scripts/bash/planverify-gate.sh + planverify-lib.sh).
//
// Phase-boundary gate before /che-compound-implement. Two independent gate
// switches are read (env wins over .che/config.yml for each):
//   - adr_gate (SKC_ADR_GATE / `adr_gate:`)   default block — the ADR
//     mechanical layer: the planverify report must exist, carry
//     `adr_status: clean`, and its recorded spec/plan/tasks SHA-256 hashes
//     must still match the artifacts on disk (a stale report is rejected,
//     never read as clean).
//   - planverify_gate (SKC_PLANVERIFY_GATE / `planverify_gate:`) default off —
//     the semantic verdict: refuses BLOCKED_DRIFT and BLOCKED_ADR.
// An invalid value for either is an error (exit 1): a typo must not silently
// disable an explicitly requested block, so the gate fails closed on
// configuration. When both gates are off the command is a silent no-op.
//
// Under blocking evaluation, the verdict must be one of PASS / REPLAN_ALLOWED /
// BLOCKED_DRIFT / BLOCKED_ADR — an unrecognized verdict fails closed.

import { createHash } from 'node:crypto';
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

  Gates (env wins over .che/config.yml, invalid values fail closed):
    adr_gate (SKC_ADR_GATE)             block (default) | off
      Report must exist, adr_status: clean, and recorded spec/plan/tasks
      SHA-256 hashes must match the artifacts on disk.
    planverify_gate (SKC_PLANVERIFY_GATE)  off (default) | block
      Verdict must not be BLOCKED_DRIFT or BLOCKED_ADR.
  Both off -> no-op.
`;

const GATE_MODES: Record<string, boolean> = { block: true, off: true };
const VERDICTS: Record<string, boolean> = {
  PASS: true,
  REPLAN_ALLOWED: true,
  BLOCKED_DRIFT: true,
  BLOCKED_ADR: true,
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

function resolveGateMode(
  repoRoot: string,
  envKey: 'SKC_ADR_GATE' | 'SKC_PLANVERIFY_GATE',
  configKey: 'adr_gate' | 'planverify_gate',
  defaultMode: 'block' | 'off',
): 'block' | 'off' {
  let raw = (process.env[envKey] ?? '').trim();
  let source = envKey;
  if (raw === '') {
    raw = readCheConfigValue(repoRoot, configKey).trim();
    source = `.che/config.yml ${configKey}`;
  }
  if (raw === '') return defaultMode;
  const value = stripQuotesAndTrim(raw).toLowerCase();
  if (!GATE_MODES[value]) {
    throw new FeatureResolutionError(
      `ERROR: invalid ${configKey} mode "${raw}" from ${source} (expected block/off)`,
    );
  }
  return value as 'block' | 'off';
}

/** Env wins over .che/config.yml; default off. Invalid values throw. */
export function resolvePlanVerifyGateMode(repoRoot: string): 'block' | 'off' {
  return resolveGateMode(repoRoot, 'SKC_PLANVERIFY_GATE', 'planverify_gate', 'off');
}

/** Env wins over .che/config.yml; default block. Invalid values throw. */
export function resolveAdrGateMode(repoRoot: string): 'block' | 'off' {
  return resolveGateMode(repoRoot, 'SKC_ADR_GATE', 'adr_gate', 'block');
}

/** First `<key>:` line in the planverify report frontmatter, or '' when absent. */
export function readPlanVerifyField(reportPath: string, key: string): string {
  let raw: string;
  try {
    raw = readFileSync(reportPath, 'utf-8');
  } catch {
    return '';
  }
  const pattern = new RegExp(`^${key}:[ \\t]*(.*)$`);
  for (const line of raw.split('\n')) {
    const match = pattern.exec(line);
    if (match !== null) return match[1].replace(/[ \\t\\r]+$/, '');
  }
  return '';
}

function sha256Of(path: string): string | null {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

function missingReportMessage(slug: string): string {
  return (
    '\n' +
    `  ⚠  Gate is on but no planverify report exists for '${slug}'.\n` +
    '\n' +
    `  Run /che-compound-planverify for '${slug}' before /che-compound-implement.\n` +
    '\n'
  );
}

function staleReportMessage(slug: string): string {
  return (
    '\n' +
    `  ⚠  The planverify report for '${slug}' no longer matches the current\n` +
    '  spec/plan/tasks (recorded SHA-256 differs, or a hash is missing).\n' +
    '\n' +
    '  The report is stale: re-run /che-compound-planverify to refresh it.\n' +
    '\n'
  );
}

function adrNotCleanMessage(slug: string, adrStatus: string): string {
  const reason =
    adrStatus === ''
      ? 'The report predates the ADR layer (no adr_status field).'
      : `The report's adr_status is '${adrStatus}' (not clean).`;
  return (
    '\n' +
    `  ⛔ ADR gate is blocking '${slug}': ${reason}\n` +
    '\n' +
    '  Fix the plan, or record the decision change via /che-adr-draft and have\n' +
    '  it ratified (adr accept), then re-run /che-compound-planverify. A draft\n' +
    '  ADR alone does not clear the gate.\n' +
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

function blockedAdrMessage(): string {
  return (
    '\n' +
    '  ⛔ Plan verdict is BLOCKED_ADR.\n' +
    '\n' +
    '  The plan departs from a governing ADR, or the ADR mechanical layer\n' +
    '  reported errors. Fix the plan, or record the change via /che-adr-draft\n' +
    '  and have it ratified, then re-run /che-compound-planverify.\n' +
    '\n'
  );
}

function unknownVerdictMessage(verdict: string): string {
  return (
    '\n' +
    `  ⛔ Unrecognized planverify verdict '${verdict}'.\n` +
    '\n' +
    '  The gate fails closed on unknown verdicts. Re-run\n' +
    '  /che-compound-planverify to produce a valid report.\n' +
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
  let adrMode: 'block' | 'off';
  try {
    repoRoot = findProjectRoot();
    mode = resolvePlanVerifyGateMode(repoRoot);
    adrMode = resolveAdrGateMode(repoRoot);
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }

  // Resolve the task: explicit positional wins; otherwise the standard
  // chain (--feature > env > session binding > auto). Resolution runs even
  // when both gates are off, only for the JSON report.
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
            ADR_GATE: adrMode,
            REPORT: null,
            VERDICT: null,
            ADR_STATUS: null,
            HASHES_MATCH: null,
            PROCEED: mode !== 'block' || adrMode !== 'block',
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
  const blocking = mode === 'block' || adrMode === 'block';
  let reportExists = false;
  let verdict = '';
  let adrStatus = '';
  let hashesMatch: boolean | null = null;
  if (blocking) {
    reportExists = isFile(report);
    verdict = reportExists ? readPlanVerifyField(report, 'verdict') : '';
    adrStatus = reportExists ? readPlanVerifyField(report, 'adr_status') : '';
    if (reportExists) {
      hashesMatch = true;
      for (const [field, file] of [
        ['spec_sha256', 'spec.md'],
        ['plan_sha256', 'plan.md'],
        ['tasks_sha256', 'tasks.md'],
      ] as const) {
        const recorded = readPlanVerifyField(report, field);
        const actual = sha256Of(join(task.path, file));
        if (recorded === '' || actual === null || recorded !== actual) {
          hashesMatch = false;
          break;
        }
      }
    }
  }

  // Gate evaluation: ADR mechanical layer first, then verdict validity
  // (fail-closed whenever any gate blocks), then the semantic verdict.
  let blockReason: 'report' | 'stale' | 'adr' | 'drift' | 'blocked_adr' | 'unknown_verdict' | null =
    null;
  if (adrMode === 'block') {
    if (!reportExists) blockReason = 'report';
    else if (adrStatus !== 'clean') blockReason = 'adr';
    else if (hashesMatch !== true) blockReason = 'stale';
  }
  if (blockReason === null && blocking) {
    if (verdict === '') blockReason = 'report';
    else if (!VERDICTS[verdict]) blockReason = 'unknown_verdict';
  }
  if (blockReason === null && mode === 'block') {
    if (verdict === 'BLOCKED_DRIFT') blockReason = 'drift';
    else if (verdict === 'BLOCKED_ADR') blockReason = 'blocked_adr';
  }

  const proceed = blockReason === null;

  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        REPO_ROOT: repoRoot,
        SLUG: slug,
        MODE: mode,
        ADR_GATE: adrMode,
        REPORT: reportExists ? report : null,
        VERDICT: verdict === '' ? null : verdict,
        ADR_STATUS: adrStatus === '' ? null : adrStatus,
        HASHES_MATCH: hashesMatch,
        PROCEED: proceed,
      }) + '\n',
    );
  }

  // Both gates off: silent no-op.
  if (!blocking) return 0;

  switch (blockReason) {
    case 'report':
      process.stderr.write(missingReportMessage(slug));
      return 1;
    case 'stale':
      process.stderr.write(staleReportMessage(slug));
      return 1;
    case 'adr':
      process.stderr.write(adrNotCleanMessage(slug, adrStatus));
      return 1;
    case 'drift':
      process.stderr.write(driftMessage());
      return 1;
    case 'blocked_adr':
      process.stderr.write(blockedAdrMessage());
      return 1;
    case 'unknown_verdict':
      process.stderr.write(unknownVerdictMessage(verdict));
      return 1;
  }

  if (!values.json) {
    process.stdout.write(
      `✓ planverify verdict for '${slug}': ${verdict} — /che-compound-implement may proceed.\n`,
    );
  }
  return 0;
}
