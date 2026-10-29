---
name: che-compound-specify
description: 意图访谈 + 特性规格一体化：问答式锁定目标、范围、约束与失败条件（G/C/F 三族质量测试全部通过才允许结束），创建或更新任务并生成统一 spec.md（含 User Story 章节与优先级），spec 落 `che paths` 解析的任务目录（FEATURE_DIR），词汇表落 docs/GLOSSARY.md；任务不存在时本技能经 `che task create` 创建任务目录并绑定 session，是规格驱动流程的第一步（任务自此诞生）。当用户运行或提到 /che-compound-specify，或说「出 spec」「写特性需求」「把这个需求转成规格」「先做 intent 访谈」「锁定目标与约束」「捕获失败条件」时使用——即使用户没提命令名，只要是动工前的意图捕获或特性规格的创建/更新也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

# Intent Interview + Feature Specification

You are running an **intent interview followed by specification generation**. Your job is to extract a complete, high-quality intent (goal, scope, constraints, failure conditions) from the user through a question-and-answer dialogue, apply a strict quality rubric, then create or update the task and write the unified `spec.md` (the one builder-readable artifact). You do not write the file or hand off to the next phase until every test passes.

---

## Project root anchor (read this first — v0.2.2 cwd fix)

**Critical:** you must operate from the project root for all file I/O. The project root is the directory containing `.git`.

Before any Read, Write, or Edit (and before any Bash that uses a relative path), run this once:

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
echo "Anchored to project root: $PROJECT_ROOT"
```

Then construct file paths as `$TASK_DIR/spec.md`, where `$TASK_DIR` is the task directory `che task create` prints (`specs/NNN-{slug}/` under `$PROJECT_ROOT`). If any subsequent Bash command changes directory, re-anchor before the next file operation.

---

## The non-negotiable rule

**Do not terminate this interview until the spec is complete and every G/C/F test passes.**

If the user tries to skip a phase, refuse politely and explain which specific test would fail. If the user is stuck, brainstorm with them — do not punt back with "good luck." The whole point of this command is to make sloppy intents structurally impossible.

---

## Inputs you have

- The user's rough description of the outcome (provided in chat when `/che-compound-specify` is invoked, or — only after the Phase 0 input gate passes — asked for as the first question)
- The context loaded by `/che-compound-load` — settled ADRs from the adrkit corpus (`docs/adr/`) plus corrections and patterns from `docs/corrections/` and `docs/patterns/`. Use them to inform your pushback (see "Compound store interaction" below).

## Output you produce

- One task directory (`specs/NNN-{slug}/`, created by `che task create` when no task resolves) holding one file written by this command: `spec.md` (unified intent + feature specification; the intent block lives in `spec.md` itself — no separate intent artifact is created)
- Slug derived from the locked goal (3–5 words, lowercase, hyphenated) — it becomes part of the task directory name and the stable handle for the whole flow
- Checklist at `{TASK_DIR}/checklists/requirements.md`
- Then offer to chain to `/che-compound-expectations`

---

## Phase 0 — Input gate（入向输入门禁）

> Pack fork (ncw)，上游升级需 port。

进入访谈之前必须先做输入门禁检查，逐项核对两个来源：

1. **前置上下文**：当前会话是否已存在与本次意图相关的实质内容——需求片段、设计讨论、粘贴的报告/issue，已装载的 `COMPOUND STORE LOADED` 摘要，或用户明确指向的 `specs/`、`docs/` 现有制品。
2. **调用输入**：触发本 skill 的那条消息里是否包含对结果/特性/问题的实质描述。

判定纪律：

- 纯触发词不算有效输入——「开始」「跑一下 specify」「继续」这类无主题内容的消息按无效处理。
- **两个来源都为空 → 必须中断**：不建任务、不推 slug、不从仓库猜主题。直接向用户明确提问，例如：
  > 我目前没有任何关于本次意图的上下文或输入。请说明需要澄清的意图是什么：用一句话描述期望的结果（解决什么问题、给谁带来什么），或给出相关讨论 / 文档 / issue 的指向。收到有效描述后我再开始访谈。

  收到用户的有效描述前绝不开始访谈；该描述即为访谈的 goal 输入，照常过 G1–G5。
- 只有其一 → 照常开始访谈。若只有前置上下文而没有调用输入，先用一句话复述你从上下文推断的主题，请用户确认或纠正后再开始 G 测试——绝不基于推断的主题直接开跑。

---

## Load precondition（入向前置）

Before the interview: if the session context has no `COMPOUND STORE LOADED` summary, run `/che-compound-load` first, then continue here. If the summary is already present (loaded earlier this session), skip the reload.

---

## The procedure, in order

### Step 1 — Resolve or decide the task (before any artifact write)

1. Run `che paths --json --session "$CHE_SESSION_ID"` from the repository root (bare `che paths --json` when no session id is available; requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`). A missing `che` executable is an **installation error**, not "no task" — tell the user to install the CLI, do not fall through to task creation guessing.
2. **Task resolved** (the command prints `FEATURE_DIR`):
   - Ask the user **update this task or create a new one** — default to **update**. Update reuses the resolved `FEATURE_DIR` and `SLUG` verbatim; do NOT regenerate the slug and do NOT invent a new directory.
   - **Update with an existing `spec.md`**: only after the user's update confirmation, load the existing spec and edit it — never blindly copy the template over it. Preserve still-valid `## Clarifications` history and replace only contradicted content.
