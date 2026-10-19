---
name: ncw-adrkit-draft
description: Draft one new ADR from the current plan artifact. Writes a single new
  record.
---

# Adrkit Draft Skill

# adrkit — draft a decision from this plan

Turns a decision the plan already made into a record that outlives it. Plans get
superseded and forgotten; the decisions inside them are what the next feature
needs and never gets.

## User Input

$ARGUMENTS

## Steps

1. Read the current plan. Identify the decision worth recording — a choice
   between real alternatives with consequences that outlast this feature. If the
   plan made no such choice, say so and stop. Not every plan contains an ADR,
   and manufacturing one is worse than not writing it.
2. Run the pack-bundled script with the decision's title as arguments —
   project install: `.agents/skills/ncw-adrkit-draft/scripts/draft.sh`; global
   install: `~/.agents/skills/ncw-adrkit-draft/scripts/draft.sh`. Write the title as the
   decision itself, in the imperative — "Adopt Postgres for the read model", not
   "Database choice".
3. The script prints `{ "id", "path" }`. It has scaffolded a schema-valid draft
   at the next free id; it has **not** written the reasoning.
4. Open that file and fill it in from the plan:
   - **Context** — the forces that made this a decision. Pull them from the
     plan; do not invent constraints the plan never stated.
   - **Decision** — what was chosen, in the plan's own terms.
   - **Options considered** — the alternatives the plan actually weighed, with
     why each lost. If the plan weighed none, record that honestly rather than
     inventing a strawman to reject.
   - **Consequences** — what gets easier, what gets harder, and what would make
     this worth revisiting.
   - Frontmatter — `affects` patterns for the paths this governs, `relatesTo`
     for records it touches, and a `review.tier` matching the blast radius.
5. Leave the status as `draft`. Ratification is a human act, and this command
   does not perform it.
6. Run `/ncw-adrkit-check` afterwards to confirm the new record is valid and
   does not conflict with an existing decision.

## Notes

- Feature resolution uses the pack-bundled
  `.agents/skills/ncw-speckit-analyze/scripts/check_prerequisites.py`; neither
  `specify init` nor `.specify/scripts/` is required. `ADRKIT_FEATURE_DIR`
  overrides feature-dir resolution.
- The adrkit 0.20.0 CLI is bundled as `scripts/adr.mjs`, with `scripts/adr.sh`
  as the cross-skill lint/migration entry point; no `@adrkit/cli` install is
  required. `ADRKIT_CLI` is an explicit opt-in override.
- This is the only command in the extension that writes, and it is deliberately
  not reachable from any hook. A plan-phase hook that created records
  unprompted would manufacture decision memory instead of recording it.
- It writes exactly one new file and never edits an existing record. If the
  target path is already taken it refuses rather than overwriting (exit 1).
- Single corpus: since the ADR-unification cutover, `docs/adr/` (or
  `$ADRKIT_DIR`) is the project's only ADR corpus. `ncw-speckit-grill-with-docs`
  and `ncw-compound-writeback` allocate their records here too, through this
  skill's `scripts/scaffold.sh` — the plan-less variant of this command's
  deterministic half (same CLI, same id allocation, no plan required). All
  writers share one numbering sequence; never hand-number.
- Migrating legacy corpus locations (records still under
  `docs/compound/adr/` or `docs/domain_knowledge/adr/`): records already in
  `docs/adr/` are canonical and need no relocation. The bundled CLI owns the
  conversion. In the commands below, `<adrkit>` means
  `.agents/skills/ncw-adrkit-draft/scripts/adr.sh` (global install:
  `~/.agents/skills/ncw-adrkit-draft/scripts/adr.sh`). Dry-run
  `<adrkit> migrate --from madr --rename --dir <legacy-dir>`
  on each legacy directory to preview the findings; before moving anything,
  renumber incoming legacy records by renaming their files so that every
  `NNNN-slug.md` id is unique across the existing canonical records and all
  incoming legacy sets (the filename drives the record id, and `<adrkit> lint`
  does not report duplicate ids, verified against the bundled CLI, so this
  renumber step is the merge's only collision guard); move only the legacy
  records into `docs/adr/`; run
  `<adrkit> migrate --from madr --rename --dir docs/adr` once over the merged
  corpus; backfill the reported findings (date, status, deciders); finish with
  `<adrkit> lint`.
- A plan must exist. Drafting "from the plan artifact" without a plan is not a
  degraded mode, it is a different and worse thing.
