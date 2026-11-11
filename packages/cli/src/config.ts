import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** First `<key>:` value in one .che config file, or '' when the file or key is absent. */
function readConfigFileValue(repoRoot: string, file: string, key: string): string {
  let raw: string;
  try {
    raw = readFileSync(join(repoRoot, '.che', file), 'utf-8');
  } catch {
    return '';
  }
  const pattern = new RegExp(`^[ \\t]*${key}[ \\t]*:(.*)$`);
  for (const line of raw.split('\n')) {
    const match = pattern.exec(line);
    if (match !== null) return match[1];
  }
  return '';
}

/** Keys the machine-local overlay may override; anything else in
 *  .che/config.local.yml is ignored (only .che/config.yml counts). */
const LOCAL_OVERRIDE_KEYS: Record<string, true> = { language: true, checker: true };

/**
 * First `<key>:` value across the two .che config files, with the supplying
 * file. Only `language` and `checker` may be overridden by the machine-local
 * overlay `.che/config.local.yml`; every other key (e.g. the gates) is read
 * from the team-shared `.che/config.yml` alone. A missing or empty overlay
 * key falls through to the team base.
 */
export function readCheConfigSource(
  repoRoot: string,
  key: string,
): { value: string; file: string } {
  if (LOCAL_OVERRIDE_KEYS[key]) {
    const local = readConfigFileValue(repoRoot, 'config.local.yml', key);
    if (local.trim() !== '') return { value: local, file: 'config.local.yml' };
  }
  return { value: readConfigFileValue(repoRoot, 'config.yml', key), file: 'config.yml' };
}

/** Overlay-aware `<key>:` value (see readCheConfigSource); '' when neither file defines a non-empty value. */
export function readCheConfigValue(repoRoot: string, key: string): string {
  return readCheConfigSource(repoRoot, key).value;
}
