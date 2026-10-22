---
name: che-compound-require-intent
description: 'Gate before specify: refuses to let /che-compound-specify proceed if no intent doc exists in docs/intents/. Run as a manual check before specify; forces /che-compound-intent first. User-toggleable: CHE_REQUIRE_INTENT env or require_intent: in .che/config.yml (default on).'
---

# Require Intent Before Specify

This gate runs manually — invoked by the user or the agent before `/che-compound-specify`. The gate logic is **inlined in the `che` CLI** (`che require-intent`) — not an interactive prompt — so it runs deterministically.

Its job: gate `/che-compound-specify` on the existence of at least one intent doc.

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
4. Toggle **on** (the default) → checks `docs/intents/` for any `*.intent.md` file:
   - At least one exists → exits 0, `/che-compound-specify` proceeds
   - None exist → exits 1 with a clear message, `/che-compound-specify` does not proceed

If the gate exits non-zero, **do not continue with `/che-compound-specify`**. Tell the user:

> *"No intent doc exists in `docs/intents/`. Run `/che-compound-intent` first to capture goal, constraints, and failure conditions. Then re-run `/che-compound-specify`."*

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

`che require-intent --json` reports the resolved state as `{"REPO_ROOT": ..., "GATE": "on"|"off", "INTENT_DIR": ..., "INTENT_COUNT": N}` for scripting.

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
- **条件**：门禁开关开启（默认）时 `docs/intents/` 存在至少一个 `*.intent.md`（退出 0）才放行 specify；开关关闭（`CHE_REQUIRE_INTENT` 或 `.che/config.yml` 的 `require_intent:`）时静默放行；否则拒绝并要求先跑 `/che-compound-intent`