3. **Ambiguous candidates** (multiple tasks, resolution fails listing them): let the user select a candidate (→ update flow) or choose to create a new one (→ step 4 of this procedure).
4. **No task exists**: proceed to create new (step 4).

### Step 2 — Run the intent interview

Interview in this exact order. The text the user typed after `/che-compound-specify` **is** the feature description — assume you always have it available; do not ask the user to repeat it unless they provided an empty command.

#### Phase 1 — Goal
Ask the user for one rough sentence describing the outcome they want (or take it from `$ARGUMENTS` / the Phase 0 description).

Apply tests **G1–G5**. For each failed test, cite the test ID, explain the failure in one sentence, and offer a concrete reword. Iterate until all five pass.

#### Phase 2 — Why now
Ask: *"Why now? What changed, what's the trigger to do this work in this moment?"*

Accept 1–3 sentences as the soft floor. If the response is fewer than ~10 words (e.g., "because I want to"), ask once: *"That'll read thin to whoever opens this in six months — want to add what changed, who asked, or why now and not six months ago?"* Accept their second answer even if still short. This is narrative context, not a gated test.

#### Phase 3 — In scope
Ask: *"What's explicitly in scope for this outcome? List the surfaces, behaviors, or boundaries this work touches."*

Get a bullet list. Push back on items that look like implementation details (libraries, file paths, class names) — those belong in Context, which the harness assembles later.

#### Phase 4 — Out of scope
Ask: *"What is explicitly NOT in scope? What should the implementation NOT touch, even if tempted?"*

This is the guard `/che-compound-intentguard` will use later. Push back if the user can't name anything — every real feature has scope boundaries; "nothing" is almost always wrong and means the user hasn't thought about it.

#### Phase 5 — Constraints
Ask one at a time. After each candidate, apply tests **C1–C5** and respond with verdicts.

**Batch quick-pick pattern.** When 3+ dimensions remain open and the user signals they want to address multiple at once (e.g., *"all of the above"*, *"the rest"*, *"give me defaults"*), proactively offer a batch quick-pick block: list each remaining dimension with 2–3 letter-coded options, and accept a multi-letter reply (e.g., `a/a/b` or `aab`). Fall back to one-at-a-time only when a candidate fails a test and needs iteration.

Continue until **5–7 constraints** exist that all pass. If the user stalls below 5, prompt explicitly about commonly-missed dimensions:
- Performance (latency, throughput, resource limits)
- Accessibility (WCAG level, screen reader, keyboard nav)
- Privacy (PII handling, logging, retention)
- Security (auth, ASVS level, secrets)
- Reliability (uptime SLO, error budget, retry behavior)
- Observability (metrics, traces, logs)
- Compatibility (device coverage, browser support, API versions)

#### Phase 6 — Failure conditions
Ask one at a time. After each candidate, apply tests **F1–F4** and respond with verdicts.

**Batch quick-pick pattern.** Same as Phase 5: if the user signals batch acceptance, offer a letter-coded multi-pick block (especially for the universals: build fails, tests fail, lint, secret scan, coverage threshold).

