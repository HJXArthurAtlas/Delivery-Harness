---
name: ncw-compound-load
description: Load settled ADRs (adrkit corpus, docs/adr/) plus corrections and patterns (docs/corrections/, docs/patterns/) into agent context at the start of a feature. Auto-scaffolds the store metadata and artifact directories if missing.
---

# Load Compound Store

You load the project's settled decisions and the committed compound store, and inject them into the current session's agent context. Settled ADRs come from the adrkit corpus at `docs/adr/` (override with `ADRKIT_DIR`); past mistakes and approved patterns come from `docs/corrections/` and `docs/patterns/`. All of them should constrain everything the agent does for the rest of the session.

---

## What to do

**1. Detect or create the compound store.**

If any part of the scaffold is missing, create the missing directories and README:

```
docs/
├── compound/
│   └── README.md     (explains the structure)
├── corrections/      (empty)
└── patterns/         (empty)
```

Copy this skill's bundled `references/compound-store-README.md` verbatim to `docs/compound/README.md` if the README is missing (it documents the store contract for future contributors — correction frontmatter and pattern slots; settled ADRs live in the adrkit corpus at `docs/adr/`).

When initializing a new store, tell the user: *"Compound store initialized: README at `docs/compound/README.md`, corrections at `docs/corrections/`, and patterns at `docs/patterns/`. Empty for now — it will fill over the next few features via `/ncw-compound-writeback`."*

**2. Migrate legacy artifacts, then read all files.** Migrate a legacy `docs/compound/adr/` corpus into the canonical adrkit corpus with the legacy-corpus instructions in `/ncw-adrkit-draft`. Move any legacy `docs/compound/corrections/` and `docs/compound/patterns/` files to `docs/corrections/` and `docs/patterns/`. Then read all files in the adrkit corpus (`docs/adr/`, or `$ADRKIT_DIR` when the project overrides it) and in `docs/corrections/` and `docs/patterns/`.

**3. Inject a context summary** at the start of the agent's working memory:

```
COMPOUND STORE LOADED

ADRs (settled decisions, do not re-debate):
- ADR-001 {title} — Rule for AI: {one-liner}
- ADR-002 {title} — Rule for AI: {one-liner}
...

Corrections (past mistakes, do not repeat):
- {date}-{slug}: {derived rule}
...

Patterns (approved approaches, reach for these by default):
- {slug}: {one-line description, when to use}
...
```

**4. Confirm to user**:

*"Loaded: {N} ADRs from the adrkit corpus, {N} corrections and {N} patterns from the compound store. Settled decisions will be respected; known corrections will be avoided; patterns will be reached for during the rest of this session."*

---

## Notes for the rest of the session

After loading, when the agent makes design decisions during `/ncw-compound-intent`, `/ncw-speckit-implement`, `/ncw-compound-intentguard`, etc., it should:

- **Reference relevant ADRs** when constraints are being chosen — don't propose a constraint that contradicts a settled ADR
- **Avoid known correction patterns** — if the agent is about to do something that matches a correction note, stop and warn
- **Reach for established patterns** by default rather than inventing fresh approaches

---

## Re-loading after context compaction

If the session's context is compacted by the harness, the compound store summary may be dropped. The user can re-run `/ncw-compound-load` to restore it.

---

## Tool choices

- **Read** for scanning compound store files
- **Bash** (`mkdir`, `ls`, `cp`, `mv`) for scaffold creation and the explicit legacy migrations above — copy `references/compound-store-README.md` into place rather than composing a fresh README
- **Write** for the auto-created `docs/compound/README.md` only if the bundled reference is unavailable

---

## Bundled references

- `references/compound-store-README.md` — the scaffold README copied into `docs/compound/README.md` when the store is first created
- `references/ref.md` — conceptual reference for the whole compound workflow (ICE slots, why compartmentation defeats reward-hacking, planverify vs intentguard). Read it when the user asks *why* the workflow is designed this way; it is background, not a procedure.

---

## What you do NOT do

- **Edit compound store content during load** — scaffolding and the explicit legacy migrations above are the only exceptions; new learnings are written via `/ncw-compound-writeback`.
- **Re-load mid-session unsolicited** — load happens at the start of a feature; only re-run if the user explicitly invokes it after context compaction.
- **Block the rest of the session if the store is empty** — empty store is normal on a fresh project; just confirm scaffold and continue.

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/ncw-compound-intent` —— 锁定目标/约束/失败条件
- **条件**：每个特性开始时装载一次后进入 intent；本次会话已装载过则 intent 隐式跳过本步；context 被压缩后可由用户手动重跑 load，绝不 unsolicited 重载