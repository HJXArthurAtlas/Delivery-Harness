# Repository Guidelines

## 例外

0. this repo is standalone harness from scratch
1. skills/ncw-monorepo-init 是独立模块，没有用户明确指令，禁止改动或引用 

## Project Overview

newchiwan 团队跨端 **agent skill pack**（`ncw-delivery-harness`）：把团队标准 monorepo 的初始化/诊断流程、PingCode 规格驱动开发流程，以及 adrkit / grill / compound 三组上游扩展技能，做成可安装的 agent skill，部署到 DSH / OpenCode / omp 等端。GitLab 项目：`council/ncw-delivery-harness`（内部仓，默认分支 `main`，无 CI——本地 `npm test` 是唯一质量门）。

本仓是「消费模板的元工具」：skill 承载流程与版本钉子，骨架载荷在模板仓 `council/monorepo-template`，两者独立发版。

仓内内容分两层，下文按 **Part I · 用户指南**（消费/安装本 pack 的视角）与 **Part II · 本地开发指南**（维护本仓的视角）组织：

- **分发面**（随 pack 发布，用户可见）：`skills/`、`.omp-plugin/marketplace.json`、`package.json`。
- **仓内基建**（只服务本仓维护，不随 pack 分发）：`tests/`、`.githooks/`、`.agents/commands/`。

---

# Part I · 用户指南（消费 / 安装本 pack）

本部分面向 pack 的消费者：分发模型、安装方式、安装后得到的技能清单。维护本仓请看 Part II。

## Architecture & Data Flow（分发模型）

无消费端构建步骤——「分发物」即 `skills/` 下的 Markdown 规则 + 技能携带的 Python / shell / Node 运行时 + 一个安装脚本，端侧按目录约定直接扫描发现。`adr.mjs` 是预先 bundle 并随仓提交的单文件运行时，安装与执行都不需要 npm 依赖。

```
skills/<name>/SKILL.md (+ references/ scripts/)
        │  sync.mjs 按 PACK_SKILLS 列表整包拷贝（无构建、无生成）
        ▼
<项目>/.agents/skills/（项目级）  ~/.agents/skills/（全局级，--global）
        │  DSH / OpenCode / omp 按目录约定发现；项目级同名覆盖全局级
        ▼
   agent 运行时加载 skill
```

omp 另有原生插件分发（不走拷贝）：`.omp-plugin/marketplace.json` 是 catalog（插件 `ncw-delivery`，`source: "./"` 即仓根），用户 `omp plugin marketplace add <仓 URL>` + `omp plugin install ncw-delivery@ncw-delivery-harness` 后由 omp 从插件树 `skills/<name>/SKILL.md` 发现。**插件只含 skills**——绝不加 `.omp-plugin/plugin.json` manifest（remap 会把 `.agents/` 带进安装面）；`.agents/commands/` 斜杠命令是本仓维护者工具（`/readme-refresh`），不经插件、不经 sync 分发——sync.mjs 只拷 `skills/`。catalog `version` 与 `package.json` 版本同步维护。marketplace 安装不解析 npm 依赖；另一条 omp 路径 `omp plugin install git+<仓 URL>` 经 bun 安装 `package.json#dependencies` 的 `@adrkit/cli`（版本钉 = `adrkit-bundle.json`，`npm test` 校验一致），`adrkit` bin 落 plugins `node_modules/.bin/`，`adrkit-lib.sh` 解析顺序 `ADRKIT_CLI` > 该 bin > bundled `adr.mjs`。根 `package.json` 的 `"omp": {}` manifest 是 git/npm 安装路径运行时技能发现的前提。

职责分层与外部委托：

- `ncw-monorepo-init` 承载流程与**版本钉子**（`references/init.md` 是唯一载体）；模板仓承载骨架（`AGENTS-TEMPLATE.md`、`docs/adr/` 等），**版本双落点同改**：init.md 的钉子 = 初始化基线，模板仓巡检表 = 巡检基线。
- `ncw-speckit-flow` 是流程衔接与门禁层，按引用委托 `ncw-speckit-*` 系技能、`pingcode` skill、`mturtle-commit`，**不内联它们的规则**。主线命令技能（specify/clarify/design/plan/tasks/implement）的 Completion Report 末尾带统一「Pack fork」下一步提示——按主流程/可选分组，条目格式 `- /命令: [可选] 能做什么`（按 9 阶段表引导下一命令与建卡/对账/收尾提醒，上游升级需 port）。

