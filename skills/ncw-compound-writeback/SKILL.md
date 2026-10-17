---
name: ncw-compound-writeback
description: Persist new learnings (ADRs, corrections, patterns) from the just-completed feature back to the compound store. Requires intent guard PASS first.
---

# Writeback to Compound Store

After `/ncw-compound-intentguard` returns PASS (or REVIEW NEEDED that a human has cleared), you persist the learnings of this feature back into the compound store. This is what makes the system compound — every feature contributes to the next.

---

## What to do

**1. Verify intent guard passed.**

Read `docs/intents/{slug}.intentguard.md`. If verdict is:
- **BLOCKED**: refuse — *"Intent guard verdict is BLOCKED. Resolve violations before writeback."*
- **REVIEW NEEDED**: ask the user — *"Verdict is REVIEW NEEDED. Has a human reviewed the {N} items? [yes / no]"* Refuse if no.
- **PASS**: proceed.

**2. Scan the session for writeback candidates:**

**ADR candidates** — non-obvious architectural choices made during `/ncw-compound-intent` or `/ncw-speckit-implement`:
- Library/framework selection that locks in a pattern
- Storage / persistence approach decisions
- API contract decisions
- Cross-cutting decisions (auth, error handling, logging, theming) that affect future features

**Correction candidates** — moments where the user pushed back on the agent during `/ncw-speckit-implement`:
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

The YAML frontmatter is what makes the correction enforceable by the active-corrections `PreToolUse` hook — all four keys (`paths`, `match`, `rule`, `context`) are required for enforcement; a correction without frontmatter is loaded as context only and never blocks a write. See `docs/compound/CORRECTIONS-SCHEMA.md` for the field semantics and `match:` regex gotchas.

```markdown
---
slug: {YYYY-MM-DD}-{slug}
paths:
  - "{glob of the files this rule applies to, e.g. **/*.ts}"
match: "{extended regex matching the forbidden pattern — POSIX ERE only; test with grep -E first}"
rule: "{one-line directive the hook cites when it blocks a write}"
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
- `docs/intents/{slug}.intent.md` (feature {slug})
- ...
```

**4. Present drafts to user.**

Show each draft and ask (use AskUserQuestion per draft):
- **accept** — write the file as drafted
- **edit** — open for inline edit, then write
- **reject** — drop this draft
- **defer** — save to a scratch file `docs/compound/_drafts/` for later review

**5. Write accepted files.** ADRs go to the shared adrkit corpus; corrections and patterns stay in the compound store.

- For ADRs: allocate each accepted ADR through the scaffold entry point `.agents/skills/ncw-adrkit-draft/scripts/scaffold.sh <title>` (global install: `~/.agents/skills/ncw-adrkit-draft/scripts/scaffold.sh`). It writes a schema-valid draft with the next free corpus id into `docs/adr/` (override with `ADRKIT_DIR`), printing `{ "id", "path" }`; write the drafted body into that file and run `adr lint` afterwards. Status stays `draft` — ratification is a human act, as in `/ncw-adrkit-draft`. Never hand-number and never edit an existing ADR; a changed decision gets a new record that supersedes the old one.
- For corrections: prefix with date. Format: `{YYYY-MM-DD}-{slug}.md`. Always include the `paths:`/`match:`/`rule:`/`context:` frontmatter from the template above so the correction is enforceable — only fall back to a frontmatter-less body if the user explicitly wants a context-only note.
- For patterns: use slug only. Format: `{slug}.md`.

**6. Update intent doc status.**

In the corresponding `docs/intents/{slug}.intent.md`, change the frontmatter:
```yaml
status: active   →   status: completed
completed: {YYYY-MM-DD}
```

**7. Summary**:

*"Writeback complete. {N} ADRs committed to the adrkit corpus (`docs/adr/`), {N} corrections and {N} patterns committed to the compound store. Intent `{slug}` marked completed. Corpus size: {N} ADRs; store size: {N} corrections / {N} patterns."*

---

## Hook behavior

When invoked as an `after_implement` hook, this command runs only AFTER `/ncw-compound-intentguard` has produced a verdict. The hook is `optional: true` — the user is prompted: *"Writeback learnings from this feature? [yes / no]"*. If yes, run the full flow above. If no, skip cleanly.

---

## Tool choices

- **Read** for scanning session history and intent guard verdict
- **Bash** for the adrkit scaffold entry point and `adr lint`
- **Write** for new compound files
- **Edit** for updating intent doc status (frontmatter only)
- **AskUserQuestion** for per-draft accept/edit/reject/defer

---

## What you do NOT do

- **Auto-create ADRs without user approval** — every ADR draft must be approved
- **Auto-elevate patterns** — patterns require explicit user approval; corrections can auto-capture without approval if the correction was made by the user mid-session
- **Modify existing ADRs** — if a decision changes, create a new ADR in the adrkit corpus (`docs/adr/`) that supersedes the old one (don't edit the old; the historical record matters)
- **Write back if intent guard is BLOCKED** — failure modes don't contribute to compound learning until resolved