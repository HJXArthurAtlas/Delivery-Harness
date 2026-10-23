---
name: che-compound-planverify-gate
description: 'Gate before implement: when the gate mode is block (SKC_PLANVERIFY_GATE env or planverify_gate: in .che/config.yml), che planverify-gate refuses /che-compound-implement if the planverify verdict is missing or BLOCKED_DRIFT. Run as a manual check before implement; no-op by default.'
---

# Planverify Gate (before_implement)

This gate runs manually — invoked by the user or the agent via Bash before
`/che-compound-implement` of the given feature. The gate logic is **inlined in
the `che` CLI** (`che planverify-gate`) — the bundled script is a thin wrapper
over it — so it executes deterministically, not as an interactive prompt.

Its job: optionally gate `/che-compound-implement` on the planverify verdict of
the feature about to be implemented.

---

## What you must do

Run the gate via Bash (the bundled script is a thin wrapper over the CLI),
passing that feature's slug (run before `/che-compound-implement` of that
feature):

```bash
.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>
```

(Global install: `~/.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>`.)

The command:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves the gate mode — `SKC_PLANVERIFY_GATE` env, else `planverify_gate:` in `.che/config.yml`, default `off`; an invalid value is an error (fail-closed)
3. If mode is not `block` → exits 0 silently — `/che-compound-implement` proceeds normally
4. If mode is `block`:
   - No planverify report exists for `<slug>` (`docs/intents/<slug>.planverify.md`) → exits 1 (run `/che-compound-planverify` for that feature first)
   - That report's verdict is `BLOCKED_DRIFT` → exits 1 (replan first)
   - That report's verdict is `PASS` or `REPLAN_ALLOWED` → exits 0 (proceed)

Exit code 2 means a usage error (missing or duplicate `<slug>`); a missing
`che` CLI exits 1 with the install hint (`npm install -g @newchiwan/che@latest`).

If the command exits non-zero, **do not continue with `/che-compound-implement`**. Relay
the message to the user:

> *"planverify gate is ON and the plan is not cleared. Run `/che-compound-planverify` (and replan if it returned BLOCKED_DRIFT) before `/che-compound-implement`."*

---

## Tool choices

- **Bash** to invoke the gate script (or `che planverify-gate <slug>` directly)
- No Read, Write, Edit, or other tools needed

---

## Handoff

- **目标**：`/che-compound-implement` —— 在 plan 判定通过后执行实现
- **条件**：gate 模式非 block → 直接放行；block 模式下该特性 `docs/intents/<slug>.planverify.md` 判定为 PASS 或 REPLAN_ALLOWED 才放行；缺失或 BLOCKED_DRIFT 拒绝，先跑/重跑 `/che-compound-planverify`
