#!/bin/bash
# scripts/bash/require-intent.sh
#
# Gate: refuses to let /che-compound-specify proceed if no intent doc exists.
# Invoked manually or by the agent before /che-compound-specify.
#
# Thin wrapper: the gate logic is inlined in the che CLI (`che require-intent`),
# including the user toggle — CHE_REQUIRE_INTENT env, else `require_intent:` in
# .che/config.yml, default on. An invalid toggle value fails closed (exit 1).
#
# A shell script, not an interactive prompt, so the gate executes
# deterministically: it blocks /che-compound-specify, the user runs
# /che-compound-intent manually, then re-runs /che-compound-specify.

set -u

command -v che >/dev/null 2>&1 || {
  echo "ERROR: che CLI not found on PATH; install it with 'npm install -g @newchiwan/che@0.1.0'" >&2
  exit 1
}

exec che require-intent "$@"
