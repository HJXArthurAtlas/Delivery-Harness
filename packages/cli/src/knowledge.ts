// Canonical knowledge-location resolver.
//
// One algorithm, shared by /che-intend, /che-clarify, /che-grill and
// /che-grill-with-docs so they cannot compute four different roots.
//
// Resolution order:
//   1. --root <dir|file> (the user's in-session choice)
//   2. AGENTS.md / CLAUDE.md declaring `knowledge_root: <path>`
//   3. README.md / repo-root CONTEXT.md declaring `knowledge_root: <path>`
//   4. default docs/domain_knowledge/
//
// Same-priority declarations that disagree are an error (exit 2): the CLI
// never guesses. A resolved path outside the repository is an error (exit 3).
// Resolution is read-only; it never creates directories or files.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve as resolvePath, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { findIntendRoot } from './feature-paths.ts';

export const KNOWLEDGE_USAGE = `Usage: che knowledge paths [--json] [--root <dir|file>]

  paths             Resolve the canonical knowledge location
  --json            Output results in JSON format
  --root <path>     Explicit knowledge directory or context file (highest priority)
  --help            Show this help message

Resolution: --root > AGENTS.md/CLAUDE.md knowledge_root > README.md/CONTEXT.md
knowledge_root > default docs/domain_knowledge/. Conflicting declarations at the
same priority fail with exit 2; a path outside the repository fails with exit 3.
`;

export interface KnowledgeSource {
  PRIORITY: number;
  EVIDENCE: string;
}

export interface KnowledgePaths {
  REPO_ROOT: string;
  KNOWLEDGE_ROOT: string;
  CONTEXT_FILE: string;
  GLOSSARY_FILE: string;
  GLOSSARY_EXISTS: boolean;
  ADR_DIR: string;
  SOURCE: KnowledgeSource;
}

interface Candidate {
  file: string;
  value: string;
  resolved: string;
}

/** Thrown with a message that already starts with "ERROR: ". */
export class KnowledgeResolutionError extends Error {
  code: 2 | 3;
  candidates: Candidate[];

  constructor(message: string, code: 2 | 3, candidates: Candidate[] = []) {
    super(message);
    this.code = code;
    this.candidates = candidates;
  }
}

const DECLARATION = /^\s*(?:[-*]\s*)?`{0,3}knowledge_root`{0,3}\s*[:=]\s*(.+?)\s*$/i;

function cleanValue(raw: string): string | null {
  let value = raw.trim();
  const quoted =
    (value.startsWith('`') && value.endsWith('`') && value.length >= 2) ||
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
  if (quoted) value = value.slice(1, -1).trim();
  // Reject template placeholders and prose examples; a real declaration is a path.
  if (value === '' || value.startsWith('<') || value.includes('...')) return null;
  if (!quoted && /\s/.test(value)) return null;
  return value;
}

function declarationsIn(file: string): string[] {
  if (!existsSync(file)) return [];
  let text: string;
  try {
    text = readFileSync(file, 'utf-8');
  } catch {
    return [];
  }
  const found: string[] = [];
  for (const line of text.split('\n')) {
    const match = DECLARATION.exec(line);
    if (match === null) continue;
    const value = cleanValue(match[1]);
    if (value !== null) found.push(value);
  }
  return found;
}

