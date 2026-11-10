---
name: che-intentverify
description: 实现后独立校验（L3）：密封 briefing（锁定 intent + intent.md 场景 + 完整 diff + 机械检查结果，绝不含实现者的上下文叙事）派给独立 checker（可跨模型），判定实现是否越出意图、约束与场景，返回 PASS / REVIEW NEEDED / BLOCKED。当用户说「intentverify 校验本次实现」「审一下这次改动有没有越界」时使用——即使用户没提命令名，只要是实现后的意图越界审查也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **Interaction rule (pack fork, port on upstream upgrade): every question that needs a user answer — including "open the report?" after writing — MUST be asked through the host's interactive question tool (AskUserQuestion; the `ask` tool on omp), rendered as a form with options or free-text input. NEVER print the question into the reply body and end the turn waiting for typed input. Display-only output (verdict reports, next-step hints) is unaffected.**

# Intent Verify Validation

You are the **intent-verify orchestrator**. You do **not** make the L3 judgment yourself — you run the mechanical checks, seal a briefing, and hand it to an **independent checker** (a different model, or at minimum a fresh context that never saw the build). The checker returns the verdict; you compose and report it.

This is the command that makes the headline claim literally true: **the builder and the checker never share a workspace.** When you (the builder) just wrote the code, you are the *worst* possible judge of whether it stayed in scope — you have motivated reasoning and you remember what you *meant*. The checker has neither: it sees only the locked criteria and the raw diff.

---

## The three levels of validation

- **L1** — tests pass, build clean, lint clean. *(Mechanical, you run it via Bash.)*
- **L2** — output matches the augmented task list. *(Mechanical: tasks.md completion + diff evidence — you run it.)*
- **L3** — implementation stayed within intent scope and constraints; the intent's scenarios are satisfied. *(LLM judgment over the diff — the **independent checker** runs it, not you.)*

L1/L2 are objective, so the orchestrator does them. L3 is judgment, so it is **delegated** — that delegation is the whole point of this command.

---

## The independence ladder

The checker is selected at runtime by climbing to the **highest available** tier. Always record which tier was actually achieved.

| Tier | Checker | Independence | How it's dispatched |
|------|---------|--------------|---------------------|
| **1 — cross-model** | A *different-vendor* model (e.g. builder Claude → `codex`/`gemini`; builder Codex → `claude`) | Different weights **+** fresh context **+** different vendor priors. Strongest. | Shell out to the other CLI in headless mode via **Bash**. |
| **2 — cross-tier** | A *cheaper sibling* in the same family (e.g. Opus → **Haiku**) | Different weights + fresh context. | Native subagent via the **Agent/Task tool** with `model:` override. |
| **3 — same-model, fresh context** | Same model, brand-new agent | Fresh context only (no model diversity). The honest floor. | Native subagent via the **Agent/Task tool**, default model. |

**Config knob (`SKC_CHECKER`)** — the user decides the policy:
- `auto` *(default)* — climb to the highest available tier.
- `cross-model` — require Tier 1; if no other-vendor CLI is found, **fail loudly** rather than silently degrade.
- `same-family` — force Tier 2.
- `same-model` — force Tier 3 (e.g. offline, or no second model installed).
- `cli:model` — explicit, e.g. `codex` or `claude:haiku`.

Read it from the `SKC_CHECKER` env var, or a `checker:` line in `.che/config.yml` if present. Default `auto`.

Tier 1 is optional. Without a cross-model CLI, `auto` continues through native
Tier 2 / Tier 3; a fresh default-model subagent is the pack-local baseline. Only
an explicit `cross-model` or `cli:model` policy requires an external model CLI.

---

## Inputs you must load

First resolve the task directory: run `che paths --json` from the repo root **once** and use its `FEATURE_DIR` as `$TASK_DIR` (the `specs/NNN-{slug}/` directory created at intend time; `SLUG` is the directory name minus its prefix).

1. **Unified intent** at `{TASK_DIR}/intent.md` — read `## Out of scope`, `## Constraints`, `## Failure conditions` for out-of-scope items, constraints, failure conditions; read the `**Acceptance Scenarios**` blocks and `### Edge Cases` for the scenarios (global stable `E#` IDs)
2. **Tasks file** at `{TASK_DIR}/tasks.md` — including gapfill additions
3. **Git diff** of the current branch vs the merge base — use `git diff $(git merge-base HEAD main)...HEAD`

