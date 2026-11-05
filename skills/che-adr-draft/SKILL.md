---
name: che-adr-draft
description: docs/adr/ 的唯一写命令，两个模式——起草：从当前 plan 工件立一条新 ADR（脚本脚手架 + 人工填推理，落稿后 lint 校验）；种子导入：把团队基础 ADR（references/seed-adr/ 七条默认底版，随技能分发维护）先讲 ADR 是什么与 adr_gate 联动、再逐条确认后导入 docs/adr/（id 冲突顺延重编号，同名不覆盖），/che-project-init 在语料缺失时移交本模式。刻意不经任何 hook 自动触发——决策变更必须显式立档。当用户说「把这个决策落成 ADR」「立一条 ADR」「draft 一份决策记录」「导入基础 ADR」「初始化 ADR 语料」，或 plan 出现需正式化的决策变更时使用——即使用户没提命令名，只要是起草新 ADR 或导入团队种子也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# Adrkit Draft Skill

# adrkit — draft a decision from this plan

Turns a decision the plan already made into a record that outlives it. Plans get
superseded and forgotten; the decisions inside them are what the next feature
needs and never gets.

## User Input

$ARGUMENTS

## Modes

`docs/adr/` is this skill's single write target, reached through two modes.
Resolve the mode from the corpus state and the request — a `/che-project-init`
handoff and a direct user invocation behave identically:

- **Draft from plan** (default) — the Steps below. A plan artifact exists and
  the user wants a decision in it formalized as one new record.
- **Seed import** — the project corpus is missing the team base records, or
  the user asks to import them. Follow "Seed import mode" instead of the
  Steps.

## Steps

1. Read the current plan. Identify the decision worth recording — a choice
   between real alternatives with consequences that outlast this feature. If the
   plan made no such choice, say so and stop. Not every plan contains an ADR,
   and manufacturing one is worse than not writing it.
2. Run the pack-bundled script with the decision's title as arguments —
   project install: `.agents/skills/che-adr-draft/scripts/draft.sh`; global
   install: `~/.agents/skills/che-adr-draft/scripts/draft.sh`. Write the title as the
   decision itself, in the imperative — "Adopt Postgres for the read model", not
   "Database choice".
3. The script prints `{ "id", "path" }`. It has scaffolded a schema-valid draft
   at the next free id; it has **not** written the reasoning.
4. Open that file and fill it in from the plan:
   - **Context** — the forces that made this a decision. Pull them from the
     plan; do not invent constraints the plan never stated.
   - **Decision** — what was chosen, in the plan's own terms.
   - **Options considered** — the alternatives the plan actually weighed, with
     why each lost. If the plan weighed none, record that honestly rather than
     inventing a strawman to reject.
   - **Consequences** — what gets easier, what gets harder, and what would make
     this worth revisiting.
   - Frontmatter — `affects` patterns for the paths this governs, `relatesTo`
     for records it touches, and a `review.tier` matching the blast radius.
5. Leave the status as `draft`. Ratification is a human act, and this command
   does not perform it.
6. After the new record is ratified (a human act — a `draft` status alone
   clears nothing), re-run `/che-planverify` to produce the formal
   pre-implement verdict. Optionally run `/che-adr-check` afterwards to confirm
   the new record is valid and does not conflict with an existing decision.

## Seed import mode

