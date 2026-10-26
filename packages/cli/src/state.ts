// che state — per-task runs timeline in specs/<task>/metadata.json.
//
// The metadata file stores ONLY what cannot be derived: wall-clock runs per
// flow stage (start/end pairs; rework = multiple runs; end:null = ongoing).
// Stage/next-step derivation lives in feature-paths/check — never stored.
//
//   che state start <stage>   append {start,end:null}; reuses an open run
//   che state done <stage>    closes the open run (error when none open)
//   che state show [--json]   task stage, next step, per-stage durations

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  deriveStage,
  getRepoRoot,
  resolveTask,
} from './feature-paths.ts';

export const STATE_USAGE = `Usage: che state <command> [<stage>] [--feature <slug>] [--session <id>] [--json]

Commands:
  che state start <stage>   Open a run for the stage (idempotent while open)
  che state done <stage>    Close the open run for the stage
  che state show            Stage, next step, and per-stage durations

Stages (in flow order): intent, expectations, specify, clarify, design, plan,
tasks, gapfill, planverify, intentguard, writeback, implement.

Options:
  --feature <slug>  Resolve this task explicitly (overrides session binding)
  --session <id>    Resolve via the session's task binding
  --json            Output results in JSON format (show)
  --help            Show this help message
`;

/** Flow order; OPTIONAL stages may be skipped without blocking the chain. */
const STAGES = [
  'intent',
  'expectations',
  'specify',
  'clarify',
  'design',
  'plan',
  'tasks',
  'gapfill',
  'planverify',
  'intentguard',
  'writeback',
  'implement',
] as const;

type Stage = (typeof STAGES)[number];

interface Run {
  start: string;
  end: string | null;
}

interface Metadata {
  slug: string;
  created_at: string;
  runs: Partial<Record<Stage, Run[]>>;
}

function metadataPath(taskDir: string): string {
  return join(taskDir, 'metadata.json');
}

function readMetadata(taskDir: string): Metadata {
  try {
    const data: unknown = JSON.parse(readFileSync(metadataPath(taskDir), 'utf-8'));
    if (typeof data !== 'object' || data === null) throw new Error('not an object');
    const meta = data as Metadata;
    if (typeof meta.slug !== 'string' || typeof meta.runs !== 'object' || meta.runs === null) {
      throw new Error('missing slug/runs');
    }
    return meta;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new FeatureResolutionError(`ERROR: cannot read ${metadataPath(taskDir)}: ${detail}`);
  }
}

function writeMetadata(taskDir: string, meta: Metadata): void {
  writeFileSync(metadataPath(taskDir), JSON.stringify(meta) + '\n', 'utf-8');
}

function parseStage(raw: string): Stage {
  if (!(STAGES as readonly string[]).includes(raw)) {
    throw new FeatureResolutionError(
      `ERROR: unknown stage '${raw}' (expected one of: ${STAGES.join(', ')})`,
    );
  }
  return raw as Stage;
}

function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

/** Total wall-clock seconds; open runs count up to now. */
function stageDurationSeconds(runs: Run[], now: number): number {
  let total = 0;
  for (const run of runs) {
    const startMs = Date.parse(run.start);
    const endMs = run.end === null ? now : Date.parse(run.end);
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs) {
      total += Math.round((endMs - startMs) / 1000);
    }
  }
  return total;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

/** Next stage = first flow stage without a closed run (pure runs view). */
function nextStage(runs: Metadata['runs']): Stage | '' {
  for (const stage of STAGES) {
    const stageRuns = runs[stage];
    if (!Array.isArray(stageRuns) || stageRuns.length === 0) return stage;
    if (!stageRuns.some((run) => run.end !== null)) return stage;
  }
  return '';
}

interface ResolvedArgs {
  values: Record<string, unknown>;
  positionals: string[];
}

function parseStateArgs(argv: string[]): ResolvedArgs {
  return parseArgs({
    args: argv,
    options: {
      json: { type: 'boolean' },
      feature: { type: 'string' },
      session: { type: 'string' },
    },
    allowPositionals: true,
    strict: true,
  });
}

function resolutionOpts(values: Record<string, unknown>): { feature: string; session: string } {
  return {
    feature: typeof values.feature === 'string' ? values.feature : '',
    session: typeof values.session === 'string' ? values.session : '',
  };
}

