// che feature — session↔task bindings in .che/feature.json (machine-local,
// gitignored). Bindings store the task slug, never the path, so the
// push-time directory rename (001-x → PROJ-4921-x) is transparent.

import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  bindSession,
  clearSession,
  getRepoRoot,
  listTaskDirs,
  readBindings,
} from './feature-paths.ts';

export const FEATURE_USAGE = `Usage: che feature <command> [options]

Commands:
  che feature bind <slug> --session <id>    Bind a session to a task (rebind overwrites)
  che feature bind --clear --session <id>   Remove the session binding
  che feature show [--session <id>] [--json]  Show bindings (or one session's)

Options:
  --json    Output results in JSON format
  --help    Show this help message
`;

interface ParsedFeatureArgs {
  values: Record<string, unknown>;
  positionals: string[];
}

function parseBindArgs(argv: string[]): ParsedFeatureArgs | null {
  try {
    const parsed = parseArgs({
      args: argv,
      options: {
        json: { type: 'boolean' },
        session: { type: 'string' },
        clear: { type: 'boolean' },
      },
      allowPositionals: true,
      strict: true,
    });
    return { values: parsed.values, positionals: parsed.positionals };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(FEATURE_USAGE);
    return null;
  }
}

function runBind(argv: string[]): number {
  const parsed = parseBindArgs(argv);
  if (parsed === null) return 2;
  const { values, positionals } = parsed;
  const sessionValue = values.session;
  const session = (typeof sessionValue === 'string' ? sessionValue : '').trim();
  if (session === '') {
    process.stderr.write('ERROR: feature bind requires --session <id>\n');
    process.stderr.write(FEATURE_USAGE);
    return 2;
  }

  const repoRoot = getRepoRoot();

  if (values.clear) {
    if (positionals.length > 0) {
      process.stderr.write('ERROR: feature bind --clear takes no positional\n');
      process.stderr.write(FEATURE_USAGE);
      return 2;
    }
    let removed: boolean;
    try {
      removed = clearSession(repoRoot, session);
    } catch (err) {
      if (err instanceof FeatureResolutionError) {
        process.stderr.write(err.message + '\n');
        return 1;
      }
      throw err;
    }
    if (values.json) {
      process.stdout.write(JSON.stringify({ SESSION: session, CLEARED: removed }) + '\n');
      return 0;
    }
    process.stdout.write(removed ? `UNBOUND: ${session}\n` : `NOT_BOUND: ${session}\n`);
    return 0;
  }

  if (positionals.length !== 1) {
    process.stderr.write('ERROR: feature bind requires exactly one <slug> positional\n');
    process.stderr.write(FEATURE_USAGE);
    return 2;
  }
  const slug = positionals[0];

  const tasks = listTaskDirs(repoRoot);
  const matches = tasks.filter((t) => t.slug === slug || t.name === slug);
  if (matches.length === 0) {
    process.stderr.write(
      `ERROR: no task matches '${slug}'.\n` +
        'Run `che task create <slug> --session <id>` first.\n' +
        `Existing tasks:\n` +
        (tasks.map((t) => `  - ${t.slug}  (${t.name})`).join('\n') || '  (none)') +
        '\n',
    );
    return 1;
  }
  if (matches.length > 1) {
    process.stderr.write(
      `ERROR: slug '${slug}' matches multiple directories:\n` +
        matches.map((t) => `  - ${t.name}`).join('\n') +
        '\n',
    );
    return 1;
  }

  const changed = bindSession(repoRoot, session, slug);
  const taskDir = matches[0].path;
  if (values.json) {
    process.stdout.write(
      JSON.stringify({ SESSION: session, SLUG: slug, TASK_DIR: taskDir, CHANGED: changed }) + '\n',
    );
    return 0;
  }
  process.stdout.write(`BOUND: ${session} -> ${slug} (${taskDir})${changed ? '' : ' [unchanged]'}\n`);
  return 0;
}

function runShow(argv: string[]): number {
  let values: Record<string, unknown>;
  try {
    values = parseArgs({
      args: argv,
      options: { json: { type: 'boolean' }, session: { type: 'string' } },
      allowPositionals: false,
      strict: true,
    }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(FEATURE_USAGE);
    return 2;
  }

  const repoRoot = getRepoRoot();
  const bindings = readBindings(repoRoot);
  const sessionValue = values.session;
  const session = (typeof sessionValue === 'string' ? sessionValue : '').trim();

  if (session !== '') {
    const binding = bindings[session];
    if (!binding) {
      process.stderr.write(`ERROR: session '${session}' is not bound to any task\n`);
      return 1;
    }
    if (values.json) {
      process.stdout.write(
        JSON.stringify({
          SESSION: session,
          SLUG: binding.slug,
          BOUND_AT: binding.bound_at,
        }) + '\n',
      );
      return 0;
    }
    process.stdout.write(`SESSION: ${session}\nSLUG: ${binding.slug}\nBOUND_AT: ${binding.bound_at}\n`);
    return 0;
  }

  const entries = Object.entries(bindings).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (values.json) {
    process.stdout.write(JSON.stringify({ bindings }) + '\n');
    return 0;
  }
  if (entries.length === 0) {
    process.stdout.write('NO_BINDINGS\n');
    return 0;
  }
  for (const [key, binding] of entries) {
    process.stdout.write(`SESSION: ${key}  SLUG: ${binding.slug}  BOUND_AT: ${binding.bound_at}\n`);
  }
  return 0;
}

export function runFeature(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    process.stdout.write(FEATURE_USAGE);
    return argv.length === 0 ? 2 : 0;
  }

  const subcommand = argv[0];
  const rest = argv.slice(1);

  if (subcommand === 'bind') return runBind(rest);
  if (subcommand === 'show') return runShow(rest);

  process.stderr.write(`ERROR: Unknown feature command '${subcommand}'\n`);
  process.stderr.write(FEATURE_USAGE);
  return 2;
}
