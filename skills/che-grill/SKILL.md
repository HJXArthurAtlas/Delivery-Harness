---
name: che-grill
description: 规划前的无上限深度澄清访谈（clarify 的深化替代）：把 intent.md 的歧义与决策点逐轮推进到 Clear/Resolved/Outstanding/Deferred，结论即时回写 intent 并校验。当用户说「深度澄清这份 spec」「grill me」「把规格歧义全部清掉」时使用——即使用户没提命令名，只要是规划前的穷尽式意图澄清也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **Interaction rule (pack fork, port on upstream upgrade): every question that needs a user answer — interview questions, option choices, conflict confirmations, the satisfaction gate, chain handoffs — MUST be asked through the host's interactive question tool (AskUserQuestion; the `ask` tool on omp), rendered as a form with options or free-text input. NEVER print the question and options into the reply body and end the turn waiting for typed input. Display-only output (round announcements, reports, next-step hints) is unaffected.**

# Grill Me Skill

# Grill Me

Purpose: Detect, reduce, and clarify ambiguities and unresolved decisions in the active feature intent.

Following the "Interview discipline (applies to every round)" in this file, perform the same clarification role as the core `che-clarify` command, but without a question limit. Detect ambiguities in intent.md, ask **one question at a time in sequence while managing the questions that can be asked now (the frontier) as rounds**, immediately apply each answer to intent.md, and repeat the rounds **until every decision point has reached one of the final statuses—Clear / Resolved / Outstanding / Deferred—and the user is satisfied**.

> **See the Glossary for terms such as design tree, question candidate pool, frontier, round, category, decision-point status, aggregate category status, and coverage map.**

**This command must be able to run as an alternative to `che-clarify` in a macOS / Linux + Bash environment.** In supported environments, preserve compatibility with clarify's artifacts and side effects by producing them in the same form (direct incorporation into the relevant intent sections, validation after every write, and a completion report with coverage; no `## Clarifications` Q&A history is written, and no checklist file is touched). The internal elicitation and convergence algorithm intentionally differs to achieve deeper clarification.

This compatibility applies to **artifacts and side effects**. It does not mean that this command supports every runtime environment supported by the base toolkit. Use only the pack-bundled Python prerequisite helper; do not substitute project-local Bash, PowerShell, or Python copies.

## Language

**Communicate in English unless the user requests another language.** Keep questions, explanations, progress updates, and intent.md in the same language.

## User Input

```text
$ARGUMENTS
```

If non-empty, treat it as a request to prioritize the specified area for deeper examination.

## Prerequisites

1. Confirm that the environment is macOS / Linux and that `bash` and the external `che` CLI are available on PATH (`@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest` if missing). If not, state that the environment is unsupported and stop. Do not substitute a project-local prerequisite script.
2. From the repository root, run `che paths --json` **exactly once** to obtain `FEATURE_DIR` / `FEATURE_SPEC`, and `che knowledge paths --json` **exactly once** to obtain `CONTEXT_FILE` / `GLOSSARY_FILE`. If either does not return JSON, stop: for `che paths`, recommend rerunning the agent-specific invocation of `che-intend` or checking the active feature environment; for `che knowledge`, report the command's error and recommend upgrading `@newchiwan/che` when the subcommand is unknown.
3. If intent.md does not exist, stop and recommend running the agent-specific invocation of `che-intend` first. Do not create a new intent here.
4. Read `docs/constitution/constitution.md` (project principles) if it exists. In addition, inspect **only the existing materials relevant to the work at hand** using ordinary file search, file reading, and symbol search:
   - `README*` / `CONTEXT.md` / `CLAUDE.md` / `AGENTS.md` / `documents/**` / `docs/**` — domain terminology, stakeholders, business flows, and design decisions
   - Related existing intents / plans / ADRs — existing requirements, constraints, and accepted or rejected decisions
   - Source code / schemas / migrations / models / interfaces / tests — implemented behavior, data shapes, and boundary conditions
   - Package / build / CI/CD / deployment configuration — technology stack, runtime environment, external integrations, and operational constraints

## Glossary

The following terms apply throughout this file. All subsequent steps rely on these definitions.

### Design tree

An in-session tree that connects unresolved decisions remaining in the intent through parent-child dependencies. Use it to manage interview progress; do not write it to a file.

- **Node** — One decision. Its session status is either working unresolved (Partial / Missing in coverage), settled (Resolved), or terminally held (Outstanding / Deferred). A terminal hold closes the decision for this interview; it does not mean the product decision itself has been made. A node becomes settled through a user answer or a fact established by investigation.
- **Branch** — A dependency in which a child decision becomes meaningful only after its parent decision is settled. For example, until "Does the scope include X?" (parent) is decided, "What should the X list display?" (child) cannot be answered.

