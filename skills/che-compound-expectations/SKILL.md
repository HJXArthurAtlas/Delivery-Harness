---
name: che-compound-expectations
description: 期望捕获（validator-only）：访谈式捕获成功场景与边界场景，单独落任务目录的 expectations.md（`{TASK_DIR}/expectations.md`，`che paths` 的 `FEATURE_DIR`），与同目录 builder 可读的统一 spec.md 分文件存放——文件隔离是防 reward-hack 的设计。当用户说「补期望场景」「写 expectations」「捕获边界场景」时使用——即使用户没提命令名，只要是期望场景的捕获落盘也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Expectations Interview

You are running an **expectations interview** — the compartmented counterpart to `/che-compound-specify`. Your job is to capture user-observable success and edge scenarios that the validator (`/che-compound-intentguard`) will use to decide whether the implementation is truly done.

---

## Project root anchor (read this first — v0.2.2 cwd fix)

**Critical:** operate from the project root for all file I/O. The project root is the directory containing `.git`.

Before any Read, Write, or Edit:

```bash
# TODO: project-root marker is currently the .git directory; revisit when a
# dedicated SDD marker is introduced.
PROJECT_ROOT="$(pwd)"
while [ "$PROJECT_ROOT" != "/" ] && [ ! -e "$PROJECT_ROOT/.git" ]; do
  PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done
if [ ! -e "$PROJECT_ROOT/.git" ]; then
  echo "ERROR: not in an SDD project (.git not found in any parent of $(pwd))"
  exit 1
fi
cd "$PROJECT_ROOT"
```

All artifacts live in the task directory. **Manual invocation**: resolve it once with `che paths --json` from `$PROJECT_ROOT` and use its `FEATURE_DIR` as `$TASK_DIR` (the `specs/NNN-{slug}/` directory created at specify time). **Chained invocation**: when this command was invoked as a chain handoff from `/che-compound-specify`, reuse the `TASK_DIR` and `SLUG` carried by that invocation instead of re-resolving among multiple tasks. Re-anchor after any `cd` in a subsequent Bash command.

---

## Why this is a separate command from /che-compound-specify

Per IDSD's compartmentation rule, **success scenarios must not live in the same artifact the builder reads**, because LLMs reward-hack: they will optimize for the validator's checks if both come from the same file.

- `/che-compound-specify` captures goal + constraints + failure conditions and generates the feature specification in the unified `{TASK_DIR}/spec.md` (what the builder reads)
- `/che-compound-expectations` captures success and edge scenarios (what the validator reads)

In v0.2 (soft compartmentation), the same agent runs both interviews, but:
- The two files are **different files** in the same task directory (`spec.md` vs `expectations.md`)
- `/che-compound-implement` is instructed to load **only** `{TASK_DIR}/spec.md`, NOT the expectations file
- `/che-compound-intentguard` is instructed to load **both**

Hard compartmentation (separate agents, encrypted evals, builder structurally unable to read the expectations file) is deferred to v0.3+ if we see evidence of gaming.

---

## The non-negotiable rule

**Do not terminate this interview until the expectations doc is complete and every scenario passes tests E1–E4.**

If the user tries to skip, refuse politely and explain which specific test would fail. If the user is stuck, brainstorm with them — do not punt back.

---

## Inputs you have

- **Required**: the unified spec at `{TASK_DIR}/spec.md`. If it does not exist, stop and instruct the user to run `/che-compound-specify` first.
- Compound store artifacts at `docs/adr/`, `docs/corrections/`, and `docs/patterns/`, if loaded via `/che-compound-load`

## Output you produce

- One file: `{TASK_DIR}/expectations.md` — same slug as the spec, in the same task directory
- Format: see "Output format" at the bottom

---

## The interview, in order

### Phase 0 — Read the unified spec

Read `{TASK_DIR}/spec.md` in full. Extract:
- The goal sentence from the `# Feature Specification:` heading
- The Why now narrative
- The in-scope list (`## In scope`)
- The out-of-scope list (`## Out of scope`)
- The constraints (C1–CN, from `## Constraints`)
- The failure conditions (F1–FN, from `## Failure conditions`)

Confirm to the user: *"Loaded unified spec for `{slug}`. Goal: `{goal}`. Working from {N} in-scope items, {N} constraints, {N} failure conditions."*

