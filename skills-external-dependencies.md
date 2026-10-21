# Skills External Script and CLI Dependencies

## Scope

Current-state audit of the skills under `skills/`, including their `SKILL.md`, `scripts/`, and `references/` files. Per the self-containment request, `ncw-speckit-flow` is **excluded from the rewrite scope** and remains documented below without modification; `ncw-monorepo-init` has since been **removed from the pack** (2026-10-20).

“External” means outside this pack. Pack-local cross-skill scripts are identified separately. Host runtimes and the target project's own toolchain are not rewritten.

## Pack-local scripts and CLI requirements

| Skills | Implementation | Requirement |
|---|---|---|
| `ncw-adrkit-{check,context,draft}` | POSIX wrappers execute only `adrkit` from `PATH`; no override variable or plugin `node_modules` lookup. | **External `@adrkit/cli` 0.20.0 required on `PATH`.** If unavailable, run `npm install -g @adrkit/cli@0.20.0`. Node ≥22 is required by the CLI. |
| `ncw-adrkit-{check,draft}` feature resolution | Each `adrkit-lib.sh` resolves feature paths through the external `che` CLI on `PATH` (`che paths`). | **External `@newchiwan/che` required on `PATH`** (Node ≥22.18). If unavailable, run `npm install -g @newchiwan/che@0.1.0`. The feature pointer lives at `.che/feature.json`; `ADRKIT_FEATURE_DIR` overrides resolution. |
| `ncw-speckit-{analyze,clarify,constitution,converge,design,grill-me,grill-with-docs,implement,plan,specify,tasks}` feature/template resolution | The same external `che` CLI (`paths` / `check` / `feature set|show` / `template` / `setup-plan` / `setup-tasks`). | **The same external `@newchiwan/che` requirement applies.** |
| `ncw-speckit-grill-with-docs`, `ncw-compound-writeback` | `ncw-adrkit-draft/scripts/scaffold.sh` allocates records; `ncw-adrkit-draft/scripts/adr.sh lint` validates them. | Pack-local entry points; the same external `@adrkit/cli` requirement applies. |
| `ncw-compound-load` legacy ADR migration | Delegates to `ncw-adrkit-draft`; its migration runbook uses `adr.sh migrate` and `adr.sh lint`. | **Only during legacy migration; the same external `@adrkit/cli` requirement applies.** |

## Excluded or conditional external integrations

| Skills | External reference | Current requirement |
|---|---|---|
| `ncw-speckit-flow` | PingCode card workflow via pack skills `ncw-pingcode-*` (external `pingcode` CLI ≥ 0.14.0, authenticated) and `mturtle-commit`. | **Excluded from the rewrite and unchanged.** They remain required for the PingCode card workflow. |
| `ncw-compound-{planverify,intentguard}` | `codex exec`, `gemini -p`, or `claude -p` for Tier-1 checking. | **Conditional.** Default `auto` uses native Tier-2/Tier-3 subagents when no cross-model CLI exists; a fresh default-model subagent is the pack-local baseline. Only forced `cross-model` or `cli:model` policy requires an external model CLI. |
| `ncw-compound-intentguard` | `git` and the target project's build/test/lint toolchain. | **Host capabilities, unchanged.** They inspect the target diff and exercise the target project; they are not pack-downloaded dependencies. |

## Bundled scripts with host runtime dependencies

- The seven speckit helpers that used to bundle Python scripts—`analyze`, `clarify`, `constitution`, `converge`, `implement`, `plan`, and `tasks`—now delegate feature-path, pointer, template, and setup resolution to the external `che` CLI (`@newchiwan/che` on `PATH`); grill, adrkit check/draft, design, and specify use the same CLI. The bundled Python helpers were removed in the che cutover.
- `ncw-adrkit-{check,context,draft}` run POSIX shell wrappers that invoke external `@adrkit/cli` exclusively through `adrkit` on `PATH`; install it with `npm install -g @adrkit/cli@0.20.0` when unavailable.
- `ncw-compound-require-intent` and `ncw-compound-planverify-gate` run their own bundled Bash scripts.

## Verification

`npm test` passed after the `che` cutover:

- Structure checks: **248 passed, 0 failed**
- che CLI contract checks: **34 passed, 0 failed**
- Pack runtime contract checks: **32 passed, 0 failed**

The pack runtime suite copies the affected skills into a temporary `.agents/skills/` installation. It first uses a minimal `PATH` without `adrkit` and without `che` to verify the nonzero exit and npm installation guidance for each, then adds the real `@adrkit/cli` and the repo-local `@newchiwan/che` (linked by `npm ci` via the `file:packages/cli` dependency) and runs feature resolution, scaffold, draft, lint, check, evaluate, context/queue, and MADR migration. `jq` and `git` remain absent from the minimal `PATH`.
