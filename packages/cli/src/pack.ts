// che pack — install / inspect / update the ncw-delivery-harness skill pack.
//
// Channels: the pack repo (git) is the distribution source; a release is a
// `vX.Y.Z` tag on the repo. `pack init` copies skills/<name>/ into the
// project's `.agents/skills/` (read by DSH / OpenCode / omp) and records the
// installation in `.che/pack.json` (committed, so `pack update` produces a
// reviewable diff). `pack status` compares installed / latest tag / main and
// detects CHANNEL_DRIFT (main version ahead of the newest tag = a release
// that bumped package.json but never got tagged).
//
// Managed vs unmanaged: skill dirs listed in the manifest are che-owned and
// may be overwritten by `update`; any other same-name dir under the target is
// unmanaged and blocks without --force (pack rule: 同名不覆盖).

import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { findIntendRoot } from './feature-paths.ts';
import { isRecord } from './type-guard.ts';
import { CLI_VERSION } from './version.ts';

export const PACK_USAGE = `Usage: che pack <command> [options]

Commands:
  che pack init [--ref <ref>] [--from <url>] [--global] [--dir <dir>] [--force] [--json]
      Install the harness pack skills into <base>/.agents/skills and write
      <base>/.che/pack.json. Default ref: newest v* tag (falls back to main).
  che pack status [--global] [--dir <dir>] [--json]
      Installed version vs newest tag vs main; integrity and CLI minimum.
      Exit 0 up-to-date, 1 action needed, 2 environment error.
  che pack update [--ref <ref>] [--from <url>] [--dry-run] [--force] [--json]
      Manifest-driven sync: add new, overwrite managed, prune removed skills.

Options:
  --ref <ref>     Tag (vX.Y.Z), branch, or commit SHA to install from
  --from <url>    Pack git URL (default: built-in repo, or $CHE_PACK_REPO)
  --global        Use ~/.agents/skills + ~/.che/pack.json
  --dir <dir>     Explicit base directory (skills → <dir>/.agents/skills)
  --force         init/update: overwrite unmanaged same-name dirs; update:
                  also reinstall managed skills from upstream, discarding
                  local edits (the repair path for hand-broken skills)
  --dry-run       Print the plan without writing anything
  --json          Output results in JSON format
  --help          Show this help message
`;

/** Thrown with a message that already starts with "ERROR: ". */
export class PackError extends Error {}

const DEFAULT_PACK_REPO = 'https://git.newchiwan.com/council/ncw-delivery-harness.git';
const TARGET_RELATIVE = '.agents/skills';
const MANIFEST_RELATIVE = '.che/pack.json';
const SHA_PATTERN = /^[0-9a-f]{7,40}$/;
const VERSION_TAG_PATTERN = /^v\d+\.\d+\.\d+$/;

interface PackManifest {
  schema: 1;
  pack: string;
  packVersion: string;
  source: string;
  ref: string;
  commit: string;
  minCliVersion: string | null;
  target: string;
  updatedAt: string;
  skills: string[];
}

interface PackSource {
  packName: string;
  packVersion: string;
  minCliVersion: string | null;
  commit: string;
  skillsDir: string;
  workDir: string;
}

// ---------------------------------------------------------------------------
// runtime narrowing helpers (JSON / child-process boundaries)