Continue until **3–7 failure conditions** exist that all pass. If the user stalls below 3, prompt explicitly about commonly-missed checks:
- Build fails
- Lint reports errors
- Test coverage drops below threshold
- Secret scan finds new exposures
- API contract changed without version bump
- Quality gate (Sonar, etc.) fails

**Do not advance past a failed G/C/F test.** Success scenarios remain excluded (they belong to `/che-compound-expectations`); tech-stack choices remain excluded (they belong to `/che-compound-plan`); task breakdown remains excluded (it belongs to `/che-compound-tasks`).

### Step 3 — Create the task (create-new only)

When all interview phases pass (or, for update, after the update confirmation):

1. For create-new: derive a slug from the locked goal (3–5 words, lowercase, hyphenated).
2. Show the slug as a one-line confirmation: *"Slug: `{slug}` — reply `override` to change, anything else (including empty) accepts."* Default behavior is accept-on-any-non-override reply.
3. Create the task (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`):
   ```bash
   che task create {slug} --summary "<locked goal in one plain sentence>" --session "$CHE_SESSION_ID"   # omit --session when no session id is available
   ```
   The command allocates the next `NNN-` number, enforces slug uniqueness, creates `specs/NNN-{slug}/` with a `metadata.json` skeleton, and binds the session. `--summary` is the one-line "what is this task about" (use the locked goal sentence) — it lands in `metadata.json` so `che task list` can show every task at a glance without reading artifacts. Use the printed `TASK_DIR` for every subsequent file operation. If the slug already exists the command fails — go back and pick another slug, confirmed the same way.
4. For update: skip task creation; keep the resolved `FEATURE_DIR`/`SLUG`.

### Step 4 — Start the runs timeline (before the first artifact write)

Only after the task exists, start the run:

```bash
che state start specify --session "$CHE_SESSION_ID"    # when a session id is available
che state start specify --feature {slug}               # otherwise
```

The `--feature` fallback is **mandatory** after ambiguous/multi-task selection (no session binding) so `state start` cannot resolve a different task. Keep one feature per invocation. Branch creation/switching is outside this skill: if the user asks for a git branch, create or switch to it using their requested name before continuing; the task directory name and the branch name are independent.

### Step 5 — Generate the unified spec

1. Load this skill's own `references/spec-template.md` — the spec template; no project scaffolding and no override/preset/extension resolution stack.
2. **Create-new**: copy the template to `{TASK_DIR}/spec.md` as the starting point. **Update**: edit the existing `{TASK_DIR}/spec.md` in place (never overwrite the template onto it); preserve still-valid `## Clarifications` history and replace contradicted content.
3. **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints.
4. **Ensure the unified-language glossary exists**: the spec template's mandatory 统一语言 section references the central glossary `docs/GLOSSARY.md`. If that file is missing, scaffold it before writing the spec: create `docs/` if needed and write a minimal glossary there — one section per project domain (域节) plus a 「使用规则」 section stating that spec terms must be registered in the matching 域节 and that definitions live in the glossary, not in individual specs. Never overwrite an existing glossary. When writing the spec, register any new domain concepts introduced by this feature into the matching 域节, as the template requires.
5. Fill the template, preserving section order and headings:
   - Every section marked *(mandatory)* must be populated. When a section doesn't apply, remove it entirely (don't leave as "N/A") — except the mandatory intent block (Why now / In scope / Out of scope / Constraints / Failure conditions / Test record / Compound store refs), which is always populated from the interview.
   - **Why now**: the user's Phase 2 narrative.
   - **In scope / Out of scope**: the Phase 3 / Phase 4 bullet lists.
   - **Constraints**: C1–C5 with optional C6/C7, each with measurable targets.
   - **Failure conditions**: F1–F3 with optional F4–F7, each binary and observable.
   - **Test record**: the G/C/F result lines exactly as in the template.
   - **Compound store refs**: ADRs respected / corrections applied / patterns reached for.
   - Then generate the specification body from the locked intent + feature description:
     1. Extract key concepts from the description: actors, actions, data, constraints.
     2. For unclear aspects: make informed guesses based on context and industry standards; only mark `[NEEDS CLARIFICATION: specific question]` when the choice significantly impacts scope or UX, multiple reasonable interpretations exist, and no reasonable default exists. **LIMIT: maximum 3 [NEEDS CLARIFICATION] markers total**, prioritized scope > security/privacy > UX > technical details.
     3. Fill User Scenarios & Testing — if no clear user flow: ERROR "Cannot determine user scenarios".
     4. Generate Functional Requirements — each requirement must be testable; document reasonable defaults in Assumptions.
     5. Define Success Criteria — measurable, technology-agnostic, user-focused, verifiable.
     6. Identify Key Entities (if data involved).

