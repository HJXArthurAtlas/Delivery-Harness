---
name: che-compound-planverify-gate
description: implement 前门禁（默认 off 静默放行）：gate 模式为 block（SKC_PLANVERIFY_GATE 环境变量或 .che/config.yml 的 planverify_gate 键）时，planverify 裁决缺失或 BLOCKED_DRIFT 即拒绝 /che-compound-implement。手动或 agent 在 implement 边界前调用。当用户说「过一遍 implement 门禁」「检查 planverify 放行了没」时使用——即使用户没提命令名，只要是实现前的门禁检查也用本 skill。
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
passing the session id or that feature's slug (run before
`/che-compound-implement` of that feature):

```bash
.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh --session "$CHE_SESSION_ID"
```

(Global install: `~/.agents/skills/che-compound-planverify-gate/scripts/bash/planverify-gate.sh`.)

The positional `<slug>` is optional; when no session id is available, omit
`--session` — the CLI then resolves the task via `CHE_SESSION_ID` env, an
explicit `--feature <slug>`, or the single in-flight task (same resolution
order as `che paths`).

The command:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves the gate mode — `SKC_PLANVERIFY_GATE` env, else `planverify_gate:` in `.che/config.yml`, default `off`; an invalid value is an error (fail-closed)
3. If mode is not `block` → exits 0 silently — `/che-compound-implement` proceeds normally
4. If mode is `block`:
   - No planverify report exists for `<slug>` (`{task_dir}/planverify.md` in the task directory `che paths` reports as `FEATURE_DIR`) → exits 1 (run `/che-compound-planverify` for that feature first)
   - That report's verdict is `BLOCKED_DRIFT` → exits 1 (replan first)
   - That report's verdict is `PASS` or `REPLAN_ALLOWED` → exits 0 (proceed)

Exit code 2 means a usage error (e.g. duplicate `<slug>`); a missing
`che` CLI exits 1 with the install hint (`npm install -g @newchiwan/che@latest`).

If the command exits non-zero, **do not continue with `/che-compound-implement`**. Relay
the message to the user:

> *"planverify gate is ON and the plan is not cleared. Run `/che-compound-planverify` (and replan if it returned BLOCKED_DRIFT) before `/che-compound-implement`."*

---

## Tool choices

- **Bash** to invoke the gate script (or `che planverify-gate --session "$CHE_SESSION_ID"` directly; positional `<slug>` optional)
- No Read, Write, Edit, or other tools needed

---

## Handoff

- **目标**：`/che-compound-implement` —— 在 plan 判定通过后执行实现
- **条件**：gate 模式非 block → 直接放行；block 模式下该特性任务目录 `planverify.md` 判定为 PASS 或 REPLAN_ALLOWED 才放行；缺失或 BLOCKED_DRIFT 拒绝，先跑/重跑 `/che-compound-planverify`
