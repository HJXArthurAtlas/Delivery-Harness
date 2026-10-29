#!/bin/bash
# scripts/bash/planverify-gate.sh
#
# Gate: refuses to let /che-compound-implement proceed when a blocking gate
# rejects the feature's planverify report. Invoked manually or by the agent
# before /che-compound-implement.
#
# Thin wrapper: the gate logic is inlined in the che CLI
# (`che planverify-gate <slug>`), including both gate modes —
# SKC_ADR_GATE env, else `adr_gate:` in .che/config.yml, default block
# (report present, adr_status clean, spec/plan/tasks SHA-256 fresh);
# SKC_PLANVERIFY_GATE env, else `planverify_gate:`, default off (refuses
# BLOCKED_DRIFT / BLOCKED_ADR; unknown verdicts fail closed). An invalid mode
# fails closed (exit 1).
#
# A shell script, not an interactive prompt, so the gate executes
# deterministically: it blocks /che-compound-implement, the user runs
# /che-compound-planverify manually, then re-runs /che-compound-implement.

set -u

command -v che >/dev/null 2>&1 || {
  echo "ERROR: che CLI not found on PATH; install it with 'npm install -g @newchiwan/che@latest'" >&2
  exit 1
}

exec che planverify-gate "$@"