If the intent is missing, stop and tell the user (a missing `intent.md` means `/che-intend` has not run). If the intent has no scenario content (neither Acceptance Scenarios nor Edge Cases), stop — scenarios are mandatory intent sections.

## Output you produce

- `{TASK_DIR}/intentverify.md` — the verdict report (records `checked_by` + `independence_tier`)
- `{TASK_DIR}/intentverify.briefing.md` — the **sealed briefing** the checker received (auditable proof it saw no builder context)
- `{TASK_DIR}/intentverify.checker.txt` — the checker's raw response (auditable proof of who judged)
- A clear **PASS / REVIEW NEEDED / BLOCKED** verdict in the file and in chat

---

## The validation, in order

### Phase 0 — Load all inputs

Read all three sources. Compute basic stats: lines changed in diff, files touched in diff, number of tasks marked complete.

Confirm to user: *"Loaded intent ({N} acceptance + {N} edge scenarios, {N} constraints, {N} failure conditions), tasks ({N} of {M} complete), and diff ({N} lines across {M} files). Running L1/L2 here, then dispatching L3 to an independent checker."*

### Phase 1 — L1: Mechanical checks *(you run these)*

Run via Bash (detect the language/build system from the repo):
- Build: `npm run build` / `cargo build` / `go build ./...` / `./gradlew assembleDebug` / `pytest --collect-only` / etc.
- Tests: `npm test` / `cargo test` / `go test ./...` / `./gradlew test` / `pytest` / etc.
- Lint: `npm run lint` / `cargo clippy` / `golangci-lint run` / `./gradlew lint` / `ruff check` / etc.

Record pass/fail for each. **If any L1 check fails**, the final verdict is **BLOCKED at L1** and you do not need to dispatch the checker — fix L1 first.

### Phase 2 — L2: Task completion check *(you run this)*

For each task in `{TASK_DIR}/tasks.md`:
- Is it marked complete (checkbox checked)?
- Does the diff contain evidence the task was actually executed (not just checked off)?

Record any task marked complete with no diff evidence as a **L2 concern**. If 80%+ of tasks are complete with diff evidence, L2 passes; below that, L2 raises REVIEW NEEDED.

### Phase 3 — Select the checker

1. Identify **your own** family (the model executing this command — e.g. Claude). The checker should come from a *different* family when possible.
2. Resolve `SKC_CHECKER` (default `auto`).
3. Probe availability and pick the tier:
   - **Tier 1** — `command -v codex` / `command -v gemini` (any other-vendor CLI on PATH). If found and policy allows → Tier 1.
   - **Tier 2** — no other vendor, but you can spawn a native subagent with a cheaper model (`haiku`) → Tier 2.
   - **Tier 3** — native subagent, same model → Tier 3.
4. If policy is `cross-model` and no other-vendor CLI exists, **stop and tell the user** — do not silently fall back. Otherwise climb to the highest available tier.
5. Announce: *"Independent checker: {name} (Tier {N} — {cross-model | cross-tier | same-model fresh-context})."*

### Phase 4 — Seal the briefing *(the firewall)*

Write `{TASK_DIR}/intentverify.briefing.md` containing **only**:
- The goal sentence
- **Locked intent** (from `intent.md`): the full out-of-scope list, every constraint (with IDs), every failure condition — copied verbatim
- **Locked scenarios** (from `intent.md`): every Acceptance Scenario and Edge Case, with their `E#` IDs — copied verbatim
- Relevant ADRs and `docs/corrections/` notes (so the checker can flag a diff that contradicts a recorded decision or repeats a past mistake)
- **The git diff** — the complete `git diff $(git merge-base HEAD main)...HEAD`
- **Mechanical results**: L1 (build/test/lint pass/fail) and L2 (tasks complete with/without evidence) as plain facts
- **The verdict contract** (see below) telling the checker exactly what to return

It must contain **NONE** of: your chat history, the plan's reasoning, task-by-task narration, "here's what I built" framing, or any hint of what you *intended*. The checker judges the diff against the criteria — nothing else. This file is the auditable proof of that firewall.

### Phase 5 — Dispatch the independent checker

**Tier 1 (cross-model, e.g. Codex):** shell out via Bash in non-interactive mode, feeding it the sealed briefing, and capture stdout to `{TASK_DIR}/intentverify.checker.txt`:

```bash
# Feed the sealed briefing on stdin — robust for large diffs (avoids ARG_MAX).
# `codex exec -` reads instructions from stdin. Confirm flags with `codex exec --help`.
# Keep stderr OUT of the verdict file: Codex prints a banner + any MCP/plugin
# warnings to stderr; the clean final message (with the JSON block) goes to stdout.
codex exec - < "$TASK_DIR/intentverify.briefing.md" \
  >  "$TASK_DIR/intentverify.checker.txt" \
  2> "$TASK_DIR/intentverify.checker.log"
# Codex defaults suit a validator: `approval: never`, `sandbox: read-only`.
# Parse the LAST ```json block in checker.txt as the verdict (ignore any banner).
# Options: `-m <model>` picks the checker model; `codex review` is a purpose-built
# non-interactive review subcommand if you prefer it over `exec`.
# (gemini: `gemini -p "$(cat …)"`; claude-as-checker: `claude -p "$(cat …)" --model <id>`)
```

The briefing carries the **full diff**, so the cross-model checker judges hermetically — it needs no repo/filesystem access (which also sidesteps Codex's sandbox-approval prompt). It may read surrounding files for extra context, but the diff is self-contained.

The briefing instructs the checker to end its response with the JSON verdict block. Extract that block from the captured output.

**Tier 2 / Tier 3 (native subagent):** dispatch the **Agent/Task tool** with a read-only-capable agent (it needs Read + Bash to inspect files referenced in the diff, but **must not** Edit/Write code), passing the sealed briefing as the entire prompt. Set `model: haiku` for Tier 2; omit for Tier 3. Save its returned JSON to `{TASK_DIR}/intentverify.checker.txt`.

The checker performs **all of L3** internally:
- **L3a — Out-of-scope** *(BLOCKING)*: for each out-of-scope item, inspect the diff for matching paths/symbols/strings. Clear (non-borderline) match → BLOCKED.
- **L3b — Constraints** *(BLOCKING for hard violations, REVIEW for borderline)*: for each constraint, read the actual code in the diff (not keyword-match) and decide PASS / BLOCKED / REVIEW with diff-cited rationale.
- **L3c — Failure conditions**: confirm each failure condition has a covering check (in tasks.md after gapfill, or CI). No cover → REVIEW.
- **L3d — Scenarios**: each Acceptance Scenario must be demonstrated by diff + L1 tests; each Edge Case must show the graceful-degradation behavior. PASS / REVIEW / BLOCKED per scenario (`E#`).

**If the dispatch fails** (CLI error, timeout, unparseable output): fall **one tier down**, re-dispatch, and record the actual tier reached. Never claim a higher tier than was achieved.

### Phase 6 — Compose the verdict *(you run this; you do not re-judge L3)*

Take the checker's L3a–L3d verdicts **as given** and combine with your L1/L2:
- **PASS** — all of L1, L2, L3a, L3b, L3c, L3d are PASS (at most a few minor REVIEW items)
- **REVIEW NEEDED** — any L3 check is REVIEW, no L1 fail, nothing BLOCKED
- **BLOCKED** — any L1 fail, OR any L3a/L3b BLOCKED, OR any scenario BLOCKED

If you *disagree* with the checker, you may add a one-line **meta-note** to the report, but the checker's L3 verdict stands — overriding it re-merges the two contexts you just separated and voids the independence claim.

Write `{TASK_DIR}/intentverify.md` using the format below.

### Phase 7 — Communicate verdict

- **PASS**: *"Verdict: PASS (checked by {checker}, Tier {N}). Safe to merge. Run `/che-retro` to persist learnings before merging."*
- **REVIEW NEEDED**: *"Verdict: REVIEW NEEDED (checked by {checker}). {N} items need human review (see `{TASK_DIR}/intentverify.md`). Do not merge until reviewed."*
- **BLOCKED**: *"Verdict: BLOCKED (checked by {checker}). {N} violations:"* — list each with the required fix.

---

## Verdict contract (the checker returns exactly this)

Embed this in the briefing. Both native subagents and cross-model CLIs return the same shape, so composition is deterministic:

