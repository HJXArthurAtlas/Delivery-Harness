---
name: che-intend
description: 意图与场景访谈 + 特性意图一体化：问答式锁定目标、范围、约束与失败条件（GQ/CQ/FQ 全过），生成 User Stories 与 Functional Requirements，起草 Acceptance Scenarios 与 Edge Cases（稳定 E# ID，SQ1–SQ4 全过），创建或更新任务并全部写入统一 intent.md（含 User Story 章节与优先级），intent.md 落 `che paths` 解析的任务目录；任务不存在时经 `che task create` 创建任务目录并绑定 session，是意图驱动流程的第一步（任务自此诞生）。当用户运行或提到 /che-intend，或说「出 spec」「写特性需求」「把这个需求转成规格」「先做 intent 访谈」「锁定目标与约束」「捕获失败条件」「补期望场景」「写 expectations」「捕获成功场景」「捕获边界场景」时使用——即使用户没提命令名，只要是动工前的意图捕获、场景捕获或特性意图的创建/更新也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

# Intent + Scenario Interview → Unified Intent

You are running one interview that locks the intent (goal, scope, constraints, failure conditions), drafts the user stories and scenarios, and writes the single requirement artifact `intent.md`. The validator (`/che-intentverify`) and the gap analysis (`/che-gapfill`) both read the scenarios from this file; `/che-clarify` is the only later writer that resolves `[NEEDS CLARIFICATION]` markers in it.

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

Then construct file paths as `$TASK_DIR/intent.md`, where `$TASK_DIR` is the task directory `che task create` prints (`specs/NNN-{slug}/` under `$PROJECT_ROOT`). If any subsequent Bash command changes directory, re-anchor before the next file operation.

---

## The non-negotiable rule

**Do not terminate this interview until the intent content is complete, every GQ/CQ/FQ/SQ test passes, and the exit gate (Step 6) holds.**

If the user tries to skip a phase, refuse politely and explain which specific test would fail. If the user is stuck, brainstorm with them — do not punt back with "good luck."

---

## Inputs you have

- The user's rough description of the outcome (provided in chat when `/che-intend` is invoked, or — only after the Phase 0 input gate passes — asked for as the first question)
- The context loaded by `/che-load` — settled ADRs from the adrkit corpus (`docs/adr/`) plus corrections and patterns from `docs/corrections/` and `docs/patterns/`. Use them to inform pushback and to derive edge cases.

## Output you produce

- One task directory (`specs/NNN-{slug}/`, created by `che task create` when no task resolves) holding one file written by this command: `intent.md` — the single requirement source of truth: intent block (Why now / In scope / Out of scope / Constraints / Failure conditions), User Stories with prioritized Acceptance Scenarios, Edge Cases, Functional Requirements, Success Criteria
- Slug derived from the locked goal (3–5 words, lowercase, hyphenated) — it becomes part of the task directory name and the stable handle for the whole flow

---

## Phase 0 — Input gate（入向输入门禁）

> Pack fork (ncw)，上游升级需 port。

进入访谈之前必须先做输入门禁检查，逐项核对两个来源：

1. **前置上下文**：当前会话是否已存在与本次意图相关的实质内容——需求片段、设计讨论、粘贴的报告/issue，已装载的 `COMPOUND STORE LOADED` 摘要，或用户明确指向的 `specs/`、`docs/` 现有制品。
2. **调用输入**：触发本 skill 的那条消息里是否包含对结果/特性/问题的实质描述。

判定纪律：

- 纯触发词不算有效输入——「开始」「跑一下 intend」「继续」这类无主题内容的消息按无效处理。
- **两个来源都为空 → 必须中断**：不建任务、不推 slug、不从仓库猜主题。直接向用户明确提问，例如：
  > 我目前没有任何关于本次意图的上下文或输入。请说明需要澄清的意图是什么：用一句话描述期望的结果（解决什么问题、给谁带来什么），或给出相关讨论 / 文档 / issue 的指向。收到有效描述后我再开始访谈。

  收到用户的有效描述前绝不开始访谈；该描述即为访谈的 goal 输入，照常过 GQ1–GQ5。