Each item in the question candidate pool is a question intended to settle one decision in this tree. The initial tree takes shape when the candidates created in Step 1 are associated with nodes in Step 2. Thereafter, add a corresponding decision node whenever a candidate is added to the pool, and update node status whenever an answer or fact is settled. Do not create and freeze the tree only once at the beginning.

Whenever a parent node is settled, reassess in both directions whether each of its descendants—not only its immediate children—still applies under the parent's result, or whether a previously inapplicable decision has become applicable again. Before changing a descendant to inapplicable or terminally held because of a parent dependency, preserve its current status, settled value, and question candidate as separate "resumption information."

Do not delete descendants that no longer apply. Keep each as a **Resolved node with the settled result "Not applicable"**, and perform all of the following in the same operation:

- Remove the corresponding question from both the current frontier and the question candidate pool.
- Change the corresponding decision point in the coverage map to Resolved and record a rationale such as "Not applicable because parent decision <decision point> was settled as <result>."
- If obsolete child-decision text remains in the intent, remove or revise it through Step 4A or Step 4B according to the source that settled the parent, then save and validate. Do not add a separate Q&A record for a child that became inapplicable in addition to the parent answer's integration.
- Recalculate the design tree and aggregate category statuses.

Conversely, when a changed parent decision makes a descendant that was inapplicable, Outstanding, or Deferred because of that parent applicable again, remove the parent-dependent terminal rationale and do the following:

- If the preserved settled value remains valid under the parent's new result and is already incorporated into and validated against the current intent, keep the node Resolved.
- Otherwise, reassess Partial / Missing from the current intent and the resumption information, then restore the corresponding question candidate. Apply the Step 2 fact gate, impact threshold, and dependency assessment normally to restored candidates.
- Update the reassessed node and coverage statuses in the same operation, then recalculate the design tree and aggregate category statuses.

### Question candidate pool

The complete pool of potential questions for the user, initially created from Partial / Missing decision points during the ambiguity scan in Step 1. It is dynamic: follow-up questions, decision-derived checks, post-decision drill-down, and rescanning in Step 5 can add candidates; investigation can establish that a candidate is factual, and previous answers can invalidate candidates, causing them to be removed.

### Sources of question candidates

Question candidates enter the pool through four paths.

| Source | Description |
| ------ | ----------- |
| **Follow-up question** | Re-ask the same decision until it is precise when an answer is ambiguous or contradictory. Confirmation of a conflict with a recorded decision also uses this form. |
| **Drill-down** | Settle new decision points or boundary conditions created by a selected option, continuing until the user is satisfied. |
| **Decision-derived check** | At the end of a round, compare every settled decision with investigated facts about its applicable scope (such as differences by target type or screen), and add overlooked inconsistencies or boundary conditions. |
| **Rescan** (Step 5) | When no currently askable questions remain, reread the entire updated intent.md and create candidates from ambiguities newly exposed by the answers. |

### Frontier

The set of questions in the candidate pool that have no unresolved prerequisites and **can be answered now**—the leading edge while settling the design tree from its roots. As decisions are settled, candidates that depended on them become eligible to enter the frontier.

A candidate that cannot enter the frontier because it depends on unfinished factual research or an unsettled parent decision is a **blocked candidate**. Keep blocked candidates in the question candidate pool; do not treat them as an absence of candidates. Before entering Step 5, follow each dependency to its source and resolve or terminally hold it through the Step 5 entry gate in Step 3.

### Round

An interview unit corresponding to one frontier. Ask questions one at a time in sequence within a round, and recalculate the frontier after each round ends.

### Categories

The ambiguity scan (Step 1) and coverage report (Step 7) organize decision points into the following ten categories. A category is an aggregate grouping of multiple decision points, not the smallest unit that receives a status. Throughout this file, "all categories" refers to these ten.

- **Functional scope and behavior**: Core goals and success criteria / explicit out-of-scope declarations / role and persona distinctions
- **Domain and data model**: Entities, attributes, and relationships / uniqueness and identity rules / lifecycle and state transitions / expected data volume
- **Interaction and UX flow**: Primary user journeys / error, empty, and loading states / accessibility and localization
- **Non-functional quality**: Performance / scalability / reliability and availability / observability / security and privacy / compliance
- **Integrations and external dependencies**: External services and APIs plus failure modes / input and output formats / protocol and version assumptions
- **Edge cases and failure handling**: Negative scenarios / rate limits / conflict resolution, including concurrent edits
- **Constraints and trade-offs**: Technical constraints / explicit trade-offs and rejected alternatives
- **Terminology consistency**: Canonical terms checked against project documents, existing intents, and code / synonyms to avoid
- **Completion signals**: Testability of acceptance criteria / measurable Definition of Done
- **Other**: TODO and unresolved markers / unquantified vague adjectives such as "robust" or "intuitive"