function optionalString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function stderrOf(err: unknown): string {
  if (isRecord(err) && 'stderr' in err) {
    const stderr = err.stderr;
    if (typeof stderr === 'string') return stderr.trim();
    if (typeof stderr === 'object' && stderr !== null && 'toString' in stderr) {
      const text = stderr.toString();
      if (typeof text === 'string') return text.trim();
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// generic helpers

function runCapture(cmd: string, args: string[], cwd?: string): string {
  try {
    return execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    const detail = stderrOf(err);
    throw new PackError(`ERROR: ${cmd} ${args[0]} failed${detail ? `: ${detail}` : ''}`);
  }
}

function ensureGit(): void {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
  } catch {
    throw new PackError('ERROR: git is required for che pack commands but was not found on PATH');
  }
}

/** Numeric semver-ish comparison of vX.Y.Z strings (ignores any suffix).
 *  Tolerates range prefixes on either side ('>=0.3.0', '^1.2.0'). */
export function compareVersions(a: string, b: string): number {
  const part = (value: string, index: number): number => {
    const chunk = value.replace(/^[^0-9v.]+/, '').replace(/^v/, '').split('.')[index] ?? '0';
    return Number.parseInt(chunk, 10) || 0;
  };
  for (let i = 0; i < 3; i++) {
    const diff = part(a, i) - part(b, i);
    if (diff !== 0) return diff;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// git plumbing

interface RemoteInfo {
  latestTag: string | null;
}

function lsRemoteVersionTags(url: string): RemoteInfo {
  const out = runCapture('git', ['ls-remote', '--tags', url]);
  const tags: string[] = [];
  for (const line of out.split('\n')) {
    if (line === '') continue;
    const refname = line.split('\t')[1] ?? '';
    const match = /^refs\/tags\/(v[^\^]+)$/.exec(refname);
    if (match) tags.push(match[1]);
  }
  const versionTags = tags.filter((tag) => VERSION_TAG_PATTERN.test(tag));
  versionTags.sort((a, b) => compareVersions(b, a));
  return { latestTag: versionTags[0] ?? null };
}

/** Read package.json off origin/main without a working tree (one fetch). */
function fetchMainPackageJson(url: string): string | null {
  const workDir = mkdtempSync(join(tmpdir(), 'che-main-'));
  try {
    runCapture('git', ['init', '-q', '.'], workDir);
    runCapture('git', ['remote', 'add', 'origin', url], workDir);
    runCapture('git', ['fetch', '--depth', '1', 'origin', 'main'], workDir);
    const raw = runCapture('git', ['show', 'FETCH_HEAD:package.json'], workDir);
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    return optionalString(parsed, 'version');
  } catch {
    return null;
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

/** Shallow-clone the pack source at a tag/branch, or fetch a raw commit SHA. */
function checkoutPack(url: string, ref: string): PackSource {
  const workDir = mkdtempSync(join(tmpdir(), 'che-pack-'));
  try {
    if (SHA_PATTERN.test(ref)) {
      runCapture('git', ['init', '-q', '.'], workDir);
      runCapture('git', ['remote', 'add', 'origin', url], workDir);
      runCapture('git', ['fetch', '--depth', '1', 'origin', ref], workDir);
      runCapture('git', ['checkout', '--detach', 'FETCH_HEAD'], workDir);
    } else {
      runCapture('git', ['clone', '--depth', '1', '--branch', ref, url, '.'], workDir);
    }
    const commit = runCapture('git', ['rev-parse', 'HEAD'], workDir);
    const packageJson: unknown = JSON.parse(readFileSync(join(workDir, 'package.json'), 'utf8'));
    if (!isRecord(packageJson)) {
      throw new PackError(`ERROR: pack repo package.json is not an object at ref ${ref}`);
    }
    const packVersion = optionalString(packageJson, 'version');
    if (packVersion === null) {
      throw new PackError(`ERROR: pack repo package.json has no version at ref ${ref}`);
    }
    const skillsDir = join(workDir, 'skills');
    if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) {
      throw new PackError(`ERROR: pack repo has no skills/ directory at ref ${ref}`);
    }
    const engines = isRecord(packageJson.engines) ? packageJson.engines : {};
    return {
      packName: optionalString(packageJson, 'name') ?? 'ncw-delivery-harness',
      packVersion,
      minCliVersion: optionalString(engines, 'che'),
      commit,
      skillsDir,
      workDir,
    };
  } catch (err) {
    rmSync(workDir, { recursive: true, force: true });
    if (err instanceof PackError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new PackError(
      `ERROR: could not checkout pack source ${url} at ref ${ref} (${message}); ` +
        'for a commit SHA the server must allow fetch-by-SHA — prefer a vX.Y.Z tag',
    );
  }
}

function cleanupPackSource(source: PackSource): void {
  if (source.workDir.includes('che-pack-')) {
    rmSync(source.workDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// base directory + manifest

function resolveBase(values: Record<string, unknown>): string {
  if (typeof values.dir === 'string' && values.dir !== '') {
    const base = resolvePath(process.cwd(), values.dir);
    if (!existsSync(base) || !statSync(base).isDirectory()) {
      throw new PackError(`ERROR: --dir ${values.dir} is not an existing directory`);
    }
    return base;
  }
  if (values.global === true) return homedir();
  return findIntendRoot(process.cwd()) ?? process.cwd();
}

/** Validate untrusted manifest JSON against the schema-1 shape. */
function validateManifest(raw: unknown, manifestPath: string): PackManifest {
  if (!isRecord(raw)) throw new PackError(`ERROR: ${manifestPath} is not a JSON object`);
  if (raw.schema !== 1) {
    throw new PackError(
      `ERROR: manifest schema ${String(raw.schema)} is not supported by this CLI (${CLI_VERSION}); upgrade che`,
    );
  }
  const requireString = (key: string): string => {
    const value = raw[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new PackError(`ERROR: manifest ${manifestPath} is missing or has an invalid "${key}"`);
    }
    return value;
  };
  const minCliValue = raw.minCliVersion;
  if (minCliValue !== null && typeof minCliValue !== 'string') {
    throw new PackError(`ERROR: manifest ${manifestPath} has an invalid "minCliVersion"`);
  }
  const skillsValue = raw.skills;
  if (!Array.isArray(skillsValue) || skillsValue.some((entry) => typeof entry !== 'string')) {
    throw new PackError(`ERROR: manifest ${manifestPath} has an invalid "skills" list`);
  }
  return {
    schema: 1,
    pack: requireString('pack'),
    packVersion: requireString('packVersion'),
    source: requireString('source'),
    ref: requireString('ref'),
    commit: requireString('commit'),
    minCliVersion: minCliValue,
    target: requireString('target'),
    updatedAt: requireString('updatedAt'),
    skills: skillsValue,
  };
}

function readManifest(base: string): { manifest: PackManifest; manifestPath: string; targetDir: string } {
  const manifestPath = join(base, MANIFEST_RELATIVE);
  if (!existsSync(manifestPath)) {
    throw new PackError(
      `ERROR: no pack manifest at ${manifestPath} — run 'che pack init' first`,
    );
  }
  const manifest = validateManifest(JSON.parse(readFileSync(manifestPath, 'utf8')), manifestPath);
  const targetDir = join(base, manifest.target);
  return { manifest, manifestPath, targetDir };
}

function writeManifest(base: string, manifest: PackManifest): void {
  const manifestPath = join(base, MANIFEST_RELATIVE);
  mkdirSync(join(base, '.che'), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

function listSkillsDir(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function resolveSource(from: unknown): string {
  const env = process.env.CHE_PACK_REPO ?? '';
  const raw = typeof from === 'string' && from !== '' ? from : env !== '' ? env : DEFAULT_PACK_REPO;
  if (raw.startsWith('-')) throw new PackError('ERROR: pack source URL may not start with "-"');
  return raw;
}

function resolveRef(url: string, ref: unknown): string {
  const raw = typeof ref === 'string' && ref !== '' ? ref : '';
  if (raw.startsWith('-')) throw new PackError('ERROR: --ref may not start with "-"');
  if (raw !== '') return raw;
  const { latestTag } = lsRemoteVersionTags(url);
  return latestTag ?? 'main';
}

function installSkillDir(sourceDir: string, targetDir: string, name: string): void {
  const dest = join(targetDir, name);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(join(sourceDir, name), dest, { recursive: true });
}

function buildManifest(
  sourceUrl: string,
  ref: string,
  source: PackSource,
  skills: string[],
): PackManifest {
  return {
    schema: 1,
    pack: source.packName,
    packVersion: source.packVersion,
    source: sourceUrl,
    ref,
    commit: source.commit,
    minCliVersion: source.minCliVersion,
    target: TARGET_RELATIVE,
    updatedAt: new Date().toISOString(),
    skills,
  };
}

function parsePackArgs(
  argv: string[],
  options: Record<string, { type: 'boolean' | 'string' }>,
): { values: Record<string, unknown>; positionals: string[] } {
  try {
    const parsed = parseArgs({ args: argv, options, allowPositionals: true, strict: true });
    return { values: parsed.values, positionals: parsed.positionals };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new PackError(`ERROR: ${message}`);
  }
}

function guardBaseFlags(values: Record<string, unknown>): void {
  if (values.global === true && typeof values.dir === 'string' && values.dir !== '') {
    throw new PackError('ERROR: --global and --dir are mutually exclusive');
  }
}

// ---------------------------------------------------------------------------
// sync planning

interface SyncPlan {
  added: string[];
  updated: string[];
  removed: string[];
  conflicts: string[];
  stale: string[]; // manifest-managed but already missing on disk
}

function planSync(
  sourceSkills: string[],
  targetSkills: string[],
  managed: string[],
  force: boolean,
  contentChanged: boolean,
): SyncPlan {
  const targetSet = new Set(targetSkills);
  const managedSet = new Set(managed);
  const sourceSet = new Set(sourceSkills);
  const plan: SyncPlan = { added: [], updated: [], removed: [], conflicts: [], stale: [] };
  for (const name of sourceSkills) {
    if (!targetSet.has(name)) plan.added.push(name);
    else if (managedSet.has(name) && !force && !contentChanged) {
      // Installed from this same commit: content identical by construction;
      // rewriting would only churn the manifest's updatedAt.
      continue;
    } else if (managedSet.has(name) || force) plan.updated.push(name);
    else plan.conflicts.push(name);
  }
  for (const name of managed) {
    if (!sourceSet.has(name)) {
      if (targetSet.has(name)) plan.removed.push(name);
      else plan.stale.push(name);
    }
  }
  return plan;
}

function printPlan(plan: SyncPlan): void {
  process.stdout.write(
    `PLAN: ${plan.added.length} added, ${plan.updated.length} updated, ` +
      `${plan.removed.length} removed, ${plan.conflicts.length} conflicts, ${plan.stale.length} stale\n`,
  );
  const groups: Array<[string, string[]]> = [
    ['PLAN ADDED', plan.added],
    ['PLAN UPDATED', plan.updated],
    ['PLAN REMOVED', plan.removed],
    ['PLAN CONFLICTS', plan.conflicts],
    ['PLAN STALE', plan.stale],
  ];
  for (const [label, items] of groups) {
    if (items.length > 0) process.stdout.write(`${label}: ${items.join(', ')}\n`);
  }
}

function applyPlan(source: PackSource, targetDir: string, plan: SyncPlan): void {
  for (const name of [...plan.added, ...plan.updated]) {
    installSkillDir(source.skillsDir, targetDir, name);
  }
  for (const name of plan.removed) {
    rmSync(join(targetDir, name), { recursive: true, force: true });
  }
}

function warnIfCliTooOld(minCliVersion: string | null): void {
  if (minCliVersion !== null && compareVersions(CLI_VERSION, minCliVersion) < 0) {
    process.stderr.write(
      `WARNING: pack requires che ${minCliVersion} but this CLI is ${CLI_VERSION}; ` +
        "run 'che self-update'\n",
    );
  }
}

// ---------------------------------------------------------------------------
// pack init

export function runPackInit(argv: string[]): number {
  let values: Record<string, unknown>;
  try {
    ({ values } = parsePackArgs(argv, {
      ref: { type: 'string' },
      from: { type: 'string' },
      global: { type: 'boolean' },
      dir: { type: 'string' },
      force: { type: 'boolean' },
      json: { type: 'boolean' },
    }));
    guardBaseFlags(values);
  } catch (err) {
    process.stderr.write((err as Error).message + '\n');
    process.stderr.write(PACK_USAGE);
    return 2;
  }

  try {
    ensureGit();
    const base = resolveBase(values);
    const sourceUrl = resolveSource(values.from);
    const ref = resolveRef(sourceUrl, values.ref);
    const manifestPath = join(base, MANIFEST_RELATIVE);
    const targetDir = join(base, TARGET_RELATIVE);
    const targetSkills = listSkillsDir(targetDir);
    const reinstall = existsSync(manifestPath);
    let managed: string[] = [];
    let installedCommit: string | null = null;
    if (reinstall) {
      const existing = readManifest(base);
      if (values.force !== true) {
        process.stderr.write(
          `ERROR: ${manifestPath} already exists (pack ${existing.manifest.packVersion}, ref ${existing.manifest.ref}); ` +
            `use 'che pack update' to upgrade, or --force to reinstall\n`,
        );
        return 1;
      }
      managed = existing.manifest.skills;
      installedCommit = existing.manifest.commit;
    }

    const source = checkoutPack(sourceUrl, ref);
    try {
      const sourceSkills = listSkillsDir(source.skillsDir);
      const plan = planSync(
        sourceSkills,
        targetSkills,
        managed,
        values.force === true,
        installedCommit !== source.commit,
      );
      if (plan.conflicts.length > 0) {
        process.stderr.write(
          `ERROR: unmanaged skill directories would be overwritten: ${plan.conflicts.join(', ')}\n` +
            '  These were not installed by che. Remove them by hand or re-run with --force.\n',
        );
        return 1;
      }

      applyPlan(source, targetDir, plan);
      const manifest = buildManifest(sourceUrl, ref, source, sourceSkills);
      writeManifest(base, manifest);
      warnIfCliTooOld(source.minCliVersion);

      if (values.json) {
        process.stdout.write(JSON.stringify({ INSTALLED: manifest, ACTION: reinstall ? 'reinstall' : 'init' }) + '\n');
        return 0;
      }
      process.stdout.write(
        `PACK_INSTALLED: ${manifest.pack} ${manifest.packVersion} (ref ${ref}, commit ${manifest.commit.slice(0, 12)})\n`,
      );
      process.stdout.write(`TARGET: ${targetDir}\n`);
      process.stdout.write(
        `SKILLS: ${sourceSkills.length} installed ` +
          `(${plan.added.length} added, ${plan.updated.length} updated, ${plan.removed.length} removed)\n`,
      );
      process.stdout.write(`MANIFEST: ${manifestPath}\n`);
      if (!reinstall) {
        process.stdout.write(
          'GITIGNORE_HINT: keep .agents/skills/ and .che/pack.json committed for team-wide installs\n',
        );
        process.stdout.write('NEXT: run /che-project-init in this project to finish .che/config.yml setup\n');
      }
      return 0;
    } finally {
      cleanupPackSource(source);
    }
  } catch (err) {
    if (err instanceof PackError) {
      process.stderr.write(err.message + '\n');
      return 2;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// pack update

export function runPackUpdate(argv: string[]): number {
  let values: Record<string, unknown>;
  try {
    ({ values } = parsePackArgs(argv, {
      ref: { type: 'string' },
      from: { type: 'string' },
      global: { type: 'boolean' },
      dir: { type: 'string' },
      force: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      json: { type: 'boolean' },
    }));
    guardBaseFlags(values);
  } catch (err) {
    process.stderr.write((err as Error).message + '\n');
    process.stderr.write(PACK_USAGE);
    return 2;
  }

  try {
    ensureGit();
    const base = resolveBase(values);
    const { manifest, manifestPath, targetDir } = readManifest(base);
    const sourceUrl = typeof values.from === 'string' && values.from !== '' ? values.from : manifest.source;
    const ref = resolveRef(sourceUrl, values.ref);
    const targetSkills = listSkillsDir(targetDir);

    const source = checkoutPack(sourceUrl, ref);
    try {
      const sourceSkills = listSkillsDir(source.skillsDir);
      const plan = planSync(
        sourceSkills,
        targetSkills,
        manifest.skills,
        values.force === true,
        source.commit !== manifest.commit,
      );
      const unchanged =
        ref === manifest.ref &&
        source.commit === manifest.commit &&
        plan.added.length === 0 &&
        plan.updated.length === 0 &&
        plan.removed.length === 0;
      if (values.json) {
        process.stdout.write(
          JSON.stringify({
            UPDATED: unchanged
              ? null
              : { packVersion: source.packVersion, ref, commit: source.commit },
            PLAN: plan,
            DRY_RUN: values['dry-run'] === true,
          }) + '\n',
        );
      } else {
        printPlan(plan);
      }
      if (plan.conflicts.length > 0) {
        process.stderr.write(
          `ERROR: unmanaged skill directories block the update: ${plan.conflicts.join(', ')}\n` +
            '  Re-run with --force to overwrite them.\n',
        );
        return 1;
      }
      if (values['dry-run'] === true) {
        if (!values.json) process.stdout.write('DRY-RUN: no changes written\n');
        return 0;
      }
      if (unchanged) {
        if (!values.json) {
          process.stdout.write(
            `ALREADY_UP_TO_DATE: ${manifest.pack} ${manifest.packVersion} (ref ${manifest.ref})\n`,
          );
        }
        return 0;
      }

      applyPlan(source, targetDir, plan);
      const next: PackManifest = {
        ...manifest,
        packVersion: source.packVersion,
        ref,
        commit: source.commit,
        minCliVersion: source.minCliVersion,
        updatedAt: new Date().toISOString(),
        skills: sourceSkills,
      };
      writeManifest(base, next);
      warnIfCliTooOld(source.minCliVersion);

      if (!values.json) {
        process.stdout.write(
          `PACK_UPDATED: ${manifest.pack} ${manifest.packVersion} -> ${next.packVersion} ` +
            `(ref ${ref}, commit ${next.commit.slice(0, 12)})\n`,
        );
        process.stdout.write(`MANIFEST: ${manifestPath}\n`);
      }
      return 0;
    } finally {
      cleanupPackSource(source);
    }
  } catch (err) {
    if (err instanceof PackError) {
      process.stderr.write(err.message + '\n');
      return 2;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// pack status

export interface PackStatusReport {
  INSTALLED: {
    pack: string;
    packVersion: string;
    ref: string;
    commit: string;
    updatedAt: string;
    pinned: boolean;
  };
  LATEST_TAG: string | null;
  MAIN_VERSION: string | null;
  UPDATE_AVAILABLE: boolean;
  CHANNEL_DRIFT: string | null;
  SKILLS: { managed: number; missing: string[]; extra: string[] };
  CLI: { version: string; minRequired: string | null; ok: boolean };
}

export function runPackStatus(argv: string[]): number {
  let values: Record<string, unknown>;
  try {
    ({ values } = parsePackArgs(argv, {
      global: { type: 'boolean' },
      dir: { type: 'string' },
      json: { type: 'boolean' },
    }));
    guardBaseFlags(values);
  } catch (err) {
    process.stderr.write((err as Error).message + '\n');
    process.stderr.write(PACK_USAGE);
    return 2;
  }

  try {
    ensureGit();
    const base = resolveBase(values);
    const { manifest, targetDir } = readManifest(base);
    const targetSkills = listSkillsDir(targetDir);
    const missing = manifest.skills.filter((name) => !targetSkills.includes(name));
    const managedSet = new Set(manifest.skills);
    const extra = targetSkills.filter((name) => !managedSet.has(name));

    const remote = lsRemoteVersionTags(manifest.source);
    const latestTag = remote.latestTag;
    const mainVersion = fetchMainPackageJson(manifest.source);

    let drift: string | null = null;
    if (mainVersion !== null && latestTag !== null) {
      if (compareVersions(mainVersion, latestTag) > 0) {
        drift =
          `main is ${mainVersion} but newest tag is ${latestTag}: a release bumped package.json ` +
          `without tagging (che channel lags). Fix: git tag v${mainVersion} <bump-commit> && git push origin v${mainVersion}`;
      } else if (compareVersions(latestTag, mainVersion) > 0) {
        drift = `newest tag ${latestTag} is ahead of main (${mainVersion}): tag may point at the wrong commit`;
      }
    }

    const updateAvailable = latestTag !== null && compareVersions(latestTag, manifest.packVersion) > 0;
    const minRequired = manifest.minCliVersion;
    const cliOk = minRequired === null || compareVersions(CLI_VERSION, minRequired) >= 0;
    const needsAction = updateAvailable || drift !== null || missing.length > 0 || extra.length > 0 || !cliOk;

    const report: PackStatusReport = {
      INSTALLED: {
        pack: manifest.pack,
        packVersion: manifest.packVersion,
        ref: manifest.ref,
        commit: manifest.commit,
        updatedAt: manifest.updatedAt,
        pinned: VERSION_TAG_PATTERN.test(manifest.ref),
      },
      LATEST_TAG: latestTag,
      MAIN_VERSION: mainVersion,
      UPDATE_AVAILABLE: updateAvailable,
      CHANNEL_DRIFT: drift,
      SKILLS: { managed: manifest.skills.length, missing, extra },
      CLI: { version: CLI_VERSION, minRequired, ok: cliOk },
    };

    if (values.json) {
      process.stdout.write(JSON.stringify(report) + '\n');
    } else {
      process.stdout.write(
        `INSTALLED: ${manifest.pack} ${manifest.packVersion} ` +
          `(ref ${manifest.ref}, commit ${manifest.commit.slice(0, 12)}, updated ${manifest.updatedAt})\n`,
      );
      process.stdout.write(`LATEST TAG: ${latestTag ?? '(none)'}\n`);
      process.stdout.write(`MAIN: ${mainVersion ?? '(unavailable)'}\n`);
      process.stdout.write(
        `CLI: ${CLI_VERSION}${minRequired === null ? '' : ` (pack requires ${minRequired})`}${cliOk ? '' : ' — OUTDATED'}\n`,
      );
      process.stdout.write(
        `SKILLS: ${manifest.skills.length} managed, ${missing.length} missing, ${extra.length} extra` +
          `${extra.length > 0 ? `: ${extra.join(', ')}` : ''}\n`,
      );
      if (updateAvailable) process.stdout.write(`STATUS: UPDATE_AVAILABLE (${latestTag})\n`);
      if (drift !== null) process.stdout.write(`STATUS: CHANNEL_DRIFT — ${drift}\n`);
      if (!updateAvailable && drift === null) process.stdout.write('STATUS: UP_TO_DATE\n');
      if (missing.length > 0) {
        process.stdout.write(`STATUS: MISSING_ON_DISK — ${missing.join(', ')} (repair with 'che pack update --force')\n`);
      }
    }
    return needsAction ? 1 : 0;
  } catch (err) {
    if (err instanceof PackError) {
      process.stderr.write(err.message + '\n');
      return 2;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// dispatcher

export function runPack(argv: string[]): number {
  const [sub, ...rest] = argv;
  if (sub === undefined || sub === '--help' || sub === '-h') {
    process.stdout.write(PACK_USAGE);
    return 0;
  }
  switch (sub) {
    case 'init':
      return runPackInit(rest);
    case 'status':
      return runPackStatus(rest);
    case 'update':
      return runPackUpdate(rest);
    default:
      process.stderr.write(`ERROR: Unknown pack command '${sub}'\n`);
      process.stderr.write(PACK_USAGE);
      return 2;
  }
}