Bootstrap the project corpus from the team base records bundled with this
skill — `references/seed-adr/0001-backend-architecture-rules-layering-and-call-direction.md`
through `references/seed-adr/0007-liquibase-database-change-regime.md`
(the team's default seed ADRs, shipped and maintained with this pack). Execute these
steps in order; steps 1 and 2 are mandatory explanations and MUST NOT be
skipped even if the user pushes to move fast:

1. **Explain what an ADR is**: one approved technical decision per record
   (context / decision / consequences), and how the corpus binds later work —
   with `adr_gate: block` in `.che/config.yml`, an implement-phase plan that
   reverts an accepted decision is rejected, and planverify reads the corpus
   for its verdict.
2. **Introduce the seed set as a whole**: seven records of backend rules
   written for Java/Spring services (layering and call direction, domain
   exceptions, transactional event listeners, HTTP/object-storage IO outside
   DB transactions, explicit async executors, re-read managed entities before
   save, Liquibase-only schema changes). Say plainly: on a non-Spring project
   every record may be declined, and an empty corpus is valid — adr_gate
   treats it as clean.
3. **Per-record confirmation**, one question at a time (never batched): for
   each record state the rule in one sentence, the `affects` path patterns it
   governs, and applicability (Spring-specific or general); ask 导入 / 跳过.
4. **Optional drafting**: after the walk-through, ask whether the user wants
   to record a decision of their own right now; if yes, switch to the
   draft-from-plan Steps (or `scripts/scaffold.sh` when no plan exists) and
   continue the import afterwards.
5. **Import**: copy each approved seed into `docs/adr/`. A record whose
   `NNNN-` id file already exists is NOT overwritten — rename the incoming
   file to the next free id first (the filename drives the record id; never
   hand-number). Then run the cross-skill lint entry (`<adrkit> lint`, see
   Notes) and show the outcome.
6. **Report honestly**: imported records (id + title), skipped records, lint
   result. Nothing is written without per-record approval.

## Notes

- Feature resolution uses the external `che` CLI on `PATH` (`@newchiwan/che`;
  if unavailable, `npm install -g @newchiwan/che@latest`). `ADRKIT_FEATURE_DIR`
  overrides feature-dir resolution.
- Requires `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`; `scripts/adr.sh` is the
  cross-skill lint/migration entry point. If unavailable, install it with
  `npm install -g @adrkit/cli@0.20.0` and retry.
- This is the only command in the extension that writes, and it is deliberately
  not reachable from any hook. A plan-phase hook that created records
  unprompted would manufacture decision memory instead of recording it.
- In draft mode it writes exactly one new file and never edits an existing
  record. If the
  target path is already taken it refuses rather than overwriting (exit 1).
  Seed import mode writes only the approved seed files under the same
  no-overwrite rule (collision → renumber, see above).
- Single corpus: since the ADR-unification cutover, `docs/adr/` (or
  `$ADRKIT_DIR`) is the project's only ADR corpus. `che-grill-with-docs`
  and `che-retro` allocate their records here too, through this
  skill's `scripts/scaffold.sh` — the plan-less variant of this command's
  deterministic half (same CLI, same id allocation, no plan required). All
  writers share one numbering sequence; never hand-number.
- Migrating legacy corpus locations (records still under
  `docs/compound/adr/` or `docs/domain_knowledge/adr/`): records already in
  `docs/adr/` are canonical and need no relocation. The adrkit CLI owns the
  conversion. In the commands below, `<adrkit>` means
  `.agents/skills/che-adr-draft/scripts/adr.sh` (global install:
  `~/.agents/skills/che-adr-draft/scripts/adr.sh`). Dry-run
  `<adrkit> migrate --from madr --rename --dir <legacy-dir>`
  on each legacy directory to preview the findings; before moving anything,
  renumber incoming legacy records by renaming their files so that every
  `NNNN-slug.md` id is unique across the existing canonical records and all
  incoming legacy sets (the filename drives the record id, and `<adrkit> lint`
  does not report duplicate ids, verified against the adrkit CLI, so this
  renumber step is the merge's only collision guard); move only the legacy
  records into `docs/adr/`; run
  `<adrkit> migrate --from madr --rename --dir docs/adr` once over the merged
  corpus; backfill the reported findings (date, status, deciders); finish with
  `<adrkit> lint`.
- A plan must exist. Drafting "from the plan artifact" without a plan is not a
  degraded mode, it is a different and worse thing.