### Decision points and statuses

Assign status to each individual decision point within a category, not directly to the category. Treat each category checklist item—for example, performance, observability, or security—and every independent decision discovered by scanning as one decision point. If one question contains multiple decisions, update each decision point separately.

| Status | Assign when | Meaning |
| ------ | ----------- | ------- |
| **Clear** | During the Step 1 scan | Already defined well enough; no question is needed |
| **Partial** | During the Step 1 scan or while reopening a settled point | The description or decision is incomplete, or a contradiction is being confirmed. This is an in-progress status that feeds a question or investigation. |
| **Missing** | During the Step 1 scan | Required information is absent. This is an in-progress status that feeds a question or investigation. |
| **Resolved** | After incorporating an answer or investigated fact, or after a parent decision establishes non-applicability | Previously Partial / Missing, now resolved after incorporation and validation in the intent or after recording the reason it does not apply |
| **Outstanding** | When deciding not to ask a question | Still Partial / Missing in substance, but with no material impact on implementation or validation strategy |
| **Deferred** | When holding or interrupting a question or investigation | Intentionally unresolved because it belongs in planning, the user deferred it, a required fact is currently unavailable, or the interview was interrupted |

Partial / Missing are in-progress statuses and must not remain at completion. The completion condition is that **every decision point has reached one of the final statuses: Clear / Resolved / Outstanding / Deferred**.

### Aggregate category status

Derive a category's display status mechanically from all decision points beneath it. Never overwrite or hide per-point statuses with an aggregate status.

1. While work is in progress, use `Missing` if at least one point is Missing; otherwise use `Partial` if at least one point is Partial.
2. If no in-progress status remains, use `Deferred` if at least one point is Deferred.
3. Otherwise, use `Outstanding` if at least one point is Outstanding.
4. Otherwise, use `Resolved` if at least one point is Resolved.
5. Use `Clear` if every point was clear from the beginning.

For example, if Performance is Resolved, Observability is Outstanding, Security is Deferred, and the remaining points are Clear under "Non-functional quality," the aggregate category status is Deferred. However, Steps 6 and 7 must also include the per-point breakdown, including all Outstanding points.

### Coverage map

A list associating the semantic identity of every decision point (category, decision target, and applicable scope) with its current status, settled result or hold rationale, and the aggregate status of its category. Create it during the initial ambiguity scan in Step 1 and update it whenever an answer or investigated fact is incorporated or a status changes. Maintain the same list during rescans in Step 5; do not recreate it. Like the design tree, keep it only in session and do not write it to a file. Update a design-tree node and its corresponding coverage status in the same operation. Never return a node to working unresolved while leaving its coverage status as Clear / Resolved / Outstanding / Deferred; if an old status or value is needed, preserve it separately from current status. Evaluate completion by per-point status. At the satisfaction gate in Step 6, present aggregate category statuses and a per-point summary of Outstanding / Deferred items. In the completion report in Step 8, output aggregate statuses for every category and per-point breakdowns.

## Interview discipline (applies to every round)

