---
name: che-clarify
description: 意图澄清问答（产品澄清独占）：最多提 5 个高针对性的澄清问题，找出当前特性 intent 定义不足的区域，把结论直接合并进 intent.md 对应章节，并把 `[NEEDS CLARIFICATION]` 产品标记清零（intend 最多留 3 个明确标记，clarify 必须以零标记完成）。在 intend 之后、plan 之前使用。当用户运行或提到 /che-clarify，或说「澄清规格」「补全需求细节」「解决需求歧义」时使用——即使用户没提命令名，只要是对 intent 的澄清回写也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **Interaction rule (pack fork, port on upstream upgrade): every question that needs a user answer — clarifying questions, option choices, confirmations, gate questions, chain handoffs — MUST be asked through the host's interactive question tool (AskUserQuestion; the `ask` tool on omp), rendered as a form with options or free-text input. NEVER print the question and options into the reply body and end the turn waiting for typed input. Display-only output (reports, explanations, next-step hints) is unaffected.**

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

Goal: Detect and reduce ambiguity or missing decision points in the active feature intent and record the clarifications directly in the intent file.

Note: This clarification workflow is expected to run (and be completed) BEFORE invoking `/che-plan`. If the user explicitly states they are skipping clarification (e.g., exploratory spike), you may proceed, but must warn that downstream rework risk increases.

Execution steps:

1. Run `che paths --json` from repo root **once** (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`), and `che knowledge paths --json` **once** to resolve the knowledge location. Parse minimal JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - `CONTEXT_FILE` / `GLOSSARY_FILE` (knowledge resolution; if the subcommand is unavailable, stop and recommend upgrading `@newchiwan/che`)
   - (Optionally capture `IMPL_PLAN`, `TASKS` for future chained flows.)
   - If JSON parsing fails, abort and instruct user to re-run `/che-intend` or verify feature branch environment.
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
   - Record the runs timeline start: `che state start clarify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available).

2. **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints.

3. Load the current intent file. Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing. Produce an internal coverage map used for prioritization (do not output raw map unless no questions will be asked).

   Functional Scope & Behavior:
   - Core user goals & success criteria
   - Explicit out-of-scope declarations
   - User roles / personas differentiation

   Domain & Data Model:
   - Entities, attributes, relationships
   - Identity & uniqueness rules
   - Lifecycle/state transitions
   - Data volume / scale assumptions

   Interaction & UX Flow:
   - Critical user journeys / sequences
   - Error/empty/loading states
   - Accessibility or localization notes

   Non-Functional Quality Attributes:
   - Performance (latency, throughput targets)
   - Scalability (horizontal/vertical, limits)
   - Reliability & availability (uptime, recovery expectations)
   - Observability (logging, metrics, tracing signals)
   - Security & privacy (authN/Z, data protection, threat assumptions)
   - Compliance / regulatory constraints (if any)

   Integration & External Dependencies:
   - External services/APIs and failure modes
   - Data import/export formats
   - Protocol/versioning assumptions

   Edge Cases & Failure Handling:
   - Negative scenarios
   - Rate limiting / throttling
   - Conflict resolution (e.g., concurrent edits)

   Constraints & Tradeoffs:
   - Technical constraints (language, storage, hosting)
   - Explicit tradeoffs or rejected alternatives

   Terminology & Consistency:
   - Canonical glossary terms
   - Avoided synonyms / deprecated terms

   Completion Signals:
   - Acceptance criteria testability
   - Measurable Definition of Done style indicators

   Misc / Placeholders:
   - TODO markers / unresolved decisions
   - Ambiguous adjectives ("robust", "intuitive") lacking quantification

   For each category with Partial or Missing status, add a candidate question opportunity unless:
   - Clarification would not materially change implementation or validation strategy
   - The item is specifically about implementation method, tech-stack comparison, or task breakdown (note internally)

4. Generate (internally) a prioritized queue of candidate clarification questions (maximum 5). Do NOT output them all at once. Apply these constraints:
    - Maximum of 5 total questions across the whole session.
    - Each question must be answerable with EITHER:
       - A short multiple‑choice selection (2–5 distinct, mutually exclusive options), OR
       - A one-word / short‑phrase answer (explicitly constrain: "Answer in <=5 words").
    - Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance validation.
    - Ensure category coverage balance: attempt to cover the highest impact unresolved categories first; avoid asking two low-impact questions when a single high-impact area (e.g., security posture) is unresolved.
    - Exclude questions already answered, trivial stylistic preferences, or plan-level execution details (unless blocking correctness).
    - Favor clarifications that reduce downstream rework risk or prevent misaligned acceptance tests.
    - If more than 5 categories remain unresolved, select the top 5 by (Impact * Uncertainty) heuristic.

