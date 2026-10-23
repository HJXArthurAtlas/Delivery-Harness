# Repository Guidelines

## 例外

0. this repo is standalone harness from scratch

## Project Overview

newchiwan 团队跨端 **agent skill pack**（`ncw-delivery-harness`）：承载 PingCode 规格驱动开发流程，以及 adrkit / grill / compound / bug 四组上游扩展技能，做成可安装的 agent skill，部署到 DSH / OpenCode / omp 等端。GitLab 项目：`council/ncw-delivery-harness`（内部仓，默认分支 `main`，无 CI——本地 `npm test` 是唯一质量门）。

初始化与 monorepo 骨架职责在模板仓 `council/monorepo-template`；本仓只承载技能（流程规则 + 自包含运行时），两者独立发版。

仓内内容分两层，下文按 **Part I · 用户指南**（消费/安装本 pack 的视角）与 **Part II · 本地开发指南**（维护本仓的视角）组织：

- **分发面**（随 pack 发布，用户可见）：`skills/`、`.omp-plugin/marketplace.json`、`cordis.patch.yml` + `dsh-entry.js`（DSH bundle 面）、`package.json`。
- **仓内基建**（只服务本仓维护，不随 pack 分发）：`tests/`、`.githooks/`、`.agents/commands/`。

---

# Part I · 用户指南（消费 / 安装本 pack）

本部分面向 pack 的消费者：分发模型、安装方式、安装后得到的技能清单。维护本仓请看 Part II。

## Architecture & Data Flow（分发模型）

无消费端构建步骤——「分发物」即 `skills/` 下的 Markdown 规则 + 技能携带的 shell 运行时，端侧按目录约定直接扫描发现。adrkit 技能依赖外部 `@adrkit/cli`，不随 pack 内置 CLI bundle；speckit/grill 系与 adrkit check/draft 的特性路径解析依赖外部 `@newchiwan/che`（源与发布单元在 `packages/cli`，npm 发布，不经插件分发），同样只执行 PATH 上的 `che`，缺失时引导 `npm install -g @newchiwan/che@0.1.0`。

```
skills/<name>/SKILL.md (+ references/ scripts/)
        │  omp 插件安装（marketplace catalog，source: "./" 即仓根）；DSH 插件安装（根包兼作 dsh bundle，git 安装跟踪 main，升级走 update）；OpenCode 手动拷入发现目录
        ▼
各端 skill 发现目录（项目级同名覆盖全局级）
        │  DSH / OpenCode / omp 按目录约定发现
        ▼
   agent 运行时加载 skill
```

omp 另有原生插件分发（不走拷贝）：`.omp-plugin/marketplace.json` 是 catalog（插件 `ncw-delivery`，`source: "./"` 即仓根），用户 `omp plugin marketplace add <仓 URL>` + `omp plugin install ncw-delivery@ncw-delivery-harness` 后由 omp 从插件树 `skills/<name>/SKILL.md` 发现。DSH 侧为根包兼作 dsh bundle：`package.json` 的 `"dsh": {"bundle": ...}` manifest + `cordis.patch.yml`（insert 插件行）+ `dsh-entry.js`（SkillProvider，纯 node:fs 零依赖），bundle 运行时只扫描包内 `skills/`，rank 250（项目级 100/200 按名覆盖本 pack，压过用户级 400/500），`engines.dsh` 钉 `>=0.2.0-rc.2 <0.3.0` 安装时 fail-closed。**插件只含 skills**——绝不加 `.omp-plugin/plugin.json` manifest（remap 会把 `.agents/` 带进安装面）；`.agents/commands/` 斜杠命令是本仓维护者工具（`/readme-refresh`），不经插件分发。catalog `version` 与 `package.json` 版本同步维护。marketplace 安装不解析 npm 依赖；另一条 omp 路径 `omp plugin install git+<仓 URL>` 经 bun 安装 `package.json#dependencies` 的 `@adrkit/cli`（精确版本钉，`npm test` 校验）。无论走哪条安装路径，adrkit 技能都只执行 PATH 上的 `adrkit`，不读取插件 `node_modules` 或其他覆盖变量；若没有可用 CLI，按技能提示运行 `npm install -g @adrkit/cli@0.20.0`。根 `package.json` 的 `"omp": {}` manifest 是 git/npm 安装路径运行时技能发现的前提。