- **Interview every aspect thoroughly until a shared understanding is reached.** Do not stop at superficial agreement.
- **Freeze the frontier at the start of a round and ask its questions one at a time in order.** Do not present all questions in a round at once. Present one question, wait for its answer, incorporate it, then present the next. Start the next round only after all questions in the current round have been processed. Do not limit the number of questions in a round, and do not add questions midway through it.
- **Move dependent questions to a later round.** Do not include a question whose answer depends on an unresolved question in the same round. Do not build questions on assumed premises. Add it to the frontier in a later round only after its prerequisite is settled.
- **Recalculate the design tree whenever a round ends.** Apply the round's answers to the design tree, then identify question candidates whose unresolved prerequisites previously prevented them from being asked but whose prerequisites are now all settled. Treat these as candidates for the next frontier. Recalculate the frontier only during the round-end processing in Step 3, never midway through a round.
- **Investigate facts instead of asking for them. Finding facts is always the agent's responsibility, not the user's.** Investigate facts available from the codebase, project documents, and existing intents, and exclude them from questions. Ask the user only for **decisions** that only the user can make after ordinary file search (for example, `rg`), file reading, and symbol/reference search have been exhausted. Perform the investigation yourself; do not delegate it to subagents.
- **Do not stop a round while waiting for research.** Treat unfinished research like an unsettled prerequisite. If research cannot finish during the current round, remove only the questions that depend on it from the frontier and return them to the question candidate pool. Add them to a later frontier after research finishes. Continue asking all remaining questions in the current frontier.
- **Offer one to three situation-appropriate choices labeled from `A.` as radio options in the interactive question tool** (see the interaction rule above). Offer one choice when there is one best answer and two or three when real trade-offs exist. Give each choice a one- or two-sentence rationale, and rely on the tool's built-in free-text input as the free-form option. The user must be able to accept a non-recommended choice as easily as the recommended one by selecting it.
- **Whenever marking an option `**Recommended**`, explain the recommendation.** Put the best-supported option at `A` with `**Recommended**` and state in one or two sentences **why it is preferred to the alternatives**, citing investigated facts, existing implementation, or an assessment of trade-offs. Never apply the marker without a reason.
- **Allow free-form answers at any time and at any length.** Welcome answers outside the choices, partial adoption, and conditional answers such as "A, except when X"; treat them directly as decisions.
- **If a selected option requires drill-down, present another choice set later.** When a selection creates new decision points or boundary conditions, add them to the question candidate pool and place them on a later frontier, drilling down until the user is satisfied.
- **Settle upstream decisions first.** Decisions about scope, actors, or the authoritative source of data affect downstream behavior and edge cases, so bias the early frontiers toward upstream decisions.
- **If a conflict with a recorded decision is detected, reopen the affected decision point and confirm it first in the next round.** Whether the conflict comes from a user answer, investigation, or rescan, do not silently overwrite the intent. Perform the following in the same operation:
  1. Return the corresponding design-tree node to unresolved.
  2. Return the same decision point in the coverage map to Partial, preserve its previous status and settled value separately as the "old settled value pending confirmation," and immediately recalculate the aggregate category status.
  3. Say, in one line, "A conflict with a recorded decision was detected; I will confirm it first in the next round." If a user answer triggered the conflict, hold that answer until the conflict is settled.
  4. Add a follow-up question asking whether to keep the old decision or adopt the new information, and make it the first candidate for the next round.
  5. Until the conflict is settled, treat the affected point as an unresolved prerequisite and return the remaining frontier questions that depend on it to the question candidate pool. Finish the current round with only the remaining questions that can still be answered.
  6. Incorporate, save, and validate a conflict settled through user choice via Step 4A; handle an apparent conflict resolved solely by investigated facts via Step 4B. Only after completion, simultaneously settle the design-tree node, change its coverage status to Resolved, discard the preserved old value, and recalculate the aggregate category status. If it remains ambiguous, keep it Partial and continue with a follow-up.
- **Follow up on ambiguous or contradictory answers.** Do not stop until the answer is precise. You may create hypothetical scenarios to probe boundaries, but explicitly label them "hypothetical" in the question. Until the user accepts them, do not treat them as project facts, requirements, or decisions and do not incorporate them into the intent. Add each follow-up to the question candidate pool and confirm it on a later frontier.
- **Do not preview later questions.** Present only the current question. Do not reveal or list the remaining questions in the current round or any future round ahead of time.
- **Do not act on a decision until shared understanding is confirmed.** Incorporate only into intent.md; do not begin plans, tasks, or code.
- **Respect interruption signals such as "stop," "that's enough," or "let's move on for now."** Stop presenting new questions immediately and enter the "Interrupted completion path." Ending the question loop does not mean skipping the completion report.

### Interrupted completion path

If the user asks to stop after the intent has been loaded, perform these steps in order regardless of the interview stage:

1. Do not incorporate any answer that has not yet been accepted. Preserve changes that were accepted, saved, and validated before the interruption.
2. Change every remaining Partial / Missing decision point to Deferred, including the current question, unpresented candidates, candidates blocked by dependencies, unfinished factual research, and points reopened for conflict confirmation. Record the reason as "User interruption" and move corresponding design-tree nodes to terminal hold. Empty the frontier and question candidate pool, then recalculate aggregate category statuses.
3. Run the final full validation from Step 4C against the already saved intent. Do not fill unresolved content by assumption.
4. Skip the Step 5 rescan and Step 6 satisfaction gate, and proceed directly to the completion report in Step 7.
5. Issue the Step 7 completion report as "Completed by user interruption." Include the interruption point, decision points deferred with reasons, coverage table, and a recommendation on whether to proceed to planning or rerun this command later.

### Question format

Ask questions one at a time in sequence **through the interactive question tool** (AskUserQuestion; the `ask` tool on omp) — never as plain chat text that ends the turn waiting for a typed label. Restart numbering at `Q1` for every round so the number itself signals a new round. Give carried-over questions new numbers and state in one line (in chat, before the form) that they were carried over from the previous round.

Each question is ONE form:

- Form body: the question title and text (`Q1 - <Question title>: <Question text>`, may include contextual explanation and multiple paragraphs).
- Radio group with one to three choices labeled `A. <Choice>` …, each carrying its rationale; the best-supported option goes first with `**Recommended**` in its label and is preselected (`checked`).
- Free-form answers: rely on the tool's built-in free-text ("Other") input — never add your own "Free-form" option.

