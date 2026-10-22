// Port of the bundled common.py resolver semantics (byte-exact contract).
//
// Env contract: CHE_INIT_DIR, CHE_FEATURE, CHE_FEATURE_DIRECTORY,
// CHE_FEATURE_NO_PERSIST — renamed from the SPECIFY_* contract that died with
// the Python helpers.

import { existsSync, mkdirSync, realpathSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, resolve as resolvePath } from 'node:path';

export interface FeaturePaths {
  repoRoot: string;
  currentBranch: string;
  featureDir: string;
  featureSpec: string;
  implPlan: string;
  tasks: string;
  research: string;
  dataModel: string;
  quickstart: string;
  contractsDir: string;
}

/** Thrown with a message that already starts with "ERROR: ". */
export class FeatureResolutionError extends Error {}

function trimTrailingSeparators(value: string): string {
  let text = value;
  while (text.length > 1 && text.endsWith('/')) {
    text = text.slice(0, -1);
  }
  return text;
}

export function findSpecifyRoot(startDir: string): string | null {
  // Project-root marker is currently the .git directory; revisit when a
  // dedicated SDD marker is introduced.
  let current = realpathSync(startDir);
  for (;;) {
    if (existsSync(join(current, '.git'))) return current;
    const parent = resolvePath(current, '..');
    if (parent === current) return null;
    current = parent;
  }
}

function resolveInitDir(): string {
  const raw = process.env.CHE_INIT_DIR ?? '';
  const candidate = isAbsolute(raw) ? raw : resolvePath(process.cwd(), raw);
  let initRoot: string;
  try {
    initRoot = realpathSync(candidate);
    if (!statSync(initRoot).isDirectory()) throw new Error('not a directory');
  } catch {
    throw new FeatureResolutionError(
      `ERROR: CHE_INIT_DIR does not point to an existing directory: ${raw}`,
    );
  }
  if (!existsSync(join(initRoot, '.git'))) {
    throw new FeatureResolutionError(
      `ERROR: CHE_INIT_DIR is not a spec-driven development project (no .git directory): ${initRoot}`,
    );
  }
  return initRoot;
}

export function getRepoRoot(scriptDir?: string): string {
  if (process.env.CHE_INIT_DIR) return resolveInitDir();

  const specifyRoot = findSpecifyRoot(process.cwd());
  if (specifyRoot !== null) return specifyRoot;

  if (scriptDir !== undefined) {
    const scriptRoot = findSpecifyRoot(scriptDir);
    if (scriptRoot !== null) return scriptRoot;
  }

  return realpathSync(process.cwd());
}

export function readFeatureJsonFeatureDirectory(repoRoot: string): string {
  const featureJson = join(repoRoot, '.che', 'feature.json');
  let raw: string;
  try {
    raw = readFileSync(featureJson, 'utf-8');
  } catch {
    return '';
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return '';
  }
  if (typeof data !== 'object' || data === null) return '';
  const value = (data as Record<string, unknown>).feature_directory;
  return typeof value === 'string' ? value : '';
}

export function persistFeatureJson(repoRoot: string, featureDirValue: string): void {
  // Strip the repo root prefix lexically (no realpath) to mirror the
  // Bash/PowerShell helpers: with a symlinked <repo>/specs, resolving would
  // escape the repo and persist a machine-specific absolute path instead of
  // the relative "specs/NNN-name" the other variants store.
  let value = featureDirValue;
  if (isAbsolute(value)) {
    if (value === repoRoot) {
      value = '.';
    } else if (value.startsWith(repoRoot + '/')) {
      value = value.slice(repoRoot.length + 1);
    }
  }

  if (readFeatureJsonFeatureDirectory(repoRoot) === value) return;

  const memoryDir = join(repoRoot, '.che');
  mkdirSync(memoryDir, { recursive: true });
  writeFileSync(
    join(memoryDir, 'feature.json'),
    JSON.stringify({ feature_directory: value }) + '\n',
    'utf-8',
  );
}

function featureNoPersistFromEnv(): boolean {
  const raw = process.env.CHE_FEATURE_NO_PERSIST ?? '';
  return raw === '1' || raw === 'true';
}

export function getFeaturePaths(opts: { noPersist?: boolean; scriptDir?: string } = {}): FeaturePaths {
  const repoRoot = getRepoRoot(opts.scriptDir);
  let currentBranch = process.env.CHE_FEATURE ?? '';
  const noPersist = Boolean(opts.noPersist) || featureNoPersistFromEnv();

  const featureDirRaw = process.env.CHE_FEATURE_DIRECTORY ?? '';
  let featureDir: string;
  if (featureDirRaw) {
    featureDir = isAbsolute(featureDirRaw) ? featureDirRaw : join(repoRoot, featureDirRaw);
    if (!noPersist) persistFeatureJson(repoRoot, featureDirRaw);
  } else if (existsSync(join(repoRoot, '.che', 'feature.json'))) {
    const stored = readFeatureJsonFeatureDirectory(repoRoot);
    if (!stored) {
      throw new FeatureResolutionError(
        'ERROR: Feature directory not found. Set CHE_FEATURE_DIRECTORY or ensure .che/feature.json contains feature_directory.',
      );
    }
    featureDir = isAbsolute(stored) ? stored : join(repoRoot, stored);
  } else {
    throw new FeatureResolutionError(
      'ERROR: Feature directory not found. Set CHE_FEATURE_DIRECTORY or run the specify command to create .che/feature.json.',
    );
  }

  if (!currentBranch) {
    currentBranch = basename(trimTrailingSeparators(featureDir));
  }

  return {
    repoRoot,
    currentBranch,
    featureDir,
    featureSpec: join(featureDir, 'spec.md'),
    implPlan: join(featureDir, 'plan.md'),
    tasks: join(featureDir, 'tasks.md'),
    research: join(featureDir, 'research.md'),
    dataModel: join(featureDir, 'data-model.md'),
    quickstart: join(featureDir, 'quickstart.md'),
    contractsDir: join(featureDir, 'contracts'),
  };
}

export function formatPackCommand(commandName: string): string {
  let name = commandName.replace(/^\/+/, '');
  if (name.startsWith('che-compound-')) {
    name = name.slice('che-compound-'.length);
  }
  return `/che-compound-${name}`;
}
