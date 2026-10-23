#!/bin/bash
# scripts/bash/planverify-gate.sh
#
# Gate: refuses to let /che-compound-implement proceed when the gate mode is
# block and the feature's planverify verdict is missing or BLOCKED_DRIFT.
# Invoked manually or by the agent before /che-compound-implement.
#
# Thin wrapper: the gate logic is inlined in the che CLI
# (`che planverify-gate <slug>`), including the gate mode — SKC_PLANVERIFY_GATE
# env, else `planverify_gate:` in .che/config.yml, default off. An invalid mode
# fails closed (exit 1).
#
# A shell script, not an interactive prompt, so the gate executes
# deterministically: it blocks /che-compound-implement, the user runs
# /che-compound-planverify manually, then re-runs /che-compound-implement.

set -u

command -v che >/dev/null 2>&1 || {
  echo "ERROR: che CLI not found on PATH; install it with 'npm install -g @newchiwan/che@0.1.0'" >&2
  exit 1
}

exec che planverify-gate "$@"
