# Script Language Analysis

Date: 2026-10-22

## Summary

Shell and TypeScript form the standalone scripting core. The adrkit JavaScript bundle and the pack-bundled Python helpers have both been removed in favor of external CLIs (`@adrkit/cli` and `@newchiwan/che`).

| Language | Files | Physical lines | Primary role |
|---|---:|---:|---|
| TypeScript (Node ≥22.18, type stripping) | 7 | 852 | `che` CLI under `packages/cli`: feature-pointer state, feature-path resolution, template/setup resolution |
| POSIX `sh` | 8 | 348 | adrkit command wrappers and shared CLI/feature resolvers |
| Bash | 6 | 766 | Compound gates, test runners, Git commit hook |
| **Total** | **21** | **1,966** | |

Scope: standalone runtime scripts, tests, the `che` CLI source, and the Git hook. Markdown examples, JSON configuration, and external packages under `node_modules` are excluded. Physical lines include code, comments, and blank lines. **Python: 0 files** — the fourteen bundled helpers (`common.py` ×7, `check_prerequisites.py` ×4, `setup_plan.py`, `setup_tasks.py`, `resolve_template.py`) were removed in the `che` cutover (2026-10-22).

## Key observations

- **TypeScript accounts for 43.3%** of standalone script lines (the `che` CLI is the largest single runtime); Bash accounts for 39.0%, and POSIX `sh` for 17.7%.
- **`che` is published as `@newchiwan/che`** from `packages/cli` — raw TS `src/`, no build step, run by Node's native type stripping (unflagged since Node 22.18.0). Consumption model mirrors `@adrkit/cli`: PATH only, no plugin-tree or override fallback.
- **No standalone Python file remains.** Bash test runners still embed small Node.js programs for JSON assertions.
- **Two shell dialects are intentional:**
  - adrkit wrappers use `#!/bin/sh`; preserve POSIX compatibility.
  - Tests, compound gates, and the commit hook require Bash, including Bash-specific features such as process substitution and `BASH_SOURCE`.
- **External runtimes:** adrkit skills require `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`; speckit/grill/adrkit feature resolution requires `@newchiwan/che` with `che` on `PATH` (`npm install -g @newchiwan/che@0.1.0` when unavailable). No override or plugin-binary fallback is used for either.
- **Other runtime requirements:** Node.js **>=22.18**, Bash, POSIX shell/core utilities. Node and the npm-installed CLIs are mandatory for the full repository test suite (the `che` suite SKIPs only when the local Node lacks native type stripping).

## Duplication profile

Checksums confirm exact copies of:

- `adrkit-lib.sh`: **3 copies**

The seven-way `common.py` / five-way `check_prerequisites.py` duplication died with the Python helpers — those responsibilities now live once, in `packages/cli/src/`. The remaining `adrkit-lib.sh` triplication matches the pack's self-contained-per-skill script distribution model and is still a maintenance hotspot: fixes must be propagated to every copy.

## adrkit-lib.sh

`adrkit-lib.sh` (POSIX `sh`, three verbatim copies under `skills/ncw-adrkit-{check,context,draft}/scripts/`) is the shared helper library for the adrkit command scripts. It is sourced, never executed directly.

| Item | Purpose |
|---|---|
| `ADRKIT_EXIT_MISSING=1` / `ADRKIT_EXIT_USAGE=2` | Exit-code constants; 2 deliberately matches `adr`'s usage-error code |
| `adrkit_fail` | Fail-fast printer — every resolver either yields a usable value or exits non-zero naming exactly what is missing (no silent success, no fabricated payload) |
| `adrkit_cli` | Locates `adrkit` on `PATH`, errors with the `npm install -g @adrkit/cli@0.20.0` hint if absent; propagates the CLI's exit code verbatim so 1 ("found something wrong") vs 2 ("invoked wrong") stays distinguishable |
| `adrkit_corpus_dir` | Resolves the ADR corpus (`$ADRKIT_DIR` or default `docs/adr`); a missing directory is an error, not an empty corpus — a governance check silently reporting "0 decisions" was the ADR-0016 failure it guards against |
| `adrkit_feature_dir` | Resolves the current feature directory: `$ADRKIT_FEATURE_DIR` override first, else delegates to the external `che paths` on `PATH` (needs Node ≥22.18), extracting `FEATURE_DIR:` from its output |
| `adrkit_plan_path` | `<feature_dir>/plan.md`, required by anything claiming to act "on the plan" |

Design contract per the header: every resolver either yields a usable value or exits non-zero with a message naming exactly what is missing; nothing reaches the network or reads a credential.

## che CLI (`packages/cli`)

Seven TS modules, dispatched from `src/index.ts` (adrkit `packages/cli` layout: manual argv pre-parse + `node:util` `parseArgs`, `CLI_VERSION` literal pinned to `package.json#version`, `isMainModule` guard, exit codes 0/1/2).

| Module | Responsibility |
|---|---|
| `feature-paths.ts` | Repo-root resolution (`CHE_INIT_DIR` / `.git` walk-up), `.che/feature.json` pointer read/write, env precedence (`CHE_FEATURE_DIRECTORY` → pointer → error; `CHE_FEATURE_NO_PERSIST` gate; `CHE_FEATURE` branch override) |
| `check.ts` | `che paths` (resolution only, never persists) and `che check` (validation + `AVAILABLE_DOCS` report) |
| `feature.ts` | `che feature set <dir>` / `che feature show` — the pointer write/read behind `/ncw-speckit-specify` |
| `template.ts` | Safe-name (`[a-z0-9-]+`) template resolution from a caller-supplied `references/` dir |
| `setup.ts` | `che setup-plan` / `che setup-tasks` — template copy and tasks-template resolution |
| `main-module.ts` | `isMainModule`, verbatim from adrkit |
| `index.ts` | Dispatch, usage, `--version` |

The env contract was renamed from `SPECIFY_*` to `CHE_*` in the same cutover; no legacy aliases are kept. Byte-level output parity with the removed Python helpers is pinned by `tests/skills/test-che-cli.sh`.
