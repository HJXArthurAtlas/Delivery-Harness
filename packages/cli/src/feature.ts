import { parseArgs } from 'node:util';
import {
  FeatureResolutionError,
  getRepoRoot,
  persistFeatureJson,
  readFeatureJsonFeatureDirectory,
} from './feature-paths.ts';

export const FEATURE_USAGE = `Usage: che feature <command> [options]

Commands:
  che feature set <dir>   Persist the feature directory to .che/feature.json
  che feature show [--json]  Print the stored feature_directory value

Options:
  --json    Output results in JSON format
  --help    Show this help message
`;

const POINTER_ERROR =
  'ERROR: Feature directory not found. Set CHE_FEATURE_DIRECTORY or run the specify command to create .che/feature.json.';

export function runFeature(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    process.stdout.write(FEATURE_USAGE);
    return argv.length === 0 ? 2 : 0;
  }

  const subcommand = argv[0];
  const rest = argv.slice(1);

  if (subcommand === 'set') {
    let dir: string;
    try {
      dir = parseArgs({ args: rest, options: {}, allowPositionals: true, strict: true })
        .positionals[0] as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`ERROR: ${message}\n`);
      process.stderr.write(FEATURE_USAGE);
      return 2;
    }
    if (typeof dir !== 'string' || dir === '') {
      process.stderr.write('ERROR: feature set requires a feature directory argument\n');
      process.stderr.write(FEATURE_USAGE);
      return 2;
    }
    const noPersistRaw = process.env.CHE_FEATURE_NO_PERSIST ?? '';
    if (noPersistRaw === '1' || noPersistRaw === 'true') return 0;
    const repoRoot = getRepoRoot();
    persistFeatureJson(repoRoot, dir);
    return 0;
  }

  if (subcommand === 'show') {
    let json = false;
    try {
      json = Boolean(
        parseArgs({ args: rest, options: { json: { type: 'boolean' } }, allowPositionals: false, strict: true })
          .values.json,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`ERROR: ${message}\n`);
      process.stderr.write(FEATURE_USAGE);
      return 2;
    }
    let stored: string;
    try {
      stored = readFeatureJsonFeatureDirectory(getRepoRoot());
    } catch (err) {
      if (err instanceof FeatureResolutionError) {
        process.stderr.write(err.message + '\n');
        return 1;
      }
      throw err;
    }
    if (!stored) {
      process.stderr.write(POINTER_ERROR + '\n');
      return 1;
    }
    if (json) {
      process.stdout.write(JSON.stringify({ feature_directory: stored }) + '\n');
      return 0;
    }
    process.stdout.write(stored + '\n');
    return 0;
  }

  process.stderr.write(`ERROR: Unknown feature command '${subcommand}'\n`);
  process.stderr.write(FEATURE_USAGE);
  return 2;
}