5. Sequential questioning loop (interactive):
    - Ask EXACTLY ONE question at a time — each question goes out through the interactive question tool (AskUserQuestion; the `ask` tool on omp) as ONE form. NEVER print the question and options as chat text and end the turn waiting for a typed reply.
    - **Question writing quality (applies to every question, MC or short-answer):**
       - Lead with a full interrogative that ends with `?`. The question text before the `?` must make sense on its own.
       - NEVER use a topic label, section heading, or requirement id as the question itself. For example, `Acceptance device/runtime matrix (FR-023)` is INVALID — it is a label, not a question.
       - The only permitted suffix after the `?` is an optional parenthesized requirement/question id. Exact format: `<interrogative>?` or `<interrogative>? (FR-023)`. Never put the id before the `?`, and never use the id (alone or with a topic label) as the whole prompt.
       - Include one plain-language "Why it matters" sentence (the stake for acceptance or shipping) in the form body before the recommendation/options.
       - Use everyday wording; introduce jargon only if defined in the same sentence. Self-check: a reader unfamiliar with this workflow must be able to answer from the question text alone. Terse is fine; cryptic labels are not.
    - For multiple‑choice questions:
       - **Analyze all options** and determine the **most suitable option** based on:
          - Best practices for the project type
          - Common patterns in similar implementations
          - Risk reduction (security, performance, maintainability)
          - Alignment with any explicit project goals or constraints visible in the intent
       - Build ONE form with a radio group: all options (2–5 distinct, mutually exclusive), each as `<label><input type="radio">` with a one-line description; the recommended option goes FIRST and is preselected (`checked`).
       - Present your **recommended option prominently** with clear reasoning in the form body (1-2 sentences explaining why this is the best choice), formatted as: `**Recommended:** Option [X] - <reasoning>`
       - The tool's built-in free-text ("Other") input covers a different short answer (<=5 words) — NEVER add your own "Other"/"Short" option to the group.
    - For short‑answer style (no meaningful discrete options):
       - Provide your **suggested answer** based on best practices and context in the form body.
       - Format as: `**Suggested:** <your proposed answer> - <brief reasoning>`
       - Build ONE form with a single text input pre-filled with the suggested answer as its default value (answer constrained to <=5 words).
    - After the user answers:
       - If the user accepts (keeps the preselected option, submits the pre-filled suggestion, or replies "yes" / "recommended" / "suggested"), use your previously stated recommendation/suggestion as the answer.
       - Otherwise, validate the answer maps to one option or fits the <=5 word constraint.
       - If ambiguous, ask for a quick disambiguation (count still belongs to same question; do not advance).
       - Once satisfactory, record it in working memory (do not yet write to disk) and move to the next queued question.
    - Stop asking further questions when:
       - All critical ambiguities resolved early (remaining queued items become unnecessary), OR
       - User signals completion ("done", "good", "no more"), OR
       - You reach 5 asked questions.
    - Never reveal future queued questions in advance.
    - If no valid questions exist at start, immediately report no critical ambiguities.

6. Integration after EACH accepted answer (incremental update approach):
    - Maintain in-memory representation of the intent (loaded once at start) plus the raw file contents.
    - Do NOT write a `## Clarifications` Q&A history — the accepted answer is recorded only by integrating it into the affected intent sections.
    - Immediately apply the clarification to the most appropriate section(s):
       - Functional ambiguity → Update or add a bullet in Functional Requirements.
       - User interaction / actor distinction → Update User Stories with the clarified role, constraint, or scenario.
       - **Acceptance Scenarios / Edge Cases**: if the answer changes or overturns a scenario, REPLACE that scenario's text in place, keeping its existing `E#` ID — never append a contradictory alternative and never renumber or reuse IDs. Only a genuinely NEW scenario gets the next unused `E#`. After any scenario change, re-run the scenario quality tests `SQ1–SQ4` (defined in `/che-intend`) and fix failures before saving.
       - Data shape / entities → Update Key Entities (add fields, types, relationships) preserving ordering; note added constraints succinctly.
       - Non-functional constraint → Add/modify measurable criteria in Success Criteria > Measurable Outcomes (convert vague adjective to metric or explicit target).
       - Edge case / negative flow → Add or replace an entry under Edge Cases (new entries take the next unused `E#`).
       - Terminology conflict → Normalize term across intent; retain original only if necessary by adding `(formerly referred to as "X")` once. New domain terms are registered into the matching 域节 of the resolved `CONTEXT_FILE`; `docs/GLOSSARY.md`, when present, is a read-only legacy snapshot and must not be modified.
    - If the clarification invalidates an earlier ambiguous statement, replace that statement instead of duplicating; leave no obsolete contradictory text.
    - Save the intent file AFTER each integration to minimize risk of context loss (atomic overwrite).
    - Preserve formatting: do not reorder unrelated sections; keep heading hierarchy intact.
    - Keep each inserted clarification minimal and testable (avoid narrative drift).

