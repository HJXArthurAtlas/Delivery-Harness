---
name: che-compound-plan
description: 实现规划：按 plan 模板产出设计工件（research/data-model/contracts/quickstart 与 plan.md）；存在 design-tasks.md 时必读并对齐 UX 约束，与 spec 冲突回用户裁决。当用户运行或提到 /che-compound-plan，或说「出 plan」「做实现计划」「把 spec 转成实现规划」时使用——即使用户没提命令名，只要是 spec 之后的实现规划也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `che setup-plan --json --references-dir .agents/skills/che-compound-plan/references` (global install: `~/.agents/skills/che-compound-plan/references`), from repo root, and parse JSON for FEATURE_SPEC, IMPL_PLAN, FEATURE_DIR, BRANCH (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`). The `plan-template` is provided by this skill's own `references/plan-template.md`; no project scaffolding. Record the runs timeline start before any file write: `che state start plan --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `docs/constitution/constitution.md`. Load IMPL_PLAN template (resolved from this skill's `references/`). **Pack fork (ncw, port on upstream upgrade)**: if `$FEATURE_DIR/design-tasks.md` exists, read it too — its interaction rules, page states, and design requirement checklist (UI-xx) are binding UX input for the plan's UX/interaction sections. Align the plan with it; if it conflicts with FEATURE_SPEC, stop and ask the user to reconcile with product/design — never resolve the conflict silently.

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Re-evaluate Constitution Check post-design

## Completion Report

Command ends after Phase 1 design. Record the runs timeline completion: `che state done plan --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). Then report branch, IMPL_PLAN path, and generated artifacts. **Pack fork (ncw), port on upstream upgrade**: end the report with grouped next-step hints, rendered verbatim as follows:
  主流程:
  - /che-adr-check: 对照 ADR 语料校验 plan 是否越决策边界（必经；无未处置 departure 才进 tasks）
  - /che-compound-tasks: 按 spec 用户故事生成依赖有序任务清单
  可选:
  - /che-compound-analyze: [可选] spec/plan 工件一致性只读分析
  - /che-pingcode-specstoissues: [可选] 配了 mapping.task_artifact 时 tasks 后补建任务卡（implement 前 spec 有改动先跑 /che-pingcode-sync-cards 对账）

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

- **目标**：`/che-compound-tasks` —— 生成依赖有序任务清单
- **条件**：
  - 前置装载（入向，plan 开始时）：会话上下文无 `COMPOUND STORE LOADED` 摘要 → 先跑 `/che-compound-load` 再 Setup；已有摘要（本会话已装载）→ 跳过
  - plan 工件齐备
  - 存在 `design-tasks.md` 时已按其 UX 约束对齐
  - 必经 `/che-adr-check`：对照 ADR 语料校验越界，无未处置 departure 才交接 tasks
