---
name: ncw-compound-planverify-gate
description: 'Gate hook for before_implement: when SKC_PLANVERIFY_GATE=block, refuses /ncw-speckit-implement if the latest planverify verdict is missing or BLOCKED_DRIFT. No-op by default. The Claude-harness half of the gate; the cross-vendor half is the PreToolUse hook.'
---

# Planverify Gate (before_implement)

This command is registered as a `before_implement` hook. It is a **thin
shell-script wrapper** — not an interactive prompt — so it dispatches cleanly
through the Claude harness's hook executor (the same pattern `/ncw-compound-require-intent`
uses for `before_specify`, and that bundled git's hooks use).

Its job: optionally gate `/ncw-speckit-implement` on the planverify verdict of the feature about to be implemented.

This is the **phase-boundary** half of the planverify gate (fires under the
Claude harness). The **cross-vendor** half — a `PreToolUse` hook that works
under both Claude Code and Codex CLI — is installed separately via
`/ncw-compound-install-hooks`.

> **Note:** in this skill pack nothing executes `before_implement` hooks — the
> pack's `/ncw-speckit-*` skills never run hooks. Here the gate runs as a manual or
> agent-invoked check before `/ncw-speckit-implement` of the given feature.
> The automated paths, where present, are the upstream compound extension's
> `extension.yml` hook wiring or the `/ncw-compound-install-hooks` `.claude`
> PreToolUse wiring.

---

## What you must do

Run the gate script via Bash before implementing the feature, passing that
feature's slug (run before `/ncw-speckit-implement` of that feature):

```bash
.agents/skills/ncw-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>
```

(Global install: `~/.agents/skills/ncw-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>`.)

The script:

1. Walks up from cwd to find the project root (the directory containing `.specify/`)
2. Resolves the gate mode — `SKC_PLANVERIFY_GATE` env, else `planverify_gate:` in `docs/compound/compound-config.yml`, default `off`
3. If mode is not `block` → exits 0 silently — `/ncw-speckit-implement` proceeds normally
4. If mode is `block`:
   - No planverify report exists for `<slug>` (`docs/intents/<slug>.planverify.md`) → exits 1 (run `/ncw-compound-planverify` for that feature first)
   - That report's verdict is `BLOCKED_DRIFT` → exits 1 (replan first)
   - That report's verdict is `PASS` or `REPLAN_ALLOWED` → exits 0 (proceed)

If the script exits non-zero, **do not continue with `/ncw-speckit-implement`**. Relay
the script's message to the user:

> *"planverify gate is ON and the plan is not cleared. Run `/ncw-compound-planverify` (and replan if it returned BLOCKED_DRIFT) before `/ncw-speckit-implement`."*

---

## Why this is a shell script and not an interview

The harness's hook executor dispatches **shell-script** command files cleanly under
both Claude Code and Codex; **agent-prompt** hooks silently no-op (verified in
v0.2.1). Mirroring `/ncw-compound-require-intent`, the gate is a script-runner
so it fires reliably whether invoked directly or as part of the chain.

---

## Tool choices

- **Bash** to invoke the gate script
- No Read, Write, or Edit needed