### Step 6 — Validate and close the run

1. **Create/update the Spec Quality Checklist** at `{TASK_DIR}/checklists/requirements.md` (create-new) or re-validate the existing one (update), using this structure:

   ```markdown
   # Specification Quality Checklist: [FEATURE NAME]

   **Purpose**: Validate specification completeness and quality before proceeding to planning
   **Created**: [DATE]
   **Feature**: [Link to spec.md]

   ## Content Quality

   - [ ] No implementation details (languages, frameworks, APIs)
   - [ ] Focused on user value and business needs
   - [ ] Written for non-technical stakeholders
   - [ ] All mandatory sections completed

   ## Requirement Completeness

   - [ ] No [NEEDS CLARIFICATION] markers remain
   - [ ] Requirements are testable and unambiguous
   - [ ] Success criteria are measurable
   - [ ] Success criteria are technology-agnostic (no implementation details)
   - [ ] All acceptance scenarios are defined
   - [ ] Edge cases are identified
   - [ ] Scope is clearly bounded
   - [ ] Dependencies and assumptions identified

   ## Feature Readiness

   - [ ] All functional requirements have clear acceptance criteria
   - [ ] User scenarios cover primary flows
   - [ ] Feature meets measurable outcomes defined in Success Criteria
   - [ ] No implementation details leak into specification

   ## Notes

   - Items marked incomplete require spec updates before `/che-compound-clarify` or `/che-compound-plan`
   ```

2. **Run validation**: review the spec against each checklist item; document specific issues found.
3. **Handle failures (excluding [NEEDS CLARIFICATION])**: list failing items, update the spec, re-validate — maximum **3 repair iterations**; if still failing, document remaining issues in checklist notes and warn the user.
4. **Resolve [NEEDS CLARIFICATION] markers**: extract all markers; if more than 3 exist, keep the 3 most critical and make informed guesses for the rest. For each (max 3), present batched Q1–Q3 option tables:

   ```markdown
   ## Question [N]: [Topic]

   **Context**: [Quote relevant spec section]

   **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

   **Suggested Answers**:

   | Option | Answer | Implications |
   |--------|--------|--------------|
   | A      | [First suggested answer] | [What this means for the feature] |
   | B      | [Second suggested answer] | [What this means for the feature] |
   | C      | [Third suggested answer] | [What this means for the feature] |
   | Custom | Provide your own answer | [Explain how to provide custom input] |

   **Your choice**: _[Wait for user response]_
   ```

   Present all questions together, wait for the combined reply, replace each marker with the selected answer, then re-validate. Ensure markdown tables are properly formatted (consistent spacing, `| Content |` cells, 3+ dash separators).
5. **Close the run**: after the final write/validation, record `che state done specify --session "$CHE_SESSION_ID"` (omit `--session` when unavailable; use `--feature {slug}` when there is no session id). Do **not** run `state done` while the quality checklist still fails.

### Step 7 — Completion Report

Report completion to the user with:
- `TASK_DIR` — the task directory path
- `SPEC_FILE` — `{TASK_DIR}/spec.md`
- Checklist results summary
- Intent counts: goal ✓, {N} constraints (all C1–C5), {N} failure conditions (all F1–F4), {N} ADR refs

Then offer the chain handoff (use AskUserQuestion with three options):
- **Continue to expectations** — invoke `/che-compound-expectations` next, carrying the selected `TASK_DIR` and `SLUG` into that chained invocation
- **Stop here** — user will run later phases manually
- **Quit** — stop the chain entirely

---

## Test rubrics — apply these literally

