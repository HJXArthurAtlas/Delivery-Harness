---
name: che-constitution
description: 创建或更新项目章程 docs/constitution/constitution.md，作为后续 intent/plan 的治理约束来源。两个模式按工件状态判定（与调用方无关）——实例化模式（宪法不存在时）：先讲宪法是什么维度、再讲团队基础宪法整体（references/seed-constitution.md，团队默认版随技能分发），逐条确认保留/去掉/改措辞，收集项目专属条款后落盘 1.0.0，/che-project-init 在宪法缺失时移交本模式；修订模式（宪法已在位）：既有流程，无讲解环节。当用户运行或提到 /che-constitution，或说「立章程」「初始化宪法」「修订治理原则」「建项目宪章」时使用——即使用户没提命令名，只要是项目治理原则的建立或修订也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Modes

Resolve the mode from the artifact state, not the caller — a
`/che-project-init` handoff and a direct user invocation behave identically:

- `docs/constitution/constitution.md` does **not** exist → **Instantiation
  mode** (see "Instantiation mode" below): the project has no constitution
  yet; seed from the team base with per-principle confirmation.
- It exists → **Amendment mode**: the Outline flow below, unchanged. No
  base-constitution explanation or per-principle walk-through happens here —
  amendments assume a ratified constitution.

## Scope Guard

This command's own work is limited to updating the project constitution itself. Dependent templates
and commands read the constitution at runtime and are not modified here.

- Classify every part of the user input as either constitution content or a separate,
  non-governance intent.
- If the input includes feature implementation, code generation, refactoring, building, or
  deployment requests, you **MUST NOT** execute them. Extract them as deferred intents instead.
- You **MUST NOT** create, modify, or delete application source files, feature routes,
  components, tests, deployment files, or other artifacts unrelated to the constitution
  workflow.
- If it is unclear whether an instruction is constitution content, ask for clarification before
  making changes.
- After completing the constitution update, include a `Next Actions` section for each deferred
  intent. List the original intent and suggest the appropriate follow-up command, such
  as `/che-intend`, without invoking it.
- If there are no non-governance intents, omit the `Next Actions` section.

## Outline

You are updating the project constitution at `docs/constitution/constitution.md`. The active
constitution scaffold is resolved at command time from this skill's `references/constitution-template.md`.

Follow this execution flow:

1. Run `che template constitution-template --json --references-dir .agents/skills/che-constitution/references` (global install: `~/.agents/skills/che-constitution/references`), from the repository root, and parse `TEMPLATE_CONTENT` as the active template (requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`).
   - If resolution fails (the template is missing from this skill's `references/`), stop and report the resolution error; do not continue.
   - If `docs/constitution/constitution.md` exists, load it as the source of current project-specific
     values and amendments. Preserve information that is still applicable when applying the newly
     resolved scaffold.
   - If it does not exist, use the resolved template as the initial document.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type ambiguous, propose reasoning before finalizing.

3. Draft the updated constitution content using the resolved template as the required structure:
   - Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained template slots that the project has chosen not to define yet—explicitly justify any left).
   - Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
   - Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.

4. Produce a Sync Impact Report as an HTML comment at the top of the constitution file after update.
   This report is temporary scratch material for human review of the amendment, not governance
   content; it is expected to be removed before the amended constitution file is committed.
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Follow-up TODOs if any placeholders intentionally deferred.

5. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

6. Write the completed constitution back to `docs/constitution/constitution.md` (overwrite), creating the parent directory through normal file-writing behavior when needed.

7. Output a final summary to the user with:
   - New version and bump rationale.
   - Any TODO placeholders or deferred items requiring manual follow-up.
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).
   - A `Next Actions` section for any deferred non-governance intents.

## Instantiation mode

First instantiation seeds from the team base constitution bundled with this
skill (`references/seed-constitution.md` — the team's default base
constitution, shipped and maintained with this pack). Execute these steps in order; steps 1
and 2 are mandatory explanations and MUST NOT be skipped even if the user
pushes to move fast:

1. **Explain what a constitution is**: the project's governance charter —
   the dimension it covers (long-lived, cross-feature mandatory rules:
   workflow discipline, technology red lines, collaboration conventions) and
   how it binds later intent / plan / implement work (gates and checkers read
   it).
2. **Introduce the team base** from the seed file's actual text: six Core
   Principles (subproject scope discipline, convention reuse, test-verified
   quality gates, governance artifact independence, simplicity & boring
   technology, project boundary & external API contract) plus Cross-Domain
   Invariants (security / performance & integration / toolchain / language)
   and the Governance section.
3. **Per-principle confirmation**, one question at a time (never batched):
   for each principle state what it mandates, what behavior it constrains,
   and what becomes unguarded if dropped — the seed's Rationale lines are
   the material, do not invent consequences. Ask 保留 / 去掉 / 改措辞; a
   rewording MUST keep the principle declarative and testable. Confirm the
   Cross-Domain Invariants groups the same way (per group, not per bullet —
   unless the user asks to go bullet-by-bullet).
4. **Collect project-specific additions**: explain the dimension from the
   addition angle first — what projects typically add (commit discipline,
   review gates, banned frameworks or patterns, environment conventions) —
   then ask what to add; additions may be none. Additions extend Cross-Domain
   Invariants or become new numbered principles; they MUST NOT weaken a base
   clause that was kept.
5. **Write the instantiation**: replace every `[PROJECT_NAME]` (ask the user
   for the project name or infer it from the repository), set the effective
   dates to today (YYYY-MM-DD), assemble the document from the kept (possibly
   reworded) principles plus additions, version it 1.0.0 with an Amendment
   Log entry recording provenance ("Instantiated from team base v1.1.0;
   kept / dropped / added: ..."), and write it to
   `docs/constitution/constitution.md`. The Outline flow's validation rules
   (no unexplained bracket tokens, ISO dates, declarative wording) apply
   unchanged; keep the seed's structure and heading levels. The Sync Impact
   Report is not needed for a first instantiation.

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally) but do not hard enforce with awkward breaks.
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report under deferred items.

Write only `docs/constitution/constitution.md`; do not create or modify template or seed source files.
