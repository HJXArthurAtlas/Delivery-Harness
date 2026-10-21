---
name: che-compound-planverify-gate
description: 'Gate before implement: when SKC_PLANVERIFY_GATE=block, refuses /che-compound-implement if the latest planverify verdict is missing or BLOCKED_DRIFT. Run as a manual check before implement; no-op by default.'
---

# Planverify Gate (before_implement)

This gate runs manually — invoked by the user or the agent via Bash before `/che-compound-implement` of the given feature. It is a **thin shell-script wrapper** — not an interactive prompt — so it runs deterministically.

Its job: optionally gate `/che-compound-implement` on the planverify verdict of the feature about to be implemented.

---

## What you must do

Run the gate script via Bash before implementing the feature, passing that
feature's slug (run before `/che-compound-implement` of that feature):

```bash
.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>
```

(Global install: `~/.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh <slug>`.)

The script:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves the gate mode — `SKC_PLANVERIFY_GATE` env, else `planverify_gate:` in `docs/compound/compound-config.yml`, default `off`
3. If mode is not `block` → exits 0 silently — `/che-compound-implement` proceeds normally
4. If mode is `block`:
   - No planverify report exists for `<slug>` (`docs/intents/<slug>.planverify.md`) → exits 1 (run `/che-compound-planverify` for that feature first)
   - That report's verdict is `BLOCKED_DRIFT` → exits 1 (replan first)
   - That report's verdict is `PASS` or `REPLAN_ALLOWED` → exits 0 (proceed)

If the script exits non-zero, **do not continue with `/che-compound-implement`**. Relay
the script's message to the user:

> *"planverify gate is ON and the plan is not cleared. Run `/che-compound-planverify` (and replan if it returned BLOCKED_DRIFT) before `/che-compound-implement`."*

---

## Why this is a shell script and not an interview

A gate must execute deterministically; a shell script does. Mirroring
`/che-compound-require-intent`, the gate is a script-runner invoked manually
via Bash, so it fires reliably whether run directly or as part of the chain.

---

## Tool choices

- **Bash** to invoke the gate script
- No Read, Write, or Edit needed

---

## Handoff

- **目标**：`/che-compound-implement` —— 在 plan 判定通过后执行实现
- **条件**：gate 模式非 block → 直接放行；block 模式下该特性 `docs/intents/<slug>.planverify.md` 判定为 PASS 或 REPLAN_ALLOWED 才放行；缺失或 BLOCKED_DRIFT 拒绝，先跑/重跑 `/che-compound-planverify`