### Goal tests (G1–G5)

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **G1** | Two-implementations | Two competent teams could build this two different ways and both be right | "G1: only one valid implementation passes this sentence — you've made every design call upfront. Strip the [tool/pattern/library] noun and retry." |
| **G2** | No-"and" | Sentence describes one outcome; no "and" connecting two outcomes | "G2: I count two outcomes connected by 'and'. Split into two intents — the method scales by adding more intents, not by making each heavier. Pick one for this doc; we'll do the other next." |
| **G3** | Tool-strip | After deleting every tool/library/class/framework/pattern noun, a sentence still expresses an outcome | "G3: stripping [X, Y, Z] from your sentence collapses it. You wrote a recipe, not a goal. State the user-facing outcome." |
| **G4** | Outcome-not-trigger | Framed as "users [verb] [thing]" rather than "when X happens, do Y" | "G4: this is a trigger phrase ('when X changes...'), not an outcome. Reword to 'users [see / can / get / receive] [thing]'." |
| **G5** | Typist | The agent still has real engineering decisions to make | "G5: the agent would be a typist with this sentence — you've removed the value of agentic implementation. Loosen so the builder still picks the design." |

### Constraint tests (C1–C5) — apply to each candidate

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **C1** | Quality, not recipe | Names a property the outcome must carry | "C1: this names a tool/pattern. That belongs in Context (which the harness assembles), not in your intent. Drop it or restate as a quality." |
| **C2** | Measurable | Has a number, threshold, or named standard | "C2: this is directional but unmeasurable. Give me a floor (e.g., 'p95 < 500ms', 'WCAG 2.1 AA', 'OWASP ASVS L2')." |
| **C3** | Directional | Points toward where the outcome should land on this dimension | "C3: this reads as an aspiration without direction. Reword as 'must [be / support / hold] [measurable target]'." |
| **C4** | Builder-needs-it | Knowing this would change how the builder writes the code | "C4: knowing this doesn't change how the code gets written — it's a failure condition the validator catches afterward. Park it; we'll add it in the failure-conditions phase." |
| **C5** | Count | Final set has 5–7 constraints | "C5: count is {N}. {Below 5: 'feature is probably under-constrained; consider [missed dimensions]'. Above 7: 'something on the list is a spec in disguise — which can we drop or move?'}" |

### Failure condition tests (F1–F4) — apply to each candidate

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **F1** | Binary | True/false, no judgment call | "F1: this requires human opinion. Failure conditions must be decidable by a script. Restate as something an eval can check." |
| **F2** | Post-output | Could only be checked after code exists | "F2: this could be checked before code exists — it's a constraint, not a failure condition. Move it." |
| **F3** | Observable | A script or eval can determine pass/fail | "F3: this isn't observable by tooling. Restate so a CI check could decide it." |
| **F4** | Doesn't shape design | Knowing this would NOT change how the builder writes code | "F4: knowing this WOULD change how the code is written — it's a constraint, not a failure condition. Move it to the constraints phase." |

---

## Pushback style

- **Cite the test ID** that failed (e.g., "G4 failed because...").
- **Explain WHY** in one short sentence.
- **Offer a concrete reword** or specific clarifying question.
- **Do not advance** until the user accepts a fix or provides a valid alternative.
- Keep tone collaborative, not pedantic. You are helping the user write better specs, not grading them.

---

## Compound store interaction

If the compound store was loaded:

- **Before the goal phase**, scan the settled ADRs loaded from the adrkit corpus (`docs/adr/`) for decisions relevant to this work. Mention them upfront: *"I see ADR-007 settled the auth approach for this codebase. Any intent here should respect it. Proceed?"*
- **During the constraints phase**, if the user proposes a constraint that conflicts with a settled ADR, flag it: *"This conflicts with ADR-{N}. Either revise the constraint or open a new ADR to override."*
- **During the failure-conditions phase**, scan `docs/corrections/` for relevant correction patterns and suggest failure conditions that would catch repeats: *"Correction note from 2026-04 flagged that {pattern} caused {issue}. Want to add a failure condition for it?"*
- **Throughout**, do not re-debate any settled ADR present in the adrkit corpus. Assume it holds.

---

## Tool choices

- **Plain chat** for free-form prose (goal sentence, why now, individual constraint text)
- **AskUserQuestion** for discrete choices (update-or-new, accept/edit/reject a reword, slug override, yes/no/later for the chain handoff)
- **Bash** for `che paths --json`, `che task create {slug} --summary "<locked goal>" --session "$CHE_SESSION_ID"` (task directory + one-line summary + session binding), `che state start|done specify`, and date generation (`date -u +%Y-%m-%d`) when populating the `created` frontmatter
- **Read** for an existing spec on the update path
- **Write/Edit** for the final `{TASK_DIR}/spec.md` file and the checklist

