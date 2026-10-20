#!/bin/bash
# scripts/bash/require-intent.sh
#
# Gate: refuses to let /ncw-speckit-specify proceed if no intent doc exists.
# Invoked manually or by the agent before /ncw-speckit-specify.
#
# A shell script, not an interactive prompt, so the gate executes
# deterministically: it blocks /ncw-speckit-specify, the user runs
# /ncw-compound-intent manually, then re-runs /ncw-speckit-specify.
#
# Behavior:
#   - Walks up from cwd to find the project root (.git)
#   - Checks docs/intents/ for any *.intent.md file
#   - Exits 0 if at least one exists; exits 1 with message otherwise

set -u

# Find project root by walking up from cwd
# TODO: project-root marker is currently the .git directory; revisit when a
# dedicated SDD marker is introduced.
PROJECT_ROOT="$(pwd)"
while [ "$PROJECT_ROOT" != "/" ] && [ ! -e "$PROJECT_ROOT/.git" ]; do
  PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

if [ ! -e "$PROJECT_ROOT/.git" ]; then
  echo "ERROR: not in an SDD project (.git not found in any parent of $(pwd))"
  exit 1
fi

cd "$PROJECT_ROOT"

# Check for any intent doc
if [ ! -d "docs/intents" ]; then
  echo ""
  echo "  ⚠  No intent docs found (docs/intents/ does not exist)."
  echo ""
  echo "  Run /ncw-compound-intent BEFORE /ncw-speckit-specify to capture"
  echo "  the goal, constraints, and failure conditions for this feature."
  echo ""
  echo "  This is mandatory per the ncw-compound extension's discipline."
  echo "  /ncw-speckit-specify will not proceed until at least one intent doc exists."
  echo ""
  exit 1
fi

INTENT_COUNT=$(find docs/intents -maxdepth 1 -name "*.intent.md" -type f 2>/dev/null | wc -l | tr -d ' ')

if [ "$INTENT_COUNT" -eq 0 ]; then
  echo ""
  echo "  ⚠  docs/intents/ exists but contains no *.intent.md files."
  echo ""
  echo "  Run /ncw-compound-intent BEFORE /ncw-speckit-specify."
  echo ""
  exit 1
fi

# At least one intent doc exists; let /ncw-speckit-specify proceed
echo "✓ Found $INTENT_COUNT intent doc(s) in docs/intents/ — /ncw-speckit-specify may proceed."
exit 0