Vary the number of choices between one and three according to the situation. The user may accept the preselected recommendation or pick any other choice. Accept "yes" only when its meaning is unambiguous in the current question. If the user says "skip" or "defer," carry the question into a later round and renumber it there. Also treat free-form text that addresses a question other than the one currently presented—such as an advance answer to a later question or an explicit revision to a settled decision—as a decision, and incorporate it through Step 4A just like the answer to the current question. Recalculate the frontier only at the end of the round. Numbers are for reference within a round and are not recorded in intent.md; reference the affected intent section in Step 4A. When referring to a question from an earlier round, use "Round n, Qk (<question title or summary>)" and always restate the question content because the number alone is not memorable.

## Workflow

### Step 1. Ambiguity scan

Read the entire intent.md and create an internal coverage map assigning **Clear / Partial / Missing** to every decision point within all categories in the Glossary. Initialize the map only during the first scan. When returning from Step 5, do not recreate the map or reset every point to these three statuses; follow the reconciliation rules in Step 5. Do not assign a status directly to a category. Derive aggregate category status from per-point statuses.

Create a question candidate from every Partial / Missing decision point and collect them in the **question candidate pool**. Exclude only matters that "have no material effect on implementation or validation strategy" or "are appropriately deferred to the plan phase (retain them in an internal note)." Facts whose answers can be established are investigated and removed in Step 2, not excluded here. **Do not limit the number of questions.**

Do not leave an excluded point as Partial / Missing. Immediately change it in the coverage map to **Outstanding** or **Deferred** according to the Glossary's status definitions, then recalculate its aggregate category status. Step 5's completion condition cannot be reached until every point has a final status.

### Step 2. Fact gate and frontier calculation

Whenever candidates are added to the question candidate pool, apply the **fact gate** below before calculating the frontier to all candidates that have not yet passed it and all candidates whose premises changed because a dependency was settled or for another reason. This applies not only to candidates created by the initial Step 1 scan, but also to follow-ups, drill-downs, decision-derived checks, and rescans.

1. Classify the candidate's answer as either "a fact that investigation can establish" or "a decision the user must make as project policy."
2. Investigate factual candidates yourself in the codebase, project documents, and existing intents. Remove candidates whose answers are established from the question candidate pool. If the investigated fact resolves ambiguous text in the intent, edit only the main intent through **Step 4B**, then change the corresponding point to Resolved after incorporation and validation.
3. Keep a candidate whose factual investigation depends on an unresolved decision or cannot finish during the current round in the pool as "awaiting research." Do not add it to the frontier or turn it into a user question. Reapply the fact gate after its dependency is settled or the research is complete.
4. Reclassify a candidate as a decision only if, after exhausting available sources, it becomes clear that new project policy or requirements must be chosen. If a factual answer exists externally but simply cannot be obtained, do not treat it as a decision. Mark it Outstanding if it has no impact on implementation or validation strategy; otherwise mark it Deferred and record why it could not be investigated.

Reapply the same impact threshold used in Step 1 to every candidate that remains a decision after passing the fact gate. Remove any candidate whose answer, regardless of the outcome, would not change implementation, data model, task breakdown, test design, UX behavior, operations, or compliance validation. Change the corresponding point to Outstanding or Deferred and recalculate aggregate category status.

Associate each remaining decision candidate with the design-tree node it will settle. Move candidates with **no unresolved prerequisites** from the pool to the frontier, leaving all others in the pool. Sort the frontier by impact × uncertainty and number it according to the Question format.

### Step 3. Round loop

Treat the current frontier as one round and proceed with one question and one answer at a time:

1. At the start of a round, announce `Round n (m questions)` in one line. If a round starts with confirmation of a conflict detected in the previous round, include that fact in the announcement, for example: `Round n (m questions) — Starting with confirmation of a conflict with a recorded decision.` Do not preview the question list.
2. Following the Question format, ask only the first question in the round through the interactive question tool and wait for its submitted answer. The presentation order is the ordering from Step 2, and numbering begins with Q1 in that order.
3. When the answer arrives, incorporate and save each settled decision via Step 4A, change the corresponding point to Resolved, and only then present the next question. If an answer remains ambiguous or contradictory, create a follow-up in the candidate pool for a later frontier; do not insert it into the current round. State in one line that it was held and why before moving to the next question. Carry skipped or deferred questions into a later round and renumber them there. If an answer conflicts with a recorded decision, hold it according to the interview rule for conflicts and put the confirmation follow-up first in the next round.
4. If an existing answer already settles a later question in the round, do not present it; say in one line that it was incorporated as answered based on the existing answer. If the answer invalidates the premise of a later question, immediately apply the Design tree non-applicability rules, change the corresponding point to Resolved, then say in one line that the parent decision made it inapplicable.
5. After the round's questions are exhausted, perform **round-end processing**: report `Round n complete — x settled, y carried over` in one line, run the **decision-derived check**, recalculate the design tree, return to Step 2, and recalculate the next frontier. During the decision-derived check, compare every decision settled in the round with investigated facts about its applicable scope—target types, differences by screen, list/detail/history views, field composition, required/optional status, and so on—and add any overlooked inconsistency or boundary condition to the candidate pool.