职责分层与外部委托：

- `che-compound-flow` 是流程衔接与门禁层，按引用委托 `che-compound-*` 系技能、`pingcode` skill、`mturtle-commit`，**不内联它们的规则**。主线命令技能（specify/clarify/design/plan/tasks/implement）的 Completion Report 末尾带统一「Pack fork」下一步提示——按主流程/可选分组，条目格式 `- /命令: [可选] 能做什么`（按 9 阶段表引导下一命令与建卡/对账/收尾提醒，上游升级需 port）。

## 技能清单（`skills/` 目录导览，全部随 pack 分发）

| 路径 | 用途 |
|---|---|
| `cordis.patch.yml` + `dsh-entry.js`（仓根） | DSH bundle 分发面（根包兼作 dsh 组合包）：patch 层 insert 插件行 `ncw-delivery-skills`；入口把 `skills/<name>/SKILL.md` 挂成 DSH 一等 SkillProvider（provider `ncw-delivery`，source `bundled`，rank 250），纯 node:fs 零依赖、无构建；`package.json` 的 `dsh.bundle`/`engines.dsh`/`main`/`files` 一致性由 `npm test` 结构规则 10 校验 |
| `skills/che-adr-{check,context,draft}/` | adrkit 上游扩展（adrkit.* 命令）的 pack 分发：SKILL.md（正文英文原文）+ `scripts/`（`adrkit-lib.sh` 三份逐字副本 + 各自入口脚本；draft 另含 pack 新增的 `scaffold.sh`，`adr.sh` 是跨技能 lint/migrate 入口）。运行时依赖外部 `@adrkit/cli`，只执行 PATH 上的 `adrkit`，缺失时引导 `npm install -g @adrkit/cli@0.20.0`。check/draft 的特性解析委托外部 `che` CLI（`che paths`，经 `adrkit-lib.sh`，缺失时引导 `npm install -g @newchiwan/che@0.1.0`）；check 在 plan 后必跑、作为 tasks 入向前置（hook 机制已清除，统一走 SKILL.md 末尾 Handoff 块交接）|
| `skills/che-compound-*/` | compound 技能组（9 个）：intent/expectations/gapfill/planverify/intentguard/writeback/load/require-intent/planverify-gate。运行期数据落项目 `docs/intents/`、`docs/expectations/`、`docs/adr/`、`docs/corrections/`、`docs/patterns/`，README/config/_drafts 等元数据留在 `docs/compound/`；**ADR 归口 adrkit 语料 `docs/adr/`**（writeback 升格、load 读取、intent 引用均指向语料，load/intent/writeback 正文含 pack fork 段，上游升级需 port）。交接统一走各 SKILL.md 末尾的中文 `## Handoff` 块（目标/条件/回退，详见 `docs/skill-handoff-and-gates.md`）；require-intent / planverify-gate 是手动调用的门禁。require-intent 判定逻辑内联进 che CLI（`che require-intent`，技能脚本仅薄封装委托），开关经 `CHE_REQUIRE_INTENT` 环境变量或项目根 `.che/config.yml` 的 `require_intent:` 读取（默认开，非法值 fail-closed）；开关开启且 `.che/feature.json` 已登记特性时，门禁按登记 slug（目录 basename 去 `YYYYMMDD-HHMMSS-` 前缀，即 `che paths --json` 的 `SLUG` 字段）校验 `docs/intents/{slug}.intent.md` 存在，未登记维持"任意 intent.md"校验；planverify-gate 判定逻辑同样内联进 che CLI（`che planverify-gate <slug>`，技能脚本仅薄封装委托），开关经 `SKC_PLANVERIFY_GATE` 环境变量或项目根 `.che/config.yml` 的 `planverify_gate:` 读取（默认 off，非法值 fail-closed），hook 机制已清除|
| `skills/che-compound-grill-{me,with-docs}/` | grill 上游扩展（grill.* 命令）的 pack 分发：单文件 SKILL.md（正文英文原文）。特性解析统一委托外部 `che` CLI（`che paths`）；两技能均删除上游 extension-hook 段并含此 PATH 解析 fork。`che-compound-grill-me` 其余正文保持上游；**grill-with-docs 另为 pack fork**——ADR 经 `che-adr-draft/scripts/scaffold.sh` 归口 `docs/adr/`，lint 走 `adr.sh`；上游 grill 升级时需 port 这些 fork 段|
| `skills/che-compound-analyze/` | SKILL.md：analyze 命令（spec/plan/tasks 一致性只读分析），正文英文原文；特性解析入口为外部 `che` CLI（`che check`） |
|`skills/che-bug-{assess,fix,test}/`|bug 工作流三技能（spec-kit extension:bug 的 pack 分发，正文英文原文）：assess 对 bug 报告（粘贴文本/URL）三角定位产出 `docs/bugs/<slug>/assessment.md` → fix 按评估实施并记 `fix.md` → test 验证并记 `test.md`；slug 解析三级回退（显式参数 → 会话上下文 → 磁盘唯一候选），URL 抓取带信任策略|
|skills/che-compound-clarify/|SKILL.md：clarify 命令（≤5 问澄清并回写 spec），正文英文原文；特性解析走外部 `che` CLI（`che paths`）|
| `skills/che-compound-constitution/` | SKILL.md + `references/constitution-template.md`（模板自包含，`che template` 直接读 `references/`，无项目层覆盖栈）：constitution 命令（建/改 docs/constitution/constitution.md），正文英文原文 |
| `skills/che-compound-converge/` | SKILL.md：converge 命令（代码现状 vs 工件差距→追加收敛任务），正文英文原文；特性解析走外部 `che` CLI（`che check`） |
| `skills/che-compound-design/` | 设计明细产出（design 命令，pack 新增非上游，逐字吸收自 loyalty-platform 的 requirement-to-des-tasks）：SKILL.md（四盲区澄清 + 设计规约/自检七域走查 → 产出 `$FEATURE_DIR/design-tasks.md` 设计明细；澄清不回写 spec，产物不进 flow 交接门禁）+ `references/`（`question-bank.md` 问句库、`design-spec.md` 设计规约、`design-selfcheck.md` 设计自检、`design-tasks-template.md` 明细模板）；特性解析走外部 `che` CLI（`che paths`） |
| `skills/che-compound-flow/` | 单文件 `SKILL.md`：9 阶段流程表 + slug 单一事实源（`.che/feature.json` 派生 slug，经 `che paths --json` 的 `SLUG` 全流程传递）+ 交接门禁 + 对账纪律 |
| `skills/che-compound-implement/` | SKILL.md：implement 命令（按 tasks.md 执行实现），正文英文原文；特性解析走外部 `che` CLI（`che check`）；含 pack fork 段——存在 `$FEATURE_DIR/design-tasks.md` 时 UI 任务按其交互规则/页面状态实现，逐项核验设计要求清单 UI-xx 后才算完成（上游升级需 port） |
| `skills/che-compound-plan/` | SKILL.md + `references/plan-template.md`（模板自包含，`che setup-plan` 直接读 `references/`）：plan 命令（实现规划 + research/data-model/contracts/quickstart 工件），正文英文原文；含 pack fork 段——存在 `$FEATURE_DIR/design-tasks.md` 时必读并作为 UX 约束输入，与 spec 冲突回用户裁决（上游升级需 port） |
| `skills/che-compound-specify/` | SKILL.md + `references/spec-template.md`（模板自包含；特性目录编号统一 timestamp `YYYYMMDD-HHMMSS`，特性指针落 `.che/feature.json`，词汇表落 `docs/GLOSSARY.md`）：specify 命令（特性规格创建/更新 + 质量清单），正文英文原文；含 pack fork 段——short name 不再独立生成，取 `.che/feature.json` 已登记 slug，未登记取 `docs/intents/*.intent.md` 的 intent slug（上游升级需 port） |
| `skills/che-compound-tasks/` | SKILL.md + `references/tasks-template.md`（模板自包含，`che setup-tasks` 直接读 `references/`）：tasks 命令（按用户故事生成依赖有序 tasks.md），正文英文原文 |
|`skills/che-pingcode-*/`（5 个：init / discover-context / specstoissues / sync-cards / sync-status）|PingCode 集成（Spec-Kit-PingCode v2.9.0，commit 4b5aeb3，MIT 的 pack 分发，正文中文改编）：init 交互生成 `.che/pingcode-config.yml`（含 `references/pingcode-config.template.yml`）、discover-context 探类型/状态/优先级/迭代字典、specstoissues 建 spec/章节/任务卡并登记 `specs/pingcode-mapping.json`、sync-cards 制品对账增删改、sync-status 单向收尾流转；上游 specify extension hook（after_specify/after_tasks/before_implement）改接为 specify/tasks/implement 的 Handoff 块可选目标/前置对账（optional，config 在位才提示；pack 无 hook 执行器），配置落 `.che/pingcode-config.yml`、探查产物落项目根；specs/ 产物契约（`### User Story N` 章节、tasks.md 任务行、统一登记结构）与上游逐字一致（上游升级需 port）。依赖外部 `pingcode` CLI ≥ 0.14.0（`npm i -g @metaphorli/pingcode-cli`）|
|`skills/che-mturtle-troubleshooting/`|新赤湾线上问题排查（自 monorepo-template 吸纳，正文中文）：口头名称 → 环境 → Loki namespace/app → 数据库对号，业务单号/trace_id 追日志 + 数据库核事实互相印证，跨服务调用与推送链逐级定位；纯知识无 scripts，证据全部来自线上 MCP 数据源、不依赖工作目录，`references/` 三份（名称对号总表 service-map、环境模型 environments、跨服务链路 cross-service）由排查者随手回填|
| `tests/skills/` | 结构校验脚本 + `test-che-cli.sh` che CLI 契约测试 + `test-pack-runtime.sh` 自包含运行时契约测试（见 Part II Testing & QA） |

