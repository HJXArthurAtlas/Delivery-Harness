import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  formatPackCommand,
  getFeaturePaths,
  type FeaturePaths,
} from './feature-paths.ts';
import {
  TemplateResolutionError,
  resolveTemplate,
  resolveTemplateContent,
} from './template.ts';
import { availableDocs, isFile, printDocsBlock } from './check.ts';

export const SETUP_PLAN_USAGE = `Usage: che setup-plan --references-dir <dir> [--json]
  --references-dir <dir>  Directory holding the skill's bundled plan-template.md
  --json                  Output results in JSON format
  --help                  Show this help message
`;

export const SETUP_TASKS_USAGE = `Usage: che setup-tasks --references-dir <dir> [--json]
  --references-dir <dir>  Directory holding the skill's bundled tasks-template.md
  --json                  Output results in JSON format
  --help                  Show this help message
`;

interface ParsedSetupArgs {
  json: boolean;
  referencesDir: string;
}

function parseSetupArgs(argv: string[], usage: string): ParsedSetupArgs | null {
  let values: Record<string, unknown>;
  try {
    values = parseArgs({
      args: argv,
      options: { json: { type: 'boolean' }, 'references-dir': { type: 'string' } },
      allowPositionals: false,
      strict: true,
    }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(usage);
    return null;
  }
  const referencesDir = values['references-dir'];
  if (typeof referencesDir !== 'string' || referencesDir === '') {
    process.stderr.write('ERROR: --references-dir is required\n');
    process.stderr.write(usage);
    return null;
  }
  return { json: Boolean(values.json), referencesDir };
}

function resolveOrReport(): FeaturePaths | null {
  try {
    return getFeaturePaths();
  } catch (err) {
    if (err instanceof FeatureResolutionError) {
      process.stderr.write(err.message + '\n');
      process.stderr.write('ERROR: Failed to resolve feature paths\n');
      return null;
    }
    throw err;
  }
}

export function runSetupPlan(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(SETUP_PLAN_USAGE);
    return 0;
  }
  const args = parseSetupArgs(argv, SETUP_PLAN_USAGE);
  if (args === null) return 2;

  const paths = resolveOrReport();
  if (paths === null) return 1;

  mkdirSync(paths.featureDir, { recursive: true });

  // Status messages go to stderr in JSON mode so stdout stays pure JSON.
  const status = args.json
    ? (line: string) => process.stderr.write(line + '\n')
    : (line: string) => process.stdout.write(line + '\n');

  if (isFile(paths.implPlan)) {
    status(`Plan already exists at ${paths.implPlan}, skipping template copy`);
  } else {
    let templateContent: string | null;
    try {
      templateContent = resolveTemplateContent('plan-template', args.referencesDir);
    } catch (err) {
      if (err instanceof TemplateResolutionError) {
        process.stderr.write(`Error: ${err.message}\n`);
        return 1;
      }
      throw err;
    }
    if (templateContent !== null) {
      writeFileSync(paths.implPlan, templateContent, 'utf-8');
      status(`Copied plan template to ${paths.implPlan}`);
    } else {
      status('Warning: Plan template not found');
      writeFileSync(paths.implPlan, '', 'utf-8');
    }
  }

  if (args.json) {
    process.stdout.write(
      JSON.stringify({
        FEATURE_SPEC: paths.featureSpec,
        IMPL_PLAN: paths.implPlan,
        FEATURE_DIR: paths.featureDir,
        BRANCH: paths.currentBranch,
      }) + '\n',
    );
    return 0;
  }

  process.stdout.write(`FEATURE_SPEC: ${paths.featureSpec}\n`);
  process.stdout.write(`IMPL_PLAN: ${paths.implPlan}\n`);
  process.stdout.write(`FEATURE_DIR: ${paths.featureDir}\n`);
  process.stdout.write(`BRANCH: ${paths.currentBranch}\n`);
  return 0;
}

export function runSetupTasks(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(SETUP_TASKS_USAGE);
    return 0;
  }
  const args = parseSetupArgs(argv, SETUP_TASKS_USAGE);
  if (args === null) return 2;

  const paths = resolveOrReport();
  if (paths === null) return 1;

  if (!isFile(paths.implPlan)) {
    process.stderr.write(`ERROR: plan.md not found in ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('plan')} first to create the implementation plan.\n`,
    );
    return 1;
  }

  if (!isFile(paths.featureSpec)) {
    process.stderr.write(`ERROR: spec.md not found in ${paths.featureDir}\n`);
    process.stderr.write(
      `Run ${formatPackCommand('specify')} first to create the feature structure.\n`,
    );
    return 1;
  }

  const docs = availableDocs(paths, false);

  let tasksTemplateContent: string | null;
  try {
    tasksTemplateContent = resolveTemplateContent('tasks-template', args.referencesDir);
  } catch (err) {
    if (err instanceof TemplateResolutionError) {
      process.stderr.write(`ERROR: ${err.message}\n`);
      return 1;
    }
    throw err;
  }
  if (tasksTemplateContent === null) {
    process.stderr.write(
      "ERROR: Could not resolve required tasks-template from this skill's references/ directory\n",
    );
    return 1;
  }

  const tasksTemplate = resolveTemplate('tasks-template', args.referencesDir);

  if (args.json) {
    process.stdout.write(
      JSON.stringify({
        FEATURE_DIR: paths.featureDir,
        AVAILABLE_DOCS: docs,
        TASKS_TEMPLATE: tasksTemplate ?? '',
        TASKS_TEMPLATE_CONTENT: tasksTemplateContent,
      }) + '\n',
    );
    return 0;
  }

  process.stdout.write(`FEATURE_DIR: ${paths.featureDir}\n`);
  process.stdout.write(`TASKS_TEMPLATE: ${tasksTemplate ?? 'not found'}\n`);
  process.stdout.write(printDocsBlock(paths, false));
  return 0;
}
