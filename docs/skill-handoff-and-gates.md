# Skill 交接流程与门禁清单

> 来源：`skills/` 各 SKILL.md 正文（2026-10-19 盘点）。分发面技能共 20 个，本文覆盖全部交接（handoff）与门禁（gate/hook）机制。

## 1. 流程主线（`ncw-speckit-flow`，9 阶段）

| # | 阶段 | 角色 | 动作 / 命令 | 产物 |
|---|---|---|---|---|
| 1 | specify | 产品 | `/ncw-speckit-specify` | `specs/<NNN>-<short-name>/spec.md`（含 `### User Story N`） |
| 2 | 设计明细 | 产品/设计 | 涉 UI 跑 `/ncw-speckit-design`（先 clarify 更佳）；无 UI 跳过；可与建卡并行 | `design-tasks.md`（**不是门禁项**，不阻塞交接） |
| 3 | 建卡 | 产品 | pingcode 扩展 specstoissues（optional, priority 99） | 需求树 idea→epic→feature→story；登记 `specs/pingcode-mapping.json` |
| 4 | **交接门禁** | 产品→开发 | 逐项核对（见 §2） | — |
| 5 | plan | 开发 | `/ncw-speckit-plan`；有 `design-tasks.md` 必读，冲突回产品/设计裁决 | 计划产物 |
| 6 | tasks | 开发 | `/ncw-speckit-tasks`；配了 `mapping.task_artifact` 才补建任务卡 | `tasks.md`（+任务卡） |
| 7 | implement 前 | 开发 | pingcode 扩展 sync-cards 对账 | spec 改动与卡片对齐 |
| 8 | implement | 开发 | `/ncw-speckit-implement`；提交走 `mturtle-commit`，消息带故事卡 ID | 代码 + 测试 |
| 9 | 收尾 | 开发 | 本地全 `[x]` → sync-status | 卡片流转完成（单向，不回退） |

## 2. 交接门禁（阶段 4，spec 转开发前逐项必过）

1. `### User Story N` 章节齐备，标题行标注 `(Priority: P1/P2/P3)` —— 卡片优先级映射来源。
2. `specs/pingcode-mapping.json` 已登记，每卡 id/状态可追溯 —— 没有 = 建卡没完成，不能交接。
3. 建卡是 optional：没建卡的交接前手动补跑 specstoissues。
4. `pingcode-config.yml` 在位（没有先跑 pingcode 扩展 init；未装扩展先 `ncw-monorepo-init`）。

任一不过 → 留在产品侧，不推半成品给开发。`design-tasks.md` 明确**不在**门禁内。

## 3. Completion Report「Pack fork」下一步提示（6 个主线命令技能）

每个命令结束时输出统一的「主流程 / 可选」分组提示，条目格式 `- /命令: [可选] 能做什么`，上游升级需 port：

| 技能 | 主流程指向 | 可选指向 |
|---|---|---|
| `ncw-speckit-specify` | `/ncw-speckit-clarify`、`/ncw-speckit-design`（涉 UI 必跑） | specstoissues 建卡 |
| `ncw-speckit-clarify` | `/ncw-speckit-design`、`/ncw-speckit-plan`（交接门禁通过后） | `/ncw-speckit-grill-me`、specstoissues 建卡 |
| `ncw-speckit-design` | `/ncw-speckit-plan`（交接门禁通过后） | specstoissues 建卡（不建则交接前必须补跑） |
| `ncw-speckit-plan` | `/ncw-speckit-tasks` | `/ncw-adrkit-check`（对照 ADR 语料校验 plan 越界） |
| `ncw-speckit-tasks` | `/ncw-speckit-implement`（涉 UI 按设计明细核验；spec 有改动先 sync-cards） | specstoissues 补建任务卡（配了 `mapping.task_artifact` 时） |
| `ncw-speckit-implement` | sync-status 收尾故事卡（单向，重开新建工作项） | `/ncw-speckit-converge`（实现与工件有差距时追加收敛任务） |

## 4. design-tasks 交接约束（plan / implement 的 pack fork 段）

- `ncw-speckit-plan`：`$FEATURE_DIR/design-tasks.md` 存在时必读，交互规则/页面状态/UI-xx 清单是 plan 的绑定 UX 输入；与 spec 冲突 → 停下回产品/设计裁决，**绝不自行解决**。
- `ncw-speckit-implement`：有 `design-tasks.md` 时 UI 任务按其交互规则/页面状态实现，逐项核验设计要求清单 UI-xx 后才算完成。

## 5. compound 链式交接（AskUserQuestion 显式提示）

- `ncw-compound-intent` → 完成后提供 chain handoff：continue → `/ncw-compound-expectations`；stop/quit → 干净结束，可稍后手动续。
- `ncw-compound-expectations` → 被 intent 链式调用时跳过冗长确认（skip-when-chained）；完成后 handoff 到 `/ncw-speckit-specify`。

## 6. Hook 机制技能清单（`before_*` / `after_*`，共 5 个）

| 技能 | Hook 挂点 | 触发时机与行为 | 性质 |
|---|---|---|---|
| `ncw-compound-require-intent` | `before_specify` | `/ncw-speckit-specify` 前检查 `docs/intents/` 无意图文档则拒绝，强制先跑 `/ncw-compound-intent` | 门禁（gate），shell 脚本 |
| `ncw-compound-planverify-gate` | `before_implement` | `SKC_PLANVERIFY_GATE=block` 时，planverify 判定缺失或 `BLOCKED_DRIFT` 则拒绝 `/ncw-speckit-implement` | 门禁（gate），shell 脚本，默认 no-op |
| `ncw-compound-load` | `before_constitution` | 项目启动时静默 scaffold 目录 + 简报 "loaded N items" | 注入，非门禁 |
| `ncw-adrkit-check` | `after_plan` | plan 产出后对照 ADR 语料校验越界；**只读是硬性约束**（hook 可达故绝不写） | 检查，optional |
| `ncw-compound-writeback` | `after_implement` | 只在 `/ncw-compound-intentguard` 出判定后运行；`optional: true`，用户确认才执行 | 写回，optional |

### Hook 共同边界

- **pack 自身不执行任何 hook**——自动化触发一律依赖上游扩展的 `extension.yml` 接线（adrkit 由 `ncw-monorepo-init` 经 `specify extension add adrkit` 注册；compound 走上游 compound 扩展）；无接线时全部降级为手动/agent 调用。
- 门禁类统一做成 **shell 脚本 wrapper** 而非 agent-prompt hook：harness 的 hook executor 对 agent-prompt hook 会静默 no-op（上游 v0.2.1 实测）。
- `ncw-adrkit-draft` 反向约束：唯一写命令，**刻意不可达任何 hook**（plan 阶段自动建记录会制造虚假决策记忆）。
- grill 两个技能（`ncw-speckit-grill-me` / `-with-docs`）已**删除**上游 extension-hook 段，不再有 hook 机制。

## 7. 无交接/门禁定义的技能

`ncw-speckit-analyze`、`ncw-speckit-converge`、`ncw-speckit-constitution`、`ncw-speckit-grill-me`、`ncw-speckit-grill-with-docs`、`ncw-adrkit-context`、`ncw-adrkit-draft`，以及 compound 组的 `gapfill` / `planverify` / `intentguard` / `writeback`（writeback 仅 hook 挂点见 §6）。
