import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** First `<key>:` value in .che/config.yml, or '' when the file or key is absent. */
export function readCheConfigValue(repoRoot: string, key: string): string {
  let raw: string;
  try {
    raw = readFileSync(join(repoRoot, '.che', 'config.yml'), 'utf-8');
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