function assertInside(repoRoot: string, target: string, evidence: string): void {
  const rel = relative(repoRoot, target);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`)) {
    throw new KnowledgeResolutionError(
      `knowledge location '${target}' resolved from ${evidence} is outside the repository ${repoRoot}`,
      3,
    );
  }
}

function pickDeclarations(
  repoRoot: string,
  files: string[],
  priority: number,
  label: string,
): { value: string; evidence: string } | null {
  const candidates: Candidate[] = [];
  for (const name of files) {
    const file = join(repoRoot, name);
    for (const value of declarationsIn(file)) {
      const resolved = resolvePath(repoRoot, value);
      if (!candidates.some((c) => c.file === file && c.resolved === resolved)) {
        candidates.push({ file, value, resolved });
      }
    }
  }
  if (candidates.length === 0) return null;

  const distinct: Candidate[] = [];
  for (const candidate of candidates) {
    if (!distinct.some((c) => c.resolved === candidate.resolved)) distinct.push(candidate);
  }
  if (distinct.length > 1) {
    const detail = distinct.map((c) => `${c.file} -> ${c.value}`).join('; ');
    throw new KnowledgeResolutionError(
      `conflicting ${label} knowledge_root declarations at priority ${priority}: ${detail}`,
      2,
      candidates,
    );
  }
  const winner = distinct[0];
  return {
    value: winner.value,
    evidence: `${relative(repoRoot, winner.file) || winner.file} (priority ${priority})`,
  };
}

function isFileLike(repoRoot: string, value: string): boolean {
  const resolved = resolvePath(repoRoot, value);
  if (/\.md$/i.test(value)) return true;
  try {
    return statSync(resolved).isFile();
  } catch {
    return false;
  }
}

export function resolveKnowledgePaths(
  options: { root?: string; cwd?: string; adrDirEnv?: string } = {},
): KnowledgePaths {
  const cwd = options.cwd ?? process.cwd();
  const repoRoot = findIntendRoot(cwd);
  if (repoRoot === null) {
    throw new KnowledgeResolutionError(
      `no repository root found above ${cwd} (marker: .git)`,
      3,
    );
  }

  let chosen: { value: string; evidence: string; priority: number };
  if (options.root !== undefined && options.root !== '') {
    chosen = { value: options.root, evidence: '--root', priority: 1 };
  } else {
    const fromAgents = pickDeclarations(
      repoRoot,
      ['AGENTS.md', 'CLAUDE.md'],
      2,
      'agent instruction',
    );
    const fromDocs =
      fromAgents === null
        ? pickDeclarations(repoRoot, ['README.md', 'CONTEXT.md'], 3, 'project documentation')
        : null;
    if (fromAgents !== null) {
      chosen = { ...fromAgents, priority: 2 };
    } else if (fromDocs !== null) {
      chosen = { ...fromDocs, priority: 3 };
    } else {
      chosen = { value: 'docs/domain_knowledge', evidence: 'default', priority: 4 };
    }
  }

  const resolved = resolvePath(repoRoot, chosen.value);
  assertInside(repoRoot, resolved, chosen.evidence);

  const fileLike = isFileLike(repoRoot, chosen.value);
  const contextFile = fileLike ? resolved : join(resolved, 'CONTEXT.md');
  const knowledgeRoot = fileLike ? dirname(resolved) : resolved;
  assertInside(repoRoot, contextFile, chosen.evidence);

  const glossaryFile = join(repoRoot, 'docs', 'GLOSSARY.md');
  const adrDir =
    options.adrDirEnv !== undefined && options.adrDirEnv !== ''
      ? resolvePath(repoRoot, options.adrDirEnv)
      : join(repoRoot, 'docs', 'adr');

  return {
    REPO_ROOT: repoRoot,
    KNOWLEDGE_ROOT: knowledgeRoot,
    CONTEXT_FILE: contextFile,
    GLOSSARY_FILE: glossaryFile,
    GLOSSARY_EXISTS: existsSync(glossaryFile),
    ADR_DIR: adrDir,
    SOURCE: { PRIORITY: chosen.priority, EVIDENCE: chosen.evidence },
  };
}

export function runKnowledge(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(KNOWLEDGE_USAGE);
    return 0;
  }

  const [subcommand, ...rest] = argv;
  if (subcommand !== 'paths') {
    process.stderr.write(
      subcommand === undefined
        ? 'ERROR: knowledge requires a subcommand (paths)\n'
        : `ERROR: unknown knowledge subcommand '${subcommand}'\n`,
    );
    process.stderr.write(KNOWLEDGE_USAGE);
    return 2;
  }

  let values: Record<string, unknown>;
  try {
    const parsed = parseArgs({
      args: rest,
      options: { json: { type: 'boolean' }, root: { type: 'string' } },
      allowPositionals: false,
      strict: true,
    });
    values = parsed.values;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    process.stderr.write(KNOWLEDGE_USAGE);
    return 2;
  }

  let paths: KnowledgePaths;
  try {
    const root = values.root;
    paths = resolveKnowledgePaths({
      root: typeof root === 'string' ? root : undefined,
      adrDirEnv: process.env.ADRKIT_DIR,
    });
  } catch (err) {
    if (err instanceof KnowledgeResolutionError) {
      process.stderr.write(`ERROR: ${err.message}\n`);
      for (const candidate of err.candidates) {
        process.stderr.write(`  candidate: ${candidate.file} -> ${candidate.value}\n`);
      }
      return err.code;
    }
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${message}\n`);
    return 1;
  }

  if (values.json) {
    process.stdout.write(JSON.stringify(paths) + '\n');
    return 0;
  }

  process.stdout.write(`REPO_ROOT: ${paths.REPO_ROOT}\n`);
  process.stdout.write(`KNOWLEDGE_ROOT: ${paths.KNOWLEDGE_ROOT}\n`);
  process.stdout.write(`CONTEXT_FILE: ${paths.CONTEXT_FILE}\n`);
  process.stdout.write(`GLOSSARY_FILE: ${paths.GLOSSARY_FILE}\n`);
  process.stdout.write(`GLOSSARY_EXISTS: ${paths.GLOSSARY_EXISTS ? 'true' : 'false'}\n`);
  process.stdout.write(`ADR_DIR: ${paths.ADR_DIR}\n`);
  process.stdout.write(`SOURCE: priority ${paths.SOURCE.PRIORITY} (${paths.SOURCE.EVIDENCE})\n`);
  return 0;
}