After each round—or if the frontier was empty during the initial Step 2—evaluate the following **Step 5 entry gate** from top to bottom:

1. If the frontier contains a candidate, proceed to the next round in Step 3.
2. If factual research remains unfinished, complete it without blocking other askable questions, then reapply the Step 2 fact gate to the result. If research is impossible, terminally classify it as Outstanding / Deferred under the Step 2 rules. Do not proceed to Step 5.
3. If blocked candidates depend on unsettled parent points, trace the dependency of every candidate toward the root, handle them as follows, then return to Step 2. Do not proceed to Step 5.
   - If no candidate in the question candidate pool corresponds to an in-progress parent point, restore a parent candidate from that Partial / Missing point.
   - If the parent is Clear / Resolved but the child remains blocked, reassess applicability. Make applicable children candidates for the next frontier and apply the Design tree non-applicability rules to inapplicable children.
   - If the parent is Deferred, terminally hold as Deferred, with reasons, all descendants that cannot be settled without it. If the parent is Outstanding but has descendants that affect implementation or validation strategy, reopen the parent as Partial and restore its candidate. If the descendants also have no material impact, terminally hold them as Outstanding.
   - If a self-dependency or circular dependency is detected, rebuild the branches because the dependency graph is wrong. If investigated facts alone cannot establish an order, reposition the most upstream decision as a root candidate with no dependency. Do not rescan while retaining a cycle.
   - After changing statuses, recalculate the design tree and aggregate category statuses.
4. Proceed to Step 5 **only when the question candidate pool is empty, no factual research or blocked candidates remain, and every decision point is Clear / Resolved / Outstanding / Deferred**. If these conditions are not met and no actionable candidate can be restored, terminally classify the remaining in-progress points as Deferred with reasons, then evaluate this gate again.

### Step 4. Incorporation procedure: update intent.md immediately

Step 4 does not run sequentially after Step 3. Invoke Step 4A from Step 3 whenever a user answer is settled, and invoke Step 4B from Step 2 whenever an investigated fact resolves ambiguity. Never mix the two paths.

#### Step 4A. Incorporate a user answer

1. Do not write a `## Clarifications` Q&A history — clarify no longer keeps one, and this command must not reintroduce it. The accepted answer is recorded only by integrating it into the affected intent sections.
2. Incorporate the settled decision into the main intent according to "Step 4C. Shared incorporation and validation rules."
3. If one answer contains multiple decisions, incorporate, save, and validate each decision separately.
4. After each decision has been saved and validated successfully, change its point to Resolved and recalculate aggregate category status.

#### Step 4B. Incorporate a fact established by investigation

1. Incorporate only facts verified from the codebase, project documents, or existing intents into the main intent according to "Step 4C. Shared incorporation and validation rules." Never incorporate assumptions or hypothetical scenarios as facts.
2. Incorporate, save, and validate each verified fact separately.
3. After it has been saved and validated successfully, change the point resolved by that fact to Resolved and recalculate aggregate category status.

#### Step 4C. Shared incorporation and validation rules

1. Incorporate content into the best section:
   - Functional ambiguity → Functional Requirements
   - Actor or action distinctions → User Stories / Actors
   - **Acceptance Scenarios / Edge Cases**: replace an overturned scenario's text in place, keeping its existing `E#` ID — never append contradictory alternatives, never renumber or reuse IDs; only genuinely new scenarios take the next unused `E#`. After any scenario change, re-run the scenario quality tests `SQ1–SQ4` (defined in `/che-intend`) and fix failures before saving.
   - Data shape → Data Model, preserving the existing field order and keeping constraints concise
   - Non-functional requirement → measurable form under Success Criteria; convert vague adjectives into metrics
   - Edge case → Edge Cases / Error Handling
   - Terminology → normalize to the canonical term throughout the intent; register new domain terms in the matching 域节 of the resolved `CONTEXT_FILE`; `docs/GLOSSARY.md`, when present, is read-only legacy and must not be modified; if needed, note `(formerly "X")` once
