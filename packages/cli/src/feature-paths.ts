// Task/session model.
//
// .che/feature.json holds per-session task bindings (machine-local,
// gitignored); the task directory under specs/ is the single source of truth
// for artifacts. Resolution order (resolveTask):
//   1. explicit --feature <slug|dir> argument
//   2. CHE_FEATURE_DIRECTORY environment variable (no longer persisted)
//   3. session binding from .che/feature.json (--session / CHE_SESSION_ID)
//   4. auto: exactly one task dir in specs/ → it; none → error; multiple →
//      ambiguity error listing slug + dir + derived stage
//
// Task directories: specs/<prefix>-<slug>/ where prefix is a 3+ digit
// zero-padded number (pre-PingCode) or a PingCode identifier like NCW-4921
// (post-push rename). Legacy timestamp dirs (YYYYMMDD-HHMMSS-*) are not task
// dirs. The slug is the stable handle: bindings store the slug, never the
// path, so the push-time rename is transparent.

import { existsSync, mkdirSync, readdirSync, realpathSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
    text = text.slice(1, -1);
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

// ---------------------------------------------------------------------------
// Task directories
// ---------------------------------------------------------------------------

const IDENTIFIER_PREFIX = /^[A-Za-z][A-Za-z0-9]*-\d+-/;
const NUMBER_PREFIX = /^\d+-/;
const TIMESTAMP_PREFIX = /^\d{8}-\d{6}-/;
const SLUG_BODY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Valid task slug (also the slug a freshly created dir must satisfy). */
export function isValidSlug(slug: string): boolean {
  return SLUG_BODY.test(slug);
}

/** True when the specs/ entry is a task directory under the current naming rule. */
export function isTaskDirName(name: string): boolean {
  if (TIMESTAMP_PREFIX.test(name)) return false;
  let rest: string;
  if (IDENTIFIER_PREFIX.test(name)) {
    rest = name.replace(IDENTIFIER_PREFIX, '');
  } else if (NUMBER_PREFIX.test(name)) {
    rest = name.replace(NUMBER_PREFIX, '');
  } else {
    return false;
  }
  return rest !== '' && SLUG_BODY.test(rest);
}

/**
 * Stable slug of a task dir: basename with the leading PingCode identifier
 * (`NCW-4921-`) or numeric (`001-`) prefix stripped. `NCW-4921-user-auth` →
 * `user-auth`; `001-user-auth` → `user-auth`. The identifier pattern is tried
 * first so its inner hyphen can never be mistaken for the slug separator.
 */
export function slugFromDirBasename(name: string): string {
  return name.replace(IDENTIFIER_PREFIX, '').replace(NUMBER_PREFIX, '');
}

export interface TaskDir {
  /** Directory basename, e.g. `001-user-auth` or `NCW-4921-user-auth`. */
  name: string;
  slug: string;
  /** Absolute path. */
  path: string;
}

export function listTaskDirs(repoRoot: string): TaskDir[] {
  const specsDir = join(repoRoot, 'specs');
  let entries: string[];
  try {
    if (!statSync(specsDir).isDirectory()) return [];
    entries = readdirSync(specsDir);
  } catch {
    return [];
  }
  const out: TaskDir[] = [];
  for (const name of entries.sort()) {
    const path = join(specsDir, name);
    try {
      if (!statSync(path).isDirectory()) continue;
    } catch {
      continue;
    }
    if (!isTaskDirName(name)) continue;
    out.push({ name, slug: slugFromDirBasename(name), path });
  }
  return out;
}

/** Coarse flow stage derived from which artifacts exist (never stored). */
export function deriveStage(taskDir: string): string {
  if (isFileIn(taskDir, 'tasks.md')) return 'tasks';
  if (isFileIn(taskDir, 'plan.md')) return 'plan';
  if (isFileIn(taskDir, 'spec.md')) return 'specify';
  if (isFileIn(taskDir, 'intent.md')) return 'intent';
  return 'created';
}

function isFileIn(dir: string, name: string): boolean {
  try {
    return statSync(join(dir, name)).isFile();
  } catch {
    return false;
  }
}

/** One-line task summary from metadata.json; '' when absent or unreadable. */
export function readMetadataSummary(taskDir: string): string {
  try {
    const data: unknown = JSON.parse(readFileSync(join(taskDir, 'metadata.json'), 'utf-8'));
    if (typeof data !== 'object' || data === null) return '';
    const summary = (data as Record<string, unknown>).summary;
    return typeof summary === 'string' ? summary : '';
  } catch {
    return '';
  }
}

function taskListing(tasks: TaskDir[]): string {
  return tasks.map((t) => `  - ${t.slug}  (${t.name}, stage: ${deriveStage(t.path)})`).join('\n');
}

// ---------------------------------------------------------------------------
// Session bindings (.che/feature.json, machine-local, gitignored)
// ---------------------------------------------------------------------------

export interface Binding {
  slug: string;
  bound_at: string;
}

function featureJsonPath(repoRoot: string): string {
  return join(repoRoot, '.che', 'feature.json');
}

export function readBindings(repoRoot: string): Record<string, Binding> {
  let raw: string;
  try {
    raw = readFileSync(featureJsonPath(repoRoot), 'utf-8');
  } catch {
    return {};
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return {};
    const bindings = (data as Record<string, unknown>).bindings;
    if (typeof bindings !== 'object' || bindings === null) return {};
    return bindings as Record<string, Binding>;
  } catch {
    return {};
  }
}

function writeBindingsFile(repoRoot: string, bindings: Record<string, Binding>): void {
  const sorted: Record<string, Binding> = {};
  for (const key of Object.keys(bindings).sort()) sorted[key] = bindings[key];
  mkdirSync(join(repoRoot, '.che'), { recursive: true });
  writeFileSync(featureJsonPath(repoRoot), JSON.stringify({ bindings: sorted }) + '\n', 'utf-8');
}

/** Bind session → slug. Idempotent: same value leaves the file untouched. Returns true when rewritten. */
export function bindSession(repoRoot: string, session: string, slug: string): boolean {
  const bindings = readBindings(repoRoot);
  const existing = bindings[session];
  if (existing && existing.slug === slug) return false;
  bindings[session] = { slug, bound_at: new Date().toISOString() };
  writeBindingsFile(repoRoot, bindings);
  return true;
}

/** Remove a session binding. Returns true when an entry was removed. */
export function clearSession(repoRoot: string, session: string): boolean {
  const bindings = readBindings(repoRoot);
  if (!bindings[session]) return false;
  delete bindings[session];
  writeBindingsFile(repoRoot, bindings);
  return true;
}

// ---------------------------------------------------------------------------
// Task resolution
// ---------------------------------------------------------------------------

function resolveFeatureArg(featureRaw: string, tasks: TaskDir[]): TaskDir {
  if (featureRaw.includes('/')) {
    const abs = isAbsolute(featureRaw) ? featureRaw : join(process.cwd(), featureRaw);
    const name = basename(trimTrailingSeparators(abs));
    const byName = tasks.filter((t) => t.name === name);
    if (byName.length === 1) return byName[0];
    throw new FeatureResolutionError(
      `ERROR: --feature '${featureRaw}' does not name a task directory under specs/.\nExisting tasks:\n${taskListing(tasks)}\n`,
    );
  }
  const matches = tasks.filter((t) => t.name === featureRaw || t.slug === featureRaw);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new FeatureResolutionError(
      `ERROR: --feature '${featureRaw}' is ambiguous (duplicate slug):\n${taskListing(matches)}\n`,
    );
  }
  throw new FeatureResolutionError(
    `ERROR: no task matches '${featureRaw}'.\nExisting tasks:\n${taskListing(tasks) || '  (none)'}\n`,
  );
}

