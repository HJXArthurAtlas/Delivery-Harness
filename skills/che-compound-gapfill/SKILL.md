---
name: che-compound-gapfill
description: 任务缺口补全：把统一 spec（In scope / Out of scope / Constraints / Failure conditions 各节）+ expectations 对照已生成的 tasks.md 交叉核对，追加缺失的四类测试任务（约束违反/失败条件/越界回归/边界场景）并带来源注释。当用户说「补任务缺口」「gapfill」「对照 spec 查任务覆盖」时使用——即使用户没提命令名，只要是 tasks 的覆盖缺口补全也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Gap-Fill Analysis

You are running a **gap-fill analysis**. Your job is to cross-reference the unified spec's intent sections + expectations doc against the generated tasks list, identify coverage gaps, and append the missing tasks to `{task_dir}/tasks.md`.

This is **not an interview**. It is automated analysis + diff review. The user's role is to approve, reject, or edit your proposed additions.

---

## Inputs you must load

(`{task_dir}` = the task directory `che paths` reports as `FEATURE_DIR` — run `che paths --session "$CHE_SESSION_ID"` once, bare when no session id is available.)

1. **Unified spec** at `{task_dir}/spec.md` — read the `## In scope`, `## Out of scope`, `## Constraints`, and `## Failure conditions` sections for in-scope items, out-of-scope items, constraints, and failure conditions
2. **Expectations doc** at `{task_dir}/expectations.md` — for positive and edge scenarios
3. **Tasks file** at `{task_dir}/tasks.md` — the generated task list to augment

If any of these are missing, stop and tell the user which to generate first (a missing `spec.md` means `/che-compound-specify` has not run).

## Output you produce

- **Append** (do not rewrite) new tasks to `{task_dir}/tasks.md`
- Each appended task carries a source comment indicating what it derives from (e.g., `<!-- gapfill: derived from C2 -->`)
- Show the user a **diff preview** before writing

---

## The analysis, in order

### Phase 0 — Load and parse all three artifacts

- Read the unified spec; extract lists of: constraints, failure conditions, in-scope items, out-of-scope items
- Read expectations doc; extract lists of: positive scenarios, edge scenarios
- Read tasks.md; extract existing tasks. Match the existing formatting conventions (likely markdown checkboxes with brief descriptions).

Confirm to user: *"Loaded spec ({Nc} constraints, {Nf} failure conditions, {No} out-of-scope items), expectations ({Np} positive + {Ne} edge scenarios), and {Nt} existing tasks. Analyzing coverage..."*

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
- **Cross-cutting concerns** — added independent of the spec/expectations: analytics fires on key user actions, accessibility audit baseline, empty-state coverage, error-state coverage

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
## Gap-filling tasks (from /che-compound-gapfill)
<!-- Generated: {YYYY-MM-DD}. Sources: {task_dir}/spec.md, {task_dir}/expectations.md -->

- [ ] {task description} <!-- gapfill: derived from C1 -->
- [ ] {task description} <!-- gapfill: derived from F2 -->
- [ ] {task description} <!-- gapfill: derived from OOS:RSS -->
- [ ] {task description} <!-- gapfill: derived from E7 -->
...
```

### Phase 5 — Confirm and offer chain

Show summary: *"Appended {N} tasks to {task_dir}/tasks.md across {N} categories."*

Ask: *"Continue to /che-compound-planverify? [yes / no]"*

---

## Pushback style

This command is mostly automated. Pushback fires only when the user tries to reject a **high-risk gap**:

Define high-risk gaps as:
- **Any out-of-scope regression check** — `/che-compound-intentguard` L3 will block the merge if the OOS area was touched, and you'll have to re-add this task then. Cheaper to add now.
- **Any failure condition with no covering task** — the failure condition was explicitly declared in the spec and is now untestable in CI.

If the user rejects a high-risk gap addition, push back once:

*"You're rejecting the {F1 / OOS} coverage. The intentguard at merge time will still flag the gap, and you'll have to re-add this then. Confirm reject?"*

If they confirm, accept and move on.

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
- **Add tasks unrelated to the spec or expectations** — every addition must trace to a specific source (C, F, OOS, E, or a named cross-cutting concern)
- **Run the tasks** — that's `/che-compound-implement`
- **Validate after the fact** — that's `/che-compound-intentguard`

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-planverify` —— 独立 checker 审判 plan+tasks 是否漂移
- **条件**：缺口任务已追加进 tasks.md（约束违反/失败条件/越界回归/边界四类）；planverify 必须在 implement 前完成