## 技能清单（`skills/` 目录导览，全部随 pack 分发）

| 路径 | 用途 |
|---|---|
| `skills/ncw-adrkit-{check,context,draft}/` | adrkit 上游扩展（adrkit.* 命令）的 pack 分发：SKILL.md（正文英文原文）+ `scripts/`（`adrkit-lib.sh` 三份逐字副本 + 各自入口脚本；draft 另含 pack 新增的 `scaffold.sh` 与单文件 `adr.mjs`——上游 CLI 及依赖的零安装 bundle，`adr.sh` 是跨技能 lint/migrate 入口，`adrkit-bundle.json` + `licenses/` 记录来源与许可）。check/draft 的特性解析委托 `ncw-speckit-analyze` 的 bundled helper；check 在 plan 后手动跑（hook 机制已清除，统一走 SKILL.md 末尾 Handoff 块交接）|
| `skills/ncw-compound-*/` | compound 技能组（9 个）：intent/expectations/gapfill/planverify/intentguard/writeback/load/require-intent/planverify-gate。运行期数据落项目 `docs/intents/`、`docs/expectations/`、`docs/adr/`、`docs/corrections/`、`docs/patterns/`，README/config/_drafts 等元数据留在 `docs/compound/`；**ADR 归口 adrkit 语料 `docs/adr/`**（writeback 升格、load 读取、intent 引用均指向语料，load/intent/writeback 正文含 pack fork 段，上游升级需 port）。交接统一走各 SKILL.md 末尾的中文 `## Handoff` 块（目标/条件/回退，详见 `docs/skill-handoff-and-gates.md`）；require-intent / planverify-gate 是手动调用的 shell 门禁脚本，hook 机制已清除|
| `skills/ncw-speckit-grill-{me,with-docs}/` | grill 上游扩展（grill.* 命令）的 pack 分发：单文件 SKILL.md（正文英文原文）。特性解析统一委托 `ncw-speckit-analyze/scripts/check_prerequisites.py`，不再依赖 specify init 产物；两技能均删除上游 extension-hook 段并含此 resolver fork。`ncw-speckit-grill-me` 其余正文保持上游；**grill-with-docs 另为 pack fork**——ADR 经 `ncw-adrkit-draft/scripts/scaffold.sh` 归口 `docs/adr/`，lint 走 `adr.sh`；上游 grill 升级时需 port 这些 fork 段|
| `skills/ncw-monorepo-init/` | 初始化（init）/ 诊断（diagnose）skill：`SKILL.md`（模式判定、安全边界、分发说明）、`references/init.md`（init 流程 + 版本钉子）、`references/checklist.md`（diagnose 基线）、`scripts/sync.mjs`（pack 安装器） |
| `skills/ncw-speckit-analyze/` | SKILL.md + `scripts/`（bundled `check_prerequisites.py` + `common.py`，v1.1.3 逐字副本，免 specify init）：analyze 命令（spec/plan/tasks 一致性只读分析），正文英文原文；该 helper 同时是 grill、adrkit check/draft 与 speckit-design 的 pack-local 特性解析入口 |
| `skills/ncw-speckit-clarify/` | SKILL.md + `scripts/`（bundled `check_prerequisites.py` + `common.py`，v1.1.3 逐字副本，免 specify init）：clarify 命令（≤5 问澄清并回写 spec），正文英文原文 |
| `skills/ncw-speckit-constitution/` | SKILL.md + `scripts/`（bundled `resolve_template.py` + `common.py`）+ `references/constitution-template.md`（模板自包含，resolver 直接读 `references/`，无项目层覆盖栈）：constitution 命令（建/改 docs/constitution/constitution.md），正文英文原文 |
| `skills/ncw-speckit-converge/` | SKILL.md + `scripts/`（bundled `check_prerequisites.py` + `common.py`，v1.1.3 逐字副本，免 specify init）：converge 命令（代码现状 vs 工件差距→追加收敛任务），正文英文原文 |
| `skills/ncw-speckit-design/` | 设计明细产出（design 命令，pack 新增非上游，逐字吸收自 loyalty-platform 的 requirement-to-des-tasks）：SKILL.md（四盲区澄清 + 设计规约/自检七域走查 → 产出 `$FEATURE_DIR/design-tasks.md` 设计明细；澄清不回写 spec，产物不进 flow 交接门禁）+ `references/`（`question-bank.md` 问句库、`design-spec.md` 设计规约、`design-selfcheck.md` 设计自检、`design-tasks-template.md` 明细模板）；特性解析委托 `ncw-speckit-analyze` 的 bundled helper |
| `skills/ncw-speckit-flow/` | 单文件 `SKILL.md`：9 阶段流程表 + 交接门禁 + 对账纪律 |
| `skills/ncw-speckit-implement/` | SKILL.md + `scripts/`（bundled `check_prerequisites.py` + `common.py`，v1.1.3 逐字副本，免 specify init）：implement 命令（按 tasks.md 执行实现），正文英文原文；含 pack fork 段——存在 `$FEATURE_DIR/design-tasks.md` 时 UI 任务按其交互规则/页面状态实现，逐项核验设计要求清单 UI-xx 后才算完成（上游升级需 port） |
| `skills/ncw-speckit-plan/` | SKILL.md + `scripts/`（bundled `setup_plan.py` + `common.py`）+ `references/plan-template.md`（模板自包含，`setup_plan.py` 直接读 `references/`）：plan 命令（实现规划 + research/data-model/contracts/quickstart 工件），正文英文原文；含 pack fork 段——存在 `$FEATURE_DIR/design-tasks.md` 时必读并作为 UX 约束输入，与 spec 冲突回用户裁决（上游升级需 port） |
| `skills/ncw-speckit-specify/` | SKILL.md + `references/spec-template.md`（模板自包含；特性目录编号统一 timestamp `YYYYMMDD-HHMMSS`，特性指针落 `docs/memory/feature.json`，词汇表落 `docs/memory/glossary.md`）：specify 命令（特性规格创建/更新 + 质量清单），正文英文原文 |
| `skills/ncw-speckit-tasks/` | SKILL.md + `scripts/`（bundled `setup_tasks.py` + `common.py`）+ `references/tasks-template.md`（模板自包含，`setup_tasks.py` 直接读 `references/`）：tasks 命令（按用户故事生成依赖有序 tasks.md），正文英文原文 |
| `tests/skills/` | 结构校验脚本 + `ncw-speckit-constitution` 模板契约测试 + `test-pack-runtime.sh` 自包含运行时契约测试（见 Part II Testing & QA） |

