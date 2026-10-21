---
name: che-compound-require-intent
description: 'Gate before specify: refuses to let /che-compound-specify proceed if no intent doc exists in docs/intents/. Run as a manual check before specify; forces /che-compound-intent first.'
---

# Require Intent Before Specify

This gate runs manually — invoked by the user or the agent before `/che-compound-specify`. It is a **thin shell-script wrapper** — not an interactive prompt — so it runs deterministically via Bash.

Its job: gate `/che-compound-specify` on the existence of at least one intent doc.

---

## What you must do

Run the gate script via Bash:

```bash
.agents/skills/che-compound-require-intent/scripts/bash/require-intent.sh
```

The script:

1. Walks up from cwd to find the project root (the directory containing `.git`)
2. Checks `docs/intents/` for any `*.intent.md` file
3. Exits 0 (silently) if at least one intent doc exists — `/che-compound-specify` proceeds normally
4. Exits 1 with a clear message if none exist — `/che-compound-specify` does not proceed

If the script exits non-zero, **do not continue with `/che-compound-specify`**. Tell the user:

> *"No intent doc exists in `docs/intents/`. Run `/che-compound-intent` first to capture goal, constraints, and failure conditions. Then re-run `/che-compound-specify`."*

---

## Why this is a shell script and not an interview

A gate must execute deterministically; a shell script does. The actual intent capture still happens via the interactive `/che-compound-intent` skill — the user runs it after this gate blocks them.

---

## Tool choices

- **Bash** to invoke the gate script
- No Read, Write, Edit, or other tools needed

---

## Handoff

- **目标**：`/che-compound-specify` —— 在 intent 已捕获的前提下生成特性规格
- **条件**：`docs/intents/` 存在至少一个 `*.intent.md`（脚本退出 0）才放行 specify；否则拒绝并要求先跑 `/che-compound-intent`