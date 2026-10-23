#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { isMainModule } from './main-module.ts';
import { CHECK_USAGE, PATHS_USAGE, runCheck, runPaths } from './check.ts';
import { REQUIRE_INTENT_USAGE, runRequireIntent } from './require-intent.ts';
import { PLANVERIFY_GATE_USAGE, runPlanVerifyGate } from './planverify-gate.ts';
import { FEATURE_USAGE, runFeature } from './feature.ts';
import { SETUP_PLAN_USAGE, SETUP_TASKS_USAGE, runSetupPlan, runSetupTasks } from './setup.ts';
import { TemplateResolutionError, resolveTemplateContent } from './template.ts';

export const CLI_VERSION = '0.1.0';

const USAGE = `che — newchiwan delivery harness CLI

Usage: che <command> [options]

Commands:
  paths [--json]                                   Resolve feature paths (never persists)
  check [--json] [--require-spec] [--require-tasks] [--include-tasks]
  require-intent [--json]                          Gate /che-compound-specify on docs/intents/
  planverify-gate <slug> [--json]                  Gate /che-compound-implement on the planverify verdict
  feature set <dir> | feature show [--json]        Manage the .che/feature.json pointer
  template <name> --references-dir <dir> [--json]  Resolve a bundled references/ template
  setup-plan --references-dir <dir> [--json]       Create plan.md from plan-template
  setup-tasks --references-dir <dir> [--json]      Resolve the tasks template + docs

Global:
  che --version        Print the CLI version
  che --help           Show this help message
  che help <command>   Show a command's usage
`;

const TEMPLATE_USAGE =
  'Usage: che template <name> --references-dir <dir> [--json]\n' +
  "  --references-dir <dir>  Directory holding the skill's bundled <name>.md\n" +
  '  --json                  Output results in JSON format\n' +
  '  --help                  Show this help message\n';

const COMMAND_USAGE: Record<string, string> = {
  paths: PATHS_USAGE,
  check: CHECK_USAGE,
  'require-intent': REQUIRE_INTENT_USAGE,
  'planverify-gate': PLANVERIFY_GATE_USAGE,
  feature: FEATURE_USAGE,
  template: TEMPLATE_USAGE,
  'setup-plan': SETUP_PLAN_USAGE,
  'setup-tasks': SETUP_TASKS_USAGE,
};

export function main(argv: string[]): number {
  if (argv.length === 0) {
    process.stdout.write(USAGE);
    return 0;
  }

  const [command, ...rest] = argv;

  if (command === '--version') {
    process.stdout.write(CLI_VERSION + '\n');
    return 0;
  }
  if (command === '--help' || command === '-h') {
    process.stdout.write(USAGE);
    return 0;
  }
  if (command === 'help') {
    const topic = rest[0];
    if (topic === undefined) {
      process.stdout.write(USAGE);
      return 0;
    }
    const usage = COMMAND_USAGE[topic];
    if (usage === undefined) {
      process.stderr.write(`ERROR: Unknown command '${topic}'\n`);
      process.stderr.write(USAGE);
      return 2;
    }
    process.stdout.write(usage);
    return 0;
  }

  switch (command) {
    case 'paths':
      return runPaths(rest);
    case 'check':
      return runCheck(rest);
    case 'require-intent':
      return runRequireIntent(rest);
    case 'planverify-gate':
      return runPlanVerifyGate(rest);
    case 'feature':
      return runFeature(rest);
    case 'template':
      return runTemplate(rest);
    case 'setup-plan':
      return runSetupPlan(rest);
    case 'setup-tasks':
      return runSetupTasks(rest);
    default:
      process.stderr.write(`ERROR: Unknown command '${command}'\n`);
      process.stderr.write(USAGE);
      return 2;
  }
}

function runTemplate(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(TEMPLATE_USAGE);
    return 0;
  }

  let positionals: string[];
  let values: Record<string, unknown>;
  try {
    const parsed = parseArgs({
      args: argv,
      options: { json: { type: 'boolean' }, 'references-dir': { type: 'string' } },
      allowPositionals: true,
      strict: true,
    });
    positionals = parsed.positionals;
    values = parsed.values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(TEMPLATE_USAGE);
    return 2;
  }

  const name = positionals[0];
  const referencesDir = values['references-dir'];
  if (typeof name !== 'string' || name === '') {
    process.stderr.write('ERROR: template requires a template name argument\n');
    process.stderr.write(TEMPLATE_USAGE);
    return 2;
  }
  if (typeof referencesDir !== 'string' || referencesDir === '') {
    process.stderr.write('ERROR: --references-dir is required\n');
    process.stderr.write(TEMPLATE_USAGE);
    return 2;
  }

  let content: string | null;
  try {
    content = resolveTemplateContent(name, referencesDir);
  } catch (err) {
    if (err instanceof TemplateResolutionError) {
      process.stderr.write(`ERROR: ${err.message}\n`);
      return 1;
    }
    throw err;
  }
  if (content === null) {
    process.stderr.write(`ERROR: Could not resolve required ${name} from ${referencesDir}\n`);
    return 1;
  }

  if (values.json) {
    process.stdout.write(JSON.stringify({ TEMPLATE_NAME: name, TEMPLATE_CONTENT: content }) + '\n');
    return 0;
  }
  process.stdout.write(content);
  return 0;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
