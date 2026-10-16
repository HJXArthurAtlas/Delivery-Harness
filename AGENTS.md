# Repository Guidelines

## Project Overview

newchiwan 团队跨端 **agent skill pack**（`ncw-delivery-harness`）：把团队标准 monorepo 的初始化/诊断流程与 speckit + PingCode 规格驱动开发流程，做成可安装的 agent skill，部署到 DSH / OpenCode / omp 等端。GitLab 项目：`council/ncw-delivery-harness`（内部仓，默认分支 `main`，无 CI——本地 `npm test` 是唯一质量门）。

本仓是「消费模板的元工具」：skill 承载流程与版本钉子，骨架载荷在模板仓 `council/monorepo-template`，两者独立发版。

## Architecture & Data Flow

无构建步骤——「源码」即 `skills/` 下的 Markdown 规则加一个安装脚本，端侧按目录约定直接扫描发现。

```
skills/<name>/SKILL.md (+ references/ scripts/)
        │  sync.mjs 按 PACK_SKILLS 列表整包拷贝（无构建、无生成）
        ▼
<项目>/.agents/skills/（项目级）  ~/.agents/skills/（全局级，--global）
        │  DSH / OpenCode / omp 按目录约定发现；项目级同名覆盖全局级
        ▼
   agent 运行时加载 skill
```

职责分层与外部委托：

- `ncw-monorepo-init` 承载流程与**版本钉子**（`references/init.md` 是唯一载体）；模板仓承载骨架（`AGENTS-TEMPLATE.md`、`.specify/`、`docs/adr/` 等），**版本双落点同改**：init.md 的钉子 = 初始化基线，模板仓巡检表 = 巡检基线。
- `ncw-speckit-flow` 是流程衔接与门禁层，按引用委托 `/speckit.*`、`pingcode` skill、`mturtle-commit`，**不内联它们的规则**。

## Key Directories

| 路径 | 用途 |
|---|---|
| `skills/ncw-monorepo-init/` | 初始化（init）/ 诊断（diagnose）skill：`SKILL.md`（模式判定、安全边界、分发说明）、`references/init.md`（init 流程 + 版本钉子）、`references/checklist.md`（diagnose 基线）、`scripts/sync.mjs`（pack 安装器） |
| `skills/ncw-speckit-flow/` | 单文件 `SKILL.md`：8 阶段流程表 + 交接门禁 + 对账纪律 |
| `tests/skills/` | 结构校验脚本（见 Testing & QA） |
| `.githooks/` | `commit-msg` 提交信息格式校验 |
| `.agents/commands/` | 斜杠命令（通用 agent 发现路径，omp 实测可读；`*.md` + frontmatter `description`，文件名即命令名，如 `/readme-refresh`）。**禁止**用工具专属的 `.omp/commands/` |

## Development Commands

```bash
npm test                                                  # 结构校验（唯一测试门）
node skills/ncw-monorepo-init/scripts/sync.mjs            # 项目级安装到 <cwd>/.agents/skills/
node skills/ncw-monorepo-init/scripts/sync.mjs --global   # 用户级安装到 ~/.agents/skills/
node skills/ncw-monorepo-init/scripts/sync.mjs --dry-run  # 只打印 PLAN，不写盘
npx git+https://git.newchiwan.com/council/ncw-delivery-harness.git --global   # 免克隆直装
git config core.hooksPath .githooks   # 首次克隆后激活 commit-msg 校验（一次性）
```

## Code Conventions & Common Patterns

- **SKILL.md frontmatter 严格两字段**，`---` 定界：`name`（必须等于目录名）+ `description`。
- **技能命名**：`ncw-{submodule}-action`（如 `ncw-monorepo-init`），kebab、至少三段、全名 ≤32 字符。
- **description**：≤1024 字符，触发条件枚举式中文写法（命令名 + 意图信号），含「即使用户没提关键词，意图匹配也用本 skill」语义。
- **正文**：中文写作；规则以「必须 / 绝不」句式为主；按引用委托外部流程，不复述其规则。
- **安全边界**（三模式通用）：同名不覆盖（跳过 + 列出 + 问用户）；migrate 模式能力「待标注」——收集现状后停下，不主动迁移；版本号只写 `init.md` 一处，不凭记忆报版本。
- **`sync.mjs` 的 `PACK_SKILLS`（`sync.mjs:23`）必须保持单行数组字面量**——测试用单行 grep 解析它，拆成多行会破坏校验。新增技能 = 加目录 + `SKILL.md` + `PACK_SKILLS` 登记一行。
- **提交信息格式**（`.githooks/commit-msg` 强制）：`<type>(<scope>): #<工作项ID> <主题>`，如 `refactor(skills): #TECH-1234 技能更名`；无工作项用默认 `#TECH-000`；type ∈ `feat / fix / refactor / docs / test / chore`；`Merge` / `Revert` / `fixup!` / `squash!` 放行。

## Important Files

| 文件 | 作用 |
|---|---|
| `package.json` | `bin` = sync.mjs（`npx git+…` 直装的入口）、`scripts.test`、`files: ["skills"]`（npm 只发 skills/）、`engines.node >=22` |
| `skills/ncw-monorepo-init/scripts/sync.mjs:23` | `PACK_SKILLS` —— 安装清单唯一事实源 |
| `skills/ncw-monorepo-init/references/init.md` | init 流程 + 工具链版本钉子唯一载体（spec-kit v1.1.3、adrkit 0.20.0 等） |
| `skills/ncw-monorepo-init/references/checklist.md` | diagnose 基线；版本事实源是项目 `AGENTS.md` 或模板仓，本文件不复写版本号 |
| `.githooks/commit-msg` | 提交格式校验（`core.hooksPath` 已在本仓激活） |
| `README.md` | 面向用户的安装/开发文档；改动分发模型时同步 |

## Runtime/Tooling Preferences

- **Node ≥ 22**，ESM（`.mjs`）；bash + POSIX coreutils（`awk/grep/sort`…）。
- **零依赖、无 lockfile**（刻意）：`sync.mjs` 只用 `node:fs/os/path/url`，测试只用 bash——不要引入 npm 依赖或 lockfile。
- 无 CI、无构建、无格式化工具链；不要新增这类配置，除非明确要建立。

## Testing & QA

`npm test` = `bash tests/skills/test-skill-structure.sh`，零依赖、可从任意 CWD 运行（路径自定位），退出码 0/1。

强制 6 条（改技能内容后必须跑）：

1. `SKILL.md` 存在，frontmatter 由 `---` 定界且闭合；
2. `name:` = 目录名，匹配 `^ncw-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$`，≤32 字符；
3. `description:` 非空、≤1024 字符；
4. `SKILL.md` 中字面引用的 `references/`、`scripts/` 文件必须存在（引用即契约，改名要同步建文件）；
5. 泄漏扫描：`skills/` 内禁止 `/Users/`、`/home/` 绝对路径；
6. `sync.mjs` `PACK_SKILLS` 与 `skills/` 目录一一对应（防新增技能忘登记）。

新增检查：在 `for skill_dir in …` 循环内加 per-skill 规则（用 `ok` / `bad "<msg>"` 助手计数），循环后加全局规则；保持 `set -u` 与结尾的 `printf` + `[ "$fail" -eq 0 ]` 不变。
