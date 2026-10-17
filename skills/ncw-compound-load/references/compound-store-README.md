# Compound Store

This directory is the **committed memory** of the codebase — the layer that makes spec-kit-compound *compound*.

Every feature contributes back via `/ncw-compound-writeback`. Every feature inherits the accumulated store via `/ncw-compound-load`. Over time, the store outweighs any static constitution document you could write upfront.

---

## Structure

```
docs/compound/
├── corrections/   ← AI correction notes (past mistakes and derived rules)
└── patterns/      ← Approved patterns (proven approaches for this codebase)
```

ADR records live in the shared adrkit corpus at `docs/adr/` — same numbering and schema as `/ncw-adrkit-draft`, validated by `adr lint`. They are allocated by the scaffold entry point in `ncw-adrkit-draft/scripts/`, not by this store.

### ADRs live in the adrkit corpus (`docs/adr/`)

Architecture decisions made during real features are allocated by the adrkit scaffold entry point (`ncw-adrkit-draft/scripts/scaffold.sh`), which owns the numeric id and the schema frontmatter (`status`, `affects`, `relatesTo`, ...). Bodies follow the writeback shape: Context → Decision → Options considered → Consequences → **Rule for AI** (one-line directive for future agents).

The "Rule for AI" line is what `/ncw-compound-load` injects into context, together with the rest of the corpus. Future agents are instructed not to re-debate these decisions, and `/ncw-adrkit-check` validates plans against the corpus at plan time.

### `corrections/`

Captured during `/ncw-speckit-implement` when the user pushes back on the agent. Each file:

- Date-prefixed slug: `2026-06-02-no-css-filters.md`
- "What happened" — the exchange, verbatim if possible
- "Derived rule" — the one-line lesson to avoid repeat

Corrections auto-capture without user approval (because the correction was already made by the user). They are reviewed at writeback time and can be promoted to ADRs if they describe a durable principle rather than a one-off.

### `patterns/`

Approaches that worked well enough to template for future features. Each file:

- Slug only: `theme-resolution-head-script.md`
- "When to use" — trigger conditions
- "How" — the approach, with a small code skeleton if relevant
- "Why this works here" — rationale, often references an ADR
- "Examples in this repo" — feature slugs that used the pattern

Patterns require explicit user approval at writeback; they are the most opinionated artifact in the store.

---

## Lifecycle

```
/ncw-compound-load                  →  reads the adrkit corpus + this store, injects into agent context
                                            (at the start of every feature)

[feature work happens — intent, plan, implement, intentguard]

/ncw-compound-writeback             →  drafts new corrections/patterns from the session
                                            (and elevates durable corrections into ADRs in the
                                            adrkit corpus); user approves each, accepted ones land
                                            in place (at the end of every feature, after
                                            intentguard PASS)
```

---

## Why this beats Claude Code's default memory

Claude Code's memory files (`~/.claude/...`) are stored **locally**. They die when you:

- Switch machines
- Onboard a new teammate
- Start a fresh session after `--clear`
- Wipe your laptop

The compound store is **committed to the repo**. It survives all of the above and is shared across the team. It is treated as a first-class repo artifact, the same way ADRs are — because that is exactly what it is.

---

## Bootstrapping

This directory is created automatically by `/ncw-compound-load` on first invocation in a project. You do not need to pre-populate it. The store grows naturally from the first feature onward.

The first feature contributes 0–2 ADRs (in the corpus) at most. By feature 10, expect a non-trivial set. By feature 50, the store contains more applied wisdom than any constitution doc you would have written upfront.