export function resolveTask(
  repoRoot: string,
  opts: { feature?: string; session?: string } = {},
): TaskDir {
  const tasks = listTaskDirs(repoRoot);

  const featureOpt = opts.feature ?? '';
  const featureRaw = (featureOpt.trim() !== '' ? featureOpt : (process.env.CHE_FEATURE_DIRECTORY ?? '')).trim();
  if (featureRaw !== '') return resolveFeatureArg(featureRaw, tasks);

  const sessionOpt = opts.session ?? '';
  const session = (sessionOpt.trim() !== '' ? sessionOpt : (process.env.CHE_SESSION_ID ?? '')).trim();
  if (session !== '') {
    const binding = readBindings(repoRoot)[session];
    if (!binding) {
      throw new FeatureResolutionError(
        `ERROR: session '${session}' is not bound to any task.\n` +
          'Run `che task create <slug> --session <id>` (new task) or `che feature bind <slug> --session <id>`.\n' +
          `Existing tasks:\n${taskListing(tasks) || '  (none)'}\n`,
      );
    }
    const bySlug = tasks.filter((t) => t.slug === binding.slug);
    if (bySlug.length === 1) return bySlug[0];
    if (bySlug.length === 0) {
      throw new FeatureResolutionError(
        `ERROR: session '${session}' is bound to slug '${binding.slug}' but no task directory matches.\n` +
          `Existing tasks:\n${taskListing(tasks) || '  (none)'}\n`,
      );
    }
    throw new FeatureResolutionError(
      `ERROR: slug '${binding.slug}' matches multiple directories:\n${taskListing(bySlug)}\n`,
    );
  }

  if (tasks.length === 1) return tasks[0];
  if (tasks.length === 0) {
    throw new FeatureResolutionError(
      'ERROR: No task directories found under specs/. Run /che-compound-intent or `che task create <slug>` first.',
    );
  }
  throw new FeatureResolutionError(
    `ERROR: Multiple tasks in flight and no session binding. Pass --feature <slug> or --session <id>.\n` +
      `Tasks:\n${taskListing(tasks)}\n`,
  );
}

// ---------------------------------------------------------------------------
// Feature paths
// ---------------------------------------------------------------------------

export function getFeaturePaths(
  opts: { feature?: string; session?: string; scriptDir?: string } = {},
): FeaturePaths {
  const repoRoot = getRepoRoot(opts.scriptDir);
  const task = resolveTask(repoRoot, opts);

  let currentBranch = process.env.CHE_FEATURE ?? '';
  if (!currentBranch) {
    currentBranch = basename(trimTrailingSeparators(task.path));
  }

  const featureDir = task.path;
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
