---
name: che-adr-check
description: 对照治理决策校验已产出的 plan 是否越界（只读）：把 plan 与 adrkit 语料 docs/adr/ 中约束本工作的决策逐条比对，标出违反项与需补的 ADR 变更；plan 产出后必跑，是进入 /che-compound-tasks 前的前置。当用户说「check 这个 plan」「校验 plan 越没越界」「plan 有没有违反决策」「adr-check」时使用——即使用户没提命令名，只要是 plan 之后的决策越界校验也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Adrkit Check Skill

# adrkit — check this plan

Runs after a plan exists, and answers one question: does this plan sit inside
the decisions already made, or does it quietly cross one?

Run this check manually after `/che-compound-plan` has produced a plan.

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
   plan silently overrule the old one.

## Notes

- Feature resolution uses the external `che` CLI on `PATH` (`@newchiwan/che`;
  if unavailable, `npm install -g @newchiwan/che@latest`). `ADRKIT_FEATURE_DIR`
  overrides feature-dir resolution.
- Requires `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`. If unavailable,
  install it with `npm install -g @adrkit/cli@0.20.0` and retry.
- Read-only, and that is load-bearing rather than incidental: this command is
  part of the plan-review chain, so it must never write.
- Exit code 1 means findings exist (corpus errors, or the evaluator returned the
  proposal). The report is still complete. Exit code 2 is a usage error.
- Configuration: `ADRKIT_DIR` (corpus, default `docs/adr/`), `ADRKIT_SNAPSHOT`
  (evaluator snapshot bundle), `ADRKIT_AS_OF` (evaluation date, default today
  UTC).

---

## Handoff

> Pack fork (ncw), port on upstream upgrade.

- **目标**：`/che-compound-tasks` —— 在 plan 通过检查后拆解为可执行任务
- **条件**：plan 已产出即必跑（plan→tasks 的必经步，不再是可选项）；本检查只读；无未处置 departure 才交接 tasks，回退：departure → 回 plan 修正或走 `/che-adr-draft` 记录为正式 ADR 变更后重跑本检查
