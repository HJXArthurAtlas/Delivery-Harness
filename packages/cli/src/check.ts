import { readdirSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  formatPackCommand,
  getFeaturePaths,
  slugFromDirBasename,
  type FeaturePaths,
} from './feature-paths.ts';

export const PATHS_USAGE = `Usage: che paths [--json] [--feature <slug>] [--session <id>]
  --json            Output results in JSON format
  --feature <slug>  Resolve this task explicitly (overrides session binding)
  --session <id>    Resolve via the session's task binding
  --help            Show this help message
`;

export const CHECK_USAGE = `Usage: che check [--json] [--require-spec] [--require-tasks] [--include-tasks] [--feature <slug>] [--session <id>]
  --json           Output results in JSON format
  --require-spec   Fail when spec.md is missing in the task directory
  --require-tasks  Fail when tasks.md is missing in the task directory
  --include-tasks  Include tasks.md in AVAILABLE_DOCS
  --feature <slug> Resolve this task explicitly (overrides session binding)
  --session <id>   Resolve via the session's task binding
  --help           Show this help message
`;

export function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function dirHasEntries(path: string): boolean {
  try {
    return statSync(path).isDirectory() && readdirSync(path).length > 0;
  } catch {
    return false;
  }
}

export function availableDocs(paths: FeaturePaths, includeTasks: boolean): string[] {
  const docs: string[] = [];
  if (isFile(paths.research)) docs.push('research.md');
  if (isFile(paths.dataModel)) docs.push('data-model.md');
  if (dirHasEntries(paths.contractsDir)) docs.push('contracts/');
  if (isFile(paths.quickstart)) docs.push('quickstart.md');
  if (includeTasks && isFile(paths.tasks)) docs.push('tasks.md');
  return docs;
}

function statusMarker(ok: boolean): string {
  return ok ? '✓' : '✗';
}

export function printDocsBlock(paths: FeaturePaths, includeTasks: boolean): string {
  const lines = ['AVAILABLE_DOCS:'];
  lines.push(`  ${statusMarker(isFile(paths.research))} research.md`);
  lines.push(`  ${statusMarker(isFile(paths.dataModel))} data-model.md`);
  lines.push(`  ${statusMarker(dirHasEntries(paths.contractsDir))} contracts/`);
  lines.push(`  ${statusMarker(isFile(paths.quickstart))} quickstart.md`);
  if (includeTasks) {
    lines.push(`  ${statusMarker(isFile(paths.tasks))} tasks.md`);
  }
  return lines.join('\n') + '\n';
}

/** Resolve feature paths; on failure print the specific error + summary line. */
function resolveOrReport(feature: string, session: string): FeaturePaths | null {
  try {
    return getFeaturePaths({ feature, session });
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      process.stderr.write('ERROR: Failed to resolve feature paths\n');
      return null;
    }
    throw err;
  }
}

function parseCommandArgs(argv: string[], usage: string, options: Record<string, { type: 'boolean' | 'string' }>): Record<string, unknown> | null {
  try {
    return parseArgs({ args: argv, options, allowPositionals: false, strict: true }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(usage);
    return null;
  }
}

export function runPaths(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(PATHS_USAGE);
    return 0;
  }
  const values = parseCommandArgs(argv, PATHS_USAGE, {
    json: { type: 'boolean' },
    feature: { type: 'string' },
    session: { type: 'string' },
  });
  if (values === null) return 2;

  const paths = resolveOrReport(String(values.feature ?? ''), String(values.session ?? ''));
  if (paths === null) return 1;

  const slug = slugFromDirBasename(basename(paths.featureDir));
  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        REPO_ROOT: paths.repoRoot,
        BRANCH: paths.currentBranch,
        SLUG: slug,
        FEATURE_DIR: paths.featureDir,
        FEATURE_SPEC: paths.featureSpec,
        IMPL_PLAN: paths.implPlan,
        TASKS: paths.tasks,
      }) + '\n',
    );
    return 0;
  }

  process.stdout.write(`REPO_ROOT: ${paths.repoRoot}\n`);
  process.stdout.write(`BRANCH: ${paths.currentBranch}\n`);
  process.stdout.write(`SLUG: ${slug}\n`);
  process.stdout.write(`FEATURE_DIR: ${paths.featureDir}\n`);
  process.stdout.write(`FEATURE_SPEC: ${paths.featureSpec}\n`);
  process.stdout.write(`IMPL_PLAN: ${paths.implPlan}\n`);
  process.stdout.write(`TASKS: ${paths.tasks}\n`);
  return 0;
}

export function runCheck(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(CHECK_USAGE);
    return 0;
  }
  const values = parseCommandArgs(argv, CHECK_USAGE, {
    json: { type: 'boolean' },
    'require-spec': { type: 'boolean' },
    'require-tasks': { type: 'boolean' },
    'include-tasks': { type: 'boolean' },
    feature: { type: 'string' },
    session: { type: 'string' },
  });
  if (values === null) return 2;

  const paths = resolveOrReport(String(values.feature ?? ''), String(values.session ?? ''));
  if (paths === null) return 1;

  const featureDirStat = (() => {
    try {
      return statSync(paths.featureDir).isDirectory();
    } catch {
      return false;
    }
  })();
  if (!featureDirStat) {
    process.stderr.write(`ERROR: Feature directory not found: ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('specify')} first to create the feature structure.\n`,
    );
    return 1;
  }

  if (!isFile(paths.implPlan)) {
    process.stderr.write(`ERROR: plan.md not found in ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('plan')} first to create the implementation plan.\n`,
    );
    return 1;
  }

  if (values['require-spec'] && !isFile(paths.featureSpec)) {
    process.stderr.write(`ERROR: spec.md not found in ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('specify')} first to create the feature specification.\n`,
    );
    return 1;
  }

  if (values['require-tasks'] && !isFile(paths.tasks)) {
    process.stderr.write(`ERROR: tasks.md not found in ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('plan')} first to create the task list.\n`,
    );
    return 1;
  }

  const docs = availableDocs(paths, Boolean(values['include-tasks']));

  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        FEATURE_DIR: paths.featureDir,
        AVAILABLE_DOCS: docs,
      }) + '\n',
    );
    return 0;
  }

  process.stdout.write(`FEATURE_DIR:${paths.featureDir}\n`);
  process.stdout.write(printDocsBlock(paths, Boolean(values['include-tasks'])));
  return 0;
}