---

## What you do NOT capture in this file

- **Success scenarios** — these go to `{TASK_DIR}/expectations.md` via `/che-compound-expectations`. Compartmentation is the structural defense against the builder reward-hacking the validator's success criteria. If the user offers a success scenario during this interview, acknowledge it and say: *"That's an expectation, not part of intent. I'll park it for the expectations interview right after this."*
- **Tech stack choices** — these go into `/che-compound-plan` later. If the user names a stack, ask whether it's a hard constraint (in which case it's a C-test-failing constraint that probably belongs in Context) or just a preference (defer to /che-compound-plan).
- **Task breakdown** — that's `/che-compound-tasks`. Don't pre-decompose work here.

---

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT create any checklists that are embedded in the spec. That will be a separate command.

### For AI Generation

When creating this spec from a user prompt:

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers - use only for critical decisions that:
   - Significantly impact feature scope or user experience
   - Have multiple reasonable interpretations with different implications
   - Lack any reasonable default
4. **Prioritize clarifications**: scope > security/privacy > user experience > technical details
5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
6. **Common areas needing clarification** (only if no reasonable default exists):
   - Feature scope and boundaries (include/exclude specific use cases)
   - User types and permissions (if multiple conflicting interpretations possible)
   - Security/compliance requirements (when legally/financially significant)

**Examples of reasonable defaults** (don't ask about these):

- Data retention: Industry-standard practices for the domain
- Performance targets: Standard web/mobile app expectations unless specified
- Error handling: User-friendly messages with appropriate fallbacks
- Authentication method: Standard session-based or OAuth2 for web apps
- Integration patterns: Use project-appropriate patterns (REST/GraphQL for web services, function calls for libraries, CLI args for tools, etc.)

### Success Criteria Guidelines

Success criteria must be:

1. **Measurable**: Include specific metrics (time, percentage, count, rate)
2. **Technology-agnostic**: No mention of frameworks, languages, databases, or tools
3. **User-focused**: Describe outcomes from user/business perspective, not system internals
4. **Verifiable**: Can be tested/validated without knowing implementation details

**Good examples**:

- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"
- "Task completion rate improves by 40%"

**Bad examples** (implementation-focused):

- "API response time is under 200ms" (too technical, use "Users see results instantly")
- "Database can handle 1000 TPS" (implementation detail, use user-facing metric)
- "React components render efficiently" (framework-specific)
- "Redis cache hit rate above 80%" (technology-specific)

---

## Done When

- [ ] Intent interview complete: goal passes G1–G5, 5–7 constraints pass C1–C5, 3–7 failure conditions pass F1–F4
- [ ] Task resolved (update) or created via `che task create` (create-new); runs timeline opened and closed for `specify`
- [ ] Unified specification written to `{TASK_DIR}/spec.md` and validated against the quality checklist (intent block included in spec.md — no separate intent artifact)
- [ ] Completion reported to user with task directory, spec file path, checklist results, and intent counts

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-expectations` —— 起草正/边界场景期望（chain continue 时携带本技能选定的 `TASK_DIR` 与 `SLUG`）
- **可选目标**：`/che-pingcode-specstoissues` —— 建需求树卡片并登记 `specs/pingcode-mapping.json`
  - 条件：`.che/pingcode-config.yml` 在位（`pingcode` CLI ≥ 0.14.0 已装并认证）
  - 回退：无 config 或用户拒绝 → 跳过；不建卡由交接门禁兜底（交接前必须补跑）
- **条件**：
  - 入向输入门禁（Phase 0）：访谈之前无任何上下文且调用时无有效输入 → 中断，向用户明确提问需要澄清的意图，拿到有效描述后才开访谈
  - 前置装载（入向）：会话上下文无 `COMPOUND STORE LOADED` 摘要 → 先跑 `/che-compound-load` 再开访谈；已有摘要（本会话已装载）→ 跳过
  - 统一 `spec.md` 已写入（任务目录经 `che task create` 创建或经用户确认更新，session 已绑定/显式解析）且质量清单通过；AskUserQuestion 选 continue 直接链式调用 `/che-compound-expectations`，stop/quit 由用户稍后手动跑
