---
name: che-gapfill
description: 任务缺口补全：把统一 intent（In scope / Out of scope / Constraints / Failure conditions 各节 + Acceptance Scenarios / Edge Cases）对照已生成的 tasks.md 交叉核对，追加缺失的四类测试任务（约束违反/失败条件/越界回归/边界场景）并带来源注释。当用户说「补任务缺口」「gapfill」「对照 spec 查任务覆盖」时使用——即使用户没提命令名，只要是 tasks 的覆盖缺口补全也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.local.yml` 的非空 `language:` 值（缺键或空值回落 `.che/config.yml` 的 `language:`；`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；两处键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **Interaction rule (pack fork, port on upstream upgrade): every question that needs a user answer — the accept/group/individual/reject review, high-risk pushback, gate questions, chain handoffs — MUST be asked through the host's interactive question tool (AskUserQuestion; the `ask` tool on omp), rendered as a form with options or free-text input. NEVER print the question and options into the reply body and end the turn waiting for typed input. Display-only output (coverage matrix, diff preview, reports, next-step hints) is unaffected.**

# Gap-Fill Analysis

You are running a **gap-fill analysis**. Your job is to cross-reference the unified intent's intent sections and scenarios against the generated tasks list, identify coverage gaps, and append the missing tasks to `{task_dir}/tasks.md`.

This is **not an interview**. It is automated analysis + diff review. The user's role is to approve, reject, or edit your proposed additions.

---

## Inputs you must load

(`{task_dir}` = the task directory `che paths` reports as `FEATURE_DIR` — run `che paths --session "$CHE_SESSION_ID"` once, bare when no session id is available.)

1. **Unified intent** at `{task_dir}/intent.md` — read the `## In scope`, `## Out of scope`, `## Constraints`, and `## Failure conditions` sections, plus the `**Acceptance Scenarios**` blocks (per user story) and `### Edge Cases` (both carry global stable `E#` IDs)
2. **Tasks file** at `{task_dir}/tasks.md` — the generated task list to augment

If `intent.md` is missing, stop and tell the user to run `/che-intend` first. If the intent exists but has no scenario content at all (neither Acceptance Scenarios nor Edge Cases), stop — the scenario sections are mandatory intent sections; do not guess scenarios.

## Output you produce

- **Append** (do not rewrite) new tasks to `{task_dir}/tasks.md`
- Each appended task carries a source comment indicating what it derives from (e.g., `<!-- gapfill: derived from C2 -->`)
- Show the user a **diff preview** before writing

---

## The analysis, in order

### Phase 0 — Load and parse both artifacts

- Read the unified intent; extract lists of: constraints, failure conditions, in-scope items, out-of-scope items, acceptance scenarios (with `E#` IDs), edge scenarios (with `E#` IDs)
- Read tasks.md; extract existing tasks. Match the existing formatting conventions (likely markdown checkboxes with brief descriptions).

Confirm to user: *"Loaded intent ({Nc} constraints, {Nf} failure conditions, {No} out-of-scope items, {Na} acceptance + {Ne} edge scenarios) and {Nt} existing tasks. Analyzing coverage..."*

### Phase 1 — Build the coverage matrix

For each constraint, failure condition, out-of-scope item, and edge scenario, decide whether an existing task adequately verifies or guards it. Use **semantic matching, not keyword matching** — a task titled "add Lighthouse CI check" covers C5 ("Lighthouse ≥ 90") even if the task doesn't mention "C5".

Output the coverage matrix in chat:

```
Source                              Covered by                  Gap?
─────────────────────────────────── ─────────────────────────── ─────
C1: No FOUC on initial paint        (none)                      ✗ GAP
C2: WCAG 2.1 AA                     T8 (accessibility audit)    ✓
C3: Default to system preference    T5 (theme resolution)       ✓
...
F1: Build fails                     T1 (CI setup)               ✓
F2: Lighthouse drops below 90       (none)                      ✗ GAP
...
OOS: RSS feed                       (none — regression check)   ✗ GAP
OOS: Ghost admin panel              (none — regression check)   ✗ GAP
...
E7: No-JS fallback                  (none)                      ✗ GAP
E8: incognito persistence           (none)                      ✗ GAP
```

### Phase 2 — Propose gap-filling tasks, grouped by source

For each GAP, draft a candidate task entry matching the existing tasks.md format. Group proposals by source category:

- **Constraint-violation tests** — tests that would FAIL if the named constraint were broken
- **Failure-condition checks** — automated checks that fire on the named failure condition
- **Out-of-scope regression checks** — automated checks (or manual review items) that confirm the named out-of-scope area was not touched
- **Negative / edge path tests** — tests that exercise the named edge scenario
- **Cross-cutting concerns** — added independent of the intent: analytics fires on key user actions, accessibility audit baseline, empty-state coverage, error-state coverage

