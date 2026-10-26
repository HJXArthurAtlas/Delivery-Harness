// che task create <slug> / che task list
//
// create — the flow's first write, at intent time:
//   - allocates the next 3-digit zero-padded number across specs/ numeric
//     prefixes (PingCode identifier dirs don't affect numbering)
//   - enforces slug uniqueness across all task dirs
//   - creates specs/NNN-<slug>/ with a metadata.json skeleton (one-line
//     summary + runs timeline)
//   - optionally binds the session (same write path as `che feature bind`)
// list — quick scan: dir, slug, derived stage, one-line summary per task.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  bindSession,
  deriveStage,
  getRepoRoot,
  isValidSlug,
  listTaskDirs,
  readMetadataSummary,
  type TaskDir,
} from './feature-paths.ts';

export const TASK_USAGE = `Usage: che task <command> [options]

Commands:
  che task create <slug> [--session <id>] [--summary <text>] [--json]
      Create the task directory; --summary is the one-line "what is this about"
  che task list [--json]
      List tasks: directory, slug, derived stage, one-line summary

Options:
  --session <id>  Bind this session to the new task after creation
  --json          Output results in JSON format
  --help          Show this help message
`;

function nextTaskNumber(tasks: TaskDir[]): number {
  let max = 0;
  for (const task of tasks) {
    const match = /^(\d+)-/.exec(task.name);
    if (match !== null) {
      const value = parseInt(match[1], 10);
      if (Number.isFinite(value) && value > max) max = value;
    }
  }
  return max + 1;
}

export function runTask(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    process.stdout.write(TASK_USAGE);
    return argv.length === 0 ? 2 : 0;
  }

  const subcommand = argv[0];
  const rest = argv.slice(1);

  if (subcommand === 'create') return runTaskCreate(rest);
  if (subcommand === 'list') return runTaskList(rest);

  process.stderr.write(`ERROR: Unknown task command '${subcommand}'\n`);
  process.stderr.write(TASK_USAGE);
  return 2;
}

function runTaskCreate(argv: string[]): number {
  let values: Record<string, unknown>;
  let positionals: string[];
  try {
    const parsed = parseArgs({
      args: argv,
      options: {
        json: { type: 'boolean' },
        session: { type: 'string' },
        summary: { type: 'string' },
      },
      allowPositionals: true,
      strict: true,
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(TASK_USAGE);
    return 2;
  }

  if (positionals.length === 0 || positionals.length > 1) {
    process.stderr.write('ERROR: expected exactly one <slug> positional\n');
    process.stderr.write(TASK_USAGE);
    return 2;
  }
  const slug = positionals[0];
  if (!isValidSlug(slug)) {
    process.stderr.write(
      `ERROR: invalid slug '${slug}' (expected lowercase alphanumeric + hyphens, e.g. user-auth)\n`,
    );
    return 2;
  }

  const repoRoot = getRepoRoot();
  const tasks = listTaskDirs(repoRoot);
  const duplicates = tasks.filter((t) => t.slug === slug);
  if (duplicates.length > 0) {
    process.stderr.write(
      `ERROR: slug '${slug}' already exists:\n` +
        duplicates.map((t) => `  - ${t.name}`).join('\n') +
        '\n',
    );
    return 1;
  }

  const number = nextTaskNumber(tasks);
  const dirName = `${String(number).padStart(3, '0')}-${slug}`;
  const taskDir = join(repoRoot, 'specs', dirName);
  mkdirSync(taskDir, { recursive: true });
  const summaryValue = values.summary;
  const summary = (typeof summaryValue === 'string' ? summaryValue : '').trim();
  const metadata = { slug, summary, created_at: new Date().toISOString(), runs: {} };
  writeFileSync(join(taskDir, 'metadata.json'), JSON.stringify(metadata) + '\n', 'utf-8');

  const sessionValue = values.session;
  const session = (typeof sessionValue === 'string' ? sessionValue : '').trim();
  let bound = false;
  if (session !== '') {
    try {
      bound = bindSession(repoRoot, session, slug);
    } catch (err) {
      if (err instanceof FeatureResolutionError) {
        process.stderr.write(err.message + '\n');
        return 1;
      }
      throw err;
    }
  }

  if (values.json) {
    process.stdout.write(
      JSON.stringify({ TASK_DIR: taskDir, SLUG: slug, NUMBER: number, BOUND: bound }) + '\n',
    );
    return 0;
  }
  process.stdout.write(`TASK_DIR: ${taskDir}\n`);
  process.stdout.write(`SLUG: ${slug}\n`);
  if (session !== '') process.stdout.write(`BOUND: ${session} -> ${slug}\n`);
  return 0;
}

function runTaskList(argv: string[]): number {
  let values: Record<string, unknown>;
  try {
    values = parseArgs({
      args: argv,
      options: { json: { type: 'boolean' } },
      allowPositionals: false,
      strict: true,
    }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(TASK_USAGE);
    return 2;
  }

  const tasks = listTaskDirs(getRepoRoot());
  const rows = tasks.map((task) => ({
    DIR: task.path,
    SLUG: task.slug,
    STAGE: deriveStage(task.path),
    SUMMARY: readMetadataSummary(task.path),
  }));

  if (values.json) {
    process.stdout.write(JSON.stringify({ tasks: rows }) + '\n');
    return 0;
  }
  if (rows.length === 0) {
    process.stdout.write('NO_TASKS\n');
    return 0;
  }
  for (const row of rows) {
    const summary = row.SUMMARY === '' ? '(no summary)' : row.SUMMARY;
    process.stdout.write(`${row.SLUG}  [${row.STAGE}]  ${summary}\n`);
  }
  return 0;
}
