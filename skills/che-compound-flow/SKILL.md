---
name: che-compound-flow
description: 团队基于 规格驱动开发 + PingCode 的 AI native 开发流程操作规范（产品出规格建卡 → 开发接规格规划实现 → 卡片随实现收尾）。当用户要执行或提到 /che-compound-specify、/che-compound-design、/che-compound-plan、/che-compound-implement、specstoissues、sync-cards、sync-status，或说"出 spec""写规格""这个需求转开发了""接需求开始 plan""拆任务""建卡""对账卡片""任务卡收尾"，或任务涉及 specs/ 产物、pingcode-mapping.json、需求树（idea/epic/feature/story）与本地任务的对应关系时使用本 skill——即使用户没提"che-compound"命令名，只要是在这套规格驱动流程里干活（产品侧或开发侧）也要使用。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# che-compound-flow

团队 AI native 开发流程的**衔接与门禁层**：不替代 `/che-compound-*` 命令与 `/che-pingcode-*` 命令（它们各自的规则以自身为准），也不复述 `pingcode` skill 的 ID 安全规则与 `mturtle-commit` 的提交格式——本 skill 只定义角色怎么交接、什么才算交接完成、卡片与产物怎么对得上账。

**前提**：规格驱动开发流程就绪（`.che/pingcode-config.yml` 由 `/che-pingcode-init` 生成，`pingcode` CLI ≥ 0.14.0 已安装并认证）。本 pack 无 hook 执行器——pingcode 卡流程经 clarify/plan/implement 的 Handoff 块可选目标/前置对账交接（条件不满足或拒绝即跳过），其余场景按各阶段要求手动跑命令即可。阶段间交接以各技能 SKILL.md 末尾的 `## Handoff` 块为准（目标 + 条件 + 回退）。

## 流程主线

| 阶段 | 角色 | 动作 | 产物 / 卡片 |
|---|---|---|---|
| 1. specify | 产品 | `/che-compound-specify` 意图访谈（目标/范围/约束/失败条件）+ 场景起草（Acceptance / Edge，全局稳定 `E#` ID）+ 生成统一规格；任务目录 `specs/<NNN>-<short-name>/` 由本阶段 `che task create` 创建并绑定 session | `specs/<NNN>-<short-name>/spec.md`（含 Why now / In scope / Out of scope / Constraints / Failure conditions 意图块、`### User Story N` 章节与 `### Edge Cases`） |
| 2. clarify | 产品 | `/che-compound-clarify` ≤5 问澄清并把结论回写 spec（清零 `[NEEDS CLARIFICATION]`；场景改动保留既有 `E#` ID） | 更新后的 `spec.md` |
| 3. 设计明细 | 产品/设计 | 涉 UI 的特性跑 `/che-compound-design`；无 UI 跳过；与建卡并行 | `specs/<NNN>-<short-name>/design-tasks.md`（设计明细；不是交接门禁项，不阻塞建卡与交接） |
| 4. 建卡 | 产品 | `/che-pingcode-specstoissues` 命令（optional） | 需求树 idea → epic → feature(spec 卡) → story 卡；登记 `specs/pingcode-mapping.json` |
| 5. 交接 | 产品→开发 | 门禁检查（下节），通过后转开发 | — |
| 6. plan+tasks | 开发 | `/che-compound-plan` 单命令一次产出 plan 工件（research/data-model/contracts/quickstart + plan.md）与依赖有序 `tasks.md`；特性目录存在 `design-tasks.md` 时必须先读，交互/页面状态按它对齐后再规划，与 spec 冲突时回产品/设计侧对齐；配置了 `mapping.task_artifact` 时 Handoff 可选目标补建任务卡（`/che-pingcode-specstoissues`） | `plan.md` 等计划产物 + `tasks.md`（+ 任务卡挂 story/spec 卡下） |
| 7. implement 前 | 开发 | implement 开始时 Handoff 前置对账（`/che-pingcode-sync-cards`，已建卡才提示） | spec 后续修改与卡片的增删改对齐 |
| 8. implement | 开发 | `/che-compound-implement`；UI 任务按设计稿 + `design-tasks.md` 设计要求清单验收；提交走 `/che-git-master`（消息不带工作项 ID） | 代码 + 测试 |
| 9. 收尾 | 开发 | 本地任务全部 `[x]` → `/che-pingcode-sync-status` | 卡片流转完成（单向，不回退） |

## 任务与 slug 单一事实源

