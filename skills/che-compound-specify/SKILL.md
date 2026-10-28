---
name: che-compound-specify
description: 特性规格生成：从自然语言需求创建/更新 spec.md（含 User Story 章节与优先级），spec 落 `che paths` 解析的任务目录（FEATURE_DIR），词汇表落 docs/GLOSSARY.md；前置门禁 require-intent 放行后执行。当用户运行或提到 /che-compound-specify，或说「出 spec」「写特性需求」「把这个需求转成规格」时使用——即使用户没提命令名，只要是特性规格的创建或更新也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

The text the user typed after `/che-compound-specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Resolve the short name from the single source of truth** — the feature slug, never invent an independent one:

   > Pack fork (ncw), port on upstream upgrade: upstream generates this short name from the feature description; the pack aligns it with the task directory slug so one slug flows through the whole chain.

   - Run `che paths --session "$CHE_SESSION_ID"` from the repository root (bare `che paths` when no session id is available; requires the external `che` CLI on PATH — `@newchiwan/che`, Node ≥ 22.18; install with `npm install -g @newchiwan/che@latest`):
     - **Task resolved** (the command prints a directory): the short name is the `SLUG` it reports — the task directory's slug, basename with the leading prefix (`NNN-` number, or a PingCode card identifier after push) stripped (e.g. `specs/001-user-auth` → `user-auth`). Reuse it verbatim; do NOT regenerate a different name.
     - **No task resolved** (exit non-zero, or it reports an ambiguous candidate list): ask the user which task this feature corresponds to, and use that task's slug. None → the require-intent gate should have blocked before specify; as a defensive fallback only, generate a 2-4 word short name from the feature description (action-noun format when possible, e.g. "add-user-auth", "fix-payment-bug"; preserve technical terms and acronyms; concise but descriptive):
         - "I want to add user authentication" → "user-auth"
         - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
         - "Create a dashboard for analytics" → "analytics-dashboard"
         - "Fix payment processing timeout bug" → "fix-payment-timeout"

2. **Branch creation**:

   This skill does not create or switch git branches. The spec directory name is independent of any git branch name; if the user asks for a branch, create or switch to it using their requested name before continuing.

3. **Resolve the spec feature directory**:

   The feature directory is the task directory created at intent time — it already exists and holds every artifact of this task, spec included.

   **Resolution**: reuse the `che paths` invocation from step 1 and take its `FEATURE_DIR` as `CHE_FEATURE_DIRECTORY`. The CLI resolves it as an explicit `--feature <slug>` > `CHE_FEATURE_DIRECTORY` env > session binding > the single task in `specs/`; never invent or auto-generate a new directory. The short name from step 1 is that directory's `SLUG`.

   **Create the spec file** (the task directory exists; `mkdir -p` is idempotent):
   - Record the runs timeline start: `che state start specify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available)
   - `mkdir -p CHE_FEATURE_DIRECTORY`
   - Use this skill's own `references/spec-template.md` as the spec template — no project scaffolding and no override/preset/extension resolution stack
   - Copy the resolved `spec-template` file to `CHE_FEATURE_DIRECTORY/spec.md` as the starting point
   - Set `SPEC_FILE` to `CHE_FEATURE_DIRECTORY/spec.md`

   **IMPORTANT**:
   - You must only create one feature per `/che-compound-specify` invocation
   - The spec directory name and the git branch name are independent — they may be the same but that is the user's choice
   - The spec directory and file are always created by this command

4. Load the resolved active `spec-template` file to understand required sections.

5. **IF EXISTS**: Load `docs/constitution/constitution.md` for project principles and governance constraints.

6. **Ensure the unified-language glossary exists**: The spec template's mandatory 统一语言 section references the central glossary `docs/GLOSSARY.md`. If that file is missing, scaffold it before writing the spec: create `docs/` if needed and write a minimal glossary there — one section per project domain (域节) plus a 「使用规则」 section stating that spec terms must be registered in the matching 域节 and that definitions live in the glossary, not in individual specs. Never overwrite an existing glossary. When writing the spec (step 8), register any new domain concepts introduced by this feature into the matching 域节, as the template requires.

