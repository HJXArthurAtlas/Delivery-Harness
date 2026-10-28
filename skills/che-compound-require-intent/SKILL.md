---
name: che-compound-require-intent
description: specify 前门禁（默认开）：当前任务目录 specs/NNN-{slug}/ 里没有 intent.md 就拒绝 /che-compound-specify。任务经 session 绑定解析（或 --feature/--session 显式指定）；可经 CHE_REQUIRE_INTENT 环境变量或 .che/config.yml 的 require_intent 键关闭。手动或 agent 在 specify 边界前调用。当用户说「过一遍 specify 门禁」「检查 intent 放行了没」时使用——即使用户没提命令名，只要是规格前的门禁检查也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Require Intent Before Specify

This gate runs manually — invoked by the user or the agent before `/che-compound-specify`. The gate logic is **inlined in the `che` CLI** (`che require-intent`) — not an interactive prompt — so it runs deterministically.

Its job: gate `/che-compound-specify` on the existence of an intent doc in the **current task directory** (`specs/NNN-{slug}/intent.md`). The task is born at `/che-compound-intent` (`che task create`), which also binds the session — so a pass here proves intent ran for the bound task.

---

## What you must do

Run the gate via Bash (the bundled script is a thin wrapper over the CLI), passing the session when one is available:

```bash
.agents/skills/che-compound-require-intent/scripts/bash/require-intent.sh --session "$CHE_SESSION_ID"
```

Omit `--session` when no session id is available — the CLI then resolves via `CHE_SESSION_ID` env, an explicit `--feature <slug>`, or the single in-flight task.

The gate:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves the gate toggle (see below)
3. Toggle **off** → exits 0 silently — `/che-compound-specify` proceeds normally (the task is not even resolved)
4. Toggle **on** (the default) → resolves the current task (`--feature` argument > `CHE_FEATURE_DIRECTORY` env > session binding > the single task in `specs/`):
   - No task can be resolved (no binding, none or multiple tasks in flight) → exits 1 with a candidate list — bind the session or pass `--feature`
   - Task resolved → `{task_dir}/intent.md` must exist:
     - It exists → exits 0, `/che-compound-specify` proceeds
     - It does not → exits 1 with a message naming the expected path — intent never ran for this task

If the gate exits non-zero, **do not continue with `/che-compound-specify`**. Tell the user:

> *"The task `{slug}` has no intent doc. Run `/che-compound-intent` first to capture goal, constraints, and failure conditions (it creates the task directory and binds the session), then re-run `/che-compound-specify`."*

`/che-compound-specify` resolves its short name from the same task directory, so a pass here guarantees the intent doc and the spec live in the same task.

---

## The toggle

The gate is **on by default** and can be switched off by the user, read in this order (first hit wins):

1. `CHE_REQUIRE_INTENT` environment variable
2. `require_intent:` in `.che/config.yml` (project root)
3. Default: `on`

Accepted values (case-insensitive): `on` / `true` / `1` / `yes`, or `off` / `false` / `0` / `no`. An invalid value is an error — the gate fails closed (exit 1) rather than silently passing.

```bash
# env
CHE_REQUIRE_INTENT=off che require-intent

# .che/config.yml
require_intent: off
```

`che require-intent --json` reports the resolved state as `{"REPO_ROOT": ..., "GATE": "on"|"off", "TASK_DIR": "<absolute task dir or null>", "SLUG": "<task slug or ''>", "INTENT_DOC": "<expected {task_dir}/intent.md or ''>"}` for scripting. When the gate is off the task is not resolved and `TASK_DIR` is `null`. The slug comes from the task directory name (`che paths --json` reports the same value as `SLUG`).

---

## Why this is a CLI command and not an interview

A gate must execute deterministically; a CLI command does. The actual intent capture still happens via the interactive `/che-compound-intent` skill — the user runs it after this gate blocks them.

---

## Tool choices

- **Bash** to invoke the gate script (or `che require-intent` directly)
- No Read, Write, Edit, or other tools needed

---

## Handoff

- **目标**：`/che-compound-specify` —— 在 intent 已捕获的前提下生成特性规格
- **条件**：门禁开关开启（默认）时当前任务（session 绑定或 `--feature`/`--session` 解析）的目录里存在 `intent.md`（`che require-intent` 退 0）才放行，缺失即拒绝并指回 `/che-compound-intent`（任务不存在/多个在飞且未绑定时列出候选）；开关关闭（`CHE_REQUIRE_INTENT` 或 `.che/config.yml` 的 `require_intent:`）时静默放行