2. If new content invalidates older ambiguous text, **replace** it rather than appending a duplicate. Leave no conflicting obsolete text.
3. **Save intent.md after every incorporation.** Do not reorder unrelated sections or alter their heading hierarchy. Keep additions minimal and testable.
4. **Validate after every save**, and run one final full pass after the last round:
   - Ensure no ambiguous text or placeholder that the incorporation should resolve remains.
   - Ensure no invalidated option or conflicting obsolete text remains.
   - Ensure scenario `E#` IDs are stable (pre-existing IDs kept, no duplicates), and changed scenarios re-pass `SQ1–SQ4`.
   - Ensure Markdown structure is valid. No new top-level sections are added — integration happens inside existing sections only.
   - Ensure canonical terminology is consistent across every updated section.

### Step 5. Rescan loop

Only after passing the Step 5 entry gate in Step 3, **repeat the Step 1 detection scan against the updated intent.md**, because answers can expose new ambiguities and derived decision points. Rescan **as strictly as the initial run and as though reading the updated intent for the first time**, but do not reset point statuses. Reconcile differences into the existing coverage map in this order:

1. Preserve semantic identity, current status, settled result or hold rationale, and dependencies for every point from before the rescan.
2. Match every detected point to existing points by semantic identity. Treat different wording as the same point when it has the same decision target and applicable scope; do not recreate it as new.
3. Preserve status and rationale for existing Clear / Resolved / Outstanding / Deferred points when the updated intent supports the recorded result and introduces no new scope, boundary condition, or conflict. If a new conflict is detected, do not silently overwrite the recorded final status; send it to the conflict-confirmation flow in "If a conflict with a recorded decision is detected."
4. Classify only genuinely new points with no existing match as Clear / Partial / Missing, and create candidates from new Partial / Missing points. If an existing point is no longer present in the main text, do not delete it automatically: apply the Design tree non-applicability rules if a parent decision made it inapplicable; otherwise treat it as a conflict candidate.
5. Recalculate aggregate category statuses after reconciling the differences.

The acceptance criterion is: "Immediately rerunning this command would produce no new question capable of changing a decision." If new Partial / Missing points appear, the candidate pool is replenished and askable questions emerge, so return to Steps 2–4 for new rounds. Repeat until rescanning produces no new askable question and every point is Clear / Resolved / Outstanding / Deferred.

Avoid an interview that never ends because each rescan continually creates questions from minor details. Maintain strict detection while **raising the threshold for turning findings into questions in stages**.

Check candidates generated by rescanning for semantic duplicates. If a candidate is semantically identical to a point already assigned a final status of Resolved / Outstanding / Deferred, would converge to the same decision, and introduces no new scope, boundary condition, or conflict, do not add it. Treat mere rewordings as duplicates.

> **Threshold definition** — The standard for what an answer must be capable of changing before a candidate becomes a question. Use these two stages:
>
> - **Initial scan through first rescan** — Use the same gate as Step 2. Ask about any point whose answer could change implementation, data model, task breakdown, test design, UX behavior, operations, or compliance validation.
> - **Second and subsequent rescans** — Ask only about points whose answer would change the decision or implementation branch, meaning different choices lead to different designs or implementations. Settle minor points below this threshold—wording details or clarifications that produce the same implementation regardless of answer—as Outstanding, and list them at the Step 6 satisfaction gate. The user can reopen them with option 2.

### Step 6. Satisfaction gate

Once every point is Clear / Resolved / Outstanding / Deferred, present aggregate category statuses, a per-point summary of Outstanding / Deferred items, and the sections changed in this run. Then use **the interactive question tool (AskUserQuestion; the `ask` tool on omp) to present the three choices as a form and confirm satisfaction — never plain-text output that pauses the session for input**. Do not wait for a free-form "OK." Use this fixed confirmation format every time **at this satisfaction gate only**; it does not apply to Step 3 rounds, which use the question format from the interview discipline.

Always offer these three choices and explain the recommendation:

1. **Finish and proceed** — `**Recommended**`, because every point has a final status and no unresolved question remains
2. **Explore an area further** — Ask for the area and specific concern, change the corresponding point (or a new point if necessary) to Partial, add it to the candidate pool, and return to Step 2
3. **Concerns remain, but stop here** — Ask for the area and specific points, then follow the Interrupted completion path from step 2 onward, recording each identified point as Deferred before continuing with Step 7

If the user selects 1, proceed to Step 7.

If the user selects 2, ask a confirmation question through the interactive question tool (text input) requesting a free-form description of the area and concern. After confirming the response, perform option 2 above: make the relevant point Partial, add it to the candidate pool, recalculate aggregate category status, and return to Step 2.

Also accept free-form answers outside the choices, such as directly identifying an additional point, and treat them like option 2 or 3 according to their content.

