---
name: che-compound-planverify
description: plan 独立校验（L3）：实现前由独立 checker（可跨模型）对照统一 spec 锁定的范围/约束/失败条件 + 场景（Acceptance/Edge `E#`）审查 plan 与补全后的 tasks；机械层先跑确定性 ADR 查询（共用 che-adr-check 的 check.sh，产出 planverify.adr.json 与报告 hash），再密封 briefing（含 adrkit 返回的 governing ADR 全文）派发（绝不含规划者的上下文），返回 PASS / REPLAN_ALLOWED / BLOCKED_DRIFT / BLOCKED_ADR。当用户说「验证 plan」「planverify」「实现前审一遍计划」时使用——即使用户没提命令名，只要是实现前的计划独立校验也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Plan Verify

You are the **planverify orchestrator**. You judge the *proposed plan* before any
code is written — the cheaper, earlier mirror of `intentguard`. You do **not** make
the judgment yourself: you run surface analysis and the deterministic ADR query,
seal a briefing, and hand it to an **independent checker** (a different model, or at
minimum a fresh context that never saw the planning). The checker returns the
verdict; you compose and report it.

```
planverify:  is the proposed PLAN drifting, before files are edited?
intentguard: did the actual git DIFF drift, after implementation?
```

The planner is the *worst* judge of its own plan — a plan is pure reasoning, the
planner's own justification for its choices. Self-judging asks "is my argument
good?" of the entity that made the argument. The checker has only the locked
criteria, the plan, the surface facts, and the governing ADR corpus.

---

## Position in the loop

Run **after `gapfill`, before `implement`**. It must run after gapfill so it judges
the **complete obligation set** (constraints + failure conditions + OOS regressions
+ edge cases), not the incomplete generated task list — and so the ADR mechanical
layer checks the *final* task list's surface.

Before `/che-compound-implement`, run `/che-compound-planverify-gate` (it executes
`che planverify-gate`). Two independent gates are evaluated:

- **`adr_gate`** (`SKC_ADR_GATE` env, else `adr_gate:` in `.che/config.yml`,
  default **`block`**): the report must exist, carry `adr_status: clean`, and its
  recorded spec/plan/tasks SHA-256 hashes must match the artifacts on disk. A stale
  or pre-ADR report is rejected — never read as clean.
- **`planverify_gate`** (`SKC_PLANVERIFY_GATE` env, else `planverify_gate:`,
  default `off`): additionally refuses `BLOCKED_DRIFT` and `BLOCKED_ADR` verdicts.

Both `off` → no blocking. Invalid values fail closed (exit 1).

---

## The independence ladder

Identical to intentguard. Climb to the highest available tier; always record the tier reached.

| Tier | Checker | Independence | Dispatch |
|------|---------|--------------|----------|
| **1 — cross-model** | Different-vendor model (`codex`/`gemini`; or `claude` if you are Codex) | Different weights + fresh context + different vendor priors | Shell out via Bash, headless |
| **2 — cross-tier** | Cheaper sibling (Opus → Haiku) | Different weights + fresh context | Native subagent (Agent/Task) with `model: haiku` |
| **3 — same-model, fresh context** | Same model, new agent | Fresh context only | Native subagent (Agent/Task), default model |

**Config (`SKC_CHECKER`, default `auto`):** `auto` climbs to highest; `cross-model`
requires Tier 1 or fails loudly; `same-family` forces Tier 2; `same-model` forces
Tier 3; `cli:model` is explicit. Read from `SKC_CHECKER` env, else a `checker:` line
in `.che/config.yml`.

Tier 1 is optional. Without a cross-model CLI, `auto` continues through native
Tier 2 / Tier 3; a fresh default-model subagent is the pack-local baseline. Only
an explicit `cross-model` or `cli:model` policy requires an external model CLI.

---

## Inputs you must load

