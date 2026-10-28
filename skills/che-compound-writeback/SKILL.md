---
name: che-compound-writeback
description: 经验沉淀：intentguard PASS 后把本次特性的新经验写回 compound store（docs/corrections/、docs/patterns/），耐久纠偏升格为 ADR 进 docs/adr/。当用户说「writeback 本次经验」「把这次的教训沉淀下来」时使用——即使用户没提命令名，只要是特性完成后的经验回写也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Writeback to Compound Store

After `/che-compound-intentguard` returns PASS (or REVIEW NEEDED that a human has cleared), you persist the learnings of this feature back into the compound store. This is what makes the system compound — every feature contributes to the next.

---

## What to do

**1. Verify intent guard passed.**

Read `{task_dir}/intentguard.md` (`{task_dir}` = the task directory `che paths` reports as `FEATURE_DIR`). If verdict is:
- **BLOCKED**: refuse — *"Intent guard verdict is BLOCKED. Resolve violations before writeback."*
- **REVIEW NEEDED**: ask the user — *"Verdict is REVIEW NEEDED. Has a human reviewed the {N} items? [yes / no]"* Refuse if no.
- **PASS**: proceed.

**2. Scan the session for writeback candidates:**

**ADR candidates** — non-obvious architectural choices made during `/che-compound-intent` or `/che-compound-implement`:
- Library/framework selection that locks in a pattern
- Storage / persistence approach decisions
- API contract decisions
- Cross-cutting decisions (auth, error handling, logging, theming) that affect future features

**Correction candidates** — moments where the user pushed back on the agent during `/che-compound-implement`:
- *"No, don't use X, use Y because Z"*
- *"Wrong — the convention here is W"*
- Repeated agent mistakes in the same session

**Pattern candidates** — approaches used that proved out:
- A technique used to satisfy a constraint that could apply to future features
- A test pattern that worked well
- A refactor approach that could be templated

**3. Draft proposed files** for each candidate.

**ADR body template** — the record itself is allocated by the adrkit scaffold entry point in step 5; draft the body into the scaffolded sections:

- **Context** — {what the situation was, what forces were at play}
- **Decision** — {what was decided}
- **Options considered** — {the alternatives actually weighed, and why each lost; trim if none were genuinely weighed}
- **Consequences** — {what this implies for future work — positive and negative}

Append one final section the scaffold does not carry:

- **Rule for AI** — {a one-line rule that future agents should follow because of this ADR}

**Correction template:**

The YAML frontmatter keeps corrections structured and compatible with upstream active-corrections tooling. Include all four keys (`paths`, `match`, `rule`, `context`) to record the scope, forbidden pattern, directive, and background.

```markdown
---
slug: {YYYY-MM-DD}-{slug}
paths:
  - "{glob of the files this rule applies to, e.g. **/*.ts}"
match: "{extended regex matching the forbidden pattern — POSIX ERE only; test with grep -E first}"
rule: "{one-line directive future agents should follow}"
context: "{one line of background: the past mistake and why the rule exists}"
---

# Correction: {YYYY-MM-DD}-{slug}

## What happened
{agent action and user correction, verbatim if possible}

## Derived rule
{one-line rule to avoid repeat}

## Related ADRs
{any ADRs that codify this correction long-term}
```

**Pattern template:**
```markdown
# Pattern: {slug}

## When to use
{trigger conditions — what kind of feature or constraint calls for this pattern}

## How
{the approach, with a small code skeleton if relevant}

## Why this works here
{one-line rationale, often references an ADR}

## Examples in this repo
- `{task_dir}/intent.md` (feature {slug})
- ...
```

**4. Present drafts to user.**

Show each draft and ask (use AskUserQuestion per draft):
- **accept** — write the file as drafted
- **edit** — open for inline edit, then write
- **reject** — drop this draft
- **defer** — save to a scratch file `docs/compound/_drafts/` for later review

**5. Write accepted files.** ADRs go to the shared adrkit corpus at `docs/adr/`; corrections and patterns go to `docs/corrections/` and `docs/patterns/`.

- For ADRs: allocate each accepted ADR through the scaffold entry point `.agents/skills/che-adr-draft/scripts/scaffold.sh <title>` (global install: `~/.agents/skills/che-adr-draft/scripts/scaffold.sh`). It writes a schema-valid draft with the next free corpus id into `docs/adr/` (override with `ADRKIT_DIR`), printing `{ "id", "path" }`; write the drafted body into that file and run `.agents/skills/che-adr-draft/scripts/adr.sh lint` afterwards (global install: `~/.agents/skills/che-adr-draft/scripts/adr.sh lint`). Status stays `draft` — ratification is a human act, as in `/che-adr-draft`. Never hand-number and never edit an existing ADR; a changed decision gets a new record that supersedes the old one.
- For corrections: write `docs/corrections/{YYYY-MM-DD}-{slug}.md`, prefixing the filename with the date. Always include the `paths:`/`match:`/`rule:`/`context:` frontmatter from the template above so the correction is enforceable — only fall back to a frontmatter-less body if the user explicitly wants a context-only note.
- For patterns: write `docs/patterns/{slug}.md`, using the slug only as the filename.

**6. Update intent doc status.**

In the corresponding `{task_dir}/intent.md`, change the frontmatter:
```yaml
status: active   →   status: completed
completed: {YYYY-MM-DD}
```

**7. Summary**:

*"Writeback complete. {N} ADRs committed to the adrkit corpus (`docs/adr/`), {N} corrections committed to `docs/corrections/`, and {N} patterns committed to `docs/patterns/`. Intent `{slug}` marked completed. Corpus size: {N} ADRs; store size: {N} corrections / {N} patterns."*

---

## Tool choices

- **Read** for scanning session history and intent guard verdict
- **Bash** for the adrkit scaffold entry point and `.agents/skills/che-adr-draft/scripts/adr.sh lint`
- **Write** for new compound files
- **Edit** for updating intent doc status (frontmatter only)
- **AskUserQuestion** for per-draft accept/edit/reject/defer

---

## What you do NOT do

- **Auto-create ADRs without user approval** — every ADR draft must be approved
- **Auto-elevate patterns** — patterns require explicit user approval; corrections can auto-capture without approval if the correction was made by the user mid-session
- **Modify existing ADRs** — if a decision changes, create a new ADR in the adrkit corpus (`docs/adr/`) that supersedes the old one (don't edit the old; the historical record matters)
- **Write back if intent guard is BLOCKED** — failure modes don't contribute to compound learning until resolved

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：无 —— 链终点；产物落 `docs/adr/`、`docs/corrections/`、`docs/patterns/`
- **条件**：仅在 intentguard PASS（或 REVIEW NEEDED 经人工确认）后执行；BLOCKED 必须拒绝