7. Validation (performed after EACH write plus final pass):
   - Updated sections contain no lingering vague placeholders the new answer was meant to resolve.
   - No contradictory earlier statement remains (scan for now-invalid alternative choices removed).
   - Scenario IDs: every pre-existing `E#` still present (or explicitly replaced in place), sequence unchanged, no duplicates; changed scenarios re-pass `SQ1–SQ4`.
   - Markdown structure valid; no new top-level sections added beyond integration into existing ones (no `## Clarifications`).
   - Terminology consistency: same canonical term used across all updated sections.

8. Write the updated intent back to `FEATURE_SPEC`.

9. **Final marker sweep**: confirm zero `[NEEDS CLARIFICATION]` markers remain in the intent — clarify is the only writer allowed to resolve them, and it must end with none (intend may leave at most 3 explicit markers; they are resolved here).

Behavior rules:

- If no meaningful ambiguities found (or all potential questions would be low-impact), respond: "No critical ambiguities detected worth formal clarification." and suggest proceeding.
- If intent file missing, instruct user to run `/che-intend` first (do not create a new intent here).
- `[NEEDS CLARIFICATION]` markers are clarify's exclusive domain: always sweep the intent for them (even when no new questions arise) and resolve or explicitly settle each one — completion with zero markers is mandatory.
- Never exceed 5 total asked questions (clarification retries for a single question do not count as new questions).
- Avoid speculative tech stack questions unless the absence blocks functional clarity.
- Respect user early termination signals ("stop", "done", "proceed").
- If no questions asked due to full coverage, output a compact coverage summary (all categories Clear) then suggest advancing.
- If quota reached with unresolved high-impact categories remaining, explicitly flag them under Deferred with rationale.

Context for prioritization: $ARGUMENTS

## Completion Report

Record the runs timeline completion: `che state done clarify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). Then report completion (after questioning loop ends or early termination):
- Number of questions asked & answered.
- Path to updated intent.
- Sections touched (list names).
- Scenario changes: replaced in place (with their kept `E#` IDs) vs newly added (`E#`), and confirmation that changed scenarios re-pass `SQ1–SQ4`.
- Remaining `[NEEDS CLARIFICATION]` markers: must be zero.
- Coverage summary table listing each taxonomy category with Status: Resolved (was Partial/Missing and addressed), Deferred (exceeds question quota, or remaining item is specifically implementation method, tech-stack comparison, or task breakdown), Clear (already sufficient), Outstanding (still Partial/Missing but low impact).
- If any Outstanding or Deferred remain, recommend whether to proceed to `/che-plan` or run `/che-clarify` again later post-plan.
- Suggested next command.
- **Pack fork (ncw), port on upstream upgrade** — after the report body, close with this fixed ending sequence, nothing after it:
  1. **Chain handoff to grill (main path)**: use the AskUserQuestion tool (never plain-text output that pauses the session for input) with two options, each carrying a one-line description of the action; on selection the agent executes it immediately in this session — 「继续 grill」（**推荐**）— 深度追问：多轮交叉检验 intent，暴露自相矛盾与隐含假设，把每个决策点钉到终态；结束后承接「是否现在推送到 PingCode?」与主流程提示。选中即自动执行 `/che-grill`（携带 `TASK_DIR` 与 `SLUG`）/「就此停下」— 结束本次链，grill 与推送稍后手动跑. On continue, grill takes over and nothing follows here. On stop, judge UI presence from the intent (User Stories / In scope / Acceptance Scenarios 中是否出现用户可见界面交互；拿不准按涉 UI 处理) and show exactly ONE manual next-step hint, rendered verbatim:
     UI 存在 →
     主流程:
     - /che-design（本特性含 UI，先出设计明细 design-tasks.md，再进 plan）
     无 UI →
     主流程:
     - /che-plan（无 UI，交接门禁通过后直接出实现计划）

## Done When

- [ ] Intent ambiguities identified and clarifications integrated directly into the affected intent sections (no `## Clarifications` history written)
- [ ] Zero `[NEEDS CLARIFICATION]` markers remain in the intent
- [ ] Scenario `E#` IDs preserved for replaced scenarios; only genuinely new scenarios took new IDs; changed scenarios re-pass `SQ1–SQ4`
- [ ] Completion reported to user with questions answered, sections touched, scenario changes, and coverage summary

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-grill` —— 追问式深度澄清（主路径下一环）：暴露隐含假设与自相矛盾；PingCode 推送确认与 design/plan 主流程提示由 grill 收尾承接
- **条件**：
  - 澄清结论已回写 intent，`[NEEDS CLARIFICATION]` 标记清零
  - AskUserQuestion 选「继续 grill」直接链式调用；停下由用户稍后手动跑 grill 或直接进 design/plan
