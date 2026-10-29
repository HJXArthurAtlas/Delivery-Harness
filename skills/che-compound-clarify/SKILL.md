---
name: che-compound-clarify
description: 规格澄清问答（产品澄清独占）：最多提 5 个高针对性的澄清问题，找出当前特性 spec 定义不足的区域，把结论直接合并进 spec.md 对应章节，并把 `[NEEDS CLARIFICATION]` 产品标记清零（specify 最多留 3 个明确标记，clarify 必须以零标记完成）。在 specify 之后、plan 之前使用。当用户运行或提到 /che-compound-clarify，或说「澄清规格」「补全需求细节」「解决需求歧义」时使用——即使用户没提命令名，只要是对 spec 的澄清回写也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

Goal: Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

Note: This clarification workflow is expected to run (and be completed) BEFORE invoking `/che-compound-plan`. If the user explicitly states they are skipping clarification (e.g., exploratory spike), you may proceed, but must warn that downstream rework risk increases.

Execution steps:

1. Run `che paths --json` from repo root **once** (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`). Parse minimal JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - (Optionally capture `IMPL_PLAN`, `TASKS` for future chained flows.)
   - If JSON parsing fails, abort and instruct user to re-run `/che-compound-specify` or verify feature branch environment.
   - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
   - Record the runs timeline start: `che state start clarify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available).

2. **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints.

3. Load the current spec file. Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing. Produce an internal coverage map used for prioritization (do not output raw map unless no questions will be asked).

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
    - Present EXACTLY ONE question at a time.
    - **Question writing quality (applies to every question, MC or short-answer):**
       - Lead with `**Question:**` followed by a full interrogative that ends with `?`. The question text before the `?` must make sense on its own.
       - NEVER use a topic label, section heading, or requirement id as the question itself. For example, `Acceptance device/runtime matrix (FR-023)` is INVALID — it is a label, not a question.
       - After the `?`, the only permitted suffix is an optional parenthesized requirement/question id. Exact format: `**Question:** <interrogative>?` or `**Question:** <interrogative>? (FR-023)`. Never put the id before the `?`, and never use the id (alone or with a topic label) as the whole prompt.
       - Immediately after the question line, add one plain-language "Why it matters" sentence (the stake for acceptance or shipping) before the recommendation/options.
       - Use everyday wording; introduce jargon only if defined in the same sentence. Self-check: a reader unfamiliar with this workflow must be able to answer from the Question line alone. Terse is fine; cryptic labels are not.
    - For multiple‑choice questions:
       - **Analyze all options** and determine the **most suitable option** based on:
          - Best practices for the project type
          - Common patterns in similar implementations
          - Risk reduction (security, performance, maintainability)
          - Alignment with any explicit project goals or constraints visible in the spec
       - Present your **recommended option prominently** at the top with clear reasoning (1-2 sentences explaining why this is the best choice).
       - Format as: `**Recommended:** Option [X] - <reasoning>`
       - Then render all options as a Markdown table:

       | Option | Description |
       |--------|-------------|
       | A | <Option A description> |
       | B | <Option B description> |
       | C | <Option C description> (add D/E as needed up to 5) |
       | Short | Provide a different short answer (<=5 words) (Include only if free-form alternative is appropriate) |

       - After the table, add: `You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or provide your own short answer.`
    - For short‑answer style (no meaningful discrete options):
       - Provide your **suggested answer** based on best practices and context.
       - Format as: `**Suggested:** <your proposed answer> - <brief reasoning>`
       - Then output: `Format: Short answer (<=5 words). You can accept the suggestion by saying "yes" or "suggested", or provide your own answer.`
    - After the user answers:
       - If the user replies with "yes", "recommended", or "suggested", use your previously stated recommendation/suggestion as the answer.
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
    - Maintain in-memory representation of the spec (loaded once at start) plus the raw file contents.
    - Do NOT write a `## Clarifications` Q&A history — the accepted answer is recorded only by integrating it into the affected spec sections.
    - Immediately apply the clarification to the most appropriate section(s):
       - Functional ambiguity → Update or add a bullet in Functional Requirements.
       - User interaction / actor distinction → Update User Stories with the clarified role, constraint, or scenario.
       - **Acceptance Scenarios / Edge Cases**: if the answer changes or overturns a scenario, REPLACE that scenario's text in place, keeping its existing `E#` ID — never append a contradictory alternative and never renumber or reuse IDs. Only a genuinely NEW scenario gets the next unused `E#`. After any scenario change, re-run the scenario quality tests `SQ1–SQ4` (defined in `/che-compound-specify`) and fix failures before saving.
       - Data shape / entities → Update Key Entities (add fields, types, relationships) preserving ordering; note added constraints succinctly.
       - Non-functional constraint → Add/modify measurable criteria in Success Criteria > Measurable Outcomes (convert vague adjective to metric or explicit target).
       - Edge case / negative flow → Add or replace an entry under Edge Cases (new entries take the next unused `E#`).
       - Terminology conflict → Normalize term across spec; retain original only if necessary by adding `(formerly referred to as "X")` once. New domain terms are registered into the matching 域节 of `docs/GLOSSARY.md`.
    - If the clarification invalidates an earlier ambiguous statement, replace that statement instead of duplicating; leave no obsolete contradictory text.
    - Save the spec file AFTER each integration to minimize risk of context loss (atomic overwrite).
    - Preserve formatting: do not reorder unrelated sections; keep heading hierarchy intact.
    - Keep each inserted clarification minimal and testable (avoid narrative drift).

