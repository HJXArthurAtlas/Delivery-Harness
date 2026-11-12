---
name: che-git-master
description: 执行 git commit 的规范流程：消息格式 `type(scope): 中文消息`、小步拆分、精确暂存、敏感文件排除与安全边界。当用户说「提交」「commit」「帮我提交这些改动」「拆分提交」「这些改动怎么拆」「检查提交风险」或让你代拟 commit message 时使用——即使用户没提「规范」二字也用本 skill。适用于仓库内任何目录。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.local.yml` 的非空 `language:` 值（缺键或空值回落 `.che/config.yml` 的 `language:`；`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；两处键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。
>
> **交互规则（pack fork，port on upstream upgrade）**：所有需要用户回答的问题——「是否提交」询问、拆分方案确认——必须经宿主的交互式提问工具发出（AskUserQuestion；omp 端即 `ask` 工具），以表单承载选项；绝不把问题与选项打印进回复正文后停下等待键入回答。纯展示、无需回答的输出（拆分方案展示、提交后复查）不受此限。

# 按规范提交

> Pack fork：吸收自 mturtle-commit 技能（freight-mono），纪律正文逐条保留；去除仓库特有的 hook 现状与敏感文件清单。**提交消息不绑定任何工作项/PingCode ID**——消息里绝不出现 `#ID` 段（上游 mturtle-commit 的工作项 ID 机制已整段移除，上游规则升级时按此文件 port 并保持移除）。

把一次用户请求的提交做对：正确的消息格式、干净的暂存区、不碰敏感文件、不越权操作。四个核心不变量先行记住：**只在用户明确要求时提交；消息格式 `type(scope): 中文提交消息`（不带任何 ID）；skill pack 流程产出的提交页脚必须带 `Co-Authored-By: Delivery Harness`；不编造、不猜测、不追问工作项 ID。**

本 skill 只负责提交工作流，不负责判断功能是否完成：实现、测试、验证未完成时先说明，再问是否提交。

## 触发门槛

只有用户明确要求时才提交："提交"、"commit"、"帮我提交当前改动"算明确要求。功能开发、补测试完成时只能经交互式提问工具（AskUserQuestion；omp 端即 `ask` 工具）**询问**是否提交，不得自行 commit。未经用户明确指示：不 push、不 amend、不用 `--no-verify` / `--no-gpg-sign`、不执行 `git reset --hard` / `git clean -fd` / `git push --force`。这些限制保护的是共享历史和用户对仓库状态的控制权，不是形式主义。

## 消息格式

```text
type(scope): 中文提交消息
```

- `type` 反映改动目的，不为历史好看滥用 `feat`：

| type | 含义 |
| --- | --- |
| `feat` | 新增能力或功能 |
| `fix` | 修复缺陷 |
| `refactor` | 重构，不改变外部行为 |
| `test` | 补充或调整测试 |
| `docs` | 文档变更 |
| `chore` | 工程配置、脚本、索引、维护性调整 |
| `style` | 格式、排版等不影响逻辑的调整 |

- `scope`：小写英文，表达改动范围，从改动路径和目的推断——领域/模块名、前端站点或包名、组件或 skill 名；纯文档用 `docs`。一个 commit 塞不进单一 scope，说明它该继续拆。
- 提交消息主体必须中文；消息里**绝不**出现 `#XXXX-123` 形式的工作项/故事卡 ID——提交与工作项的关联由 PingCode 卡片链（`specs/pingcode-mapping.json`）负责，不进提交消息。

AI 辅助的提交在末尾追加页脚，**只有标题 + 空行 + 页脚，不写 body**：

```text
feat(invoice): 支持红冲确认单号开票

Co-Authored-By: Sisyphus
Co-Authored-By: Delivery Harness
```

页脚里的名字用当前执行提交的 Agent 名（如 Claude / Codex / Gemini），不要从 git config 取值，也不要编造邮箱。当改动内容是通过本 skill pack 流程（intend / clarify / plan / implement 等任一技能）开发出来的时候，页脚**必须再加一行** `Co-Authored-By: Delivery Harness`，与 Agent 署名行并列——多个 `Co-Authored-By` trailer 是合法格式；非 skill pack 产出（用户手写代码、外部工具生成）只保留 Agent 署名行。