## 安装方式

```bash
node skills/ncw-monorepo-init/scripts/sync.mjs            # 项目级安装到 <cwd>/.agents/skills/
node skills/ncw-monorepo-init/scripts/sync.mjs --global   # 用户级安装到 ~/.agents/skills/
node skills/ncw-monorepo-init/scripts/sync.mjs --dry-run  # 只打印 PLAN，不写盘
npx git+https://git.newchiwan.com/council/ncw-delivery-harness.git --global   # 免克隆直装
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
npm test                                                  # 结构校验（唯一测试门，改技能内容后必须跑）
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
| `skills/ncw-monorepo-init/references/init.md` | init 流程 + 工具链版本钉子唯一载体（v1.1.3、adrkit 0.20.0 等） |
| `skills/ncw-monorepo-init/references/checklist.md` | diagnose 基线；版本事实源是项目 `AGENTS.md` 或模板仓，本文件不复写版本号 |
| `.githooks/commit-msg` | 提交格式校验（`core.hooksPath` 已在本仓激活） |
| `.omp-plugin/marketplace.json` | omp marketplace catalog（omp 插件分发唯一入口；`version` 必须与 `package.json` 一致，`npm test` 强制） |
| `README.md` | 面向用户的安装/开发文档；改动分发模型时同步 |

## Runtime/Tooling Preferences

- **Node ≥ 22**，ESM（`.mjs`）；bash + POSIX coreutils（`awk/grep/sort`…）。
- **运行时零依赖、无 lockfile（刻意）**：`sync.mjs` 只用 `node:fs/os/path/url`；测试只用 bash + node 内联脚本（JSON 校验，node ≥22 是运行前提）——不要为仓内工具引入 npm 依赖或 lockfile。唯一例外：`package.json#dependencies` 的 `@adrkit/cli` 仅供 omp git/npm 插件安装路径由 bun 安装，仓内代码与测试不消费它（bundle `adr.mjs` 仍是兜底），版本钉必须与 `adrkit-bundle.json` 一致。
- 无 CI、无构建、无格式化工具链；不要新增这类配置，除非明确要建立。