function runStart(argv: string[]): number {
  let parsed: ResolvedArgs;
  try {
    parsed = parseStateArgs(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(STATE_USAGE);
    return 2;
  }
  if (parsed.positionals.length !== 1) {
    process.stderr.write('ERROR: state start requires exactly one <stage>\n');
    process.stderr.write(STATE_USAGE);
    return 2;
  }

  try {
    const stage = parseStage(parsed.positionals[0]);
    const repoRoot = getRepoRoot();
    const task = resolveTask(repoRoot, resolutionOpts(parsed.values));
    const meta = readMetadata(task.path);
    const runs = (meta.runs[stage] ??= []);
    const openRun = runs.find((run) => run.end === null);
    if (openRun !== undefined) {
      process.stdout.write(`RUN OPEN: ${stage} (since ${openRun.start}) — already running, no change\n`);
      return 0;
    }
    runs.push({ start: new Date().toISOString(), end: null });
    writeMetadata(task.path, meta);
    process.stdout.write(`RUN START: ${stage} — ${task.slug}\n`);
    return 0;
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }
}

function runDone(argv: string[]): number {
  let parsed: ResolvedArgs;
  try {
    parsed = parseStateArgs(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(STATE_USAGE);
    return 2;
  }
  if (parsed.positionals.length !== 1) {
    process.stderr.write('ERROR: state done requires exactly one <stage>\n');
    process.stderr.write(STATE_USAGE);
    return 2;
  }

  try {
    const stage = parseStage(parsed.positionals[0]);
    const repoRoot = getRepoRoot();
    const task = resolveTask(repoRoot, resolutionOpts(parsed.values));
    const meta = readMetadata(task.path);
    const runs = meta.runs[stage] ?? [];
    const openRun = [...runs].reverse().find((run) => run.end === null);
    if (openRun === undefined) {
      process.stderr.write(
        `ERROR: no open run for stage '${stage}' in ${task.slug} — run \`che state start ${stage}\` first\n`,
      );
      return 1;
    }
    openRun.end = new Date().toISOString();
    writeMetadata(task.path, meta);
    process.stdout.write(`RUN DONE: ${stage} — ${task.slug}\n`);
    return 0;
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }
}

function runShow(argv: string[]): number {
  let parsed: ResolvedArgs;
  try {
    parsed = parseStateArgs(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(STATE_USAGE);
    return 2;
  }
  if (parsed.positionals.length > 0) {
    process.stderr.write('ERROR: state show takes no positional\n');
    process.stderr.write(STATE_USAGE);
    return 2;
  }

  try {
    const repoRoot = getRepoRoot();
    const task = resolveTask(repoRoot, resolutionOpts(parsed.values));
    const meta = readMetadata(task.path);
    const stage = deriveStage(task.path);
    const next = nextStage(meta.runs);
    const now = Date.now();

    const durations: Record<string, number> = {};
    const runCounts: Record<string, number> = {};
    for (const key of Object.keys(meta.runs)) {
      if (!isStage(key)) continue;
      const stageRuns = meta.runs[key];
      if (!Array.isArray(stageRuns) || stageRuns.length === 0) continue;
      durations[key] = stageDurationSeconds(stageRuns, now);
      runCounts[key] = stageRuns.length;
    }

    if (parsed.values.json) {
      process.stdout.write(
        JSON.stringify({
          TASK_DIR: task.path,
          SLUG: task.slug,
          STAGE: stage,
          NEXT: next === '' ? null : next,
          RUNS: meta.runs,
          DURATION_SECONDS: durations,
        }) + '\n',
      );
      return 0;
    }

    process.stdout.write(`TASK: ${task.name}  (${task.path})\n`);
    process.stdout.write(`STAGE: ${stage}\n`);
    process.stdout.write(`NEXT: ${next === '' ? '(flow complete)' : next}\n`);
    for (const entry of STAGES) {
      const seconds = durations[entry];
      if (seconds === undefined) continue;
      const open = (meta.runs[entry] ?? []).some((run) => run.end === null) ? ' [running]' : '';
      process.stdout.write(`  ${entry}: ${formatDuration(seconds)} (${runCounts[entry]} run(s))${open}\n`);
    }
    return 0;
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      return 1;
    }
    throw err;
  }
}

export function runState(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    process.stdout.write(STATE_USAGE);
    return argv.length === 0 ? 2 : 0;
  }

  const subcommand = argv[0];
  const rest = argv.slice(1);

  if (subcommand === 'start') return runStart(rest);
  if (subcommand === 'done') return runDone(rest);
  if (subcommand === 'show') return runShow(rest);

  process.stderr.write(`ERROR: Unknown state command '${subcommand}'\n`);
  process.stderr.write(STATE_USAGE);
  return 2;
}
