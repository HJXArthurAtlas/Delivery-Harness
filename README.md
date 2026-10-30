# NCW Delivery Harness

赤湾东方自建软件交付 Harness：把团队 AI native 交付方法做成跨端 agent skill pack，可在 DSH / OpenCode / omp 等端安装。方法底座三条：

- **知识工程**——把团队知识落盘为机器可装载的资产：宪法 `docs/constitution/`、ADR 语料 `docs/adr/`、领域知识库 `docs/domain_knowledge/`、compound store（`docs/corrections/`、`docs/patterns/`）；会话开场装载（load），交付后回写（retro）。
- **Intent Driven Development**——规格是唯一意图来源：specify → clarify/grill → plan → tasks → implement，以宪法与 ADR 为治理约束，planverify 门禁与 intentverify 独立校验实现不越出意图。
- **Compound Engineering**——每次交付让下次更快：新经验写回 store、耐久纠偏升格为 ADR，bug 走 assess → fix → test 闭环沉淀回归，组织经验随交付复利。

流程与 PingCode 打通：产品出规格建卡 → 开发接规格规划实现 → 卡片随实现收尾。GitLab 项目：[Tech Council / ncw-delivery-harness](https://git.newchiwan.com/council/ncw-delivery-harness)（内部仓，默认分支 `main`）。

## 一键安装（For Agent）

把下面提示词整段复制给任意 agent（omp / DSH / OpenCode / Claude Code…），由 agent 自动完成安装：

```text
请在本机安装 ncw-delivery-harness agent skill pack（newchiwan 内部工具，仓库
https://git.newchiwan.com/council/ncw-delivery-harness）。按步骤执行，任何一步失败
就停下向我报告，绝不跳步继续：

1. 技能包安装——检测本机环境，选择匹配的一种；检测不出就问我：
   - 有 omp CLI：
     omp plugin marketplace add https://git.newchiwan.com/council/ncw-delivery-harness.git
     omp plugin install ncw-delivery@ncw-delivery-harness
   - 有 dsh CLI：
     dsh plugin --profile <当前 profile> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git
   - 都没有（OpenCode 等手动拷贝端）：
     git clone https://git.newchiwan.com/council/ncw-delivery-harness.git /tmp/ncw-delivery-harness
     然后把仓库 skills/ 下每个子目录拷入 ~/.agents/skills/；
     目标已存在同名目录时停下来问我，绝不覆盖。

2. 运行时 CLI——必须先做 scope 配置（@newchiwan/che 只在公司 Nexus，公网拉取 404）：
   npm config set @newchiwan:registry https://nexus.newchiwan.cn/repository/registry-npm/
   npm install -g @newchiwan/che@latest
   npm install -g @adrkit/cli@0.20.0

3. 验证并逐项汇报结果：
   - che --version（应 ≥ 0.1.0）
   - command -v adrkit 与 command -v che
   - 技能发现：omp 用 omp plugin list；手动拷贝方式确认 ~/.agents/skills/ 下的技能目录已就位

4. 最后询问我：是否要在当前 git 项目里运行 /che-project-init 做项目级配置
   （.che/config.yml 五键 + 可选 PingCode 接入）。我不需要就到此为止。
```

手动安装步骤见下文「安装」。

## 安装 （For Human）

omp 与 DSH 走各自的原生插件安装（见下），手动拷贝全靠文件落位；项目级同名覆盖全局级（DSH：项目级 100/200 > bundle 250 > 用户级 400/500）。

```bash
# omp 插件（推荐）
omp plugin marketplace add https://git.newchiwan.com/council/ncw-delivery-harness.git
omp plugin install ncw-delivery@ncw-delivery-harness

# DSH 插件（根包兼作 DSH bundle；默认跟踪 main 最新，升级走 update）
dsh plugin --profile <name> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git
dsh plugin --profile <name> update ncw-delivery-harness   # 升级到 main 最新
dsh plugin --profile <name> remove ncw-delivery-harness

# 其他端（OpenCode 等）：把 skills/<name>/ 拷入对应 skill 发现目录即可
git clone https://git.newchiwan.com/council/ncw-delivery-harness.git
cp -R ncw-delivery-harness/skills/<name> <发现目录>/skills/
```

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |

omp 实测同时读项目级与全局级；OpenCode 官方支持同两个路径；DSH 同样官方支持手动拷贝（skill 是「被扫描的文件」，拷贝即安装、免重启热加载），原生插件安装见下文「DSH 插件」小节。

### npm 运行时 CLI（`che` / `adrkit`，所有安装路径通用）

两个外部 CLI 不随任何插件路径分发，必须装在全局 PATH 上。`@newchiwan/che` 发布在公司 Nexus（公网 npmjs 上没有这个包），内网机器先做一次性 scope 配置：

```bash
npm config set @newchiwan:registry https://nexus.newchiwan.cn/repository/registry-npm/   # Nexus group（internal + 公网代理）
npm install -g @newchiwan/che@latest        # 特性路径解析（意图驱动 / grill / adrkit 系技能）
npm install -g @adrkit/cli@0.20.0           # 仅 adrkit 三技能需要
```

或直接运行 `/che-project-init`——它自检并代装这两个 CLI，che 安装 404 时会提示上面的 scope 配置。

### omp 插件补充（更新与坑）

- 更新：`omp plugin upgrade ncw-delivery@ncw-delivery-harness`，装完 `/reload-plugins` 或开新会话生效；`marketplace.autoUpdate` 默认 `notify` 只写 debug log，要自动更新执行 `omp config set marketplace.autoUpdate auto`。
- 插件**只含 skills**（`.agents/commands/` 是本仓维护者工具，不经插件分发）。
- **marketplace 安装不解析 npm 依赖**——`che` / `adrkit` 按上节装到全局 PATH。
- `git+` 前缀只用于 `omp plugin install`（会剥掉并改用 bun 装 `package.json#dependencies`）；`marketplace add` 必须写裸 `https://…`。
- `marketplace add` 缓存是整仓快照；开发机勿用本地路径验证分发（不读 .gitignore，会把未跟踪文件带进缓存），一律走 git URL。

### DSH 插件补充（升级与坑）

- 升级走 `dsh plugin --profile <name> update` + 重启 profile 生效（bundle 技能不热加载）；默认跟踪 main 最新（lockfile 记录解析到的 commit），要防篡改可在 `add` 时钉 `#<commit>`。
- `engines.dsh` 钉 `>=0.2.0-rc.2 <0.3.0`，安装/启动 fail-closed。
- 与手动拷贝二选一即可；同装时插件版（rank 250）胜出。
- bundle 随包安装的 `@adrkit/cli` 等依赖不进 PATH，`che` / `adrkit` 仍按上节装到全局 PATH。
- 想走 DSH「发现」市场：按[官方 plugin-market 文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md)自托管索引（git source + `vX.Y.Z` tag）。

## 使用指南

完整使用指南见 **[docs/AI Native实践指南.md](docs/AI%20Native实践指南.md)**：两仓底座总览与分工、项目初始化与 monorepo 骨架规则、主线流程（产品 / UI 设计 / 开发各侧顺序、交接门禁、质量环节、辅助链）、产物结构与从初始化到日常交付的完整路径。

## Pack 内容

技能清单与触发语**以各 `skills/<name>/SKILL.md` frontmatter 的 `description` 为准**，本 README 不维护副本。

0.4.0 起意图驱动技能由 `che-compound-*` 统一更名为 `che-*` 二段名（如 `/che-compound-plan` → `/che-plan`）。从旧版升级后，手动删除技能发现目录里残留的 `che-compound-*` 旧目录——技能安装同名不覆盖，不删会新旧双份并存。

## 运行时与外部 CLI（排除 init）

`che-adr-*` 依赖外部 `@adrkit/cli`；特性路径解析依赖外部 `che` CLI（`@newchiwan/che`）：

| 能力 | 实现 / 入口 | 运行时前提 |
|---|---|---|
| adrkit `new/check/queue/lint/migrate/evaluate` | 外部 `@adrkit/cli`；`adr.sh` 是跨技能入口 | Node ≥22；`adrkit` 不可用时运行 `npm install -g @adrkit/cli@0.20.0` |
| grill、adrkit check/draft、speckit 全流程（analyze/clarify/constitution/converge/design/implement/plan/tasks/specify）的特性路径与模板解析 | 外部 `che` CLI（源与发布单元在 `packages/cli`，npm 包 `@newchiwan/che`，发布在公司 Nexus） | Node ≥22.18；`che` 不可用时运行 `npm install -g @newchiwan/che@latest`（先按「安装 → npm 运行时 CLI」配置 scope，公网无此包）；任务目录 `specs/NNN-{slug}/` 由 `che task create` 创建，session 绑定在 `.che/feature.json`（机器本地） |
| ADR scaffold / lint / legacy migration | `che-adr-draft/scripts/{scaffold.sh,adr.sh}` | 同 adrkit；全部走 pack-local 跨技能调用 |
| PingCode 卡操作（che-pingcode-* 五技能） | 无 bundle——依赖外部 `pingcode` CLI ≥ 0.14.0（`npm i -g @metaphorli/pingcode-cli`） | `pingcode auth login` 认证 + 网络可达 PingCode；pack 不内置（认证凭据与 API 演进留在上游 CLI） |

CLI 解析（`adrkit-lib.sh`）：只执行 PATH 上的 `adrkit` 与 `che`，不使用其他二进制路径或回退。不可用时退出并提示上述 npm 安装命令。

`planverify` / `intentverify` 的默认 `auto` 策略在没有跨模型 CLI 时使用原生 Tier 2/3 subagent；只有用户强制 `cross-model` 或 `cli:model` 才需要对应外部模型 CLI。

**范围边界**：目标项目自身的 git / build / test / lint 工具链不随 pack 内置。

## 开发

```bash
npm ci     # 安装钉版本的 @adrkit/cli，并把仓内 @newchiwan/che（file:packages/cli）链接进 node_modules/.bin，供运行时契约测试使用
npm test   # 依次运行技能结构、che CLI 契约和技能运行时契约测试
```

新增技能 = 在 `skills/` 下建目录 + `SKILL.md`（frontmatter 含 `name`、`description`≤1024 字符）；`npm test` 会把关。omp 插件按 `skills/` 目录自动发现，无需另行登记。命名格式 `che-<name>`（如 `che-plan`），至少两段，全名 ≤32 字符。

提交信息格式：`<type>(<scope>): 中文主题`（不带工作项 ID），如 `refactor(skills): 技能更名`。type 取值：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。格式约定由 `/che-git-master` 技能在提交流程中执行，仓库不设强制 hook。

## 发布

只有 `@newchiwan/che` 发布到公司 Nexus（`internal-npm` hosted；安装侧走 `registry-npm` group）。**根包（即整个 pack）不发 npm**（`package.json` 已 `private: true` 防误发）——它的分发就是 omp 插件与 DSH 插件两条插件路径，推到 main 即发布：

```bash
# @newchiwan/che（bun 打包 dist/cli.js 单文件——Node 不剥 node_modules 内类型，纯 TS tarball 经 npm -g 装出来跑不了；需本机有 bun）
bash packages/cli/scripts/publish.sh
```

- npm 认证写**用户级** `~/.npmrc`（`//nexus.newchiwan.cn/repository/internal-npm/:_auth` = base64(user:pass)，npm 按 registry URI 精确匹配凭据；devops 账号），绝不入仓库。
- 根包版本改动后同步 `.omp-plugin/marketplace.json` 的 plugin `version`（`npm test` 强制一致）；`@newchiwan/che` 版本须与 `src/index.ts` 的 `CLI_VERSION` 一致（`test-che-cli.sh` 校验）。
- 消费端（内网机器）的一次性 scope 配置见「安装 → npm 运行时 CLI」。