- 只有其一 → 照常开始访谈。若只有前置上下文而没有调用输入，先用一句话复述你从上下文推断的主题，请用户确认或纠正后再开始 GQ 测试——绝不基于推断的主题直接开跑。

---

## Load precondition（入向前置）

Before the interview: if the session context has no `COMPOUND STORE LOADED` summary, run `/che-load` first, then continue here. If the summary is already present (loaded earlier this session), skip the reload.

---

## The procedure, in order

### Step 1 — Resolve or decide the task (before any artifact write)

1. Run `che paths --json --session "$CHE_SESSION_ID"` from the repository root (bare `che paths --json` when no session id is available; requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`). A missing `che` executable is an **installation error**, not "no task" — tell the user to install the CLI, do not fall through to task creation guessing.
2. **Task resolved** (the command prints `FEATURE_DIR`):
   - Ask the user **update this task or create a new one** — default to **update**. Update reuses the resolved `FEATURE_DIR` and `SLUG` verbatim; do NOT regenerate the slug and do NOT invent a new directory.
   - **Update with an existing `intent.md`**: only after the user's update confirmation, load the existing intent and edit it — never blindly copy the template over it. Replace only contradicted content. **Scenario IDs are immutable**: keep every still-valid `E#` verbatim, never renumber or reuse IDs; assign only genuinely new scenarios the next unused `E#`.
   - **Legacy migration**: if `{TASK_DIR}/expectations.md` still exists (retired artifact), merge it into the intent in the same update: (1) match each old scenario to an intent scenario by semantics and attach the old `E#` ID to the matching intent scenario; (2) move scenarios missing from the intent into the matching User Story's Acceptance Scenarios or `### Edge Cases` under their original `E#`; (3) conflicting wording goes to the user (or a follow-up `/che-clarify`) — never keep two versions; (4) keep existing `derived from E#` references in `tasks.md` resolvable. Re-run the exit gate (Step 6) on the merged intent, then delete `expectations.md`. Never leave the file behind half-merged.
3. **Ambiguous candidates** (multiple tasks, resolution fails listing them): let the user select a candidate (→ update flow) or choose to create a new one (→ step 4 of this procedure).
4. **No task exists**: proceed to create new (step 3 of this procedure).

### Step 2 — Run the interview

Interview in this exact order. The text the user typed after `/che-intend` **is** the feature description — assume you always have it available; do not ask the user to repeat it unless they provided an empty command.

#### Phase 1 — Goal
Ask the user for one rough sentence describing the outcome they want (or take it from `$ARGUMENTS` / the Phase 0 description).

Apply tests **GQ1–GQ5**. For each failed test, cite the test ID, explain the failure in one sentence, and offer a concrete reword. Iterate until all five pass.

#### Phase 2 — Why now
Ask: *"Why now? What changed, what's the trigger to do this work in this moment?"*

Accept 1–3 sentences as the soft floor. If the response is fewer than ~10 words (e.g., "because I want to"), ask once: *"That'll read thin to whoever opens this in six months — want to add what changed, who asked, or why now and not six months ago?"* Accept their second answer even if still short. This is narrative context, not a gated test.

#### Phase 3 — In scope
Ask: *"What's explicitly in scope for this outcome? List the surfaces, behaviors, or boundaries this work touches."*

Get a bullet list. Push back on items that look like implementation details (libraries, file paths, class names) — those belong in Context, which the harness assembles later.

#### Phase 4 — Out of scope
Ask: *"What is explicitly NOT in scope? What should the implementation NOT touch, even if tempted?"*

This is the guard `/che-intentverify` will use later. Push back if the user can't name anything — every real feature has scope boundaries; "nothing" is almost always wrong and means the user hasn't thought about it.

#### Phase 5 — Constraints
Ask one at a time. After each candidate, apply tests **CQ1–CQ5** and respond with verdicts.

**Batch quick-pick pattern.** When 3+ dimensions remain open and the user signals they want to address multiple at once (e.g., *"all of the above"*, *"the rest"*, *"give me defaults"*), proactively offer a batch quick-pick block: list each remaining dimension with 2–3 letter-coded options, and accept a multi-letter reply (e.g., `a/a/b` or `aab`). Fall back to one-at-a-time only when a candidate fails a test and needs iteration.

Continue until every constraint passes CQ1–CQ5 — there is no minimum or maximum count; completeness is judged by coverage (Step 6 exit gate), not by how many collected. If the list is thin, prompt explicitly about commonly-missed dimensions:
- Performance (latency, throughput, resource limits)
- Accessibility (WCAG level, screen reader, keyboard nav)
- Privacy (PII handling, logging, retention)
- Security (auth, ASVS level, secrets)
- Reliability (uptime SLO, error budget, retry behavior)
- Observability (metrics, traces, logs)
- Compatibility (device coverage, browser support, API versions)

#### Phase 6 — Failure conditions
Ask one at a time. After each candidate, apply tests **FQ1–FQ4** and respond with verdicts.

**Batch quick-pick pattern.** Same as Phase 5: if the user signals batch acceptance, offer a letter-coded multi-pick block (especially for the universals: build fails, tests fail, lint, secret scan, coverage threshold).

Continue until every failure condition passes FQ1–FQ4 — no fixed count; coverage is judged at the exit gate. If the list is thin, prompt explicitly about commonly-missed checks:
- Build fails
- Lint reports errors
- Test coverage drops below threshold
- Secret scan finds new exposures
- API contract changed without version bump
- Quality gate (Sonar, etc.) fails

**Do not advance past a failed GQ/CQ/FQ test.** Tech-stack choices remain excluded (they belong to `/che-plan`); task breakdown remains excluded (it also belongs to `/che-plan`'s task-generation phase).

#### Phase 7 — Draft stories and scenarios (merged from the retired expectations interview)

Work from the locked intent + feature description, in this order:

1. **Generate User Stories and Functional Requirements.** Prioritized user journeys (P1/P2/P3, each independently testable) plus testable `FR-###` requirements; document reasonable defaults in Assumptions. If no clear user flow exists: ERROR "Cannot determine user scenarios".
2. **Draft Acceptance Scenarios** from the stories and requirements — user-observable Given/When/Then per story.
3. **Draft Edge Cases** from the out-of-scope list (what must NOT happen if implementation overreaches), the failure conditions (user-observable parallels), commonly-missed degradation cases for the feature type, and relevant `docs/corrections/` entries (*"Correction note from {date} flagged that {pattern} caused {issue}. Worth an edge scenario for it."*).
4. **Batch-review both scenario sets**: show the full drafts as numbered lists and ask *"Accept all / edit specific numbers / write your own."* Apply tests **SQ1–SQ4** to every accepted scenario; push back on failures with a concrete reword. Iterate until both sets are locked.
5. **Assign globally stable IDs**: one `E1…En` sequence across Acceptance Scenarios and Edge Cases, never reordered, never reused. Each scenario carries a `Validates:` line citing the `FR-###` it proves.

Coverage — not counts — decides when drafting is done:
- Every major story has acceptance coverage.
- Every relevant boundary (out-of-scope, failure condition, correction) has edge coverage.
- Every scenario is observable and unambiguous (SQ1–SQ4).

No fixed scenario quota exists; do not pad. Do not add a separate `## Expectations` section — scenarios live in the user stories and `### Edge Cases` of the intent body.

### Step 3 — Create the task (create-new only)

When all interview phases pass (or, for update, after the update confirmation):

1. For create-new: derive a slug from the locked goal (3–5 words, lowercase, hyphenated).
2. Show the slug as a one-line confirmation: *"Slug: `{slug}` — reply `override` to change, anything else (including empty) accepts."* Default behavior is accept-on-any-non-override reply.
3. Create the task (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`):
   ```bash
   che task create {slug} --summary "<locked goal in one plain sentence>" --session "$CHE_SESSION_ID"   # omit --session when no session id is available
   ```
   The command allocates the next `NNN-` number, enforces slug uniqueness, creates `specs/NNN-{slug}/` with a `metadata.json` skeleton, and binds the session. `--summary` is the one-line "what is this task about" (use the locked goal sentence). Use the printed `TASK_DIR` for every subsequent file operation. If the slug already exists the command fails — go back and pick another slug, confirmed the same way.
4. For update: skip task creation; keep the resolved `FEATURE_DIR`/`SLUG`.

### Step 4 — Start the runs timeline (before the first artifact write)

Only after the task exists, start the run:

```bash
che state start intend --session "$CHE_SESSION_ID"    # when a session id is available
che state start intend --feature {slug}               # otherwise
```

The `--feature` fallback is **mandatory** after ambiguous/multi-task selection (no session binding) so `state start` cannot resolve a different task. Keep one feature per invocation. Branch creation/switching is outside this skill: if the user asks for a git branch, create or switch to it using their requested name before continuing; the task directory name and the branch name are independent.

### Step 5 — Write the unified intent

1. Load this skill's own `references/intent-template.md` — the intent template; no project scaffolding and no override/preset/extension resolution stack.
2. **Create-new**: copy the template to `{TASK_DIR}/intent.md` as the starting point. **Update**: edit the existing `{TASK_DIR}/intent.md` in place (never overwrite the template onto it); preserve still-valid content and scenario IDs, replace contradicted content.
3. **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints.
4. **Register terms in the knowledge file**: run `che knowledge paths --json` once from the repository root to resolve `CONTEXT_FILE` and `GLOSSARY_FILE` (if the subcommand is unavailable, stop and recommend `npm install -g @newchiwan/che@latest`; on a non-zero exit, stop and report its stderr). Any new domain concept introduced by this feature is registered into the matching 域节 of `CONTEXT_FILE` before the intent references it as settled terminology, and the intent's `## 统一语言` section declares that file and the domain section(s) it follows. If `CONTEXT_FILE` is missing, scaffold it first: create its parent directory if needed and write a minimal file — a 「使用规则」 section, one 域节 per project domain known so far (at least the domain this feature belongs to), and a topic-document index. The rules state that intent terms must be registered in the matching 域节 and that `docs/GLOSSARY.md`, when present, is a read-only legacy snapshot. Never overwrite an existing file, and never create or modify `docs/GLOSSARY.md`.
5. Fill the template, preserving section order and headings:
   - Every section marked *(mandatory)* must be populated. When an optional section doesn't apply, remove it entirely (don't leave as "N/A"); the mandatory intent block (Why now / In scope / Out of scope / Constraints / Failure conditions) is always populated from the interview.
   - Frontmatter: only `status: active`.
   - **Why now / In scope / Out of scope**: the Phase 2–4 narrative and lists.
   - **Constraints / Failure conditions**: the CQ/FQ-locked items with their `C#`/`F#` IDs.
   - **统一语言**: the glossary declaration — the resolved `CONTEXT_FILE` path and the domain section(s) in it this intent follows, with new domain concepts already registered.
   - **User Stories + Acceptance Scenarios + Edge Cases**: the Phase 7 locked sets with global `E#` IDs and `Validates:` lines.
   - **Functional Requirements** (`FR-###`), **Success Criteria** (`SC-###`, measurable, technology-agnostic, user-focused, verifiable), optional **Key Entities**.
   - **References** (optional): ADRs respected, corrections applied — no other compound-store record is kept in the intent.
   - Markers: for unclear aspects make informed guesses based on context and industry standards; only mark `[NEEDS CLARIFICATION: specific question]` when the choice significantly impacts scope or UX, multiple reasonable interpretations exist, and no reasonable default exists. **LIMIT: maximum 3 markers total**, prioritized scope > security/privacy > UX > technical details. These are product questions — `/che-clarify` owns resolving them.

### Step 6 — Exit gate, then close the run

Run this in-line validation after writing; no separate checklist file is created:

1. **Structure**: frontmatter is exactly `status: active`; all *(mandatory)* sections populated; template section order intact; no `## Clarifications` history, no Test record, no cross-file coverage list.
2. **Quality verdicts**: goal passes GQ1–GQ5; every constraint passes CQ1–CQ5; every failure condition passes FQ1–FQ4; every scenario passes SQ1–SQ4.
3. **Coverage**: every major story has ≥1 acceptance scenario; every relevant boundary (out-of-scope, failure condition, correction) has ≥1 edge scenario; no orphan scenario (`Validates:` cites existing `FR-###`).
4. **IDs**: one global `E#` sequence, unique, no gaps introduced by edits; `C#`/`F#`/`FR-###`/`SC-###` unique.
5. **Markers**: at most 3 `[NEEDS CLARIFICATION]` markers, each explicit and product-level.
6. **Failure handling**: list failing items, update the intent, re-validate — maximum **3 repair iterations**; if still failing, report the remaining issues and warn the user.
7. If markers exist, present them batched (Q1–Qn option tables) so the user can resolve them now; whatever remains explicit stays for `/che-clarify`, which must end with zero markers.

**Close the run**: after the final write/validation, record `che state done intend --session "$CHE_SESSION_ID"` (omit `--session` when unavailable; use `--feature {slug}` when there is no session id). Do **not** run `state done` while the exit gate still fails.

### Step 7 — Completion Report

Report completion to the user with:
- `TASK_DIR` — the task directory path
- `SPEC_FILE` — `{TASK_DIR}/intent.md`
- Exit-gate results summary
- Counts: goal ✓, {N} constraints (CQ1–CQ5), {N} failure conditions (FQ1–FQ4), {N} acceptance + {N} edge scenarios (SQ1–SQ4), {N} ADR refs, {N} remaining markers

Then offer the chain handoff (use AskUserQuestion with three options):
- **Continue to clarify** — invoke `/che-clarify` next, carrying the selected `TASK_DIR` and `SLUG` into this chained invocation
- **Stop here** — user will run later phases manually
- **Quit** — stop the chain entirely

---

## Test rubrics — apply these literally

### Goal tests (GQ1–GQ5)

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **GQ1** | Two-implementations | Two competent teams could build this two different ways and both be right | "GQ1: only one valid implementation passes this sentence — you've made every design call upfront. Strip the [tool/pattern/library] noun and retry." |
| **GQ2** | No-"and" | Sentence describes one outcome; no "and" connecting two outcomes | "GQ2: I count two outcomes connected by 'and'. Split into two intents — the method scales by adding more intents, not by making each heavier. Pick one for this doc; we'll do the other next." |
| **GQ3** | Tool-strip | After deleting every tool/library/class/framework/pattern noun, a sentence still expresses an outcome | "GQ3: stripping [X, Y, Z] from your sentence collapses it. You wrote a recipe, not a goal. State the user-facing outcome." |
| **GQ4** | Outcome-not-trigger | Framed as "users [verb] [thing]" rather than "when X happens, do Y" | "GQ4: this is a trigger phrase ('when X changes...'), not an outcome. Reword to 'users [see / can / get / receive] [thing]'." |
| **GQ5** | Typist | The agent still has real engineering decisions to make | "GQ5: the agent would be a typist with this sentence — you've removed the value of agentic implementation. Loosen so the builder still picks the design." |

### Constraint tests (CQ1–CQ5) — apply to each candidate

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **CQ1** | Quality, not recipe | Names a property the outcome must carry | "CQ1: this names a tool/pattern. That belongs in Context (which the harness assembles), not in your intent. Drop it or restate as a quality." |
| **CQ2** | Measurable | Has a number, threshold, or named standard | "CQ2: this is directional but unmeasurable. Give me a floor (e.g., 'p95 < 500ms', 'WCAG 2.1 AA', 'OWASP ASVS L2')." |
| **CQ3** | Directional | Points toward where the outcome should land on this dimension | "CQ3: this reads as an aspiration without direction. Reword as 'must [be / support / hold] [measurable target]'." |
| **CQ4** | Builder-needs-it | Knowing this would change how the builder writes the code | "CQ4: knowing this doesn't change how the code gets written — it's a failure condition the validator catches afterward. Park it; we'll add it in the failure-conditions phase." |
| **CQ5** | Distinct | States a property no other constraint on the list already states | "CQ5: this duplicates C{N}. Merge them or state the new dimension it adds." |

### Failure condition tests (FQ1–FQ4) — apply to each candidate

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **FQ1** | Binary | True/false, no judgment call | "FQ1: this requires human opinion. Failure conditions must be decidable by a script. Restate as something an eval can check." |
| **FQ2** | Post-output | Could only be checked after code exists | "FQ2: this could be checked before code exists — it's a constraint, not a failure condition. Move it." |
| **FQ3** | Observable | A script or eval can determine pass/fail | "FQ3: this isn't observable by tooling. Restate so a CI check could decide it." |
| **FQ4** | Doesn't shape design | Knowing this would NOT change how the builder writes code | "FQ4: knowing this WOULD change how the code is written — it's a constraint, not a failure condition. Move it to the constraints phase." |

### Scenario tests (SQ1–SQ4) — apply to every acceptance and edge scenario

| ID | Test | Pass | Fail pushback |
|---|---|---|---|
| **SQ1** | Specific | Names a concrete user action AND a concrete observable outcome | "SQ1: '{scenario}' is too vague. Name the action ('reader clicks toggle in header') AND the outcome ('page re-renders in dark theme within 200ms'). Both halves must be concrete." |
| **SQ2** | Observable | Success/failure is decidable by a validator (DOM state, pixel comparison, console event, network call, log line). No human judgment needed. | "SQ2: '{scenario}' requires human opinion ('feels right', 'looks good'). Restate so a Playwright assertion, visual diff, or log check could decide it." |
| **SQ3** | User-recognizable | Reads like something a user would describe in plain language. No code identifiers, function names, or framework jargon. | "SQ3: '{scenario}' uses implementation language ('resolveTheme() returns dark'). Rewrite from the reader's point of view: 'reader sees the blog in dark theme on first visit'." |
| **SQ4** | Behavior, not mechanism | Describes user-observable behavior, NOT the implementation mechanism — the HOW stays the builder's design call | "SQ4: '{scenario}' names the mechanism (`localStorage['theme']` is set). Rewrite as the user-observable outcome: 'reader's theme choice persists on the next visit'. The HOW is the builder's design call." |

**SQ3 worked examples for calibration:**

| Phrase | SQ3 verdict | Why |
|---|---|---|
| "Reader sees the blog in dark theme" | ✓ Pass | Plain language, user POV |
| "Reader using forced-colors mode" | ✓ Pass | OS-level user-facing accessibility feature, not internal code |
| "Reader on iOS 15+ with reduced-motion enabled" | ✓ Pass | Both phrases are user-recognizable system states |
| "Reader in private/incognito browsing" | ✓ Pass | A user mode, not an implementation detail |
| "resolveTheme() returns 'dark'" | ✗ Fail | Code identifier (function name) |
| "ThemeProvider.theme === 'dark'" | ✗ Fail | Code property access |
| "document.documentElement[data-theme] is set to 'dark'" | ✗ Fail | DOM API specifics |
| "localStorage['theme'] survives a reload" | ✗ Fail | Names the storage mechanism (also fails SQ4) |

The boundary: if a non-technical user could read it aloud and understand what is being claimed, it passes SQ3. If they would need a developer to explain it, it fails.

---

## Pushback style

- **Cite the test ID** that failed (e.g., "SQ4 failed because...").
- **Explain WHY** in one short sentence.
- **Offer a concrete reword** or specific clarifying question.
- **Do not advance** until the user accepts a fix or provides a valid alternative.
- Keep tone collaborative, not pedantic. You are helping the user write better intents, not grading them.

---

## Compound store interaction

If the compound store was loaded:

- **Before the goal phase**, scan the settled ADRs loaded from the adrkit corpus (`docs/adr/`) for decisions relevant to this work. Mention them upfront: *"I see ADR-007 settled the auth approach for this codebase. Any intent here should respect it. Proceed?"*
- **During the constraints phase**, if the user proposes a constraint that conflicts with a settled ADR, flag it: *"This conflicts with ADR-{N}. Either revise the constraint or open a new ADR to override."*
- **During the failure-conditions and edge-case phases**, scan `docs/corrections/` for relevant correction patterns and propose items that would catch repeats: *"Correction note from 2026-04 flagged that {pattern} caused {issue}. Want a failure condition / edge scenario for it?"*
- **Throughout**, do not re-debate any settled ADR present in the adrkit corpus. Assume it holds.

---

## Tool choices

- **Plain chat** for free-form prose (goal sentence, why now, constraint text, scenario drafts)
- **AskUserQuestion** for discrete choices (update-or-new, accept/edit/reject scenario sets, slug override, yes/no/later for the chain handoff)
- **Bash** for `che paths --json`, `che task create {slug} --summary "<locked goal>" --session "$CHE_SESSION_ID"`, and `che state start|done intend`
- **Read** for an existing intent on the update path
- **Write/Edit** for the final `{TASK_DIR}/intent.md` file and the resolved `CONTEXT_FILE`

---

## What you do NOT capture in this file

- **Tech stack choices** — these go into `/che-plan` later. If the user names a stack, ask whether it's a hard constraint (in which case it's a CQ-failing constraint that probably belongs in Context) or just a preference (defer to /che-plan).
- **Task breakdown** — that's `/che-plan`'s task generation. Don't pre-decompose work here.
- **Clarification Q&A history** — do not write a `## Clarifications` section; `/che-clarify` integrates resolved answers directly into the intent sections.

### For AI Generation

When creating this intent from a user prompt:

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 `[NEEDS CLARIFICATION]` markers — only for critical decisions that significantly impact scope/UX, have multiple reasonable interpretations, and lack any reasonable default. Prioritize: scope > security/privacy > user experience > technical details. `/che-clarify` resolves them.
4. **Think like a tester**: Every vague requirement should fail the exit gate's coverage check

**Examples of reasonable defaults** (don't ask about these):

- Data retention: Industry-standard practices for the domain
- Performance targets: Standard web/mobile app expectations unless specified
- Error handling: User-friendly messages with appropriate fallbacks
- Authentication method: Standard session-based or OAuth2 for web apps
- Integration patterns: Use project-appropriate patterns (REST/GraphQL for web services, function calls for libraries, CLI args for tools, etc.)

---

## Done When

- [ ] Interview complete: goal passes GQ1–GQ5, constraints pass CQ1–CQ5, failure conditions pass FQ1–FQ4, scenarios pass SQ1–SQ4 with global stable `E#` IDs
- [ ] Task resolved (update) or created via `che task create` (create-new); runs timeline opened and closed for `intend`
- [ ] Unified intent written to `{TASK_DIR}/intent.md` and the Step 6 exit gate passes (no separate checklist file)
- [ ] Completion reported to user with task directory, intent file path, exit-gate results, and counts

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-clarify` —— 产品澄清：≤5 个针对性问题清零 `[NEEDS CLARIFICATION]` 标记，结论回写 intent（含场景，保留既有 `E#` ID）
- **主链**：intend → clarify（清零产品标记）→ grill（深度追问）→ 推送确认（config 在位时）→ design/plan
- **条件**：
  - 入向输入门禁（Phase 0）：访谈之前无任何上下文且调用时无有效输入 → 中断，向用户明确提问需要澄清的意图，拿到有效描述后才开访谈
  - 前置装载（入向）：会话上下文无 `COMPOUND STORE LOADED` 摘要 → 先跑 `/che-load` 再开访谈；已有摘要（本会话已装载）→ 跳过
  - 统一 `intent.md` 已写入（任务目录经 `che task create` 创建或经用户确认更新，session 已绑定/显式解析）且出口校验通过；AskUserQuestion 选 continue 直接链式调用 `/che-clarify`，stop/quit 由用户稍后手动跑
- **回退**：无 config 或用户拒绝推送时由交接门禁兜底；建卡（`/che-pingcode-specstoissues`）由 grill 收尾的推送确认承接（同意推送即自动执行）
