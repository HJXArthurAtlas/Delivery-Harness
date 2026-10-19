---
name: ncw-speckit-design
description: 需求澄清与设计明细产出（design 命令）：按四盲区问句库逐项澄清需求，按设计规约与设计自检对方案做七域走查，产出页面级设计明细 design-tasks.md 到当前特性目录。依赖活动特性（spec.md）才能执行；澄清结论不回写 spec。当用户运行或提到 /ncw-speckit-design，或说「出设计明细」「design-tasks」「把这份 spec 转成设计明细」「设计走查这份需求」，或要在 spec 之后、开发之前做设计层澄清与设计明细产出时使用本 skill——即使用户没提「ncw-speckit-design」命令名，只要是规格之后的设计澄清与设计明细转化意图也用本 skill。
---

# ncw-speckit-design

本 skill 只产出设计明细（`design-tasks.md`），绝不产出视觉稿、原型或代码；绝不代替用户拍板业务口径。

与 `ncw-speckit-clarify` 的分工：clarify 把澄清结论回写 spec.md（≤5 问）；本 skill 的澄清是设计层，结论落设计明细，绝不修改 spec.md。顺序上先 clarify 后 design（本 skill 消化的是 spec 之外的设计层歧义）。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## 执行步骤

### 段一：确定功能语境

1. 确定功能名称与所属迭代：优先取自活动特性 spec 或用户输入；缺什么向用户问什么。
2. 故事卡号不盲问：先查 `specs/pingcode-mapping.json` 中当前特性的登记条目，有则带出卡片 id；没有登记（建卡是 optional 步骤）再问用户，用户不知道就留空，绝不阻塞。

### 段二：解析当前特性（硬性前置，与其他 speckit 命令同惯例）

1. 确认环境是 macOS / Linux 且 `python3` 可用，并确认 pack 安装位 `.agents/skills/ncw-speckit-analyze/scripts/check_prerequisites.py` 存在（全局安装位 `~/.agents/skills/ncw-speckit-analyze/scripts/check_prerequisites.py`）。不可用则声明环境不受支持并停止。绝不退回项目 `.specify/` 下 `specify init` 生成的脚本——pack 契约是不依赖 specify init 产物。
2. 从仓库根运行 `python3 .agents/skills/ncw-speckit-analyze/scripts/check_prerequisites.py --json --paths-only` **恰好一次**，解析 JSON 取 `FEATURE_DIR` / `FEATURE_SPEC`。
3. 校验 `$FEATURE_DIR/spec.md` 存在：脚本失败或 spec 缺失时停止，提示先运行 `/ncw-speckit-specify`，绝不凭空继续。
4. 本 skill 依赖一个具体的 spec 才能执行：后续澄清以该 spec 为需求材料，设计明细最终落到 `$FEATURE_DIR/design-tasks.md`（特性目录本身即唯一标识）。

### 段三：四盲区澄清

以 spec.md 为主需求材料、参考相关现状实现，按 `references/question-bank.md` 逐项核对四个盲区（为什么 / 有哪些情况 / 数据算什么 / 动作的后果与回退）；任何不确定事项必须向用户提问，直到需求足够清晰。

- 问句是检查模板，不是必须逐字照问；按当前需求替换页面名、字段名、角色、场景。
- 每个事项标注状态（已有答案 / 可自查 / 需问人 / 不适用）并记录结论与来源；不适用必须写明理由，绝不静默跳过。
- 规约未覆盖的业务决策必须标注「规约未规定，需由需求方确认」，绝不用规约推断答案；现状实现不等于正确口径，与目标冲突时向用户确认预期口径。

输出需求清单后向用户对齐。澄清结论绝不回写 spec.md。

### 段四：设计规则与七域走查

需求清单对齐后：

1. 按 `references/design-spec.md` 确定方案必须遵循的设计规则。
2. 按 `references/design-selfcheck.md` 的七域走查项（状态与反馈、语言与信息、记忆负担与流程上下文、控制与防错、一致性、数据可信、触达与可用性）在产出前逐项核验设计交互合理性；走查以方案涉及的页面、模块、字段为「位置」，每条发现按其「走查输出」五要素记录（级别 / 位置 / 问题 / 规约依据 / 改法或待确认问题）。
3. 分级处置，绝不跳过：
   - **P0/P1 发现**：必须修订方案后再继续；规则缺失或冲突时标「待补」，向用户提出确认，绝不自行补充规则。
   - **P2 或「待补」项**：整理为待确认清单向用户提出，绝不自行判定违规、绝不替用户拍板。

### 段五：产出设计明细

方案无任何待解决事项（无「待补」、无未决疑问）后，按段四确定的规则与自检结论，参照 `references/design-tasks-template.md` 输出设计明细到 `$FEATURE_DIR/design-tasks.md`；功能名称与所属迭代记录在文档「任务目标」节，故事卡号（如有）一并写入，便于设计侧对齐 flow 溯源链。

输出后向用户确认。用户提出任何改动建议、或自检发现需调整时，重新过一遍 `references/design-spec.md` 与 `references/design-selfcheck.md`（段四），再按段五重新产出。产出物确认后本 skill 结束；结束时按 flow 提示下一步：设计明细已落 `design-tasks.md`，尚未建卡的提示跑 pingcode 扩展的 specstoissues 命令（登记 `specs/pingcode-mapping.json`），随后过交接门禁转开发。

## 行为规则

- 需求澄清未收敛，或涉及设计规约未覆盖的业务决策：必须停下向用户提问，绝不带疑问产出。
- 绝不修改 spec.md；绝不产出设计明细以外的交付物。
- 走查中发现设计规约缺口时走其内置回流闭环：先在走查记录标「待补」，经用户确认具有通用性后更新 `references/design-spec.md` 并同步对应自检项；单个页面问题绝不自动升格为通用规则。

## Done When

- [ ] 活动特性已解析，spec.md 存在
- [ ] 四盲区澄清完成，需求清单与用户对齐，无未决疑问
- [ ] 七域走查完成，无 P0/P1 未处理项、无未决「待补」
- [ ] `design-tasks.md` 已按模板产出并经用户确认
