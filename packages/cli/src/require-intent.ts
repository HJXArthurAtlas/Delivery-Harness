// Inlined require-intent gate (was scripts/bash/require-intent.sh).
//
// Gate: refuses to let /che-compound-specify proceed if no intent doc exists
// in docs/intents/. The toggle is user-configurable, read in this order:
//   1. CHE_REQUIRE_INTENT env (on/true/1/yes, off/false/0/no)
//   2. require_intent: in <repoRoot>/.che/config.yml (same value set)
//   3. default on
// An invalid value is an error (exit 1): the gate fails closed.
//
// When .che/feature.json registers a feature, the gate additionally checks
// the intent doc for THAT feature's slug (basename of the registered feature
// directory, timestamp prefix stripped): docs/intents/{slug}.intent.md must
// exist. This is the single-source-of-truth check that keeps the intent slug
// and the spec directory name aligned (see `deriveFeatureSlug`).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { FeatureResolutionError, findSpecifyRoot, readFeatureSlug } from './feature-paths.ts';
import { isFile } from './check.ts';
import { readCheConfigValue } from './config.ts';

export const REQUIRE_INTENT_USAGE = `Usage: che require-intent [--json]
  --json    Output results in JSON format
  --help    Show this help message
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

export function countIntentDocs(repoRoot: string): number {
  const intentDir = join(repoRoot, 'docs', 'intents');
  let entries: string[];
  try {
    if (!statSync(intentDir).isDirectory()) return 0;
    entries = readdirSync(intentDir);
  } catch {
    return 0;
  }
  return entries.filter((entry) => entry.endsWith('.intent.md') && isFile(join(intentDir, entry)))
    .length;
}

function blockedMessage(intentDirExists: boolean): string {
  if (!intentDirExists) {
    return (
      '\n' +
      '  ⚠  No intent docs found (docs/intents/ does not exist).\n' +
      '\n' +
      '  Run /che-compound-intent BEFORE /che-compound-specify to capture\n' +
      '  the goal, constraints, and failure conditions for this feature.\n' +
      '\n' +
      "  This is mandatory per the che-compound extension's discipline.\n" +
      '  /che-compound-specify will not proceed until at least one intent doc exists.\n' +
      '\n'
    );
  }
  return (
    '\n' +
    '  ⚠  docs/intents/ exists but contains no *.intent.md files.\n' +
    '\n' +
    '  Run /che-compound-intent BEFORE /che-compound-specify.\n' +
    '\n'
  );
}

function blockedSlugMessage(slug: string, intentDoc: string, intentCount: number): string {
  return (
    '\n' +
    `  ⚠  No intent doc matches the current feature slug "${slug}".\n` +
    '\n' +
    `  .che/feature.json registers this feature as slug "${slug}", so the intent\n` +
    `  doc must live at ${intentDoc}.\n` +
    `  Found ${intentCount} intent doc(s) in docs/intents/, none matching.\n` +
    '\n' +
    '  Run /che-compound-intent BEFORE /che-compound-specify and keep the slug\n' +
    '  identical (accept the proposed slug, or reply `override` with the same one).\n' +
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
      options: { json: { type: 'boolean' } },
      allowPositionals: false,
      strict: true,
    }).values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(REQUIRE_INTENT_USAGE);
    return 2;
  }

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

  const intentDir = join(repoRoot, 'docs', 'intents');
  let intentDirExists = false;
  try {
    intentDirExists = statSync(intentDir).isDirectory();
  } catch {
    intentDirExists = false;
  }
  const intentCount = countIntentDocs(repoRoot);
  const featureSlug = readFeatureSlug(repoRoot);
  const intentDoc = featureSlug === '' ? '' : join(intentDir, `${featureSlug}.intent.md`);
  const intentDocFound = intentDoc !== '' && isFile(intentDoc);

  if (values.json) {
    process.stdout.write(
      JSON.stringify({
        REPO_ROOT: repoRoot,
        GATE: gateOn ? 'on' : 'off',
        INTENT_DIR: intentDir,
        INTENT_COUNT: intentCount,
        SLUG: featureSlug,
        INTENT_DOC: intentDoc,
      }) + '\n',
    );
  }

  // Gate off: silent no-op (mirrors planverify-gate's off mode).
  if (!gateOn) return 0;

  if (intentCount === 0) {
    process.stderr.write(blockedMessage(intentDirExists));
    return 1;
  }

  if (intentDoc !== '' && !intentDocFound) {
    process.stderr.write(blockedSlugMessage(featureSlug, intentDoc, intentCount));
    return 1;
  }

  if (!values.json) {
    const slugNote =
      intentDoc === '' ? '' : ` — slug "${featureSlug}" matches ${intentDoc.replace(`${repoRoot}/`, '')}`;
    process.stdout.write(
      `✓ Found ${intentCount} intent doc(s) in docs/intents/${slugNote} — /che-compound-specify may proceed.\n`,
    );
  }
  return 0;
}