7. Follow this execution flow:
    1. Parse user description from arguments
       If empty: ERROR "No feature description provided"
    2. Extract key concepts from description
       Identify: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if:
         - The choice significantly impacts feature scope or user experience
         - Multiple reasonable interpretations exist with different implications
         - No reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
       - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
    4. Fill User Scenarios & Testing section
       If no clear user flow: ERROR "Cannot determine user scenarios"
    5. Generate Functional Requirements
       Each requirement must be testable
       Use reasonable defaults for unspecified details (document assumptions in Assumptions section)
    6. Define Success Criteria
       Create measurable, technology-agnostic outcomes
       Include both quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion)
       Each criterion must be verifiable without implementation details
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS (spec ready for planning)

8. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.

9. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `CHE_FEATURE_DIRECTORY/checklists/requirements.md` using the checklist template structure with these validation items:

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

   b. **Run Validation Check**: Review the spec against each checklist item:
      - For each item, determine if it passes or fails
      - Document specific issues found (quote relevant spec sections)

   c. **Handle Validation Results**:

      - **If all items pass**: Mark checklist complete and proceed to the Completion Report

      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List the failing items and specific issues
        2. Update the spec to address each issue
        3. Re-run validation until all items pass (max 3 iterations)
        4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec
        2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
        3. For each clarification needed (max 3), present options to user in this format:

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

        4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
           - Use consistent spacing with pipes aligned
           - Each cell should have spaces around content: `| Content |` not `|Content|`
           - Header separator must have at least 3 dashes: `|--------|`
           - Test that the table renders correctly in markdown preview
        5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)
        6. Present all questions together before waiting for responses
        7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
        8. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
        9. Re-run validation after all clarifications are resolved

   d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status

## Completion Report

Record the runs timeline completion: `che state done specify --session "$CHE_SESSION_ID"` (omit `--session` when no session id is available). Then report completion to the user with:
- `CHE_FEATURE_DIRECTORY` — the feature directory path
- `SPEC_FILE` — the spec file path
- Checklist results summary
- Readiness for the next phase (`/che-compound-clarify` or `/che-compound-plan`)
- **Pack fork (ncw), port on upstream upgrade**: end the report with grouped next-step hints, rendered verbatim as follows (`- /cmd: [可选] what-it-does` item shape; `[可选]` tag only on optional items):
  主流程:
  - /che-compound-clarify: 澄清 spec 歧义并把结论回写 spec（≤5 问）
  - /che-compound-design: 出设计明细 design-tasks.md（涉 UI 特性必跑）
  可选:
  - /che-compound-grill-me: [可选] 无上限深度澄清，替代 clarify
  - /che-pingcode-specstoissues: [可选] 建需求树卡片并登记 specs/pingcode-mapping.json（不建则交接前必须补跑）

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT create any checklists that are embedded in the spec. That will be a separate command.

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

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

## Done When

- [ ] Specification written to `SPEC_FILE` and validated against quality checklist
- [ ] Completion reported to user with feature directory, spec file path, and checklist results

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-clarify`（或 `/che-compound-grill-me`）—— 澄清 spec 歧义
- **可选目标**：`/che-pingcode-specstoissues` —— 建需求树卡片并登记 `specs/pingcode-mapping.json`
  - 条件：`.che/pingcode-config.yml` 在位（`pingcode` CLI ≥ 0.14.0 已装并认证）
  - 回退：无 config 或用户拒绝 → 跳过；不建卡由交接门禁兜底（交接前必须补跑）
- **条件**：
  - spec.md 已写入且质量清单通过
  - 前置门禁 `/che-compound-require-intent` 必须已放行（`che require-intent` 退 0；已解析任务时还要求任务目录内 `intent.md` 存在且 slug 与 session 绑定一致）
  - 涉 UI 特性澄清后进 `/che-compound-design`，无 UI 可跳过 design
