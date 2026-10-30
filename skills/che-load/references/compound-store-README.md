# Compound Store

This compound store is the **committed memory** of the codebase — the layer that makes the workflow *compound*.

Every feature contributes back via `/che-writeback`. Every feature inherits the accumulated store via `/che-load`. Over time, the store outweighs any static constitution document you could write upfront.

---

## Structure

```
docs/
├── adr/              ← ADR records (shared adrkit corpus)
├── corrections/      ← AI correction notes (past mistakes and derived rules)
├── patterns/         ← Approved patterns (proven approaches for this codebase)
└── compound/
    └── README.md     ← This store guide
```

ADR records live in the shared adrkit corpus at `docs/adr/` — same numbering and schema as `/che-adr-draft`, validated by `.agents/skills/che-adr-draft/scripts/adr.sh lint`. They are allocated by the scaffold entry point in `che-adr-draft/scripts/`, never hand-numbered.

### ADRs live in the adrkit corpus (`docs/adr/`)

Architecture decisions made during real features are allocated by the adrkit scaffold entry point (`che-adr-draft/scripts/scaffold.sh`), which owns the numeric id and the schema frontmatter (`status`, `affects`, `relatesTo`, ...). Bodies follow the writeback shape: Context → Decision → Options considered → Consequences → **Rule for AI** (one-line directive for future agents).

The "Rule for AI" line is what `/che-load` injects into context, together with the rest of the corpus. Future agents are instructed not to re-debate these decisions, and the planverify mechanical layer validates plans against the corpus at plan time (via the shared `che-adr-check/scripts/check.sh`; `/che-adr-check` itself remains an on-demand manual diagnostic).

### `docs/corrections/`

Captured during `/che-implement` when the user pushes back on the agent. Each file:

- Date-prefixed slug: `2026-06-02-no-css-filters.md`
- "What happened" — the exchange, verbatim if possible
- "Derived rule" — the one-line lesson to avoid repeat

Corrections auto-capture without user approval (because the correction was already made by the user). They are reviewed at writeback time and can be promoted to ADRs if they describe a durable principle rather than a one-off.

### `docs/patterns/`

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
/che-load                  →  reads the adrkit corpus + this store, injects into agent context
                                            (at the start of every feature)

[feature work happens — intend, plan, implement, intentverify]

/che-writeback             →  drafts new corrections/patterns from the session
                                            (and elevates durable corrections into ADRs in the
                                            adrkit corpus); user approves each, accepted ones land
                                            in place (at the end of every feature, after
                                            intentverify PASS)
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

This scaffold is created automatically by `/che-load` on first invocation in a project, with this README at `docs/compound/README.md` and artifact directories at `docs/corrections/` and `docs/patterns/`. You do not need to pre-populate it. The store grows naturally from the first feature onward.

The first feature contributes 0–2 ADRs (in the corpus) at most. By feature 10, expect a non-trivial set. By feature 50, the store contains more applied wisdom than any constitution doc you would have written upfront.
