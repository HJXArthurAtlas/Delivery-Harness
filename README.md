# NCW Delivery Harness

newchiwan 团队的跨端 agent skill pack：把 PingCode 规格驱动的 AI native 开发流程（speckit 全流程与建卡收尾）、adrkit / grill / compound / bug 治理与线上排障做成可安装的 agent skill，DSH / OpenCode / omp 等等。GitLab 项目：[Tech Council / ncw-delivery-harness](https://git.newchiwan.com/council/ncw-delivery-harness)（内部仓，默认分支 `main`）。

## Pack 内容

| skill | 用途 | 触发语示例 |
|---|---|---|
| `che-adr-context` | 规划前取治理决策进上下文：带路径给 governedBy/activeProposals/history，无路径列 ARB 待评审队列（adrkit context 命令的 pack 分发，正文英文原文；只读） | 「这个改动受哪些决策约束」「列出待评审决策」 |
| `che-adr-check` | plan 产出后对照 ADR 语料只读校验是否越界，配 ADRKIT_SNAPSHOT 时追加确定性路由报告（adrkit check 命令的 pack 分发；plan 后必跑、tasks 入向前置） | 「check 这个 plan 越没越决策」 |
| `che-adr-draft` | 从当前 plan 工件 scaffold 一条新 ADR 草稿（不经 hook；其 `scripts/scaffold.sh` 还是 grill-with-docs / compound-writeback 的免 plan 分配入口——ADR 统一归口语料 `docs/adr/`；落稿后接 `scripts/adr.sh lint` 校验） | 「把这个决策落成 ADR」 |
| `che-compound-intent` | intent 访谈：目标 + 约束 + 失败条件（compound v0.7.0 的 pack 分发，正文英文原文；运行期数据落在项目 `docs/intents/` 等，不经扩展安装） | 「先做 intent 访谈」「锁定目标与约束」 |
| `che-compound-expectations` | 期望访谈：正/边缘场景与 intent 分文件存放（builder 不可见，防 reward-hack） | 「补期望场景」「写 expectations」 |
| `che-compound-load` | 会话开始加载 adrkit ADR 语料（`docs/adr/`）+ compound store（`docs/corrections/` + `docs/patterns/`）进上下文，缺目录时按 bundled 模板 scaffold | 「加载 compound store」 |
| `che-compound-writeback` | intentguard PASS 后把本次纠偏/模式写回 `docs/corrections/` + `docs/patterns/`，耐久纠偏升格为 ADR 进 adrkit 语料 `docs/adr/` | 「writeback 本次经验」 |
| `che-compound-gapfill` | intent + expectations 对照 tasks.md 找覆盖缺口并追加任务（带来源注释） | 「补任务缺口」「gapfill」 |
| `che-compound-planverify` | 实现前由独立 checker（跨模型优先）判定 plan + 任务是否偏离锁定 intent | 「验证 plan」「planverify」 |
| `che-compound-planverify-gate` | before_implement 门禁（判定逻辑内联在 che CLI `che planverify-gate`）：`SKC_PLANVERIFY_GATE=block`（或 `.che/config.yml` 的 `planverify_gate:`）时拦截未验证/BLOCKED_DRIFT 的实现，默认 off | （手动/agent 调用） |
| `che-compound-intentguard` | 实现后 L3 校验：密封 briefing + 独立 checker 判 diff 是否越出 intent/期望 | 「intentguard 校验本次实现」 |
| `che-compound-require-intent` | before_specify 门禁：`docs/intents/` 无 intent 文档时拦截 specify（判定逻辑内联在 che CLI `che require-intent`，技能脚本仅薄封装委托）；开关经 `CHE_REQUIRE_INTENT` 环境变量或 `.che/config.yml` 的 `require_intent:` 配置，默认开 | （手动/agent 调用） |
| `che-compound-grill-me` | 无上限轮次澄清访谈（clarify 的深化替代）：前沿/轮次/设计树把 spec.md 决策点推进到 Clear/Resolved/Outstanding/Deferred（grill me 命令的 pack 分发，正文英文原文） | 「深度澄清这份 spec」「grill me」 |
| `che-compound-grill-with-docs` | 同 grill-me 澄清流程 + settled 跨特性术语/领域知识即时落盘 docs/domain_knowledge/（CONTEXT.md + 主题文档）；过三条件记录门的决策经 adrkit scaffold 归口为 ADR（`docs/adr/`，pack fork 段）（grill with-docs 命令的 pack 分发） | 「澄清并沉淀领域知识」 |
| `che-compound-analyze` | 跨工件一致性只读分析（analyze 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「分析 spec/plan/tasks 一致性」 |
| `che-bug-assess` | bug 报告三角定位：粘贴文本/URL → 症状、疑似代码路径、严重度与修复方案，产出 `docs/bugs/<slug>/assessment.md`（spec-kit extension:bug 的 pack 分发，正文英文原文） | 「评估这个 bug」「看看这个报错是不是真问题」 |
| `che-bug-fix` | 按 assessment 的修复方案实施并记录变更到 `docs/bugs/<slug>/fix.md`（仅 assessment 存在后可用；assessment 有误停下回退） | 「按评估修这个 bug」 |
| `che-bug-test` | 验证修复是否真正解决 bug：重跑复现 + 新增测试 + 回归，产出 `docs/bugs/<slug>/test.md`（failed 回退重跑 assess） | 「验证这个修复」「回归这个 bug」 |
| `che-compound-clarify` | 规格澄清问答（clarify 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「澄清规格歧义」「补全需求细节」 |
| `che-compound-constitution` | 创建/更新项目章程 `docs/constitution/constitution.md`（constitution 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「立章程」「修订治理原则」 |
| `che-compound-converge` | 差距收敛（converge 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「收敛剩余工作」「补齐未实现需求」 |
| `che-compound-design` | 需求澄清与设计明细产出（design 命令，pack 新增非上游）：四盲区问句库澄清 + 设计规约/自检七域走查，产出 `design-tasks.md` 设计明细（依赖活动特性 spec.md；澄清不回写 spec，产物不进交接门禁） | 「出设计明细」「把这份 spec 转成设计明细」 |
| `che-compound-flow` | 规格驱动开发 + PingCode AI native 开发流程的衔接与门禁（出规格建卡 → 接规格规划实现 → 卡片收尾） | 「这个需求转开发了，开始 plan」「出 spec 并建卡」 |
| `che-compound-implement` | 按 tasks.md 执行任务实现（implement 命令的 pack 分发，正文英文原文；不含 extension hook 机制；含 pack fork：涉 UI 按 `design-tasks.md` 交互规则实现并核验设计要求清单） | 「开始实现」「按任务清单编码」 |
| `che-compound-plan` | 实现规划与设计工件生成（plan 命令的 pack 分发，正文英文原文；不含 extension hook 机制；含 pack fork：存在 `design-tasks.md` 时必读并对齐 UX，冲突回用户裁决） | 「做这个需求的实现计划」「出 plan」 |
| `che-compound-specify` | 特性规格创建/更新（specify 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「出 spec」「写特性需求」 |
| `che-compound-tasks` | 任务清单生成（tasks 命令的 pack 分发，正文英文原文；不含 extension hook 机制，Handoff 块含 pingcode 补建任务卡可选目标） | 「出任务清单」「拆任务」 |
| `che-pingcode-init` | 交互式初始化 PingCode 集成：选项目/产品/迭代/映射类型（含需求树不跳级校验），生成 `.che/pingcode-config.yml` 并初始化 CLI 运行时上下文（Spec-Kit-PingCode v2.9.0 的 pack 分发，正文中文） | 「配置 PingCode」「重置建卡映射」 |
| `che-pingcode-discover-context` | 探查 PingCode 项目字典（工作项类型/状态/优先级/迭代/产品），生成可粘贴配置片段与 `pingcode-discovered-context.json`（同上 pack 分发） | 「看看 PingCode 有哪些类型/迭代」 |
| `che-pingcode-specstoissues` | spec → PingCode 需求树卡片：spec 卡/`### User Story N` 章节卡/任务行卡三级相邻映射，动态祖先关联（需求必问、中间层只选已有不代建），登记 `specs/pingcode-mapping.json`（同上 pack 分发；extension hook 改接为 specify/tasks Handoff 块可选目标，任务卡按提示或手动重跑补建） | 「把这个 spec 建成卡」「补建/重建卡片」 |
| `che-pingcode-sync-cards` | 实现前核对 specs/ 制品与卡片一致性，按差异增删改（删除逐项确认），祖先关联沿用登记不重问（同上 pack 分发；implement 开始时前置对账，已建卡才提示） | 「对账卡片」「spec 改了同步卡片」 |
| `che-pingcode-sync-status` | 本地任务全勾后把任务卡/story/spec 卡单向流转完成态（只收尾不回退），写 `pingcode-sync-log.json` 并回写登记（同上 pack 分发） | 「收尾卡片」「同步完成状态」 |
| `che-mturtle-troubleshooting` | 线上问题排查：口头名称（"中台财务"、"网运通"、"调度"…）→ 环境/Loki namespace·app/数据库对号，业务单号/trace_id 追日志 + 数据库核事实互相印证，跨服务调用与推送链逐级定位，收口给时间线与证据边界（自 monorepo-template 吸纳，正文中文；纯知识无 scripts，证据全部来自线上 MCP 数据源，不依赖工作目录） | 「中台财务这笔流水到哪了」「这个报错是哪个服务的」 |

## 运行时与外部 CLI（排除 init / flow）

`che-adr-*` 依赖外部 `@adrkit/cli`；特性路径解析依赖外部 `che` CLI（`@newchiwan/che`）：

| 能力 | 实现 / 入口 | 运行时前提 |
|---|---|---|
| adrkit `new/check/queue/lint/migrate/evaluate` | 外部 `@adrkit/cli`；`adr.sh` 是跨技能入口 | Node ≥22；`adrkit` 不可用时运行 `npm install -g @adrkit/cli@0.20.0` |
| grill、adrkit check/draft、speckit 全流程（analyze/clarify/constitution/converge/design/implement/plan/tasks/specify）的特性路径与模板解析 | 外部 `che` CLI（源与发布单元在 `packages/cli`，npm 包 `@newchiwan/che`） | Node ≥22.18；`che` 不可用时运行 `npm install -g @newchiwan/che@0.1.0`；特性指针在 `.che/feature.json` |
| ADR scaffold / lint / legacy migration | `che-adr-draft/scripts/{scaffold.sh,adr.sh}` | 同 adrkit；全部走 pack-local 跨技能调用 |
| PingCode 卡操作（che-pingcode-* 五技能） | 无 bundle——依赖外部 `pingcode` CLI ≥ 0.14.0（`npm i -g @metaphorli/pingcode-cli`） | `pingcode auth login` 认证 + 网络可达 PingCode；pack 不内置（认证凭据与 API 演进留在上游 CLI） |

CLI 解析（`adrkit-lib.sh`）：只执行 PATH 上的 `adrkit` 与 `che`，不使用其他二进制路径或回退。不可用时退出并提示上述 npm 安装命令。

`planverify` / `intentguard` 的默认 `auto` 策略在没有跨模型 CLI 时使用原生 Tier 2/3 subagent；只有用户强制 `cross-model` 或 `cli:model` 才需要对应外部模型 CLI。

**范围边界**：`che-compound-flow` 不属于自包含改造范围（保留 PingCode 卡流程依赖）。目标项目自身的 git / build / test / lint 工具链也不随 pack 内置。

## 安装

各端全靠文件落位；项目级同名覆盖全局级（DSH rank 100/200 > 400/500）。

```bash
# omp 插件（推荐）
omp plugin marketplace add git+https://git.newchiwan.com/council/ncw-delivery-harness.git
omp plugin install ncw-delivery@ncw-delivery-harness

# DSH 插件（根包兼作 DSH bundle；git 安装钉 commit，升级换 sha 重跑 add）
dsh plugin --profile <name> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git#<commit>
dsh plugin --profile <name> remove ncw-delivery-harness

# 其他端（DSH / OpenCode）：把 skills/<name>/ 拷入对应 skill 发现目录即可
git clone https://git.newchiwan.com/council/ncw-delivery-harness.git
cp -R ncw-delivery-harness/skills/<name> <发现目录>/skills/
```

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |

omp 实测同时读项目级与全局级；DSH / OpenCode 官方支持同两个路径；DSH 无需 plugin——skill 是「被扫描的文件」，拷贝即安装，免重启热加载。

### DSH 插件（根包兼作 DSH bundle，可选）

本仓 `package.json` 同时声明 omp 与 DSH 两个分发面（`"omp": {}` + `"dsh": {"bundle": ...}`），无构建、无拷贝——bundle 插件运行时直接扫描包内 `skills/`：

- `cordis.patch.yml`：bundle patch 层，insert 插件行 `ncw-delivery-skills`。
- `dsh-entry.js`：SkillProvider 入口（纯 node:fs，零依赖），把每个 `skills/<name>/SKILL.md` 挂成 DSH 一等技能（provider `ncw-delivery`，source `bundled`）。
- 冲突策略：rank 250——项目级发现（`.dsh/skills`=100、`.agents/skills`=200）按名覆盖本 pack，本 pack 压过用户级目录（400/500）；与手动拷贝二选一即可，同装时插件版胜出。
- `engines.dsh` 钉 `>=0.2.0-rc.2 <0.3.0`，DSH 安装/启动按范围 fail-closed；升级 = 换 commit sha 重跑 `add`，重启 profile 生效（bundle 技能不热加载）。
- 技能运行时仍只执行 PATH 上的 `adrkit` / `che`（全局安装指引不变）；`dsh plugin add` 随包安装的 `@adrkit/cli` 等依赖不进 PATH 解析。
- 想走 DSH「发现」市场：按 [官方 plugin-market 文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md)自托管索引（git source + `vX.Y.Z` tag），本仓不再另建市场服务。

### omp marketplace 插件（可选）

omp 侧还可以走原生插件分发（catalog：`.omp-plugin/marketplace.json`，插件名 `ncw-delivery`）：

```bash
omp plugin marketplace add https://git.newchiwan.com/council/ncw-delivery-harness.git
omp plugin install ncw-delivery@ncw-delivery-harness
```

- 插件**只含 skills**，不含斜杠命令；`.agents/commands/`（`/readme-refresh`）是本仓维护者工具，不经插件分发——pack 没有额外的同步/安装脚本，插件树即 `skills/`。
- 更新：`omp plugin upgrade ncw-delivery@ncw-delivery-harness`；装完 `/reload-plugins` 或开新会话生效。
- 注意 `marketplace.autoUpdate` 默认 `notify` 只写 debug log 不提示；要自动更新执行 `omp config set marketplace.autoUpdate auto`。
- catalog `version` 与 `package.json` 版本同步维护，`npm test` 校验二者一致。
- **marketplace 安装不解析 npm 依赖**（只缓存插件树并符号链接）。该路径下若 `adrkit` 或 `che` 不可用，手动运行 `npm install -g @adrkit/cli@0.20.0` 与 `npm install -g @newchiwan/che@0.1.0`。
- **缓存是整仓快照**：`marketplace add` 克隆整仓，`plugin install` 把 `source` 目录整树拷入 `~/.omp/plugins/cache/plugins/<marketplace>___<plugin>___<version>/`（catalog 无文件过滤字段）。agent 运行时只从缓存发现 `skills/<name>/SKILL.md`，tests/packages/docs 等其余文件是惰性缓存，不进发现面。
- **开发机勿用本地路径验证分发**：`marketplace add <本地目录>` 按 omp 语义整目录拷贝（不读 .gitignore），会把未跟踪的 `node_modules`/`.idea` 一并带进缓存；分发验证一律走 git URL。

#### omp git 插件安装（带 `@adrkit/cli` 依赖）

git 插件安装会让 omp 用 bun 安装 `package.json#dependencies` 中钉版本的 `@adrkit/cli`。技能不会直接读取插件 `node_modules`；无论采用哪种插件安装方式，都必须确保 `adrkit` 在 PATH 上，最简单的做法是另行运行 `npm install -g @adrkit/cli@0.20.0`（特性路径解析同理需要 `che`：`npm install -g @newchiwan/che@0.1.0`）：

```bash
omp plugin install git+https://git.newchiwan.com/council/ncw-delivery-harness.git
npm install -g @adrkit/cli@0.20.0
```

`package.json` 的 `"omp": {}` manifest 是这条路径下运行时技能发现的前提（omp 跳过无 manifest 的包）；`npm test` 校验 `@adrkit/cli` 使用精确版本钉。

## 开发

```bash
npm ci     # 安装钉版本的 @adrkit/cli，并把仓内 @newchiwan/che（file:packages/cli）链接进 node_modules/.bin，供运行时契约测试使用
npm test   # ① test-skill-structure.sh：结构与分发面（skills frontmatter/引用/泄漏、.omp-plugin catalog、.agents/commands、DSH bundle 分发面）；② test-che-cli.sh：che CLI 契约（paths/check/feature/require-intent/template/setup-plan/setup-tasks，模板字节级 round-trip）；③ test-pack-runtime.sh：临时 .agents/skills 安装 + 最小 PATH，验证缺失 CLI 的 npm 安装提示，再用真实 @adrkit/cli 与 che 驱动特性解析、ADR scaffold/draft/lint/check/evaluate/context/queue/migrate
```

新增技能 = 在 `skills/` 下建目录 + `SKILL.md`（frontmatter 含 `name`、`description`≤1024 字符）；`npm test` 会把关。omp 插件按 `skills/` 目录自动发现，无需另行登记。命名格式 `che-{submodule}-action`（如 `che-pingcode-init`），全名 ≤32 字符。

提交信息格式：`<type>(<scope>): #<工作项ID> <主题>`，如 `refactor(skills): #TECH-1234 技能更名`；无对应工作项时 ID 用默认 `#TECH-000`。type 取值：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。提交时由 `.githooks/commit-msg` 强制校验；首次克隆后执行一次 `git config core.hooksPath .githooks` 激活。