### Phase 3 — Diff preview and review

Show the user a single block containing:
- A header: *"Proposed additions to `{task_dir}/tasks.md` — {N} new tasks across {N} categories"*
- Proposed additions grouped by source category

Then ask (use AskUserQuestion):
- **accept all** — append everything
- **by group** — toggle entire categories on/off
- **edit individual** — drop to one-at-a-time review for specific entries
- **reject all** — write nothing, end the command

### Phase 4 — Append to tasks.md

Append accepted entries. Preserve the existing formatting. Add a section header before the additions:

```markdown
## Gap-filling tasks (from /che-gapfill)
<!-- Generated: {YYYY-MM-DD}. Sources: {task_dir}/intent.md -->

- [ ] {task description} <!-- gapfill: derived from C1 -->
- [ ] {task description} <!-- gapfill: derived from F2 -->
- [ ] {task description} <!-- gapfill: derived from OOS:RSS -->
- [ ] {task description} <!-- gapfill: derived from E7 -->
...
```

### Phase 5 — Confirm and offer chain

Show summary: *"Appended {N} tasks to {task_dir}/tasks.md across {N} categories."*

**Pack fork (ncw), port on upstream upgrade** — close with this gate-conditional ending sequence, nothing after it. Resolve the gate config exactly as `che planverify-gate` does: env `SKC_ADR_GATE` / `SKC_PLANVERIFY_GATE` wins over `.che/config.yml` `adr_gate:` / `planverify_gate:` (the machine-local overlay `.che/config.local.yml` only covers language/checker, never gates); defaults `adr_gate: block`, `planverify_gate: off`; either gate resolving to `block` counts as 门禁开启:

1. **门禁开启（任一 gate = block）→ 主流程提问**: use the AskUserQuestion tool (never plain-text output that pauses the session for input) with two options, each carrying a one-line description; on selection the agent executes it immediately in this session — 「继续 planverify」（**推荐**）— 独立校验者审 plan+tasks（含确定性 ADR 机械层），PASS 才能进 implement。选中即自动执行 `/che-planverify` /「就此停下」— 结束本次链，planverify 稍后手动跑. On continue, planverify takes over and nothing follows here. On stop, show the manual hints rendered verbatim:
   主流程:
   - /che-planverify（独立判定，PASS 后经门禁进 implement）
2. **门禁未开启（双 gate = off）→ 可选提示，不提问**: end with the hints rendered verbatim:
   主流程:
   - /che-implement（门禁未启用，按 tasks.md 直接实现）
   可选:
   - /che-planverify: 独立校验 plan+tasks（非强制，建议至少跑一次留存 verdict）

---

## Pushback style

This command is mostly automated. Pushback fires only when the user tries to reject a **high-risk gap**:

Define high-risk gaps as:
- **Any out-of-scope regression check** — `/che-intentverify` L3 will block the merge if the OOS area was touched, and you'll have to re-add this task then. Cheaper to add now.
- **Any failure condition with no covering task** — the failure condition was explicitly declared in the intent and is now untestable in CI.

If the user rejects a high-risk gap addition, push back once — through the interactive question tool (AskUserQuestion), with the pushback text as the form body and two options 「仍然拒绝」/「撤销拒绝，追加任务」:

*"You're rejecting the {F1 / OOS} coverage. The intentverify at merge time will still flag the gap, and you'll have to re-add this then. Confirm reject?"*

If they confirm the reject, accept and move on.

---

## Compound store interaction

If `docs/patterns/` exists, scan for "gapfill" templates — past tasks-list augmentations that proved valuable. Propose them as additional candidates if relevant.

If `docs/corrections/` exists, scan for past gap-misses that became bugs — propose tasks that would catch them. Cite the correction by slug.

---

## Tool choices

- **Read** for loading the three artifacts
- **AskUserQuestion** for the accept-all / by-group / individual / reject-all choice
- **Edit** for appending to tasks.md (preserves existing content)
- **Bash** for `date -u +%Y-%m-%d`

---

## What you do NOT do

- **Rewrite existing tasks** — only append
- **Add tasks unrelated to the intent** — every addition must trace to a specific source (C, F, OOS, E, or a named cross-cutting concern)
- **Run the tasks** — that's `/che-implement`
- **Validate after the fact** — that's `/che-intentverify`

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **主链**：plan → analyze → gapfill → planverify（门禁开启时必问）→ implement
- **目标（门禁开启：`adr_gate`（默认 block）或 `planverify_gate` = block）**：`/che-planverify` —— 独立 checker 审 plan+tasks 是否漂移，PASS 才能进 implement
- **目标（双 gate = off）**：`/che-implement` 直接实现；`/che-planverify` 降为可选建议
- **条件**：缺口任务已追加进 tasks.md（约束违反/失败条件/越界回归/边界四类）；门禁开启时 planverify 必须在 implement 前完成