(`{task_dir}` = the task directory `che paths` reports as `FEATURE_DIR` — run `che paths --session "$CHE_SESSION_ID"` once, bare when no session id is available.)

1. **Unified spec** `{task_dir}/spec.md` — read `## In scope`, `## Out of scope`, `## Constraints`, `## Failure conditions`; read the `**Acceptance Scenarios**` blocks and `### Edge Cases` for the scenarios (global stable `E#` IDs)
2. **Plan** `{task_dir}/plan.md` — the proposed plan, including any `requested_surface` blocks
3. **Tasks** `{task_dir}/tasks.md` — the gapfilled task list

If the spec is missing, stop and tell the user (a missing `spec.md` means `/che-compound-specify` has not run). If the spec has no scenario content (neither Acceptance Scenarios nor Edge Cases), stop — scenarios are mandatory spec sections.

## Outputs you produce

- `{task_dir}/planverify.md` — verdict report (records `checked_by`, `independence_tier`, `gate_mode`, ADR mechanical fields, spec/plan/tasks SHA-256)
- `{task_dir}/planverify.adr.json` — the adrkit raw facts: command, exit code, raw stdout/stderr (audit record of the mechanical layer)
- `{task_dir}/planverify.briefing.md` — the sealed briefing (auditable proof of the firewall)
- `{task_dir}/planverify.checker.txt` — the checker's raw response
- A clear **PASS / REPLAN_ALLOWED / BLOCKED_DRIFT / BLOCKED_ADR** verdict in the file and in chat

---

## The verification, in order

### Phase 0 — Load all inputs

Read all three sources. Compute: number of constraints, failure conditions, OOS items; number of acceptance + edge scenarios (`E#`); number of tasks.

Confirm: *"Loaded spec ({Nc} constraints, {Nf} failure conditions, {No} OOS, {Na}+{Ne} scenarios), plan, and {Nt} tasks. Running surface analysis and the ADR mechanical layer here, then dispatching plan judgment to an independent checker."*

### Phase 1a — Surface analysis *(you run this — the mechanical layer)*

There is nothing built, so there are no L1/L2 mechanical checks. Instead:

1. Extract the **proposed surface** — every file/path the plan intends to touch.
   Gather from: plan.md prose, every `requested_surface:` block, and file paths
   referenced in tasks.md.
2. Read the spec's declared **in-scope** and **out-of-scope** lists (`## In scope` / `## Out of scope`).
3. For each proposed path, classify: `in-scope` / `out-of-scope` / `undeclared`.
4. A proposed path that is out-of-scope or undeclared is a **drift candidate**.
   Note for each whether a matching `requested_surface` block exists (`requested`)
   or not (`unrequested`).

Record these as **plain facts** for the briefing — do NOT judge them yourself.
Keep the deduplicated repo-relative path list — Phase 1b passes it to adrkit.

### Phase 1b — Deterministic ADR query *(the mechanical layer, no judgment)*

Invoke the shared script — the same one `/che-adr-check` uses (no copy, no second
adrkit invocation):

```bash
.agents/skills/che-adr-check/scripts/check.sh <proposed-surface-paths...>
# 全局安装使用 ~/.agents/skills/che-adr-check/scripts/check.sh
```

Requirements:

- Pass the Phase 1a surface paths, deduplicated and repo-relative.
- Save the raw output and the exit code to `{task_dir}/planverify.adr.json`
  (JSON: `{"script", "args", "exit_code", "stdout", "stderr", "ran_at"}`).
- The `==> adrkit:check` section and its JSON **must** be present and parseable.
- When `ADRKIT_SNAPSHOT` is configured, the `==> adrkit:evaluate` report is also
  present — record it; when not configured, record `adr_evaluator: not_configured`
  explicitly. Never claim a deterministic evaluator pass that did not run.
- **Failure is not a verdict.** Exit code 2, an unreachable corpus, a missing or
  unparseable `adrkit:check` JSON → **stop**: write no verdict, do not seal a
  briefing, do not write `planverify.md`. Report the tool/corpus error and end.
  A mechanical failure must never be interpreted as PASS.