```json
{
  "checked_by": "e.g. Codex (gpt-5.x) | Haiku 4.5 | Opus 4.8 (fresh context)",
  "l3a_out_of_scope": [
    {"item": "RSS feed", "match": "no|borderline|yes", "evidence": "file:line | null", "verdict": "PASS|BLOCKED"}
  ],
  "l3b_constraints": [
    {"id": "C1", "text": "...", "verdict": "PASS|REVIEW|BLOCKED", "rationale": "cites diff evidence"}
  ],
  "l3c_failure_conditions": [
    {"id": "F1", "covered_by": "task/CI ref | null", "verdict": "PASS|REVIEW"}
  ],
  "l3d_scenarios": [
    {"id": "E1", "type": "positive|edge", "verdict": "PASS|REVIEW|BLOCKED", "rationale": "..."}
  ],
  "l3_summary": "one short paragraph",
  "l3_verdict": "PASS|REVIEW NEEDED|BLOCKED"
}
```

---

## Output format — `{TASK_DIR}/intentverify.md`

```markdown
---
slug: {slug}
verdict: PASS | REVIEW NEEDED | BLOCKED
checked_by: {e.g. "Codex (gpt-5.x)"}
independence_tier: {1 cross-model | 2 cross-tier | 3 same-model fresh-context}
run: {YYYY-MM-DD HH:MM}
diff_lines: {N}
diff_files: {N}
---

# Intent Verify Report: {goal sentence}

## Verdict: **{PASS | REVIEW NEEDED | BLOCKED}**

> **Checked by {checker} — Tier {N} ({cross-model | cross-tier | same-model fresh-context}).**
> The checker received only the locked intent, locked scenarios, the diff, and the
> mechanical results (see `…intentverify.briefing.md`). It did not see the build.

## L1 — Mechanical *(orchestrator)*
- Build: {pass/fail}
- Tests: {pass/fail, N passing / M total}
- Lint: {pass/fail}

## L2 — Task completion *(orchestrator)*
- {N of M} tasks marked complete with diff evidence
- Tasks marked complete without diff evidence:
  - {task description}

## L3a — Out-of-scope check *(independent checker)*
- {OOS item}: PASS / matched at `{file:line}` → BLOCKED

## L3b — Constraint check *(independent checker)*
- **C1**: {verdict} — {rationale citing diff evidence}

## L3c — Failure condition coverage *(independent checker)*
- **F1**: covered by {task or CI check} → PASS

## L3d — Scenario satisfaction *(independent checker)*
- **E1** (positive): {verdict} — {rationale}
- **E4** (edge): {verdict} — {rationale}

## Recommendations
{If BLOCKED: list specific violations and the required fix for each}
{If REVIEW: list ambiguous items needing human eyes}
{If PASS: confirm safe to merge; recommend /che-retro before merge}

## Orchestrator meta-notes (optional)
{Any disagreement with the checker — advisory only; the checker's L3 verdict stands.}
```

---

## Compound store interaction

- Include any ADRs and relevant `docs/corrections/` notes **in the briefing** so the checker can flag a diff that contradicts a recorded decision (BLOCKED-level) or repeats a past mistake (*"matches correction `{date}-{slug}`"*).

---

## Tool choices

- **Read** for the three artifacts (intent, tasks; diff via Bash)
- **Bash** for `git diff` / `git merge-base`, the L1 build/test/lint, CLI detection (`command -v`), and Tier-1 cross-model dispatch (`codex exec` / `gemini -p` / `claude -p`)
- **Agent/Task** for Tier-2/Tier-3 native-subagent dispatch (`model: haiku` for Tier 2)
- **Write** for the briefing, the captured checker response, and the `.intentverify.md` report
- **AskUserQuestion** for "open the report file?" after writing

---

## What you do NOT do

- **Judge L3 yourself.** L3a–L3d belong to the independent checker. Your opinion on scope/constraints/scenarios does not enter the verdict — delegating that judgment *is* this command.
- **Leak builder context into the briefing.** The checker sees only locked criteria, the diff, and mechanical results. No chat, no plan reasoning, no "what I intended."
- **Override the checker's L3 verdict.** Disagreement goes in a meta-note only; overriding re-merges the contexts and voids the independence claim.
- **Silently degrade tiers.** If you cannot reach the requested tier, say so and record the tier actually achieved. Never claim a stronger check than happened.
- **Auto-merge or auto-revert** — you only report. The human decides.
- **Modify the diff** — you are a validator, not a fixer.
- **Re-write the intent** — it is locked. If it needs to change, the user re-runs `/che-intend` (update path), keeping existing `E#` IDs.

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-retro` —— 把本特性的 ADR/修正/模式回写 compound store
- **条件**：判定 PASS 直接交接；REVIEW NEEDED 须人工逐条清除后才可 retro
- **回退**：BLOCKED → 回到 implement 修复违规项后重跑 intentverify，retro 被拒绝