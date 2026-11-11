---
name: che-planverify-gate
description: implement 前门禁（双 gate）：adr_gate 默认 block——planverify 报告缺失、adr_status 缺失或非 clean、或 intent/plan/tasks 的 SHA-256 与报告记录不匹配即拒绝；planverify_gate（默认 off）为 block 时再拒绝 BLOCKED_DRIFT / BLOCKED_ADR 裁决；未知 verdict 一律 fail-closed；两者均 off 才静默放行。手动或 agent 在 implement 边界前调用。当用户说「过一遍 implement 门禁」「检查 planverify 放行了没」时使用——即使用户没提命令名，只要是实现前的门禁检查也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Planverify Gate (before_implement)

This gate runs manually — invoked by the user or the agent via Bash before
`/che-implement` of the given feature. The gate logic is **inlined in
the `che` CLI** (`che planverify-gate`) — the bundled script is a thin wrapper
over it — so it executes deterministically, not as an interactive prompt.

Its job: gate `/che-implement` on the planverify verdict **and** the
ADR mechanical layer of the feature about to be implemented.

---

## What you must do

Run the gate via Bash (the bundled script is a thin wrapper over the CLI),
passing the session id or that feature's slug (run before
`/che-implement` of that feature):

```bash
.agents/skills/che-planverify-gate/scripts/bash/planverify-gate.sh --session "$CHE_SESSION_ID"
```

(Global install: `~/.agents/skills/che-planverify-gate/scripts/bash/planverify-gate.sh`.)

The positional `<slug>` is optional; when no session id is available, omit
`--session` — the CLI then resolves the task via `CHE_SESSION_ID` env, an
explicit `--feature <slug>`, or the single in-flight task (same resolution
order as `che paths`).

The command:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves both gate modes, each: env first (`SKC_ADR_GATE` / `SKC_PLANVERIFY_GATE`), else
   `adr_gate:` / `planverify_gate:` in `.che/config.local.yml` (machine-local overlay, overrides
   key by key), else in `.che/config.yml`; invalid values are errors (fail-closed)
3. If **both** modes are not `block` → exits 0 silently — `/che-implement` proceeds normally
4. Otherwise, against the task's `evidence/planverify.md` (`{task_dir}` = `che paths` `FEATURE_DIR`; legacy specs with the report flat at the task-dir root are still accepted, `evidence/` winning when both exist):
   - **ADR layer (`adr_gate`, default `block`)**:
     - No planverify report → exits 1 (run `/che-planverify` for that feature first)
     - `adr_status` missing or not `clean` → exits 1 (a pre-ADR report counts as *needs re-run*,
       never as clean; a blocked ADR layer needs a plan fix or a ratified superseding ADR)
     - Any recorded intent/plan/tasks SHA-256 missing or differing from the artifacts on disk
       → exits 1 (the report is stale; re-run planverify to refresh it)
   - **Verdict layer (`planverify_gate`, default `off`)**:
     - `BLOCKED_DRIFT` → exits 1 (replan first)
     - `BLOCKED_ADR` → exits 1 (fix the plan, or `/che-adr-draft` + human `adr accept`, then re-run planverify)
   - Unrecognized `verdict` → exits 1 (fail-closed; the old "any other value passes" behavior is gone)
   - Verdict `PASS` / `REPLAN_ALLOWED` with a clean, hash-fresh ADR layer → exits 0 (proceed)

Exit code 2 means a usage error (e.g. duplicate `<slug>`); a missing
`che` CLI exits 1 with the install hint (`npm install -g @newchiwan/che@latest`).

If the command exits non-zero, **do not continue with `/che-implement`**. Relay
the message to the user — the recovery path depends on the rejection:

> *"planverify gate is ON and the plan is not cleared. Run `/che-planverify` first."* (missing report)

> *"The planverify report is stale — intent/plan/tasks changed after it was written. Re-run `/che-planverify`."* (hash mismatch)

> *"Verdict is BLOCKED_DRIFT / BLOCKED_ADR. Replan via `/che-plan` (then gapfill + planverify), or record the decision change via `/che-adr-draft` and have it ratified before re-running planverify."* (blocked verdict)

---

## Tool choices

- **Bash** to invoke the gate script (or `che planverify-gate --session "$CHE_SESSION_ID"` directly; positional `<slug>` optional)
- No Read, Write, Edit, or other tools needed

---

## Handoff

- **目标**：`/che-implement` —— 在 plan 判定通过后执行实现
- **条件**：双 gate 均 off → 直接放行；`adr_gate` block（默认）时报告在位、`adr_status: clean`、三工件 hash 匹配；`planverify_gate` block 时裁决为 PASS 或 REPLAN_ALLOWED；缺失、非 clean、hash 不匹配、BLOCKED_DRIFT / BLOCKED_ADR、未知 verdict 均拒绝
- **回退**：拒绝时按错误消息分流——缺报告/旧报告 → 重跑 `/che-planverify`；hash 不匹配 → 改动后重跑 planverify；BLOCKED_ADR → 修 plan 或 `/che-adr-draft` 起草 superseding ADR 经人工 `adr accept` 后重跑 planverify；BLOCKED_DRIFT → 回 plan 修正后重跑 planverify