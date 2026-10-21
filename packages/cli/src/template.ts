import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Thrown when a template file exists but cannot be read. */
export class TemplateResolutionError extends Error {}

const SAFE_COMPONENT_PATTERN = /^[a-z0-9-]+$/;

/** Resolve a template name to the skill's bundled references/ copy. */
export function resolveTemplate(templateName: string, referencesDir: string): string | null {
  if (!SAFE_COMPONENT_PATTERN.test(templateName)) return null;
  const candidate = join(referencesDir, `${templateName}.md`);
  try {
    return statSync(candidate).isFile() ? candidate : null;
  } catch {
    return null;
  }
}

/** Read the resolved template content, or null when absent. */
export function resolveTemplateContent(templateName: string, referencesDir: string): string | null {
  const path = resolveTemplate(templateName, referencesDir);
  if (path === null) return null;
  try {
    return readFileSync(path, 'utf-8');
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new TemplateResolutionError(`Failed to read template '${templateName}': ${cause}`);
  }
}
