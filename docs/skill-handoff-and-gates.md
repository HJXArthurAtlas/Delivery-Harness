# Skill 交接流程与门禁清单

> 来源：`skills/` 各 SKILL.md 正文（2026-10-19 盘点，hook 机制已清除、统一 Handoff 块）。分发面技能共 20 个，本文覆盖全部交接（handoff）与门禁（gate）机制。

## 1. 流程主线（`ncw-speckit-flow`，9 阶段）

| # | 阶段 | 角色 | 动作 / 命令 | 产物 |
|---|---|---|---|---|
| 1 | specify | 产品 | `/ncw-speckit-specify` | `specs/<NNN>-<short-name>/spec.md`（含 `### User Story N`） |
| 2 | 设计明细 | 产品/设计 | 涉 UI 跑 `/ncw-speckit-design`（先 clarify 更佳）；无 UI 跳过；可与建卡并行 | `design-tasks.md`（**不是门禁项**，不阻塞交接） |
| 3 | 建卡 | 产品 | `/ncw-pingcode-specstoissues`（optional；specify Handoff 可选目标） | 需求树 idea→epic→feature→story；登记 `specs/pingcode-mapping.json` |
| 4 | **交接门禁** | 产品→开发 | 逐项核对（见 §2） | — |
| 5 | plan | 开发 | `/ncw-speckit-plan`；有 `design-tasks.md` 必读，冲突回产品/设计裁决 | 计划产物 |
| 6 | tasks | 开发 | `/ncw-speckit-tasks`；配了 `mapping.task_artifact` 才补建任务卡 | `tasks.md`（+任务卡） |
| 7 | implement 前 | 开发 | implement 开始 Handoff 前置对账（`/ncw-pingcode-sync-cards`，已建卡才提示） | spec 改动与卡片对齐 |
| 8 | implement | 开发 | `/ncw-speckit-implement`；提交走 `mturtle-commit`，消息带故事卡 ID | 代码 + 测试 |
| 9 | 收尾 | 开发 | 本地全 `[x]` → `/ncw-pingcode-sync-status` | 卡片流转完成（单向，不回退） |

## 2. 交接门禁（阶段 4，spec 转开发前逐项必过）

1. `### User Story N` 章节齐备，标题行标注 `(Priority: P1/P2/P3)` —— 卡片优先级映射来源。
2. `specs/pingcode-mapping.json` 已登记，每卡 id/状态可追溯 —— 没有 = 建卡没完成，不能交接。
3. 建卡是 optional：没建卡的交接前手动补跑 `/ncw-pingcode-specstoissues`。
4. `pingcode-config.yml` 在位（没有先跑 `/ncw-pingcode-init` 生成，`pingcode` CLI ≥ 0.14.0 已装并认证）。

任一不过 → 留在产品侧，不推半成品给开发。`design-tasks.md` 明确**不在**门禁内。

## 3. Completion Report「Pack fork」下一步提示（6 个主线命令技能）

每个命令结束时输出统一的「主流程 / 可选」分组提示，条目格式 `- /命令: [可选] 能做什么`，上游升级需 port：

| 技能 | 主流程指向 | 可选指向 |
|---|---|---|
| `ncw-speckit-specify` | `/ncw-speckit-clarify`、`/ncw-speckit-design`（涉 UI 必跑） | `/ncw-pingcode-specstoissues` 建卡 |
| `ncw-speckit-clarify` | `/ncw-speckit-design`、`/ncw-speckit-plan`（交接门禁通过后） | `/ncw-speckit-grill-me`、`/ncw-pingcode-specstoissues` 建卡 |
| `ncw-speckit-design` | `/ncw-speckit-plan`（交接门禁通过后） | `/ncw-pingcode-specstoissues` 建卡（不建则交接前必须补跑） |
| `ncw-speckit-plan` | `/ncw-speckit-tasks` | `/ncw-adrkit-check`（对照 ADR 语料校验 plan 越界） |
| `ncw-speckit-tasks` | `/ncw-speckit-implement`（涉 UI 按设计明细核验；spec 有改动先 `/ncw-pingcode-sync-cards`） | `/ncw-pingcode-specstoissues` 补建任务卡（配了 `mapping.task_artifact` 时） |
| `ncw-speckit-implement` | `/ncw-pingcode-sync-status` 收尾故事卡（单向，重开新建工作项） | `/ncw-speckit-converge`（实现与工件有差距时追加收敛任务） |

## 4. design-tasks 交接约束（plan / implement 的 pack fork 段）

- `ncw-speckit-plan`：`$FEATURE_DIR/design-tasks.md` 存在时必读，交互规则/页面状态/UI-xx 清单是 plan 的绑定 UX 输入；与 spec 冲突 → 停下回产品/设计裁决，**绝不自行解决**。
- `ncw-speckit-implement`：有 `design-tasks.md` 时 UI 任务按其交互规则/页面状态实现，逐项核验设计要求清单 UI-xx 后才算完成。

