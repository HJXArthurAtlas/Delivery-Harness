---
name: ncw-adrkit-check
description: Check a produced plan against the decisions that govern it. Read-only.
---

# Adrkit Check Skill

# adrkit — check this plan

Runs after a plan exists, and answers one question: does this plan sit inside
the decisions already made, or does it quietly cross one?

This is the command the optional `after_plan` hook offers to run. Hook firing
requires the upstream adrkit extension's hook registration (installed by
ncw-monorepo-init via `specify extension add adrkit`); without it, run this
check manually after `/ncw-speckit-plan`.

## User Input

$ARGUMENTS

## Steps

1. Treat any arguments as the repo-relative paths this plan intends to touch.
   Pass them — the check is only as sharp as the paths it is given. With no
   arguments it falls back to the plan artifact itself.
2. Run the pack-bundled script with those paths — project install:
   `.agents/skills/ncw-adrkit-check/scripts/check.sh`; global install:
   `~/.agents/skills/ncw-adrkit-check/scripts/check.sh`.
3. Read the output. It is one or two marker-introduced sections, each followed
   by a single JSON document:
   - `==> adrkit:check` — the `CheckOutcome`: which decisions govern these
     paths, and findings for any changed ADR. Always present.
   - `==> adrkit:evaluate` — the deterministic evaluator's routing report for
     this plan. Present **only** when `ADRKIT_SNAPSHOT` points at an offline
     snapshot bundle. When it is absent, the script says so on stderr; that is
     an omission you have been told about, not a check that passed.
4. Report back, in the plan's own terms:
   - Every governing decision the plan touches, named by id.
   - Any place the plan departs from one. Say so explicitly. A departure that
     is deliberate and recorded is fine; a departure nobody noticed is the
     thing this catches.
   - If the evaluator ran, its routing outcome and any escalation trigger. The
     evaluator routes; it does not approve. Do not read a clean route as sign-off.
5. If the plan does cross a decision, the next step is
   `/ncw-adrkit-draft` — record the new decision rather than letting the
   plan silently overrule the old one.

## Notes

- Feature resolution uses the pack-bundled
  `.agents/skills/ncw-speckit-analyze/scripts/check_prerequisites.py`; neither
  `specify init` nor `.specify/scripts/` is required. `ADRKIT_FEATURE_DIR`
  overrides feature-dir resolution.
- The adrkit 0.20.0 CLI is bundled at
  `.agents/skills/ncw-adrkit-draft/scripts/adr.mjs`; no `@adrkit/cli` install is
  required. `ADRKIT_CLI` is an explicit opt-in override.
- Read-only, and that is load-bearing rather than incidental: this command is
  reachable from a lifecycle hook, so it must never write.
- Exit code 1 means findings exist (corpus errors, or the evaluator returned the
  proposal). The report is still complete. Exit code 2 is a usage error.
- Configuration: `ADRKIT_DIR` (corpus, default `docs/adr/`), `ADRKIT_SNAPSHOT`
  (evaluator snapshot bundle), `ADRKIT_AS_OF` (evaluation date, default today
  UTC), `ADRKIT_CLI` (explicit path to the `adr` entry point).
