---
name: che-adr-check
description: 按需对 plan 做独立 ADR 越界检查（只读）：把 plan 拟修改的路径与 adrkit 语料 docs/adr/ 中约束这些路径的决策逐条比对，标出违反项与需补的 ADR 变更。正式实现前校验与门禁由 /che-planverify 承担（其机械层共用本技能的 check.sh）；本技能用于规划过程中随时手动排查，不参与强制流程、不产生可供 gate 消费的 verdict、不满足 adr_gate。当用户说「check 这个 plan」「校验 plan 越没越界」「plan 有没有违反决策」「adr-check」时使用——即使用户没提命令名，只要是规划中的手动决策越界排查也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Adrkit Check Skill

# adrkit — check this plan

Answers one question on demand: does this plan sit inside
the decisions already made, or does it quietly cross one?

This is an **on-demand diagnostic**, not a gate. The formal pre-implement
verification and gate live in `/che-planverify` (whose deterministic
ADR layer invokes this same `scripts/check.sh` against the gapfilled plan/tasks
surface). Running this command manually never writes `planverify.md`, produces
no verdict the gate consumes, and does not satisfy `adr_gate` — a manual PASS
here does not replace the pre-implement planverify.

## User Input

$ARGUMENTS

## Steps

1. Treat any arguments as the repo-relative paths this plan intends to touch.
   Pass them — the check is only as sharp as the paths it is given. With no
   arguments it falls back to the plan artifact itself.
2. Run the pack-bundled script with those paths — project install:
   `.agents/skills/che-adr-check/scripts/check.sh`; global install:
   `~/.agents/skills/che-adr-check/scripts/check.sh`.
3. Read the output. It is one or two marker-introduced sections, each followed
   by a single JSON document:
   - `==> adrkit:check` — the `CheckOutcome`: which decisions govern these
     paths, and findings for any changed ADR. Always present.
   - `==> adrkit:evaluate` — the deterministic evaluator's routing report for
     this plan. Present **only** when `ADRKIT_SNAPSHOT` points at an offline
     snapshot bundle. When it is absent, the script says so on stderr; that is
     an omission you have been told about, not a check that passed.
4. Report back, in the plan's own terms:
   - Every governing decision the plan touches, named by id.
   - Any place the plan departs from one. Say so explicitly. A departure that
     is deliberate and recorded is fine; a departure nobody noticed is the
     thing this catches.
   - If the evaluator ran, its routing outcome and any escalation trigger. The
     evaluator routes; it does not approve. Do not read a clean route as sign-off.
5. If the plan does cross a decision, the next step is
   `/che-adr-draft` — record the new decision rather than letting the
   plan silently overrule the old one. For a formal clearance, re-run
   `/che-planverify` afterwards.

## Notes

- Feature resolution uses the external `che` CLI on `PATH` (`@newchiwan/che`;
  if unavailable, `npm install -g @newchiwan/che@latest`). `ADRKIT_FEATURE_DIR`
  overrides feature-dir resolution.
- Requires `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`. If unavailable,
  install it with `npm install -g @adrkit/cli@0.20.0` and retry.
- Read-only, and that is load-bearing rather than incidental: this command
  never writes — no `planverify.md`, no verdict, no gate-relevant state.
- Exit code 1 means findings exist (corpus errors, or the evaluator returned the
  proposal). The report is still complete. Exit code 2 is a usage error.
- Configuration: `ADRKIT_DIR` (corpus, default `docs/adr/`), `ADRKIT_SNAPSHOT`
  (evaluator snapshot bundle), `ADRKIT_AS_OF` (evaluation date, default today
  UTC).

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：无强制交接目标——本技能是按需排查工具，不参与强制流程
- **条件**：只读；输出仅终端报告；不产生正式 verdict、不满足 `adr_gate`；正式实现前校验一律走 `/che-planverify`
- **回退**：发现 departure → 修 plan（重跑 `/che-plan` 重生 tasks.md）或走 `/che-adr-draft` 立正式 ADR 变更，随后以 `/che-planverify` 产出正式判定