## 5. 统一 Handoff 块（每个链上技能末尾）

hook 机制已**全部清除**（原 `before_*` / `after_*` 挂点与 `extension.yml` 接线表述一并移除）；交接统一改为 SKILL.md 末尾的中文 `## Handoff` 块，显式声明**目标**与**条件**（有回退则加**回退**行）。上游原文技能带 `> Pack fork (ncw), port on upstream upgrade.` 引用行，上游升级需 port；pack 原生技能（design / require-intent / planverify-gate）省略该行。

主线全链（planverify 必须在 gapfill 后、implement 前，审判完整义务集）：

```
load → intent → expectations → specify → clarify|grill-me → design(涉UI) → plan
     → tasks → gapfill → planverify → implement → intentguard → writeback
```

| 技能 | Handoff 目标 | 条件 / 回退 |
|---|---|---|
| `ncw-compound-load` | `/ncw-compound-intent` | 每特性开始装载一次；会话已装载则 intent 隐式跳过；context 压缩后用户手动重跑，绝不 unsolicited 重载 |
| `ncw-compound-intent` | `/ncw-compound-expectations` | intent doc 已写入且用户确认；AskUserQuestion continue 链式调用，stop/quit 手动续 |
| `ncw-compound-expectations` | `/ncw-speckit-specify` | 期望文档已写入；continue 时以 intent 的 goal+in-scope 预填 |
| `ncw-compound-require-intent`（门禁） | `/ncw-speckit-specify` | `docs/intents/` 有 `*.intent.md`（脚本退 0）才放行；否则拒绝，先跑 intent。**手动/agent 调用的 shell 门禁** |
| `ncw-speckit-specify` | `/ncw-speckit-clarify`（或 grill-me） | spec 质量清单通过；require-intent 已放行；涉 UI 澄清后接 design |
| `ncw-speckit-clarify` | design（涉 UI）/ plan | 结论回写 spec；交接门禁（§2）通过才进 plan |
| `ncw-speckit-grill-{me,with-docs}` | design（涉 UI）/ plan | grill-me 不回写 spec（需回写先 clarify）；with-docs 结论落 `docs/adr/` |
| `ncw-speckit-design` | `/ncw-speckit-plan` | `design-tasks.md` 已产出；非门禁项；与 spec 冲突回产品/设计裁决 |
| `ncw-speckit-plan` | `/ncw-speckit-tasks` | 工件齐备；有 design-tasks.md 已对齐；可选先 `/ncw-adrkit-check` |
| `ncw-adrkit-check` | `/ncw-speckit-tasks` | plan 后手动跑，只读；发现越界先回 plan 修正或立正式 ADR 变更 |
| `ncw-speckit-tasks` | `/ncw-compound-gapfill` | tasks.md 依赖有序；配 `mapping.task_artifact` 时任务卡已补建 |
| `ncw-compound-gapfill` | `/ncw-compound-planverify` | 四类缺口任务已追加进 tasks.md |
| `ncw-compound-planverify` | `/ncw-speckit-implement` | PASS 放行；回退：REPLAN_ALLOWED 改 plan 后重跑、BLOCKED_DRIFT 回 plan |
| `ncw-compound-planverify-gate`（门禁） | `/ncw-speckit-implement` | 非 block 直接放行；block 模式需 PASS/REPLAN_ALLOWED，缺失或 BLOCKED_DRIFT 拒绝。**手动/agent 调用的 shell 门禁** |
| `ncw-speckit-implement` | `/ncw-compound-intentguard` | tasks 全 `[x]`；UI 任务逐项核验 UI-xx；planverify-gate（block 时）已放行 |
| `ncw-compound-intentguard` | `/ncw-compound-writeback` | PASS 直接交接；REVIEW 须人工清除；回退：BLOCKED 回 implement 修复后重跑 |
| `ncw-compound-writeback` | 无（链终点） | 仅 PASS（或 REVIEW 经人工确认）后执行；BLOCKED 必须拒绝 |

### 门禁边界（hook 清除后的保留约束）

- 两个门禁（require-intent / planverify-gate）仍是 **shell 脚本 wrapper**，手动或 agent 在边界前调用——脚本保证确定性判定，不依赖任何 hook 分发机制。
- `ncw-adrkit-draft` 反向约束不变：唯一写命令，**刻意不进任何交接链自动触发**（plan 阶段自动建记录会制造虚假决策记忆）。
- `ncw-compound-intent` / `-expectations` 的 AskUserQuestion 三段链（continue / stop / quit）是链内**显式**交接，与末尾 Handoff 块互补：块声明目标与条件，AskUserQuestion 执行当次选择。

## 6. 无交接定义的技能

`ncw-speckit-analyze`、`ncw-speckit-converge`、`ncw-speckit-constitution`、`ncw-adrkit-context`、`ncw-adrkit-draft`（draft 见 §5 反向约束）。
