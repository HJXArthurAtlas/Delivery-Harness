# NCW Delivery Harness

newchiwan 团队的跨端 agent skill pack：把团队标准 monorepo 的初始化 / 诊断流程与 PingCode 规格驱动开发流程做成可安装的 agent skill，DSH / OpenCode / omp 等等。GitLab 项目：[Tech Council / ncw-delivery-harness](https://git.newchiwan.com/council/ncw-delivery-harness)（内部仓，默认分支 `main`）。初始化步骤与工具链版本钉子的单一载体是 `skills/ncw-monorepo-init/references/init.md`（与模板仓 `monorepo-template` 的 `AGENTS-TEMPLATE.md` 巡检表版本同步）。

## Pack 内容

| skill | 用途 | 触发语示例 |
|---|---|---|
| `ncw-monorepo-init` | 项目初始化（init）/ 结构环境诊断（diagnose），migrate 待标注 | 「按团队 monorepo 规范初始化/诊断这个项目」 |
| `ncw-adrkit-context` | 规划前取治理决策进上下文：带路径给 governedBy/activeProposals/history，无路径列 ARB 待评审队列（adrkit context 命令的 pack 分发，正文英文原文；只读） | 「这个改动受哪些决策约束」「列出待评审决策」 |
| `ncw-adrkit-check` | plan 产出后对照 ADR 语料只读校验是否越界，配 ADRKIT_SNAPSHOT 时追加确定性路由报告（adrkit check 命令的 pack 分发；after_plan 可选 hook 目标） | 「check 这个 plan 越没越决策」 |
| `ncw-adrkit-draft` | 从当前 plan 工件 scaffold 一条新 ADR 草稿（不经 hook；其 `scripts/scaffold.sh` 还是 grill-with-docs / compound-writeback 的免 plan 分配入口——ADR 统一归口语料 `docs/adr/`；落稿后接 `scripts/adr.sh lint` 校验） | 「把这个决策落成 ADR」 |
| `ncw-compound-intent` | intent 访谈：目标 + 约束 + 失败条件（compound v0.7.0 的 pack 分发，正文英文原文；运行期数据落在项目 `docs/intents/` 等，不经扩展安装） | 「先做 intent 访谈」「锁定目标与约束」 |
| `ncw-compound-expectations` | 期望访谈：正/边缘场景与 intent 分文件存放（builder 不可见，防 reward-hack） | 「补期望场景」「写 expectations」 |
| `ncw-compound-load` | 会话开始加载 adrkit ADR 语料（`docs/adr/`）+ compound store（`docs/corrections/` + `docs/patterns/`）进上下文，缺目录时按 bundled 模板 scaffold | 「加载 compound store」 |
| `ncw-compound-writeback` | intentguard PASS 后把本次纠偏/模式写回 `docs/corrections/` + `docs/patterns/`，耐久纠偏升格为 ADR 进 adrkit 语料 `docs/adr/` | 「writeback 本次经验」 |
| `ncw-compound-gapfill` | intent + expectations 对照 tasks.md 找覆盖缺口并追加任务（带来源注释） | 「补任务缺口」「gapfill」 |
| `ncw-compound-planverify` | 实现前由独立 checker（跨模型优先）判定 plan + 任务是否偏离锁定 intent | 「验证 plan」「planverify」 |
| `ncw-compound-planverify-gate` | before_implement 门禁脚本包装器：`SKC_PLANVERIFY_GATE=block` 时拦截未验证/BLOCKED_DRIFT 的实现 | （hook 触发） |
| `ncw-compound-intentguard` | 实现后 L3 校验：密封 briefing + 独立 checker 判 diff 是否越出 intent/期望 | 「intentguard 校验本次实现」 |
| `ncw-compound-require-intent` | before_specify 门禁脚本包装器：`docs/intents/` 无 intent 文档时拦截 specify | （hook 触发） |
| `ncw-speckit-grill-me` | 无上限轮次澄清访谈（clarify 的深化替代）：前沿/轮次/设计树把 spec.md 决策点推进到 Clear/Resolved/Outstanding/Deferred（grill me 命令的 pack 分发，正文英文原文） | 「深度澄清这份 spec」「grill me」 |
| `ncw-speckit-grill-with-docs` | 同 grill-me 澄清流程 + settled 跨特性术语/领域知识即时落盘 docs/domain_knowledge/（CONTEXT.md + 主题文档）；过三条件记录门的决策经 adrkit scaffold 归口为 ADR（`docs/adr/`，pack fork 段）（grill with-docs 命令的 pack 分发） | 「澄清并沉淀领域知识」 |
| `ncw-speckit-analyze` | 跨工件一致性只读分析（analyze 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「分析 spec/plan/tasks 一致性」 |
| `ncw-speckit-clarify` | 规格澄清问答（clarify 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「澄清规格歧义」「补全需求细节」 |
| `ncw-speckit-constitution` | 创建/更新项目章程 `docs/constitution/constitution.md`（constitution 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「立章程」「修订治理原则」 |
| `ncw-speckit-converge` | 差距收敛（converge 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「收敛剩余工作」「补齐未实现需求」 |
| `ncw-speckit-design` | 需求澄清与设计明细产出（design 命令，pack 新增非上游）：四盲区问句库澄清 + 设计规约/自检七域走查，产出 `design-tasks.md` 设计明细（依赖活动特性 spec.md；澄清不回写 spec，产物不进交接门禁） | 「出设计明细」「把这份 spec 转成设计明细」 |
| `ncw-speckit-flow` | 规格驱动开发 + PingCode AI native 开发流程的衔接与门禁（出规格建卡 → 接规格规划实现 → 卡片收尾） | 「这个需求转开发了，开始 plan」「出 spec 并建卡」 |
| `ncw-speckit-implement` | 按 tasks.md 执行任务实现（implement 命令的 pack 分发，正文英文原文；不含 extension hook 机制；含 pack fork：涉 UI 按 `design-tasks.md` 交互规则实现并核验设计要求清单） | 「开始实现」「按任务清单编码」 |
| `ncw-speckit-plan` | 实现规划与设计工件生成（plan 命令的 pack 分发，正文英文原文；不含 extension hook 机制；含 pack fork：存在 `design-tasks.md` 时必读并对齐 UX，冲突回用户裁决） | 「做这个需求的实现计划」「出 plan」 |
| `ncw-speckit-specify` | 特性规格创建/更新（specify 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「出 spec」「写特性需求」 |
| `ncw-speckit-tasks` | 任务清单生成（tasks 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「出任务清单」「拆任务」 |

## 自包含运行时（排除 init / flow）

`ncw-adrkit-*`、grill 与相关 compound 写入路径默认不需要安装项目外 CLI 或脚本：

| 能力 | Pack 内实现 | 运行时前提 |
|---|---|---|
| adrkit `new/check/queue/lint/migrate/evaluate` | `skills/ncw-adrkit-draft/scripts/adr.mjs`（上游 CLI 与依赖的单文件 bundle）；`adr.sh` 是跨技能入口 | Node ≥22；无需 `@adrkit/cli`、`node_modules` 或 PATH 上的 `adr` |
| grill、adrkit check/draft 与 ncw-speckit-design 的特性路径解析 | `skills/ncw-speckit-analyze/scripts/check_prerequisites.py` | python3；无需 `specify init`（`.specify/` 已废弃，特性指针在 `docs/memory/feature.json`） |
| ADR scaffold / lint / legacy migration | `ncw-adrkit-draft/scripts/{scaffold.sh,adr.sh}` | 同上；全部走 pack-local 跨技能调用 |

CLI 解析顺序（`adrkit-lib.sh`）：`ADRKIT_CLI` 显式覆盖 > omp 插件依赖安装的 `@adrkit/cli`（`<项目>/.omp/plugins/node_modules/.bin/adrkit`，然后 `~/.omp/plugins/node_modules/.bin/adrkit`）> pack-bundled `adr.mjs` 兜底。PATH 上的 `adr`/`adrkit` 永远不被拾取。

`ADRKIT_CLI` 仅是显式覆盖入口，不是默认依赖。`planverify` / `intentguard` 的默认 `auto` 策略在没有跨模型 CLI 时使用原生 Tier 2/3 subagent；只有用户强制 `cross-model` 或 `cli:model` 才需要对应外部模型 CLI。

**范围边界**：`ncw-monorepo-init` 与 `ncw-speckit-flow` 不属于自包含改造范围；前者保留初始化工具链，后者保留 PingCode 卡流程依赖。目标项目自身的 git / build / test / lint 工具链也不随 pack 内置。

## 安装

需要 Node ≥ 22。各端全靠文件落位，无需包管理器或插件；项目级同名覆盖全局级（DSH rank 100/200 > 400/500）。

```bash
# 方式一：npx 直装（免克隆；私有仓需 git 凭证）
# 装（用户级）全局 skill 加 --global；装当前项目则去掉该参数
npx git+https://git.newchiwan.com/council/ncw-delivery-harness.git --global

# 方式二：克隆后执行
git clone https://git.newchiwan.com/council/ncw-delivery-harness.git && cd ncw-delivery-harness
node skills/ncw-monorepo-init/scripts/sync.mjs             # 项目级：<cwd>/.agents/skills/
node skills/ncw-monorepo-init/scripts/sync.mjs --global    # 用户级：~/.agents/skills/
```

支持 `--dry-run` 预览、`--force` 覆盖同名；默认同名不覆盖。

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |

omp 实测同时读项目级与全局级；DSH / OpenCode 官方支持同两个路径；DSH 无需 plugin——skill 是「被扫描的文件」，拷贝即安装，免重启热加载。

### omp marketplace 插件（可选）

omp 侧还可以走原生插件分发（catalog：`.omp-plugin/marketplace.json`，插件名 `ncw-delivery`）：

```bash
omp plugin marketplace add https://git.newchiwan.com/council/ncw-delivery-harness.git
omp plugin install ncw-delivery@ncw-delivery-harness
```

- 插件**只含 skills**，不含斜杠命令；`.agents/commands/`（`/readme-refresh`）是本仓维护者工具，不经插件也不经 sync 分发——sync 只装 `skills/`。
- 更新：`omp plugin upgrade ncw-delivery@ncw-delivery-harness`；装完 `/reload-plugins` 或开新会话生效。
- 注意 `marketplace.autoUpdate` 默认 `notify` 只写 debug log 不提示；要自动更新执行 `omp config set marketplace.autoUpdate auto`。
- catalog `version` 与 `package.json` 版本同步维护，`npm test` 校验二者一致。
- **marketplace 安装不解析 npm 依赖**（只缓存插件树并符号链接），上述路径下 adrkit 技能继续走 pack-bundled `adr.mjs`。

#### omp git 插件安装（带 `@adrkit/cli` 依赖）

想让 adrkit 技能使用真实 `@adrkit/cli`（版本钉在 `package.json#dependencies`，与 bundled `adr.mjs` 同为 0.20.0）时，走 git 插件安装——omp 会用 bun 安装依赖，`adrkit` 二进制落 `~/.omp/plugins/node_modules/.bin/`，技能脚本按上述解析顺序自动优先它：

```bash
omp plugin install git+https://git.newchiwan.com/council/ncw-delivery-harness.git
```

`package.json` 的 `"omp": {}` manifest 是这条路径下运行时技能发现的前提（omp 跳过无 manifest 的包）；`npm test` 钉住依赖版本与 `adrkit-bundle.json` 一致。

## 开发

```bash
npm test   # ① test-skill-structure.sh：结构与分发面；② test-speckit-constitution.sh：模板分辨栈契约；③ test-pack-runtime.sh：临时 .agents/skills 安装 + 无 adr/specify/git 的最小 PATH，驱动特性解析、ADR scaffold/draft/lint/check/evaluate/context/queue/migrate（无 python3 时 SKIP）
```

新增技能 = 在 `skills/` 下建目录 + `SKILL.md`（frontmatter 含 `name`、`description`≤1024 字符）+ 在 `tests/skills/test-skill-structure.sh` 的 `known_unregistered` 白名单登记一行；`npm test` 会把关，缺登记即失败。安装清单 `PACK_SKILLS` 冻结在回退态（仅 monorepo-setup / speckit-flow 两项，其余技能不在 sync 安装面，见测试内 rule 6 注释）；omp 插件按 `skills/` 目录自动发现，无需另行登记。命名格式 `ncw-{submodule}-action`（如 `ncw-monorepo-init`），全名 ≤32 字符。

提交信息格式：`<type>(<scope>): #<工作项ID> <主题>`，如 `refactor(skills): #TECH-1234 技能更名`；无对应工作项时 ID 用默认 `#TECH-000`。type 取值：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。提交时由 `.githooks/commit-msg` 强制校验；首次克隆后执行一次 `git config core.hooksPath .githooks` 激活。
