# Skills External Script and CLI Dependencies

## Scope

Current-state audit of the skills under `skills/`, including their `SKILL.md`, `scripts/`, and `references/` files. Per the self-containment request, `ncw-speckit-flow` is **excluded from the rewrite scope** and remains documented below without modification; `ncw-monorepo-init` has since been **removed from the pack** (2026-10-20).

“External” means outside this pack. Pack-local cross-skill scripts are identified separately. Host runtimes and the target project's own toolchain are not rewritten.

## Pack-local scripts and CLI requirements

| Skills | Implementation | Requirement |
|---|---|---|
| `ncw-adrkit-{check,context,draft}` | POSIX wrappers execute only `adrkit` from `PATH`; no override variable or plugin `node_modules` lookup. | **External `@adrkit/cli` 0.20.0 required on `PATH`.** If unavailable, run `npm install -g @adrkit/cli@0.20.0`. Node ≥22 is required by the CLI. |
| `ncw-adrkit-{check,draft}` feature resolution | `ncw-speckit-analyze/scripts/check_prerequisites.py` + `common.py`, invoked by each `adrkit-lib.sh`. | The feature pointer lives at `docs/memory/feature.json`. `python3` is required unless `ADRKIT_FEATURE_DIR` is set. |
| `ncw-speckit-grill-{me,with-docs}` | The same bundled `check_prerequisites.py --json --paths-only` from `ncw-speckit-analyze`. | **No external prerequisite script required.** `python3` and the active feature context remain required. |
| `ncw-speckit-grill-with-docs`, `ncw-compound-writeback` | `ncw-adrkit-draft/scripts/scaffold.sh` allocates records; `ncw-adrkit-draft/scripts/adr.sh lint` validates them. | Pack-local entry points; the same external `@adrkit/cli` requirement applies. |
| `ncw-compound-load` legacy ADR migration | Delegates to `ncw-adrkit-draft`; its migration runbook uses `adr.sh migrate` and `adr.sh lint`. | **Only during legacy migration; the same external `@adrkit/cli` requirement applies.** |

## Excluded or conditional external integrations

| Skills | External reference | Current requirement |
|---|---|---|
| `ncw-speckit-flow` | PingCode card workflow via pack skills `ncw-pingcode-*` (external `pingcode` CLI ≥ 0.14.0, authenticated) and `mturtle-commit`. | **Excluded from the rewrite and unchanged.** They remain required for the PingCode card workflow. |
| `ncw-compound-{planverify,intentguard}` | `codex exec`, `gemini -p`, or `claude -p` for Tier-1 checking. | **Conditional.** Default `auto` uses native Tier-2/Tier-3 subagents when no cross-model CLI exists; a fresh default-model subagent is the pack-local baseline. Only forced `cross-model` or `cli:model` policy requires an external model CLI. |
| `ncw-compound-intentguard` | `git` and the target project's build/test/lint toolchain. | **Host capabilities, unchanged.** They inspect the target diff and exercise the target project; they are not pack-downloaded dependencies. |

## Bundled scripts with host runtime dependencies

- Seven speckit skills—`analyze`, `clarify`, `constitution`, `converge`, `implement`, `plan`, and `tasks`—run their own bundled Python helpers through `python3`; grill and adrkit feature resolution reuse the `analyze` copy.
- `ncw-adrkit-{check,context,draft}` run POSIX shell wrappers that invoke external `@adrkit/cli` exclusively through `adrkit` on `PATH`; install it with `npm install -g @adrkit/cli@0.20.0` when unavailable.
- `ncw-compound-require-intent` and `ncw-compound-planverify-gate` run their own bundled Bash scripts.

## Verification

`npm test` passed after the `@adrkit/cli` cutover:

- Structure checks: **267 passed, 0 failed**
- Constitution runtime contract checks: **6 passed, 0 failed**
- Pack runtime contract checks: **28 passed, 0 failed**

The pack runtime suite copies the affected skills into a temporary `.agents/skills/` installation. It first uses a minimal `PATH` without `adrkit` to verify the nonzero exit and npm installation guidance, then adds the real `@adrkit/cli` installed by `npm ci` and runs feature resolution, scaffold, draft, lint, check, evaluate, context/queue, and MADR migration. `jq` and `git` remain absent from the minimal `PATH`.
