---
name: ncw-speckit-plan
description: Execute the implementation planning workflow using the plan template to generate design artifacts. Use when the user runs or mentions /ncw-speckit-plan, or asks to plan the implementation, produce the design artifacts, or turn a spec into an implementation plan.
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `che setup-plan --json --references-dir .agents/skills/ncw-speckit-plan/references` (global install: `~/.agents/skills/ncw-speckit-plan/references`), from repo root, and parse JSON for FEATURE_SPEC, IMPL_PLAN, FEATURE_DIR, BRANCH (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@0.1.0`). The `plan-template` is provided by this skill's own `references/plan-template.md`; no project scaffolding. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `docs/constitution/constitution.md`. Load IMPL_PLAN template (resolved from this skill's `references/`). **Pack fork (ncw, port on upstream upgrade)**: if `$FEATURE_DIR/design-tasks.md` exists, read it too — its interaction rules, page states, and design requirement checklist (UI-xx) are binding UX input for the plan's UX/interaction sections. Align the plan with it; if it conflicts with FEATURE_SPEC, stop and ask the user to reconcile with product/design — never resolve the conflict silently.

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Re-evaluate Constitution Check post-design

## Completion Report

Command ends after Phase 1 design. Report branch, IMPL_PLAN path, and generated artifacts. **Pack fork (ncw), port on upstream upgrade**: end the report with grouped next-step hints, rendered verbatim as follows:
  主流程:
  - /ncw-speckit-tasks: 按 spec 用户故事生成依赖有序任务清单
  可选:
  - /ncw-adrkit-check: [可选] 对照 ADR 语料校验 plan 是否越决策边界
  - /ncw-speckit-analyze: [可选] spec/plan 工件一致性只读分析
  - /ncw-pingcode-specstoissues: [可选] 配了 mapping.task_artifact 时 tasks 后补建任务卡（implement 前 spec 有改动先跑 /ncw-pingcode-sync-cards 对账）

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Create quickstart validation guide** → `quickstart.md`:
   - Document runnable validation scenarios that prove the feature works end-to-end
   - Include prerequisites, setup commands, test/run commands, and expected outcomes
   - Use links or references to contracts and data model details instead of duplicating them
   - Do not include full implementation code, model/service/controller bodies, migrations, or complete test suites
   - Keep this artifact as a validation/run guide; implementation details belong in `tasks.md` and the implementation phase

**Output**: data-model.md, contracts/*, quickstart.md

## Key rules

- Use absolute paths for filesystem operations; use project-relative paths for references in documentation
- ERROR on gate failures or unresolved clarifications

## Done When

- [ ] Plan workflow executed and design artifacts generated
- [ ] Completion reported to user with branch, plan path, and generated artifacts

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/ncw-speckit-tasks` —— 生成依赖有序任务清单
- **条件**：
  - plan 工件齐备
  - 存在 `design-tasks.md` 时已按其 UX 约束对齐
  - 可选先跑 `/ncw-adrkit-check` 对照 ADR 语料校验越界
