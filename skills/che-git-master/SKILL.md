---
name: che-git-master
description: 执行 git commit 的规范流程：消息格式 `type(scope): #故事卡ID 中文消息`、故事卡 ID 确认（接入 PingCode 时从 specs/pingcode-mapping.json 取当前任务卡 identifier 供确认）、小步拆分、精确暂存、敏感文件排除与安全边界。当用户说「提交」「commit」「帮我提交这些改动」「拆分提交」「这些改动怎么拆」「检查提交风险」或让你代拟 commit message 时使用——即使用户没提「规范」二字也用本 skill。适用于仓库内任何目录。
---

# 按规范提交

> Pack fork：吸收自 mturtle-commit 技能（freight-mono），纪律正文逐条保留；去除仓库特有的 hook 现状与敏感文件清单，故事卡 ID 接入本 pack 任务模型（`specs/pingcode-mapping.json` 解析）。上游规则升级时按此文件 port。

把一次用户请求的提交做对：正确的消息格式、干净的暂存区、不碰敏感文件、不越权操作。三个核心不变量先行记住：**只在用户明确要求时提交；消息格式 `type(scope): #故事卡ID 中文消息`；识别不到故事卡 ID 必须问用户，禁止编造。**

本 skill 只负责提交工作流，不负责判断功能是否完成：实现、测试、验证未完成时先说明，再问是否提交。

## 触发门槛

只有用户明确要求时才提交："提交"、"commit"、"帮我提交当前改动"算明确要求。功能开发、补测试完成时只能**询问**是否提交，不得自行 commit。未经用户明确指示：不 push、不 amend、不用 `--no-verify` / `--no-gpg-sign`、不执行 `git reset --hard` / `git clean -fd` / `git push --force`。这些限制保护的是共享历史和用户对仓库状态的控制权，不是形式主义。

## 消息格式

```text
type(scope): #故事卡ID 中文提交消息
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
- 故事卡 ID 形如 `#WYT-1234`、`#TECH-0000`（即 `[A-Z]+-[0-9]+`，项目用什么前缀以用户和仓库近期提交为准），带 `#` 放在冒号后消息开头。上下文里找不到就停下来问用户；宁可这轮不提交，也不能编造 ID——ID 是提交与工作项的唯一关联，错了等于白提交。
- 提交消息主体必须中文。

AI 辅助的提交在末尾追加页脚，**只有标题 + 空行 + 页脚，不写 body**：

```text
feat(invoice): #TECH-0000 支持红冲确认单号开票

Co-Authored-By: Sisyphus
```

页脚里的名字用当前执行提交的 Agent 名（如 Claude / Codex / Gemini），不要从 git config 取值，也不要编造邮箱。

## 故事卡 ID 解析（本 pack 任务模型）

当前任务 = session 绑定或 `che paths` 解析的任务目录（slug 即绑定句柄）。按以下优先级取故事卡 ID，**取出后必须向用户复述确认**，确认前不提交：

1. 用户输入里显式给出的 `#XXXX-123` 形式 ID
2. `specs/pingcode-mapping.json` 中当前任务条目（键 = 当前任务目录名）：默认取 `artifacts.spec.card.identifier`（spec 卡）；改动明确只涉单一 `### User Story N` 章节时用对应 `artifacts.stories[].card.identifier`
3. 仓库近期提交的 ID 前缀习惯 + 用户口头确认

均取不到 → 停下询问；未接入 PingCode（无 mapping 或无本任务条目）→ 询问用户工作项 ID，用户说没有时用仓库惯用的占位前缀（如 `#TECH-0000`）并注明。

## 工作流

1. **确认前提**：用户已明确要求提交；实现/测试/验证未完成的先说明再动手。识别改动位置与涉及的子项目。
2. **确认故事卡 ID**：按上节优先级解析并向用户复述确认。
3. **检查工作区**：依次执行 `git status --short`、`git diff`、`git diff --cached`、`git log -5 --oneline`。目的：分清 staged / unstaged / untracked，防止带入半成品、无关文件或敏感文件，并参考近期消息风格（含 ID 前缀习惯）。
4. **排除敏感与无关改动**：`.env*`、`*.key`、`*.pem`、`credentials.json`、本地环境配置（如 `application-*.local.yaml`、`*.local.*`）、本地 IDE 临时文件一律不提交；已被 git 跟踪的本地配置文件，已有内容的正常修改可以提交，但**不得往里加新密钥**，发现疑似新增凭据必须先警告。用户点名要提交疑似敏感文件时，警告并等确认，不静默排除也不静默提交。
5. **拆分小 commit**：一个 commit 表达一个目的——不同目的、不同模块、可独立回滚的改动都拆开（功能、格式调整、文档更新分开）。向用户输出拆分方案（每个 commit 的 type(scope)、文件列表、提交消息）后执行。
6. **精确 stage**：只 stage 当前 commit 需要的文件，禁止 `git add .` 这类全量 add——它会把 untracked 的临时文件和敏感文件一起带进来。每批 stage 后用 `git diff --cached` 复核。自动生成的 catalog / 索引 / lock 文件跟随对应变更一起提交。
7. **创建提交**：按上面的格式与页脚规则提交。pre-commit hook 改写了文件时，把改写重新 stage 后再完成提交（见下节）。不 push、不 amend、不跳 hook。
8. **收尾复查**：再次 `git status --short`；仍有改动就说明留了什么、为什么、是否属于下一个 commit。

## Hook 与提交前检查

先确认当前仓库的 hook 行为，不要猜：看 `.husky/`、`package.json`（lint-staged / prepare 脚本）、`.git/hooks/`、`git config core.hooksPath`、构建工具（Gradle/Maven 等）的 git hook 插件配置。monorepo 里还要注意：子项目声明的 hook 只有在该子项目拥有独立 `.git` 时才会安装；hook 是「可能生效」，不是「一定生效」——无论装没装，都不要假定 `git commit` 会被检查拦住，提交前自己跑与本次改动相关的既定检查（lint、定点测试等）；跑不了或明显不适用（如沙箱/无构建环境）时向用户说明，不要静默跳过。

通用处理：

- **会改写文件的 pre-commit hook**：hook 改写文件后必须把改写一并 stage 进当前 commit，否则改写会丢；hook 因检查失败而拒绝提交时，修复问题本身，不要 `--no-verify`。
- 本 pack 分发面不含任何消费者项目的 commit hook——消费者项目要不要装 `.githooks/` 由其自行决定，本 skill 的纪律不依赖 hook 生效。

## 高频错误

- 没被要求就顺手 commit；提交完顺手 push；为补文件 amend 已有提交；用 `--no-verify` 跳 hook——全部需要用户明确要求。
- 编造或猜测故事卡 ID；把 PingCode 卡 ID 与工作项 ID 混用而不确认。
- `git add .` 一把梭。
- 功能、格式、文档混进一个 commit。
- 写了 body，或 AI 辅助提交漏了 `Co-Authored-By` 页脚。
- 发现敏感文件后静默排除或静默提交。
- hook 改写文件后直接重试提交，改写丢失。
- 提交后不做 `git status --short` 收尾。