## 安装方式

```bash
# omp 插件（推荐）
omp plugin marketplace add git+https://git.newchiwan.com/council/ncw-delivery-harness.git
omp plugin install ncw-delivery@ncw-delivery-harness

# DSH 插件（根包兼作 dsh bundle；默认跟踪 main 最新，升级走 update）
dsh plugin --profile <name> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git

# 其他端（DSH / OpenCode）：把 skills/<name>/ 拷入对应发现目录即可
npm test   # 结构校验（唯一质量门）
```

omp 原生插件路径（不经拷贝，见上文分发模型）：`omp plugin marketplace add <仓 URL>` + `omp plugin install ncw-delivery@ncw-delivery-harness`，或 `omp plugin install git+<仓 URL>`。

---

# Part II · 本地开发指南（维护本仓）

本部分面向 pack 维护者：开发约定、质量门、仓内基建。以下目录/文件只服务本仓维护，不随 pack 分发：

| 路径 | 用途 |
|---|---|
| `tests/skills/` | 三个测试脚本（见下文 Testing & QA） |
| `.githooks/` | `commit-msg` 提交信息格式校验 |
| `.agents/commands/` | 斜杠命令（通用 agent 发现路径，omp 实测可读；`*.md` + frontmatter `description`，文件名即命令名，如 `/readme-refresh`）。**禁止**用工具专属的 `.omp/commands/` |