**Skip-when-chained.** If this command was invoked as a chain handoff from `/che-compound-specify` in the same session, skip the verbose confirmation — the user just wrote the spec seconds ago and doesn't need it summarized back. Say briefly instead: *"Continuing from specify → drafting positive scenarios..."*

### Phase 1 — Positive scenarios (the golden paths)

For each in-scope item from the spec's `## In scope` list, draft a candidate positive scenario in user-observable language. Show the user the **full draft set as a numbered list** before asking individual questions — most users accept most drafts, so batch presentation is faster than one-at-a-time.

Ask: *"Accept all / edit specific numbers / write your own."*

After the user responds, apply tests **E1–E4** to each accepted scenario. Push back on any that fail. Iterate until the positive-scenario set is locked.

Target: **3–6 positive scenarios.**

### Phase 2 — Edge / negative scenarios (boundary and graceful-degradation cases)

Derive candidate edge scenarios from:
- The spec's **`## Out of scope`** list (what should NOT happen if the implementation overreaches)
- The spec's **`## Failure conditions`** (negative paths the validator will catch — make sure the expectations describe user-observable parallels)
- Commonly-missed degradation cases for the feature type

For dark-mode-style UI features, commonly-missed edges:
- No-JavaScript fallback
- No-localStorage (private/incognito browsing)
- Forced-colors / high-contrast mode
- Race conditions (rapid user input)
- Network failures (if relevant)

For data-pipeline features, commonly-missed edges:
- Empty input
- Malformed input
- Rate-limit hits
- Partial failure / retry semantics
- Idempotency

For agent/AI features, commonly-missed edges:
- Hallucination / wrong output
- Timeout
- User cancellation mid-stream
- Empty context window

Show drafts as a numbered list. Accept/edit/write-your-own. Apply E1–E4. Push the user explicitly on edges they didn't ask about.

Target: **2–4 edge scenarios.**

### Phase 3 — Cap check, then write the file

**Soft cap at 12 total scenarios** (target: 6 positive + 6 edge). If the locked set exceeds 12, stop and ask:

*"This is getting wide ({N} scenarios). Two options:*
*  (a) **split** — create a second expectations file (e.g., `{slug}-perf.expectations.md`) for a focused sub-area*
*  (b) **consolidate** — merge closely related scenarios into broader ones*
*Which?"*

Apply the user's choice before writing. Then, when scenarios are within cap and all pass:

1. Write `{TASK_DIR}/expectations.md` using the format at the bottom of this file
2. Confirm the file path in chat
3. Show a one-line summary: *"Wrote {N} positive + {N} edge scenarios for `{slug}`."*

### Phase 4 — Chain

Ask the user (use AskUserQuestion with three options):
- **Continue to /che-compound-clarify** — invoke `/che-compound-clarify` next on the unified spec
- **Stop here** — user will run later phases manually
- **Quit** — stop the chain entirely

---

## Test rubrics — apply these literally

### E1 — Specific
**Pass**: scenario names a concrete user action AND a concrete observable outcome.
**Fail pushback**: *"E1: '{scenario}' is too vague. Name the action ('reader clicks toggle in header') AND the outcome ('page re-renders in dark theme within 200ms'). Both halves must be concrete."*

### E2 — Observable
**Pass**: success/failure is decidable by a validator (DOM state, pixel comparison, console event, network call, log line). No human judgment needed.
**Fail pushback**: *"E2: '{scenario}' requires human opinion ('feels right', 'looks good'). Restate so a Playwright assertion, visual diff, or log check could decide it."*

### E3 — User-recognizable
**Pass**: the scenario reads like something a user would describe in plain language. No code identifiers, function names, or framework jargon.
**Fail pushback**: *"E3: '{scenario}' uses implementation language ('resolveTheme() returns dark'). Rewrite from the reader's point of view: 'reader sees the blog in dark theme on first visit'."*

**Worked examples for calibration:**

| Phrase | E3 verdict | Why |
|---|---|---|
| "Reader sees the blog in dark theme" | ✓ Pass | Plain language, user POV |
| "Reader using forced-colors mode" | ✓ Pass | OS-level user-facing accessibility feature, not internal code |
| "Reader on iOS 15+ with reduced-motion enabled" | ✓ Pass | Both phrases are user-recognizable system states |
| "Reader in private/incognito browsing" | ✓ Pass | A user mode, not an implementation detail |
| "resolveTheme() returns 'dark'" | ✗ Fail | Code identifier (function name) |
| "ThemeProvider.theme === 'dark'" | ✗ Fail | Code property access |
| "document.documentElement[data-theme] is set to 'dark'" | ✗ Fail | DOM API specifics |
| "localStorage['theme'] survives a reload" | ✗ Fail | Names the storage mechanism (also fails E4) |

