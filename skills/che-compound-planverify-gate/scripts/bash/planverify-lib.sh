#!/bin/bash
# scripts/bash/planverify-lib.sh
#
# Verdict/config resolution for the before_implement planverify gate.
# Sourced by planverify-gate.sh.
#
# Provides:
#   pv_find_root            -> echoes the project root, or "" if none
#   pv_gate_mode <root>     -> echoes "off" | "block"  (env first, then config)
#   pv_latest_verdict <root> [slug]
#                           -> with a slug, the verdict of
#                              docs/intents/<slug>.planverify.md only ("" and
#                              non-zero if that file is missing);
#                              without a slug, the verdict of the newest
#                              *.planverify.md repo-wide ("" if none exists)

# Walk up from cwd to the directory containing .git
# TODO: project-root marker is currently the .git directory; revisit when a
# dedicated SDD marker is introduced.
pv_find_root() {
  local d="$(pwd)"
  while [ "$d" != "/" ] && [ ! -e "$d/.git" ]; do
    d="$(dirname "$d")"
  done
  [ -e "$d/.git" ] && echo "$d" || echo ""
}

# Resolve gate mode: SKC_PLANVERIFY_GATE env wins; else planverify_gate: in
# docs/compound/compound-config.yml; else "off".
pv_gate_mode() {
  local root="$1"
  local gate="${SKC_PLANVERIFY_GATE:-}"
  if [ -z "$gate" ] && [ -f "$root/docs/compound/compound-config.yml" ]; then
    gate="$(grep -E '^[[:space:]]*planverify_gate:' "$root/docs/compound/compound-config.yml" \
            | head -1 | sed -E 's/.*planverify_gate:[[:space:]]*//' | tr -d '"'"'"' \r')"
  fi
  echo "${gate:-off}"
}

# Verdict of the planverify report for the feature about to be implemented.
# With a slug, only docs/intents/<slug>.planverify.md counts — a missing file
# yields "" and a non-zero return. Without a slug, legacy repo-wide behavior:
# lexicographically last filename (slugs are typically date- or feature-
# prefixed). Empty if no report exists.
pv_latest_verdict() {
  local root="$1"
  local slug="${2:-}"
  local latest
  if [ -n "$slug" ]; then
    latest="$root/docs/intents/$slug.planverify.md"
    [ -f "$latest" ] || { echo ""; return 1; }
  else
    latest="$(find "$root/docs/intents" -maxdepth 1 -name '*.planverify.md' -type f 2>/dev/null \
              | sort | tail -1)"
    [ -z "$latest" ] && { echo ""; return; }
  fi
  grep -E '^verdict:' "$latest" | head -1 | sed -E 's/^verdict:[[:space:]]*//' | tr -d ' \r'
}