## Development Commands

```bash
npm ci                                                    # 安装钉版本的 @adrkit/cli，并把仓内 @newchiwan/che（file:packages/cli）链接进 node_modules/.bin（运行时契约测试前提）
npm test                                                  # 结构 + 运行时校验（唯一测试门，改技能内容后必须跑）
git config core.hooksPath .githooks   # 首次克隆后激活 commit-msg 校验（一次性）
```

## Code Conventions & Common Patterns

- **SKILL.md frontmatter 严格两字段**，`---` 定界：`name`（必须等于目录名）+ `description`。
- **技能命名**：`che-{submodule}-action`（如 `che-pingcode-init`），kebab、至少三段、全名 ≤32 字符。
- **description**：≤1024 字符，触发条件枚举式中文写法（命令名 + 意图信号），含「即使用户没提关键词，意图匹配也用本 skill」语义。
- **正文**：中文写作；规则以「必须 / 绝不」句式为主；按引用委托外部流程，不复述其规则。
- **安全边界**：同名不覆盖（跳过 + 列出 + 问用户，技能写盘通用）；版本号不凭记忆报，以仓内登记文件为准。
- **提交信息格式**（`.githooks/commit-msg` 强制）：`<type>(<scope>): #<工作项ID> <主题>`，如 `refactor(skills): #TECH-1234 技能更名`；无工作项用默认 `#TECH-000`；type ∈ `feat / fix / refactor / docs / test / chore`；`Merge` / `Revert` / `fixup!` / `squash!` 放行。
- **小步提交**：一个逻辑改动一个提交——完成一个可独立验证的单元（通过 `npm test`）即提交，绝不把多个无关改动攒进同一提交；提交只含该单元涉及的文件。