## 工作流

1. **确认前提**：用户已明确要求提交；实现/测试/验证未完成的先说明再动手。识别改动位置与涉及的子项目。
2. **检查工作区**：依次执行 `git status --short`、`git diff`、`git diff --cached`、`git log -5 --oneline`。目的：分清 staged / unstaged / untracked，防止带入半成品、无关文件或敏感文件，并参考近期消息风格。
3. **排除敏感与无关改动**：`.env*`、`*.key`、`*.pem`、`credentials.json`、本地环境配置（如 `application-*.local.yaml`、`*.local.*`）、本地 IDE 临时文件一律不提交；已被 git 跟踪的本地配置文件，已有内容的正常修改可以提交，但**不得往里加新密钥**，发现疑似新增凭据必须先警告。用户点名要提交疑似敏感文件时，警告并等确认，不静默排除也不静默提交。
4. **拆分小 commit**：一个 commit 表达一个目的——不同目的、不同模块、可独立回滚的改动都拆开（功能、格式调整、文档更新分开）。向用户输出拆分方案（每个 commit 的 type(scope)、文件列表、提交消息）后执行。提交时机不强制中途逐段进行：允许把全部提交动作集中到收尾时一次补齐，但拆分标准不变——收尾时同样按逻辑改动逐个创建多个小 commit，绝不把多个目的压成一个大 commit。
5. **精确 stage**：只 stage 当前 commit 需要的文件，禁止 `git add .` 这类全量 add——它会把 untracked 的临时文件和敏感文件一起带进来。每批 stage 后用 `git diff --cached` 复核。自动生成的 catalog / 索引 / lock 文件跟随对应变更一起提交。
6. **创建提交**：按上面的格式与页脚规则提交。pre-commit hook 改写了文件时，把改写重新 stage 后再完成提交（见下节）。不 push、不 amend、不跳 hook。
7. **收尾复查**：再次 `git status --short`；仍有改动就说明留了什么、为什么、是否属于下一个 commit。

## Hook 与提交前检查

先确认当前仓库的 hook 行为，不要猜：看 `.husky/`、`package.json`（lint-staged / prepare 脚本）、`.git/hooks/`、`git config core.hooksPath`、构建工具（Gradle/Maven 等）的 git hook 插件配置。monorepo 里还要注意：子项目声明的 hook 只有在该子项目拥有独立 `.git` 时才会安装；hook 是「可能生效」，不是「一定生效」——无论装没装，都不要假定 `git commit` 会被检查拦住，提交前自己跑与本次改动相关的既定检查（lint、定点测试等）；跑不了或明显不适用（如沙箱/无构建环境）时向用户说明，不要静默跳过。

通用处理：

- **会改写文件的 pre-commit hook**：hook 改写文件后必须把改写一并 stage 进当前 commit，否则改写会丢；hook 因检查失败而拒绝提交时，修复问题本身，不要 `--no-verify`。
- 本 pack 分发面不含任何消费者项目的 commit hook——消费者项目要不要装 `.githooks/` 由其自行决定，本 skill 的纪律不依赖 hook 生效。

## 高频错误

- 没被要求就顺手 commit；提交完顺手 push；为补文件 amend 已有提交；用 `--no-verify` 跳 hook——全部需要用户明确要求。
- 把 `#工作项ID` / 故事卡 ID 写进提交消息，或向用户追问 ID。
- `git add .` 一把梭。
- 功能、格式、文档混进一个 commit。
- 写了 body，或 AI 辅助提交漏了 `Co-Authored-By` 页脚。
- 经 skill pack 流程开发的改动漏加 `Co-Authored-By: Delivery Harness` 署名行。
- 收尾集中补提交时把多个逻辑改动压成一个大 commit。
- 发现敏感文件后静默排除或静默提交。
- hook 改写文件后直接重试提交，改写丢失。
- 提交后不做 `git status --short` 收尾。
