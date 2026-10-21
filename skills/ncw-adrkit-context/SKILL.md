---
name: ncw-adrkit-context
description: Retrieve the decisions that govern this work into context, before planning
  against them. Read-only.
---

# Adrkit Context Skill

# adrkit — governing decisions

Loads the accumulated decision record into context so the plan you are about to
write is informed by it, rather than rediscovering it at review time.

## User Input

$ARGUMENTS

## Steps

1. Treat any arguments as repo-relative paths the work will touch. Passing the
   paths you actually intend to change gives a far sharper answer than passing
   none.
2. Run the pack-bundled script with those paths as arguments — project install:
   `.agents/skills/ncw-adrkit-context/scripts/context.sh`; global install:
   `~/.agents/skills/ncw-adrkit-context/scripts/context.sh`.
   - **With paths**, it emits a `CheckOutcome` JSON document: the decisions
     governing each path, plus findings for any ADR among them.
   - **With no paths**, it emits the ARB queue as JSON: every proposed decision
     awaiting review, with its SLA state. That is the set of questions already
     open — planning against them as if they were settled is the mistake this
     command exists to prevent.
3. Read the result and carry it forward:
   - `governedBy` / `governing` — decisions already binding here. Follow them,
     or say plainly in the plan that you are departing from one and why.
   - `activeProposals` — not yet binding, but in flight. Note any the plan
     touches; do not silently assume they will land.
   - `history` — superseded and rejected records. This is where "we tried that"
     lives, and it is the reason not to re-propose it.
4. If the command exits non-zero, read the message on stderr. It names the
   missing thing (the adrkit CLI, a Node runtime, or the corpus at
   `ADRKIT_DIR`) rather than returning an empty result that reads as "nothing
   governs this."

## Notes

- Requires `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`, but no feature
  resolver. If unavailable, install it with `npm install -g @adrkit/cli@0.20.0`
  and retry.
- Read-only. This command never writes to `docs/adr/**` or anything else.
- The corpus directory defaults to `docs/adr/` and is overridable with
  `ADRKIT_DIR`. Since the ADR-unification cutover this is the project's only
  ADR corpus: ncw-speckit-grill-with-docs and ncw-compound-writeback allocate
  their records here through the scaffold entry point at
  `.agents/skills/ncw-adrkit-draft/scripts/scaffold.sh`, so this
  command sees every ADR written anywhere in the workflow.
- An exit code of 1 means the corpus itself has error-severity findings — the
  report is still complete and still worth reading.