## Important Files

| 文件 | 作用 |
|---|---|
| `package.json` | `scripts.test`、`files: ["skills", "dsh-entry.js", "cordis.patch.yml"]`（npm 只发 skills/ 与 DSH bundle 两文件）、`dependencies.@adrkit/cli`（adrkit 技能外部运行时，精确版本钉；omp git/npm 插件安装路径由 bun 安装，仓内运行时测试经 `npm ci` 使用）与 `dependencies.@newchiwan/che`（`file:packages/cli` 本仓链接；首次 registry 发布后改精确钉 `"0.1.0"`）、`engines.node >=22.18` + `engines.dsh`（DSH 兼容范围，钉 `>=0.2.0-rc.2 <0.3.0`）、`main: dsh-entry.js` + `"type": "module"`、`dsh.bundle`（根包兼作 dsh 组合包 manifest，指向 `./cordis.patch.yml`） |
| `.githooks/commit-msg` | 提交格式校验（`core.hooksPath` 已在本仓激活） |
| `.omp-plugin/marketplace.json` | omp marketplace catalog（omp 插件分发唯一入口；`version` 必须与 `package.json` 一致，`npm test` 强制） |
| `README.md` | 面向用户的安装/开发文档；改动分发模型时同步 |

## Runtime/Tooling Preferences

- **Node ≥ 22.18**；bash + POSIX coreutils（`awk/grep/sort`…）。
- **仓内工具不新增 npm 依赖（刻意）**：结构与契约测试只用 bash + node 内联脚本。`package.json#dependencies` 只有两个运行时依赖：`@adrkit/cli`（随 lockfile 钉版本，adrkit 技能的外部运行时，供 `test-pack-runtime.sh` 驱动）与 `@newchiwan/che`（`file:packages/cli` 本仓链接，`npm ci` 后供 `test-che-cli.sh` 与 `test-pack-runtime.sh` 驱动；omp git/npm 插件安装路径则由 bun 安装）。
- 无 CI、无构建、无格式化工具链；不要新增这类配置，除非明确要建立。

## Testing & QA

`npm test` = `bash tests/skills/test-skill-structure.sh`（结构校验）+ `bash tests/skills/test-che-cli.sh`（che CLI 运行时契约）+ `bash tests/skills/test-pack-runtime.sh`（adrkit CLI 与 che 运行时契约）。先运行 `npm ci` 安装钉版本的 `@adrkit/cli` 并链接仓内 `@newchiwan/che`；测试可从任意 CWD 运行（路径自定位），退出码 0/1。

强制规则（改技能内容后必须跑）：

