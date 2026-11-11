---
name: che-design
description: 需求澄清与设计明细产出（design 命令）：按四盲区问句库逐项澄清需求，按设计规约与设计自检对方案做七域走查，产出页面级设计明细 design-tasks.md 到当前特性目录。依赖活动特性（intent.md）才能执行；澄清结论不回写 intent。当用户运行或提到 /che-design，或说「出设计明细」「design-tasks」「把这份 spec 转成设计明细」「设计走查这份需求」，或要在 intent 之后、开发之前做设计层澄清与设计明细产出时使用本 skill——即使用户没提「che-design」命令名，只要是 intent 之后的设计澄清与设计明细转化意图也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.local.yml` 的非空 `language:` 值（缺键或空值回落 `.che/config.yml` 的 `language:`；`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；两处键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **交互规则（pack fork，port on upstream upgrade）**：所有需要用户回答的问题——四盲区澄清提问、待确认清单、走查「待补」确认、产出确认——必须经宿主的交互式提问工具发出（AskUserQuestion；omp 端即 `ask` 工具），以表单承载选项或自由文本输入；绝不把问题与选项打印进回复正文后停下等待键入回答。纯展示、无需回答的输出（需求清单、走查记录、下一步指引）不受此限。

# che-design

本 skill 只产出设计明细（`design-tasks.md`），绝不产出视觉稿、原型或代码；绝不代替用户拍板业务口径。

与 `che-clarify` 的分工：clarify 把澄清结论回写 intent.md（≤5 问）；本 skill 的澄清是设计层，结论落设计明细，绝不修改 intent.md。顺序上先 clarify 后 design（本 skill 消化的是 intent 之外的设计层歧义）。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## 执行步骤

### 段一：确定功能语境

1. 确定功能名称与所属迭代：优先取自活动特性 intent 或用户输入；缺什么向用户问什么。
2. 故事卡号不盲问：先查 `specs/pingcode-mapping.json` 中当前特性的登记条目，有则带出卡片 id；没有登记（建卡是 optional 步骤）再问用户，用户不知道就留空，绝不阻塞。

### 段二：解析当前特性（硬性前置，与其他 speckit 命令同惯例）

1. 确认环境是 macOS / Linux 且外部 `che` CLI 在 PATH 上可用（`@newchiwan/che`，要求 Node ≥ 22.18；缺失则 `npm install -g @newchiwan/che@latest`）。不可用则声明环境不受支持并停止。绝不退回项目内其他脚本——pack 契约是只经由 PATH 上的 `che` 解析。
2. 从仓库根运行 `che paths --json` **恰好一次**，解析 JSON 取 `FEATURE_DIR` / `FEATURE_SPEC`。
3. 校验 `$FEATURE_DIR/intent.md` 存在：脚本失败或 intent 缺失时停止，提示先运行 `/che-intend`，绝不凭空继续。
4. 本 skill 依赖一个具体的 intent 才能执行：后续澄清以该 intent 为需求材料，设计明细最终落到 `$FEATURE_DIR/design-tasks.md`（特性目录本身即唯一标识）。
5. 首个写盘动作前记录 runs 时间线开始：`che state start design --session "$CHE_SESSION_ID"`（无 session id 时省略 --session）。Pack fork (ncw)，上游升级时移植。

### 段三：四盲区澄清

以 intent.md 为主需求材料、参考相关现状实现，按 `references/question-bank.md` 逐项核对四个盲区（为什么 / 有哪些情况 / 数据算什么 / 动作的后果与回退）；任何不确定事项必须向用户提问，直到需求足够清晰。

- 问句是检查模板，不是必须逐字照问；按当前需求替换页面名、字段名、角色、场景。
- 每个事项标注状态（已有答案 / 可自查 / 需问人 / 不适用）并记录结论与来源；不适用必须写明理由，绝不静默跳过。
- 规约未覆盖的业务决策必须标注「规约未规定，需由需求方确认」，绝不用规约推断答案；现状实现不等于正确口径，与目标冲突时向用户确认预期口径。

输出需求清单后向用户对齐。澄清结论绝不回写 intent.md。

### 段四：设计规则与七域走查

需求清单对齐后：

1. 按 `references/design-spec.md` 确定方案必须遵循的设计规则。
2. 按 `references/design-selfcheck.md` 的七域走查项（状态与反馈、语言与信息、记忆负担与流程上下文、控制与防错、一致性、数据可信、触达与可用性）在产出前逐项核验设计交互合理性；走查以方案涉及的页面、模块、字段为「位置」，每条发现按其「走查输出」五要素记录（级别 / 位置 / 问题 / 规约依据 / 改法或待确认问题）。
3. 分级处置，绝不跳过：
   - **P0/P1 发现**：必须修订方案后再继续；规则缺失或冲突时标「待补」，向用户提出确认，绝不自行补充规则。
   - **P2 或「待补」项**：整理为待确认清单向用户提出，绝不自行判定违规、绝不替用户拍板。

### 段五：产出设计明细

方案无任何待解决事项（无「待补」、无未决疑问）后，按段四确定的规则与自检结论，参照 `references/design-tasks-template.md` 输出设计明细到 `$FEATURE_DIR/design-tasks.md`；功能名称与所属迭代记录在文档「任务目标」节，故事卡号（如有）一并写入，便于设计侧对齐 flow 溯源链。

输出后向用户确认。用户提出任何改动建议、或自检发现需调整时，重新过一遍 `references/design-spec.md` 与 `references/design-selfcheck.md`（段四），再按段五重新产出。产出物确认后本 skill 结束；结束前记录 runs 时间线完成：`che state done design --session "$CHE_SESSION_ID"`（无 session id 时省略 --session；Pack fork (ncw)）。结束时按 flow 分组提示下一步（条目格式 `- /命令: [可选] 能做什么`）：

主流程:
- /che-plan: 交接门禁通过后开发侧出实现计划
可选:
- /che-pingcode-specstoissues: [可选] 建需求树卡片并登记 `specs/pingcode-mapping.json`（不建则交接前必须补跑）

## 行为规则

- 需求澄清未收敛，或涉及设计规约未覆盖的业务决策：必须停下，经交互式提问工具（AskUserQuestion；omp 端即 `ask` 工具）向用户提问，绝不把问题打印进正文等待键入回答，绝不带疑问产出。
- 绝不修改 intent.md；绝不产出设计明细以外的交付物。
- 走查中发现设计规约缺口时走其内置回流闭环：先在走查记录标「待补」，经用户确认具有通用性后更新 `references/design-spec.md` 并同步对应自检项；单个页面问题绝不自动升格为通用规则。

## Done When

- [ ] 活动特性已解析，intent.md 存在
- [ ] 四盲区澄清完成，需求清单与用户对齐，无未决疑问
- [ ] 七域走查完成，无 P0/P1 未处理项、无未决「待补」
- [ ] `design-tasks.md` 已按模板产出并经用户确认

---

## Handoff

- **目标**：`/che-plan`（交接门禁通过后）
- **条件**：
  - 前置装载（入向，design 开始时）：会话上下文无 `COMPOUND STORE LOADED` 摘要 → 先跑 `/che-load` 再进执行步骤；已有摘要（本会话已装载）→ 跳过
  - `design-tasks.md` 已产出
  - 它不是交接门禁项，不阻塞交接
  - 与 intent 冲突回产品/设计裁决，绝不自行解决