## Testing & QA

`npm test` = `bash tests/skills/test-skill-structure.sh`（结构校验）+ `bash tests/skills/test-speckit-constitution.sh`（模板运行时契约）+ `bash tests/skills/test-pack-runtime.sh`（自包含运行时契约），零 npm 依赖、可从任意 CWD 运行（路径自定位），退出码 0/1。

强制规则（改技能内容后必须跑）：

1. `SKILL.md` 存在，frontmatter 由 `---` 定界且闭合；
2. `name:` = 目录名，匹配 `^ncw-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$`，≤32 字符；
3. `description:` 非空、≤1024 字符；
4. `SKILL.md` 中字面引用的 `references/`、`scripts/` 文件必须存在（引用即契约，改名要同步建文件；`.agents/`、`~/` 等安装位/宿主路径是运行时路径，不做仓内存在性校验）；
5. 泄漏扫描：`skills/` 与 `.omp-plugin/` 内禁止 `/Users/`、`/home/` 绝对路径；
6. `sync.mjs` `PACK_SKILLS` 与 `skills/` 目录一一对应（防新增技能忘登记；已知偏差 `monorepo-setup`/`speckit-flow` 经测试内显式别名表钉住）；
7. `.agents/commands/*.md` frontmatter 合规（`---` 定界 + 非空 `description`），且不存在工具专属 `.omp/commands/`；
8. `.omp-plugin/marketplace.json` 为合法 JSON，marketplace/plugin 名合规（小写开头结尾、可含 `-`/`.`、≤64），plugin `source` 恰为 `"./"`，`version` 与 `package.json` 一致且符合 omp 缓存路径字符集。JSON 校验用 node 内联脚本完成（node 是运行前提，非新增依赖）；
9. `.omp-plugin/plugin.json` 绝不许存在（manifest remap 会把 `.agents/` 带进 omp 插件安装面，插件只分发 skills）。
10. `tests/skills/test-speckit-constitution.sh` 驱动 `ncw-speckit-constitution` 的 bundled `resolve_template.py`，钉模板自包含契约：`--json` 输出与 `references/constitution-template.md` 字节级 round-trip、不安全模板名与不存在的模板名均非零退出并报 `Could not resolve required`；python3 是技能运行时前提而非本仓测试前提，缺失则 SKIP（退出 0，不计 pass/fail）。
11. `tests/skills/test-pack-runtime.sh` 把 adrkit 三个技能与 analyze 复制到临时 `.agents/skills/` 安装位，以不含 `adr` / `specify` / `jq` / `git` 的最小 PATH 驱动 feature paths、scaffold、draft、lint、check、evaluate、context/queue、MADR migrate；夹具项目不得存在 `.specify/` 目录（已废弃，项目根判定用 `.git`，特性指针在 `docs/memory/feature.json`），以此钉住默认路径不依赖外部 CLI / specify init 的契约。python3 缺失时同样 SKIP。

新增检查：在 `for skill_dir in …` 循环内加 per-skill 规则（用 `ok` / `bad "<msg>"` 助手计数），循环后加全局规则；保持 `set -u` 与结尾的 `printf` + `[ "$fail" -eq 0 ]` 不变。