### Phase 1c — Classify the mechanical results *(facts only)*

| adrkit result | Handling |
|---|---|
| corpus error findings | `BLOCKED_ADR` — the mechanical layer is broken, not clean |
| evaluator returned the proposal | `BLOCKED_ADR` — awaits ADR/ARB disposition |
| evaluator escalation | `BLOCKED_ADR` — awaits governance review |
| evaluator warn / info / inert | recorded in the report; not blocking on its own |
| snapshot not configured | report `adr_evaluator: not_configured`; never claim a deterministic evaluator pass |
| governing ADRs returned normally | sealed verbatim into the briefing as facts for the checker's P3e |

### Phase 2 — Select the checker

Identical to intentguard's checker selection: identify your own family, resolve
`SKC_CHECKER`, probe availability (`command -v codex` / `command -v gemini` for
Tier 1; native subagent with `model: haiku` for Tier 2; default subagent for Tier 3).
If policy is `cross-model` and no other-vendor CLI exists, stop and tell the user.
Announce: *"Independent checker: {name} (Tier {N} — {cross-model | cross-tier | same-model fresh-context})."*

### Phase 3 — Seal the briefing *(the firewall)*

Write `{task_dir}/planverify.briefing.md` containing **only**:
- The goal sentence
- **Locked intent** (from the unified spec): full out-of-scope list, every constraint (with IDs), every failure condition — verbatim
- **Locked scenarios** (from the unified spec): every Acceptance Scenario and Edge Case, with their `E#` IDs — verbatim
- **The plan**: full `{task_dir}/plan.md`
- **The tasks**: full `{task_dir}/tasks.md`
- **Surface analysis**: the drift-candidate list from Phase 1a (path, classification, requested/unrequested) as plain facts
- **ADR facts** (from Phase 1b/1c — sealed, not selected): the full text of every
  governing ADR adrkit returned for the proposed surface; the `CheckOutcome` with
  corpus findings; the evaluator report, or the explicit `not_configured` state
- **The verdict contract** (below)

The orchestrator does **not** pick "relevant ADRs" — adrkit's query against the
proposed surface is the only ADR source. The briefing must contain **NONE** of:
your chat history, the planner's reasoning narration, "here's what I plan to do"
framing, or any hint of what you *intended*.

### Phase 4 — Dispatch the independent checker

**Tier 1 (cross-model):** shell out via Bash, feeding the sealed briefing on stdin,
capturing stdout to the checker file (keep stderr separate):

```bash
codex exec - < {task_dir}/planverify.briefing.md \
  >  {task_dir}/planverify.checker.txt \
  2> {task_dir}/planverify.checker.log
# gemini: gemini -p "$(cat {task_dir}/planverify.briefing.md)"
# claude-as-checker: claude -p "$(cat …briefing.md)" --model <id>
# Parse the LAST ```json block in checker.txt as the verdict.
```

**Tier 2 / Tier 3 (native subagent):** dispatch the Agent/Task tool with a
read-only-capable agent (Read + Bash to inspect referenced files; MUST NOT
Edit/Write), passing the sealed briefing as the entire prompt. `model: haiku` for
Tier 2; omit for Tier 3. Save returned JSON to the checker file.

The checker performs all judgment internally:
- **P3a — Surface drift** *(blocking)*: for each drift candidate, is the path truly out-of-scope? Clear out-of-scope match → BLOCKED_DRIFT.
- **P3b — Drift requests** *(the REPLAN_ALLOWED path)*: for each `requested_surface` block, is it necessary, bounded, and inside intent? Apply the decision table. → REPLAN_ALLOWED | BLOCKED_DRIFT.
- **P3c — Obligation coverage**: does plan + tasks plan to satisfy every constraint, every failure condition, every scenario (Acceptance `E#` and Edge `E#`), and every out-of-scope regression obligation? Missing coverage → REPLAN_ALLOWED (grow inward, not drift outward).
- **P3d — Constraint pre-check**: does the planned approach already contradict a constraint? → BLOCKED_DRIFT.
- **P3e — ADR conformance** *(blocking)*: for each governing ADR in the briefing,
  does plan + tasks conform to it, depart from it, or not apply? Cite plan/tasks
  evidence per ADR. Any **departure** → BLOCKED_ADR. `not_applicable` requires
  evidence that the ADR's scope does not cover this plan's surface.