The boundary: if a non-technical user could read it aloud and understand what is being claimed, it passes E3. If they would need a developer to explain it, it fails.

### E4 — Doesn't reveal implementation (compartmentation defense)
**Pass**: scenario describes user-observable behavior, NOT the mechanism.
**Fail pushback**: *"E4: '{scenario}' names the mechanism (`localStorage['theme']` is set). The builder could game this directly. Rewrite as the user-observable outcome: 'reader's theme choice persists on the next visit'. The HOW is the builder's design call."*

**E4 is the most important test in this file.** It is the structural defense against reward-hacking. A scenario that mentions cookies, localStorage, specific DOM attributes, specific function names, or specific framework constructs has leaked the answer to the builder. Push back hard.

---

## Pushback style

- Cite the test ID that failed (e.g., "E4 failed").
- Explain WHY in one short sentence.
- Offer a concrete reword from the user's perspective.
- Do not move to the next scenario until the user accepts a fix or provides a valid alternative.

---

## Compound store interaction

If the compound store was loaded:

- **Scan `docs/patterns/`** for relevant test patterns — if a pattern exists for "how we test dark mode" or "how we test feature flags", reference it as a starting template.
- **Scan `docs/corrections/`** for past failure scenarios that became known issues — propose edge scenarios that would catch repeats: *"Correction note from {date} flagged that {pattern} caused {issue}. Worth an edge scenario for it."*
- **Do not contradict** the spec's locked constraints. If an expectation seems to require violating a constraint, flag it: *"This scenario requires X, but C{N} forbids it. Either drop the scenario or revise the constraint via a `/che-compound-specify` re-run (choose update)."*

---

## Tool choices

- **Plain chat** for free-form scenario prose
- **AskUserQuestion** for discrete choices (accept all / edit / write your own; continue/stop/quit)
- **Read** to ingest the unified spec at Phase 0
- **Write** for the final `{TASK_DIR}/expectations.md` file
- **Bash** for the runs timeline — `che state start expectations --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available; use `che state start expectations --feature {slug}` after a chained handoff without a session binding) before the first file write in Phase 3 — and date generation (`date -u +%Y-%m-%d`)

---

## What you do NOT capture in this file

- **Constraints, goal, failure conditions** — those live in the unified spec's intent sections; don't duplicate.
- **Implementation details** — colors, file paths, function names, library choices. If the user offers these, redirect: *"That's a design choice for the builder. The expectation should be the user-observable outcome, not the mechanism."*
- **Task breakdown** — that's `/che-compound-tasks`.

---

## Output format — write exactly this structure

```markdown
---
slug: {kebab-case-slug}
status: active
created: {YYYY-MM-DD}
spec: spec.md
---

# Expectations: {goal sentence from the unified spec}

> **Compartmentation note.** This file is consumed by `/che-compound-intentguard`. It is NOT consumed by `/che-compound-implement`. Do not paste scenarios from this file into builder prompts.

## Positive scenarios
- **E1**: {scenario in user-observable language}
- **E2**: {scenario}
- ...

## Edge / negative scenarios
- **E{N}**: {scenario}
- ...

## Test record
- Total scenarios: {N positive} positive + {N edge} edge = {N total}
- All pass E1–E4

## Compound store refs
- Patterns reached for: {list of pattern slugs or none}
- Corrections applied: {list of correction note slugs or none}
```

---

## After writing the file

1. Show the file path in chat: *"Wrote `{TASK_DIR}/expectations.md`."*
2. Show a one-line summary: *"{N} positive scenarios, {N} edge scenarios, all E1–E4 ✓."*
3. Record the runs timeline completion: `che state done expectations --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available; use `--feature {slug}` when there is no session binding).
4. Use AskUserQuestion to offer the chain handoff (continue to /che-compound-clarify / stop here / quit).

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-clarify` —— 澄清统一 spec 歧义并把结论回写 spec
- **条件**：期望文档已写入任务目录（`{TASK_DIR}/expectations.md`）；chain continue 时携带 specify 选定的 `TASK_DIR`/`SLUG` 直接接续