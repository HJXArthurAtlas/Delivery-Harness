#!/bin/bash
# scripts/bash/planverify-gate.sh
#
# before_implement gate. Optionally blocks
# /ncw-speckit-implement until the planverify verdict for the feature about to
# be implemented is acceptable.
#
# Usage: planverify-gate.sh <slug>
#   <slug> is the feature slug whose docs/intents/<slug>.planverify.md report
#   gates this implement run. When that report is missing, the gate is closed
#   (exit 1) under block mode.
#
# This is the phase-boundary gate. Invoke it manually or via the agent before
# running /ncw-speckit-implement for the given feature.
#
# Default behavior is OFF (no-op) — consistent with every other compound
# command being advisory. Opt in via:
#   SKC_PLANVERIFY_GATE=block   (env), or
#   planverify_gate: block      (docs/compound/compound-config.yml)
#
# When 'block':
#   - missing planverify report           -> exit 1 (run planverify first)
#   - verdict: BLOCKED_DRIFT               -> exit 1 (replan first)
#   - verdict: PASS | REPLAN_ALLOWED       -> exit 0 (proceed)
#
# Shell script, not an interactive prompt, so the gate executes
# deterministically. Mirrors require-intent.sh.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/bash/planverify-lib.sh
. "$SCRIPT_DIR/planverify-lib.sh"

ROOT="$(pv_find_root)"
if [ -z "$ROOT" ]; then
  echo "ERROR: not in an SDD project (.git not found in any parent of $(pwd))"
  exit 1
fi
cd "$ROOT"

# Feature slug whose planverify report gates this implement run.
SLUG="${1:-}"

GATE="$(pv_gate_mode "$ROOT")"

# Default (off): no-op, let implement proceed
if [ "$GATE" != "block" ]; then
  exit 0
fi

VERDICT="$(pv_latest_verdict "$ROOT" "$SLUG")"

if [ -z "$VERDICT" ]; then
  echo ""
  echo "  ⚠  SKC_PLANVERIFY_GATE=block but no planverify report exists for '${SLUG}'."
  echo ""
  echo "  Run /ncw-compound-planverify for '${SLUG}' before /ncw-speckit-implement."
  echo ""
  exit 1
fi

if [ "$VERDICT" = "BLOCKED_DRIFT" ]; then
  echo ""
  echo "  ⛔ Plan verdict is BLOCKED_DRIFT."
  echo ""
  echo "  The proposed plan drifts outside locked intent. Replan before"
  echo "  implementing: re-run /ncw-speckit-plan, then /ncw-compound-planverify."
  echo ""
  exit 1
fi

echo "✓ planverify verdict for '${SLUG}': ${VERDICT} — /ncw-speckit-implement may proceed."
exit 0