1. `SKILL.md` 存在，frontmatter 由 `---` 定界且闭合；
2. `name:` = 目录名，匹配 `^che-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$`，≤32 字符；
3. `description:` 非空、≤1024 字符；
4. `SKILL.md` 中字面引用的 `references/`、`scripts/` 文件必须存在（引用即契约，改名要同步建文件；`.agents/`、`~/` 等安装位/宿主路径是运行时路径，不做仓内存在性校验）；
5. 泄漏扫描：`skills/` 与 `.omp-plugin/` 内禁止 `/Users/`、`/home/` 绝对路径；
6. `.agents/commands/*.md` frontmatter 合规（`---` 定界 + 非空 `description`），且不存在工具专属 `.omp/commands/`；
7. `.omp-plugin/marketplace.json` 为合法 JSON，marketplace/plugin 名合规（小写开头结尾、可含 `-`/`.`、≤64），plugin `source` 恰为 `"./"`，`version` 与 `package.json` 一致且符合 omp 缓存路径字符集。JSON 校验用 node 内联脚本完成（node 是运行前提，非新增依赖）；
8. `.omp-plugin/plugin.json` 绝不许存在（manifest remap 会把 `.agents/` 带进 omp 插件安装面，插件只分发 skills）。
9. DSH bundle 分发面（根包兼作 dsh 组合包）：`package.json` 的 `dsh.bundle.patch` 恰为 `"./cordis.patch.yml"`、`main` 指向存在的 `dsh-entry.js`、`files` 含 `skills`/`dsh-entry.js`/`cordis.patch.yml` 三件、`engines.dsh` 非空（安装时 fail-closed）；`cordis.patch.yml` 存在且 `insert` 一行 `name` 指向 `package.json` 包名；`dsh-entry.js` 导出 `apply` 并调用 `ctx.skills.registerProvider`；两个 DSH 文件同做绝对路径泄漏扫描。
10. `tests/skills/test-che-cli.sh` 驱动 `npm ci` 链接进 `node_modules/.bin` 的 `@newchiwan/che`，钉 CLI 契约：`paths`/`check` 的 JSON 与文本输出（含 `FEATURE_DIR:` 无空格行与 `FEATURE_DIR: ` 空格行的不对称）、`feature set|show` 指针字节契约、`template`/`setup-plan`/`setup-tasks` 与 skill `references/` 模板的字节级 round-trip、不安全/缺失模板名非零退出并报 `Could not resolve required`、usage 错误退出 2、`--version` 与 `packages/cli/package.json#version` 一致；`paths` 输出 `SLUG` 字段（目录 basename 去 `YYYYMMDD-HHMMSS-` 前缀的 slug 契约）；`require-intent` 门禁契约（默认开拦截、`CHE_REQUIRE_INTENT` 环境变量优先于 `.che/config.yml` 的 `require_intent:`、非法值 fail-closed、非项目目录报错、已登记特性时按 slug 校验 `docs/intents/{slug}.intent.md` 存在而任意 intent.md 不满足、未登记特性维持任意 intent.md 校验）；`planverify-gate` 门禁契约（默认 off 静默放行且不读报告、`SKC_PLANVERIFY_GATE` 环境变量优先于 `.che/config.yml` 的 `planverify_gate:`、非法值 fail-closed、非项目目录报错、block 下报告缺失/无 `verdict:` 行/`BLOCKED_DRIFT` 退 1、`PASS`/`REPLAN_ALLOWED` 退 0、缺或多 slug 与未知参数退 2、`--json` 输出 `MODE`/`VERDICT`/`PROCEED`）。Node 缺失硬 FAIL；Node 无原生 type stripping 时 SKIP（退出 0，不计 pass/fail）。
11. `tests/skills/test-pack-runtime.sh` 把 adrkit 三个技能复制到临时 `.agents/skills/` 安装位，先以不含 `adrkit`/`che` 的最小 PATH 分别验证两个缺失 CLI 的非零退出与 npm 安装提示，再把 `npm ci` 安装的真实 `@adrkit/cli` 与仓内 `@newchiwan/che` 加入 PATH，驱动 feature paths（经 `adrkit-lib.sh` 的 `che paths` 解析）、scaffold、draft、lint、check、evaluate、context/queue、MADR migrate；require-intent / planverify-gate 薄封装同测缺失 che 提示与委托后的门禁行为；`jq` / `git` 仍不在最小 PATH。项目根判定用 `.git`，特性指针在 `.che/feature.json`。

新增检查：在 `for skill_dir in …` 循环内加 per-skill 规则（用 `ok` / `bad "<msg>"` 助手计数），循环后加全局规则；保持 `set -u` 与结尾的 `printf` + `[ "$fail" -eq 0 ]` 不变。