### Step 7. Completion report

Report:

- Completion type (normal / user interruption). For an interruption, include where it occurred and that no post-interruption question or answer was incorporated.
- Number of rounds and total questions; optionally include a per-round breakdown.
- Path to the updated intent and the sections changed.
- Coverage table: show every category's aggregate status as **Resolved** / **Clear** / **Deferred** / **Outstanding**, with a per-point status breakdown for each category. Do not proceed to the completion report if even one Partial / Missing point remains.
- If Outstanding / Deferred items remain, recommend whether to proceed to `/che-design` / `/che-plan` or rerun this command later.
- **Pack fork (ncw), port on upstream upgrade** — after the report body, close with this fixed ending sequence, nothing after it:
  1. **PingCode push confirmation (before any next-step hint)**: `.che/pingcode-config.yml` exists (PingCode push enabled) → ask via the **AskUserQuestion tool** (never plain-text output that pauses the session for input) with two options, each carrying a one-line description — 「现在推送」（**推荐**）— 把定稿的 spec 推送为 PingCode 需求树卡片 / 「暂不推送」— 不阻塞交接，之后可随时手动补建. The question names the action, never a skill/command. On push, execute the `/che-pingcode-specstoissues` flow in this session immediately (agent runs it itself; never tell the user to run it), then continue to step 2 after it finishes. On skip, or when the config is absent, fall through to step 2 silently.
  2. Judge UI presence from the intent itself — scan User Stories, In scope, and Acceptance Scenarios for any user-visible interface interaction (pages, forms, components, visualization, frontend behavior); when uncertain, treat as UI. Then end with exactly ONE of the following next-step hints, rendered verbatim:
     UI 存在 →
     主流程:
     - /che-design（本特性含 UI，先出设计明细 design-tasks.md，再进 plan）
     无 UI →
     主流程:
     - /che-plan（无 UI，交接门禁通过后直接出实现计划）

## Behavior rules

- This workflow is expected to finish **before** `che-plan`. If the user explicitly skips it and proceeds, comply after warning that the risk of downstream rework will increase.
- If no significant ambiguity exists, report "No critical ambiguities detected," provide an aggregate category summary showing all points as Clear, and proceed to the Step 6 satisfaction gate. Do not invent questions.
- Do not ask speculative questions about the technology stack unless they block functional clarification.
- This command may modify only intent.md. Do not modify plans, tasks, code, or any other file. Never write a `## Clarifications` Q&A history.

## Done When

- [ ] Ambiguities in the intent have been identified, and settled answers and investigated facts have been incorporated and saved in intent.md through Step 4A / 4B respectively, with the final Step 4C validation pass complete.
- [ ] The question candidate pool is empty, with no askable questions, unfinished factual research, or blocked candidates depending on unsettled parents. No question rests on an assumed premise, and no awaiting research or dependency cycle is abandoned. On interruption, every point corresponding to remaining questions and research is explicitly Deferred.
- [ ] Design-tree node statuses match corresponding coverage statuses. No working-unresolved node retains a terminal status, and all unresolved nodes are terminally held upon interruption.
- [ ] Current parent decisions and the applicability of all descendants agree. No child that became applicable again retains an obsolete non-applicable or parent-dependent terminal rationale.
- [ ] Every decision point has reached one of the final statuses—Clear / Resolved / Outstanding / Deferred—and aggregate category statuses have been recalculated.
- [ ] User satisfaction is explicit, except upon interruption.
- [ ] No `## Clarifications` Q&A history was written; scenario `E#` IDs stayed stable, and changed scenarios re-pass `SQ1–SQ4`.
- [ ] A completion report has been issued with rounds, question count, changed sections, and a coverage table containing aggregate category statuses and per-point breakdowns.

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：按 intent 判定 UI 需求——涉 UI → `/che-design`（先出设计明细再进 plan）；无 UI → `/che-plan`（交接门禁通过后）
- **推送确认（PingCode，先于主流程提示）**：`.che/pingcode-config.yml` 在位（已开启推送）→ 经 AskUserQuestion 两选项确认（「现在推送」/「暂不推送」，问句只说动作、不出现技能名）；选推送 → 本会话直接执行 `/che-pingcode-specstoissues` 建卡流程并登记 `specs/pingcode-mapping.json`，推送完成后才提示主流程；选不推送或未配置 → 静默跳过，不阻塞交接，后续可随时手动补建登记
- **条件**：
  - 追问结论已明确
  - 追问结论已回写 intent 并即时校验（Step 4A / 4B 落盘 + Step 4C 终验全过）
  - 交接门禁：intent 章节齐备；建卡可选——config 在位时 `specs/pingcode-mapping.json` 须已登记，未配置或选择不建卡不阻塞