7. Validation (performed after EACH write plus final pass):
   - Updated sections contain no lingering vague placeholders the new answer was meant to resolve.
   - No contradictory earlier statement remains (scan for now-invalid alternative choices removed).
   - Scenario IDs: every pre-existing `E#` still present (or explicitly replaced in place), sequence unchanged, no duplicates; changed scenarios re-pass `SQ1–SQ4`.
   - Markdown structure valid; no new top-level sections added beyond integration into existing ones (no `## Clarifications`).
   - Terminology consistency: same canonical term used across all updated sections.

8. Write the updated spec back to `FEATURE_SPEC`.

9. **Final marker sweep**: confirm zero `[NEEDS CLARIFICATION]` markers remain in the spec — clarify is the only writer allowed to resolve them, and it must end with none (specify may leave at most 3 explicit markers; they are resolved here).

Behavior rules:

- If no meaningful ambiguities found (or all potential questions would be low-impact), respond: "No critical ambiguities detected worth formal clarification." and suggest proceeding.
- If spec file missing, instruct user to run `/che-compound-specify` first (do not create a new spec here).
- `[NEEDS CLARIFICATION]` markers are clarify's exclusive domain: always sweep the spec for them (even when no new questions arise) and resolve or explicitly settle each one — completion with zero markers is mandatory.
- Never exceed 5 total asked questions (clarification retries for a single question do not count as new questions).
- Avoid speculative tech stack questions unless the absence blocks functional clarity.
- Respect user early termination signals ("stop", "done", "proceed").
- If no questions asked due to full coverage, output a compact coverage summary (all categories Clear) then suggest advancing.
- If quota reached with unresolved high-impact categories remaining, explicitly flag them under Deferred with rationale.

Context for prioritization: $ARGUMENTS

## Completion Report

Record the runs timeline completion: `che state done clarify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). Then report completion (after questioning loop ends or early termination):
- Number of questions asked & answered.
- Path to updated spec.
- Sections touched (list names).
- Scenario changes: replaced in place (with their kept `E#` IDs) vs newly added (`E#`), and confirmation that changed scenarios re-pass `SQ1–SQ4`.
- Remaining `[NEEDS CLARIFICATION]` markers: must be zero.
- Coverage summary table listing each taxonomy category with Status: Resolved (was Partial/Missing and addressed), Deferred (exceeds question quota, or remaining item is specifically implementation method, tech-stack comparison, or task breakdown), Clear (already sufficient), Outstanding (still Partial/Missing but low impact).
- If any Outstanding or Deferred remain, recommend whether to proceed to `/che-compound-plan` or run `/che-compound-clarify` again later post-plan.
- Suggested next command.
- **Pack fork (ncw), port on upstream upgrade**: end the report with grouped next-step hints, rendered verbatim as follows:
  主流程:
  - /che-compound-design: 出设计明细 design-tasks.md（涉 UI 必跑，先于 plan）
  - /che-compound-plan: 交接门禁通过后开发侧出实现计划
  可选:
  - /che-compound-grill-me: [可选] 决策点仍有歧义时的深度澄清
  - /che-pingcode-specstoissues: [可选] 建卡并登记 mapping.json（不建则交接前补跑）

## Done When

- [ ] Spec ambiguities identified and clarifications integrated directly into the affected spec sections (no `## Clarifications` history written)
- [ ] Zero `[NEEDS CLARIFICATION]` markers remain in the spec
- [ ] Scenario `E#` IDs preserved for replaced scenarios; only genuinely new scenarios took new IDs; changed scenarios re-pass `SQ1–SQ4`
- [ ] Completion reported to user with questions answered, sections touched, scenario changes, and coverage summary

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-design`（涉 UI）或 `/che-compound-plan`（无 UI，交接门禁通过后）
- **条件**：
  - 澄清结论已回写 spec
  - 可选 `/che-compound-grill-me` 继续追问
  - 交接门禁（spec 章节齐备 + pingcode-mapping.json 登记）通过后才进 plan
