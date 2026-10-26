---
name: che-compound-require-intent
description: specify 前门禁（默认开）：docs/intents/ 没有 intent 文档就拒绝 /che-compound-specify；.che/feature.json 已登记特性时还要求 docs/intents/{slug}.intent.md 与登记 slug 一致。可经 CHE_REQUIRE_INTENT 环境变量或 .che/config.yml 的 require_intent 键关闭。手动或 agent 在 specify 边界前调用。当用户说「过一遍 specify 门禁」「检查 intent 放行了没」时使用——即使用户没提命令名，只要是规格前的门禁检查也用本 skill。
---

# Require Intent Before Specify

This gate runs manually — invoked by the user or the agent before `/che-compound-specify`. The gate logic is **inlined in the `che` CLI** (`che require-intent`) — not an interactive prompt — so it runs deterministically.

Its job: gate `/che-compound-specify` on the existence of an intent doc, and keep the intent slug aligned with the feature registered in `.che/feature.json` (the single source of truth for the slug).

---

## What you must do

Run the gate via Bash (the bundled script is a thin wrapper over the CLI):

```bash
.agents/skills/che-compound-require-intent/scripts/bash/require-intent.sh
```

The gate:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Resolves the gate toggle (see below)
3. Toggle **off** → exits 0 silently — `/che-compound-specify` proceeds normally
4. Toggle **on** (the default) → checks `docs/intents/`:
   - No `*.intent.md` at all → exits 1, `/che-compound-specify` does not proceed
   - At least one exists, **and** `.che/feature.json` registers a feature (a spec run happened before): the current feature slug is the registered directory basename with a leading `YYYYMMDD-HHMMSS-` prefix stripped (e.g. `specs/20261022-084501-user-auth` → `user-auth`), and `docs/intents/{slug}.intent.md` must exist:
     - It exists → exits 0, `/che-compound-specify` proceeds
     - It does not → exits 1 with a message naming the expected path — intent and feature have drifted apart
   - At least one exists and no feature is registered yet (first specify) → exits 0 (legacy any-intent check)

If the gate exits non-zero, **do not continue with `/che-compound-specify`**. Tell the user:

> *"No intent doc exists in `docs/intents/`. Run `/che-compound-intent` first to capture goal, constraints, and failure conditions. Then re-run `/che-compound-specify`."*

When the failure message names a feature slug (`.che/feature.json` is registered), tell the user instead:

> *"No intent doc matches the current feature slug `{slug}`. Run `/che-compound-intent` and keep the slug identical to `{slug}` (accept the proposed slug, or `override` with the same one), then re-run `/che-compound-specify`."*

`/che-compound-specify` resolves its short name from the same source of truth, so a pass here guarantees intent slug and spec directory name stay identical.

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

`che require-intent --json` reports the resolved state as `{"REPO_ROOT": ..., "GATE": "on"|"off", "INTENT_DIR": ..., "INTENT_COUNT": N, "SLUG": "<current feature slug or ''>", "INTENT_DOC": "<expected docs/intents/{slug}.intent.md or ''>"}` for scripting. The slug comes from `.che/feature.json` (`che paths --json` reports the same value as `SLUG`).

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
- **条件**：门禁开关开启（默认）时 `docs/intents/` 存在至少一个 `*.intent.md`（`che require-intent` 退 0）才放行；`.che/feature.json` 已登记特性时还要求 `docs/intents/{slug}.intent.md` 与登记 slug 一致，缺失即拒绝并指回 `/che-compound-intent`；开关关闭（`CHE_REQUIRE_INTENT` 或 `.che/config.yml` 的 `require_intent:`）时静默放行；否则拒绝并要求先跑 `/che-compound-intent`
