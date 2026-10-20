# Skills External Script and CLI Dependencies

## Scope

Current-state audit of the skills under `skills/`, including their `SKILL.md`, `scripts/`, and `references/` files. Per the self-containment request, `ncw-speckit-flow` is **excluded from the rewrite scope** and remains documented below without modification; `ncw-monorepo-init` has since been **removed from the pack** (2026-10-20).

“External” means outside this pack. Pack-local cross-skill scripts are identified separately. Host runtimes and the target project's own toolchain are not rewritten.

## Formerly external, now bundled

| Skills | Pack-local implementation | Requirement |
|---|---|---|
| `ncw-adrkit-{check,context,draft}` | `ncw-adrkit-draft/scripts/adr.mjs` is a single-file bundle of `@adrkit/cli` and its runtime dependencies. `adrkit-lib.sh` resolves `ADRKIT_CLI` only as an explicit override, then this bundled file; it no longer probes `node_modules` or `PATH` for `adr`. | **No external adrkit CLI required.** Node ≥22 runs the bundle. Source/dependency pins are in `adrkit-bundle.json`; redistribution notices are in `scripts/licenses/`. |
| `ncw-adrkit-{check,draft}` feature resolution | `ncw-speckit-analyze/scripts/check_prerequisites.py` + `common.py`, invoked by each `adrkit-lib.sh`. | **No `specify init` required** (`.specify/` is deprecated; the feature pointer lives at `docs/memory/feature.json`). `python3` is required unless `ADRKIT_FEATURE_DIR` is set. |
| `ncw-speckit-grill-{me,with-docs}` | The same bundled `check_prerequisites.py --json --paths-only` from `ncw-speckit-analyze`. | **No external prerequisite script required.** `python3` and the active feature context remain required. |
| `ncw-speckit-grill-with-docs`, `ncw-compound-writeback` | `ncw-adrkit-draft/scripts/scaffold.sh` allocates records; `ncw-adrkit-draft/scripts/adr.sh lint` validates them. | **Pack-local cross-skill only.** No external `adr` command. |
| `ncw-compound-load` legacy ADR migration | Delegates to `ncw-adrkit-draft`; its migration runbook uses the bundled `adr.sh migrate` and `adr.sh lint`. | **Only during legacy migration; no external adrkit CLI.** |

## Excluded or conditional external integrations

| Skills | External reference | Current requirement |
|---|---|---|
| `ncw-speckit-flow` | PingCode card workflow via pack skills `ncw-pingcode-*` (external `pingcode` CLI ≥ 0.14.0, authenticated) and `mturtle-commit`. | **Excluded from the rewrite and unchanged.** They remain required for the PingCode card workflow. |
| `ncw-compound-{planverify,intentguard}` | `codex exec`, `gemini -p`, or `claude -p` for Tier-1 checking. | **Conditional.** Default `auto` uses native Tier-2/Tier-3 subagents when no cross-model CLI exists; a fresh default-model subagent is the pack-local baseline. Only forced `cross-model` or `cli:model` policy requires an external model CLI. |
| `ncw-compound-intentguard` | `git` and the target project's build/test/lint toolchain. | **Host capabilities, unchanged.** They inspect the target diff and exercise the target project; they are not pack-downloaded dependencies. |

## Bundled scripts with host runtime dependencies

- Seven speckit skills—`analyze`, `clarify`, `constitution`, `converge`, `implement`, `plan`, and `tasks`—run their own bundled Python helpers through `python3`; grill and adrkit feature resolution reuse the `analyze` copy.
- `ncw-adrkit-{check,context,draft}` run POSIX shell wrappers and the bundled `adr.mjs` through `node`; no npm install or dependency directory is needed at runtime.
- `ncw-compound-require-intent` and `ncw-compound-planverify-gate` run their own bundled Bash scripts.

## Verification

`npm test` passed:

- Structure checks: **209 passed, 0 failed**
- Constitution runtime contract checks: **16 passed, 0 failed**
- Pack runtime contract checks: **26 passed, 0 failed**

The pack runtime suite copies the affected skills into a temporary `.agents/skills/` installation and runs feature resolution, scaffold, draft, lint, check, evaluate, context/queue, and MADR migration with a minimal `PATH` containing **no `adr`, `specify`, `jq`, or `git`**, and with no project `.specify/` directory at all (deprecated). This verifies the new default runtime paths rather than merely checking file references.
