// che self-update — upgrade the globally installed @hjxarthuratlas/che via npm.
//
// The CLI is published to the public npm registry; self-update shells out to
// npm (`npm view` for the latest version, `npm install -g` to swap the files).
// Replacing files of the running process is safe on unix: the current
// process has the old bundle loaded and picks up the new one next run.
//
// Guards, in order: dev checkouts (repo file: link) are refused — upgrading
// those means git pull, not npm; npm must exist.

import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
 import { fileURLToPath } from 'node:url';
import { ANSI_GRAY, ANSI_ORANGE, paint } from './colors.ts';
 import { isRecord } from './type-guard.ts';
import { CLI_VERSION } from './version.ts';
import { compareVersions } from './pack.ts';

export const SELF_UPDATE_USAGE = `Usage: che self-update [--version <x>] [--check] [--json]

Update the globally installed @hjxarthuratlas/che from the public npm registry.

  --version <x>  Install this exact version instead of the latest
  --check        Only report current vs latest; install nothing
  --json         Output results in JSON format
  --help         Show this help message

Exit 0 when current (or updated), 1 when --check finds a newer version,
2 on usage or environment errors (dev checkout, npm/registry missing).
`;

/** Thrown with a message that already starts with "ERROR: ". */
class SelfUpdateError extends Error {}

function npmCapture(args: string[]): string {
  try {
    return execFileSync('npm', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    const detail = isRecord(err) && 'stderr' in err && typeof err.stderr === 'string' ? err.stderr.trim() : '';
    throw new SelfUpdateError(`ERROR: npm ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
}

/** True when the running module lives inside an npm-managed install. */
function isNpmManagedInstall(): boolean {
  const here = realpathSync(fileURLToPath(import.meta.url));
  return /[\\/]node_modules[\\/]@hjxarthuratlas[\\/]che[\\/]/.test(here);
}

function requireNpmManagedInstall(): void {
  if (isNpmManagedInstall()) return;
  throw new SelfUpdateError(
    'ERROR: this che runs from a development checkout (repo file: link), not an npm install; ' +
      'self-update only manages global npm installs — upgrade the dev copy via git pull',
  );
}

function requireNpm(): void {
  try {
    execFileSync('npm', ['--version'], { stdio: 'ignore' });
  } catch {
    throw new SelfUpdateError(
      'ERROR: npm is required for self-update but was not found on PATH; ' +
        'install Node.js >= 22.18 or run: npm install -g @hjxarthuratlas/che@latest',
    );
  }
}

function latestPublishedVersion(): string {
  const latest = npmCapture(['view', '@hjxarthuratlas/che', 'version']);
  if (latest === '') {
    throw new SelfUpdateError('ERROR: npm view returned no version for @hjxarthuratlas/che');
  }
  return latest;
}

export function runSelfUpdate(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(SELF_UPDATE_USAGE);
    return 0;
  }
  let values: Record<string, unknown>;
  try {
    const parsed = parseArgs({
      args: argv,
      options: { version: { type: 'string' }, check: { type: 'boolean' }, json: { type: 'boolean' } },
      allowPositionals: true,
      strict: true,
    });
    values = parsed.values;
    if (parsed.positionals.length > 0) {
      throw new SelfUpdateError(`ERROR: self-update takes no positional arguments (got '${parsed.positionals[0]}')`);
    }
  } catch (err) {
    process.stderr.write((err instanceof Error ? err.message : String(err)) + '\n');
    process.stderr.write(SELF_UPDATE_USAGE);
    return 2;
  }

  try {
    requireNpmManagedInstall();
    requireNpm();

    const current = CLI_VERSION;
    const target =
      typeof values.version === 'string' && values.version !== ''
        ? values.version
        : latestPublishedVersion();
    const outdated = compareVersions(target, current) > 0;

    if (values.check === true) {
      if (values.json) {
        process.stdout.write(JSON.stringify({ CURRENT: current, LATEST: target, OUTDATED: outdated }) + '\n');
      } else {
        process.stdout.write(paint(ANSI_GRAY, `CLI 当前版本： ${current}\n`));
        if (outdated) {
          process.stdout.write(paint(ANSI_GRAY, `发现新版本： ${target}\n`));
        } else {
          process.stdout.write(paint(ANSI_ORANGE, '✓ 已是最新版本\n'));
        }
      }
      return outdated ? 1 : 0;
    }

    if (!outdated) {
      if (values.json) {
        process.stdout.write(JSON.stringify({ CURRENT: current, LATEST: target, UPDATED: false }) + '\n');
      } else {
        process.stdout.write(paint(ANSI_GRAY, `CLI 当前版本： ${current}\n`));
        process.stdout.write(paint(ANSI_ORANGE, '✓ 已是最新版本\n'));
      }
      return 0;
    }

    if (values.json !== true) {
      process.stdout.write(paint(ANSI_GRAY, `CLI 当前版本： ${current}\n`));
      process.stdout.write(paint(ANSI_GRAY, `发现新版本： ${target}\n`));
      process.stdout.write(paint(ANSI_GRAY, '正在安装新版本……\n\n'));
    }

    try {
      // stdio piped (not inherit) so npm's own progress never pollutes the banner;
      // stderr is captured for the failure message below.
      execFileSync('npm', ['install', '-g', `@hjxarthuratlas/che@${target}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      const detail = isRecord(err) && 'stderr' in err && typeof err.stderr === 'string' ? err.stderr.trim() : '';
      throw new SelfUpdateError(
        `ERROR: npm install -g @hjxarthuratlas/che@${target} failed${detail ? `: ${detail}` : ''}; ` +
          `install by hand with: npm install -g @hjxarthuratlas/che@${target}`,
      );
    }

    if (values.json) {
      process.stdout.write(JSON.stringify({ CURRENT: current, LATEST: target, UPDATED: true }) + '\n');
    } else {
      process.stdout.write(paint(ANSI_ORANGE, `✓ 成功更新到 ${target}\n`));
    }
    return 0;
  } catch (err) {
    if (err instanceof SelfUpdateError) {
      process.stderr.write(err.message + '\n');
      return 2;
    }
    throw err;
  }
}
