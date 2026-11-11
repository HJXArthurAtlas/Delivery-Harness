---
name: che-plan
description: 实现规划与任务拆解（单命令一次完成 plan→tasks）：按 plan 模板产出设计工件（research/data-model/contracts/quickstart 与 plan.md），随后按 intent 用户故事生成依赖有序、可执行的 tasks.md；存在 design-tasks.md 时必读并对齐 UX 约束，与 intent 冲突回用户裁决。当用户运行或提到 /che-plan，或说「出 plan」「做实现计划」「把 spec 转成实现规划」「出任务清单」「拆任务」「把 plan 拆成可执行任务」时使用——即使用户没提命令名，只要是 intent 之后的实现规划与任务拆解也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.local.yml` 的非空 `language:` 值（缺键或空值回落 `.che/config.yml` 的 `language:`；`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；两处键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **Interaction rule (pack fork, port on upstream upgrade): every question that needs a user answer — task-card backfill, conflict reconciliation, chain handoffs — MUST be asked through the host's interactive question tool (AskUserQuestion; the `ask` tool on omp), rendered as a form with options or free-text input. NEVER print the question and options into the reply body and end the turn waiting for typed input. Display-only output (reports, next-step hints) is unaffected.**

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). User input may scope or steer both the design phases and task generation (e.g. TDD request, story scope limits).

## Outline

   - `che setup-plan --json --references-dir <dir>` → parse FEATURE_SPEC, IMPL_PLAN, FEATURE_DIR, BRANCH
   - `che setup-tasks --json --references-dir <dir>` → parse TASKS_TEMPLATE_CONTENT and TASKS_TEMPLATE. Run after setup-plan: it requires plan.md on disk, which setup-plan creates from the template when missing. `TASKS_TEMPLATE` must be an absolute path when provided. Ignore its AVAILABLE_DOCS list — it reflects Setup-time state only (the design artifacts do not exist yet); Phase 2 re-checks them on disk after Phases 0–1.

   Record the runs timeline start before any file write: `che state start plan --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `docs/constitution/constitution.md`. Load IMPL_PLAN template (resolved from this skill's `references/`). **Pack fork (ncw, port on upstream upgrade)**: if `$FEATURE_DIR/design-tasks.md` exists, read it too — its interaction rules, page states, and design requirement checklist (UI-xx) are binding UX input for the plan's UX/interaction sections. Align the plan with it; if it conflicts with FEATURE_SPEC, stop and ask the user to reconcile with product/design — never resolve the conflict silently.

3. **Execute plan workflow** (Phase 0 research → Phase 1 design, see Phases below): fill Technical Context, Constitution Check, generate research.md / data-model.md / contracts/ / quickstart.md. After Phase 1 output: `che state done plan --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available).

4. **Execute task generation workflow** (Phase 2, see Phases below): record `che state start tasks --session "$CHE_SESSION_ID"` before writing tasks.md, generate tasks.md from the design artifacts plus intent.md user stories per Task Generation Rules, then `che state done tasks --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available).

## Completion Report

Report branch, IMPL_PLAN path, generated design artifacts (research/data-model/contracts/quickstart), tasks.md path, and task summary:

- Total task count
- Task count per user story
- Parallel opportunities identified
- Independent test criteria for each story
- Suggested MVP scope (typically just User Story 1)
- Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)
- **Pack fork (ncw), port on upstream upgrade** — close with this fixed ending sequence, nothing after it:
  1. **Optional task-card backfill (after_tasks 挂点, condition-gated)**: `.che/pingcode-config.yml` 在位且 `mapping.task_artifact` 已设置 → ask via the AskUserQuestion tool 「根据 tasks.md 补建任务卡?」— 同意即在本会话自动执行 `/che-pingcode-specstoissues` 补建任务卡；拒绝或条件不满足 → 静默跳过
  2. **Chain handoff to analyze (main path)**: use the AskUserQuestion tool (never plain-text output that pauses the session for input) with two options, each carrying a one-line description of the action; on selection the agent executes it immediately in this session — 「继续 analyze」（**推荐**）— 实现前体检：intent/plan/tasks 三工件一致性只读分析，尽早暴露矛盾、覆盖缺口与宪法冲突，此时修复成本最低。选中即自动执行 `/che-analyze` /「就此停下」— 结束本次链，analyze / gapfill / planverify 稍后手动跑. On continue, analyze takes over and nothing follows here. On stop, show the manual next-step hints rendered verbatim as follows:
     主流程:
     - /che-analyze（三工件一致性体检，随后 gapfill 补缺口、planverify 独立判定）
     可选:
     - /che-pingcode-specstoissues: 配了 mapping.task_artifact 时补建任务卡

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each RESEARCH NEEDED → research task
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

**Output**: research.md with all RESEARCH NEEDED resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from the intent** → `data-model.md`:
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

### Phase 2: Task Generation

**Prerequisites:** Phase 1 outputs complete

1. **Load design documents** — they are in FEATURE_DIR, fresh from Phases 0–1 (re-read from disk, do not rely on memory):
   - **Required**: plan.md (tech stack, libraries, structure), intent.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (interface contracts), research.md (decisions), quickstart.md (test scenarios)
   - **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints

2. **Generate tasks.md** using TASKS_TEMPLATE_CONTENT (from the setup-tasks JSON above) as the structure. For compatibility with older setup scripts that omit TASKS_TEMPLATE_CONTENT, read TASKS_TEMPLATE instead. Fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from intent.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

**Output**: tasks.md

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the intent or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from intent.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (intent.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Interfaces/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each interface contract → to the user story it serves
   - If tests requested: Each interface contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase
   - For each field with constraints in data-model.md (max length, nullable/required, enum values, validation rules), quote the constraint verbatim in the task description so it is not left to implementation-time discretion

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

## Key rules

- Use absolute paths for filesystem operations; use project-relative paths for references in documentation
- ERROR on gate failures or unresolved clarifications
- Regenerating tasks after a plan revision (e.g. post planverify REPLAN_ALLOWED or BLOCKED_ADR): re-run this command — Setup skips existing plan.md and Phase 0/1 re-validate against the revised plan before regenerating tasks.md

## Done When

- [ ] Plan workflow executed and design artifacts generated
- [ ] tasks.md generated with all phases, task IDs, and file paths
- [ ] Completion reported to user with branch, plan path, design artifacts, and task summary

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **主链**：plan → analyze（三工件体检）→ gapfill（补四类缺口任务）→ planverify（独立判定；门禁开启时必问）→ implement
- **目标**：`/che-analyze` —— intent/plan/tasks 三工件一致性只读分析，尽早暴露漂移
- **可选目标**：`/che-pingcode-specstoissues`（补建任务卡）
  - 条件：`.che/pingcode-config.yml` 在位且 `mapping.task_artifact` 已设置
  - 回退：未配置或用户拒绝 → 跳过，任务留本地 checklist
- **条件**：
  - 前置装载（入向，plan 开始时）：会话上下文无 `COMPOUND STORE LOADED` 摘要 → 先跑 `/che-load` 再 Setup；已有摘要（本会话已装载）→ 跳过
  - plan 工件齐备，存在 `design-tasks.md` 时已按其 UX 约束对齐
  - tasks.md 已按用户故事生成且依赖有序
  - 配了 `mapping.task_artifact` 时任务卡已补建
