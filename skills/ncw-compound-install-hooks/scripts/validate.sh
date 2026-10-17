#!/bin/bash
# scripts/validate.sh
#
# Validates the compound docs layout of the current project (NOT the skill
# pack or extension repo — run it inside the project being audited):
#   - anchors at the nearest ancestor directory containing .specify/
#     (fallback: current working directory, with a stderr warning)
#   - docs/compound/ exists, with README.md + corrections/ + patterns/
#     (ADRs were consolidated into the adrkit corpus at docs/adr/)
#   - docs/compound/CORRECTIONS-SCHEMA.md is present
#   - every docs/compound/corrections/*.md that carries YAML frontmatter has
#     the four enforcement keys: paths, match, rule, context
#
# Run from anywhere inside a project: ./scripts/validate.sh
#
# Prints PASS/FAIL per check; exit 0 only if every check passes.

set -u

ERRORS=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; ERRORS=$((ERRORS + 1)); }

# ─────────────────────────────────────────────────────────────────
# Anchor at the project root
# ─────────────────────────────────────────────────────────────────
PROJECT_ROOT="$(pwd)"
while [ "$PROJECT_ROOT" != "/" ] && [ ! -d "$PROJECT_ROOT/.specify" ]; do
  PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done
if [ ! -d "$PROJECT_ROOT/.specify" ]; then
  echo "WARNING: .specify/ not found in any parent of $(pwd); validating the current directory instead" >&2
  PROJECT_ROOT="$(pwd)"
fi
cd "$PROJECT_ROOT" || exit 1

echo "=== Validating compound docs layout: $PROJECT_ROOT ==="
echo ""

# ─────────────────────────────────────────────────────────────────
# docs/compound/ structure
# ─────────────────────────────────────────────────────────────────
echo "Compound store structure"

if [ -d docs/compound ]; then
  pass "docs/compound/ exists"
else
  fail "docs/compound/ missing (bootstrap it via /ncw-compound-load)"
fi

for entry in README.md corrections patterns; do
  if [ -e "docs/compound/$entry" ]; then
    pass "docs/compound/$entry"
  else
    fail "docs/compound/$entry missing"
  fi
done

# ─────────────────────────────────────────────────────────────────
# Correction schema reference
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Correction schema"

if [ -f docs/compound/CORRECTIONS-SCHEMA.md ]; then
  pass "docs/compound/CORRECTIONS-SCHEMA.md present"
else
  fail "docs/compound/CORRECTIONS-SCHEMA.md missing (delivered by /ncw-compound-install-hooks)"
fi

# ─────────────────────────────────────────────────────────────────
# Correction frontmatter keys (enforcement contract)
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Correction frontmatter"

CORRECTION_FILES="$(ls docs/compound/corrections/*.md 2>/dev/null)"
if [ -z "$CORRECTION_FILES" ]; then
  echo "  (no corrections yet — nothing to check)"
fi

for corr in $CORRECTION_FILES; do
  # No frontmatter at all -> pre-v0.3 context-only note; not an error.
  if ! head -1 "$corr" | grep -q '^---[[:space:]]*$'; then
    echo "  SKIP: $corr (no frontmatter — context-only, hook does not enforce it)"
    continue
  fi

  # Extract the frontmatter block (lines between the first and second '---').
  fm="$(awk 'NR == 1 { next } /^---[[:space:]]*$/ { exit } { print }' "$corr")"

  missing=""
  for key in paths match rule context; do
    if ! echo "$fm" | grep -qE "^${key}:"; then
      missing="$missing $key"
    fi
  done

  if [ -z "$missing" ]; then
    pass "$corr (enforceable)"
  else
    fail "$corr missing frontmatter key(s):$missing (loaded as context only, hook skips it)"
  fi
done

# ─────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────
echo ""
echo "─────────────────────────────────"
if [ "$ERRORS" -eq 0 ]; then
  echo "OK — compound docs layout valid"
  exit 0
else
  echo "FAILED — $ERRORS check(s) failed"
  exit 1
fi