**If dispatch fails** (CLI error, timeout, unparseable): fall one tier down,
re-dispatch, record the actual tier. Never claim a higher tier than achieved.

### Phase 5 — Compose the verdict *(you run this; you do not re-judge)*

Take the checker's P3a–P3e **as given**. Precedence:

```text
BLOCKED_ADR > BLOCKED_DRIFT > REPLAN_ALLOWED > PASS
```

- **BLOCKED_ADR** — any P3e departure, or a blocking Phase 1c mechanical result
  (corpus errors, evaluator proposal/escalation)
- **BLOCKED_DRIFT** — any P3a BLOCKED_DRIFT, any P3b BLOCKED_DRIFT, or any P3d contradiction
- **REPLAN_ALLOWED** — any P3b REPLAN_ALLOWED or any P3c coverage gap, nothing above
- **PASS** — none of the above

Departure disposition (for the report's recommendations and chat):
- A departure is **unhandled** until the plan is fixed *or* a superseding ADR is
  drafted **and ratified**. A `draft` ADR alone is not clearance.
- Plan should change → fix the plan, re-run `/che-compound-plan` (regenerates
  tasks.md), then re-run gapfill and planverify.
- The decision itself should change → `/che-adr-draft` a superseding ADR, a human
  runs `adr accept`, then re-run planverify.

If you disagree with the checker, add a one-line meta-note — the checker's verdict
stands. Write `{task_dir}/planverify.md` using the format below; compute the
SHA-256 of spec/plan/tasks (`shasum -a 256`) into the frontmatter.

### Phase 6 — Communicate verdict

Read both gate modes (`SKC_ADR_GATE` / `adr_gate:` default `block`; `SKC_PLANVERIFY_GATE` /
`planverify_gate:` default `off`) and record them in the report frontmatter.

- **PASS**: *"Verdict: PASS (checked by {checker}, Tier {N}). Plan is in scope, ADR-conformant, and complete. Safe to run `/che-compound-implement`."*
- **REPLAN_ALLOWED**: *"Verdict: REPLAN_ALLOWED (checked by {checker}). {N} items to address (see `{task_dir}/planverify.md`). Fix via `/che-compound-plan` — re-running it regenerates plan and tasks together, and manual plan edits also need a re-run so `tasks.md` stays in sync — then re-run `/che-compound-planverify`."* (planverify does not patch the plan for you.)
- **BLOCKED_DRIFT**: *"Verdict: BLOCKED_DRIFT (checked by {checker}). {N} unjustified expansions:"* — list each with the bounded alternative. Replan before implementing.
- **BLOCKED_ADR**: *"Verdict: BLOCKED_ADR (checked by {checker}). {N} departures from governing ADRs:"* — list each with evidence. Fix the plan, or draft a superseding ADR via `/che-adr-draft` and have it ratified (`adr accept`), then re-run planverify. With the default `adr_gate: block`, `/che-compound-implement` is refused until a clean, hash-fresh report exists.

---

## Drift decision table (the checker applies this)

| Planner behavior | Example | Verdict |
|---|---|---|
| No drift | Uses planned in-scope files | PASS |
| Small useful drift | Adds a sibling file with the same bug | REPLAN_ALLOWED |
| Heavy bad drift | Adds auth/schema/nav/analytics | BLOCKED_DRIFT |

`risk_class` of `auth-security` / `schema` / `migration` raises the bar — those
default toward BLOCKED_DRIFT unless `bounded_by` ties tightly to a named intent item.
A drift candidate with no matching `requested_surface` block is *unrequested* — judge
it more strictly than a requested one.

## The drift-request contract (the planner emits this in plan.md)

```yaml
requested_surface:
  files: [path/a, path/b]
  reason: concrete causal reason
  risk_class: behavioral | public-contract | schema | auth-security | migration | unknown
  bounded_by: <intent item / task id / constraint id>
```

---

## Verdict contract (the checker returns exactly this)

```json
{
  "checked_by": "e.g. Codex (gpt-5.x) | Haiku 4.5 | Opus 4.8 (fresh context)",
  "p3a_surface_drift": [
    {"path": "src/auth/mw.ts", "classification": "out-of-scope|undeclared", "requested": false, "verdict": "PASS|BLOCKED_DRIFT"}
  ],
  "p3b_drift_requests": [
    {"files": ["..."], "risk_class": "behavioral", "bounded_by": "intent: fix save flow", "verdict": "REPLAN_ALLOWED|BLOCKED_DRIFT", "rationale": "..."}
  ],
  "p3c_obligation_coverage": [
    {"id": "C1", "planned_by": "task ref | null", "verdict": "PASS|REPLAN_ALLOWED"},
    {"id": "E1", "type": "acceptance|edge", "planned_by": "task ref | null", "verdict": "PASS|REPLAN_ALLOWED"}
  ],
  "p3d_constraint_precheck": [
    {"id": "C2", "verdict": "PASS|BLOCKED_DRIFT", "rationale": "..."}
  ],
  "p3e_adr_conformance": [
    {
      "adr": "ADR-0007",
      "verdict": "conforms | departure | not_applicable",
      "evidence": "plan.md section / task id",
      "rationale": "..."
    }
  ],
  "summary": "one short paragraph",
  "verdict": "PASS|REPLAN_ALLOWED|BLOCKED_DRIFT|BLOCKED_ADR"
}
```

---

## Output format — `{task_dir}/planverify.md`

```markdown
---
slug: {slug}
verdict: PASS | REPLAN_ALLOWED | BLOCKED_DRIFT | BLOCKED_ADR
checked_by: {e.g. "Codex (gpt-5.x)"}
independence_tier: {1 cross-model | 2 cross-tier | 3 same-model fresh-context}
gate_mode: {off | block}
adr_gate: {off | block}
run: {YYYY-MM-DD HH:MM}
surface_files: {N}
drift_candidates: {N}
adr_status: clean | blocked
adr_governed: {N}
adr_departures: {N}
adr_corpus_errors: {N}
adr_evaluator: not_configured | clean | escalation | returned
spec_sha256: {sha256 of spec.md at run time}
plan_sha256: {sha256 of plan.md at run time}
tasks_sha256: {sha256 of tasks.md at run time}
---

# Plan Verify Report: {goal sentence}

## Verdict: **{PASS | REPLAN_ALLOWED | BLOCKED_DRIFT | BLOCKED_ADR}**

> **Checked by {checker} — Tier {N} ({cross-model | cross-tier | same-model fresh-context}).**
> The checker received only the locked intent, locked scenarios, the plan, the
> tasks, the surface analysis, and the adrkit governing-ADR facts (see
> `…planverify.briefing.md`). It did not see the planning.

## ADR Mechanical Layer *(orchestrator, deterministic)*
- adrkit: {version}; corpus: {corpus dir}; check.sh exit code: {0|1}
- Governing ADRs: {N} (`planverify.adr.json` has the raw audit record)
- Corpus errors: {N} · Evaluator: {not_configured | outcome}

## Surface Analysis *(orchestrator)*
- Proposed surface: {N} files
- Drift candidates:
  - `{path}`: {out-of-scope | undeclared} — {requested | unrequested}

## P3a — Surface drift *(independent checker)*
- `{path}`: PASS / BLOCKED_DRIFT

## P3b — Drift requests *(independent checker)*
- `{files}` (risk: {risk_class}, bounded_by {ref}): {verdict} — {rationale}

## P3c — Obligation coverage *(independent checker)*
- **C1**: planned by {task ref} → PASS / (none) → REPLAN_ALLOWED
- **E1** (acceptance): planned by {task ref} → PASS / (none) → REPLAN_ALLOWED

## P3d — Constraint pre-check *(independent checker)*
- **C2**: {verdict} — {rationale}

## P3e — ADR conformance *(independent checker)*
- **ADR-0007**: conforms / departure / not_applicable — {evidence} — {rationale}

## Recommendations
{BLOCKED_ADR: each departure + the fix: revise the plan (re-run /che-compound-plan,
then gapfill and planverify) or supersede the ADR (/che-adr-draft + human `adr accept`,
then re-run planverify) — a draft ADR alone does not clear the gate}
{BLOCKED_DRIFT: each unjustified expansion + the bounded alternative}
{REPLAN_ALLOWED: each item to address before re-running}
{PASS: confirm safe to /che-compound-implement}

## Orchestrator meta-notes (optional)
{Any disagreement — advisory only; the checker's verdict stands.}
```

**Report freshness**: the frontmatter hashes are load-bearing. The gate refuses a
report whose hashes do not match the current spec/plan/tasks, and treats a report
without `adr_status` as requiring a re-run (never as clean). Any edit to spec, plan,
or tasks after the run invalidates the report — re-run planverify.

---

## Tool choices
- **Read** for the three artifacts (spec, plan, tasks), the governing ADRs adrkit reports, and the check output
- **Bash** for CLI detection (`command -v`), the Phase 1b shared script, SHA-256 (`shasum -a 256`), Tier-1 dispatch, reading config
- **Agent/Task** for Tier-2/Tier-3 native subagent dispatch (`model: haiku` for Tier 2)
- **Write** for the briefing, the adrkit audit JSON, captured checker response, and the `planverify.md` report

## What you do NOT do
- **Judge the plan yourself.** P3a–P3e belong to the independent checker; Phase 1b/1c only collects deterministic facts.
- **Pick "relevant ADRs" yourself.** The proposed surface goes to adrkit; whatever it returns is sealed into the briefing.
- **Leak planner context into the briefing.** Only locked criteria + plan + tasks + surface facts + ADR facts.
- **Override the checker's verdict.** Disagreement goes in a meta-note only.
- **Auto-patch the plan.** You report; the user replans. Validator, not fixer.
- **Interpret tool failure as pass.** Exit 2, unreachable corpus, missing/unparseable JSON → stop, no verdict.
- **Silently degrade tiers.** Record the tier actually achieved.
- **Re-write the spec's locked sections.** They are locked — a locked-intent change means re-running `/che-compound-specify` (update path), keeping existing `E#` IDs.

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-implement`
- **条件**：判定 PASS 才放行 implement；实现前另需过 `/che-compound-planverify-gate`——`adr_gate` 默认 block（报告缺失、`adr_status` 非 clean、hash 不匹配均拒绝），`planverify_gate` block 时再拒 BLOCKED_DRIFT / BLOCKED_ADR
- **回退**：BLOCKED_ADR → 修 plan 后重跑 `/che-compound-plan` + gapfill + planverify，或 `/che-adr-draft` 起草 superseding ADR 经人工 `adr accept` 后重跑 planverify（draft 状态不放行）；REPLAN_ALLOWED → 修订 plan 后重跑 planverify（plan 有改动就重跑 `/che-compound-plan` 让 tasks.md 同步再生，不校验陈旧的 plan/tasks 组合）；BLOCKED_DRIFT → 回到 plan 修正