全流程（specify（含 intent 访谈与场景起草）→ clarify/design → plan（含 tasks 生成）→ gapfill → planverify → intentguard → writeback）围绕**任务目录**展开：`/che-compound-specify` 用 `che task create {slug} --session <id>` 创建 `specs/NNN-{slug}/`（任务自此诞生，session 绑定落 `.che/feature.json`，机器本地不入库），后续所有制品都落这个目录。slug 是任务的全流程稳定句柄：目录名剥 `NNN-` 数字前缀（推送 PingCode 后为 `NCW-x` identifier 前缀）即得，`che paths --json` 的 `SLUG` 字段即该值。

- 下游各技能取 slug/目录一律从 `che paths`（带 `--session` 或在单任务时裸跑）读，不各自拼猜；链式调用（如 specify → clarify）直接沿用上游技能选定的 `TASK_DIR`/`SLUG`，不在多任务间重新解析；specify / planverify / intentguard 产物按 `{任务目录}/spec.md`、`{任务目录}/planverify.md` 等落盘。
- spec 推送 PingCode 后 `/che-pingcode-specstoissues` 把目录改名为 `{pingcode-identifier}-{slug}`（如 `NCW-4921-demo`）——slug 不变，session 绑定与后续解析不受影响。

## 交接门禁（阶段 5，spec 转开发前逐项核对）

1. `### User Story N` 章节齐备，每章标题行内标注优先级 `(Priority: P1/P2/P3)`（bundled spec 模板的既有格式）——这是卡片优先级映射的来源，缺了卡片优先级落不下来。
2. `specs/pingcode-mapping.json` 已登记：每张卡的 id 与状态可追溯。没有登记 = 建卡没完成，不能交接。
3. 建卡是 **optional** 步骤：specify 后选择不建卡的，交接前手动补跑 `/che-pingcode-specstoissues`。
4. `.che/pingcode-config.yml` 在位（没有就先跑 `/che-pingcode-init` 生成，`pingcode` CLI ≥ 0.14.0 已装并认证）。

任何一项不过 → 留在产品侧处理完再交接，不要把半成品 spec 推给开发。

设计明细（阶段 3 的 `design-tasks.md`）不在本门禁清单内：无 UI 特性不产出；涉 UI 未产出也不阻塞产品→开发交接，由设计侧自行跟进。

## 开发侧纪律

- **implement 前必过 planverify，ADR 层始终强制**：gapfill 后跑 `/che-compound-planverify`（其机械层对 gapfill 后的最终 tasks 跑确定性 ADR 查询 + 独立 checker 判 P3e）；`adr_gate` 默认 block——报告缺失、`adr_status` 非 clean、或 spec/plan/tasks 改动后 hash 不匹配，`/che-compound-implement` 一律拒绝；BLOCKED_ADR 时回 plan 修正（重跑 `/che-compound-plan` 重生 tasks.md）或 `/che-adr-draft` 立 superseding ADR 经人工 accept 后重跑 planverify（draft 状态不放行），不带越界补任务、动代码。规划过程中可随时手动 `/che-adr-check` 排查，但它无门禁效力。
- **implement 前必对账**：spec 在建卡后有过修改的，先 `sync-cards` 消化差异再动代码——卡片描述与 spec 漂移会让收尾阶段对不上账。
- **涉 UI 必对 design-tasks**：特性目录有 `design-tasks.md` 的，plan 前先读——交互规则、页面状态、设计要求清单（UI-01…）是 plan 的 UX 输入；它与 spec 冲突时回产品/设计侧对齐，绝不自行裁决；实现与验收对照设计稿 + 设计要求清单，不让 plan 即兴发明交互。
- **溯源链**：`specs/<NNN>-<short-name>/spec.md 章节 → mapping.json 卡片 id → sync-status 收尾`（提交消息不携带工作项 ID，溯源由 mapping.json 承担）。
- **收尾单向**：任务卡随本地勾选收尾，不回退；需要重开就走新的工作项，不要手动改回收尾态以外的状态。

## 幂等与边界

- `mapping.json` 已有登记条目时，建卡命令会提供补建/重建/中止选项——按用户选择走，已创建的卡片绝不重复建。
- Phase（实现阶段划分）永不建卡、不进卡描述；任务卡只在配置了 `mapping.task_artifact` 时才建，未配置时任务留在本地 checklist，这是设计行为不是故障。
- 不猜 `state_id` / `type_id` / `priority_id` 等 ID：先跑 `/che-pingcode-discover-context`或 pingcode 字典命令解析成 raw ID（详见 `pingcode` skill）。
- 流程本身要改造（阶段增删、角色变化）→ 先在模板仓/本 skill 里修订规范，不要在单个项目里即兴偏离。
