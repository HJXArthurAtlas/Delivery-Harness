#!/bin/bash
# scripts/bash/planverify-gate.sh
#
# spec-kit before_implement gate (Claude + spec-kit). Optionally blocks
# /ncw-speckit-implement until the planverify verdict for the feature about to
# be implemented is acceptable.
#
# Usage: planverify-gate.sh <slug>
#   <slug> is the feature slug whose docs/intents/<slug>.planverify.md report
#   gates this implement run. When that report is missing, the gate is closed
#   (exit 1) under block mode.
#
# This is the phase-boundary half of the belt-and-suspenders gate. The
# cross-vendor half (works for BOTH Claude Code and Codex CLI) is the
# PreToolUse hook planverify-pretooluse.sh. spec-kit before_* hooks fire
# only when the user runs spec-kit slash commands under a harness that
# dispatches them — i.e. Claude + spec-kit — so this gate is a bonus, not
# the primary enforcement path.
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
# Shell script, not an agent-prompt hook: agent-prompt hooks silently no-op
# under spec-kit's executor (verified v0.2.1). Mirrors require-intent.sh.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/bash/planverify-lib.sh
. "$SCRIPT_DIR/planverify-lib.sh"

ROOT="$(pv_find_root)"
if [ -z "$ROOT" ]; then
  echo "ERROR: not in a spec-kit project (.specify/ not found in any parent of $(pwd))"
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
