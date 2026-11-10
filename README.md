# NCW Delivery Harness

赤湾东方自建软件交付 Harness：把团队 AI native 交付方法做成跨端 agent skill pack，可在 DSH / OpenCode / omp 等端安装。方法底座三条：

- **知识工程**——把团队知识落盘为机器可装载的资产：宪法 `docs/constitution/`、ADR 语料 `docs/adr/`、领域知识库 `docs/domain_knowledge/`、compound store（`docs/corrections/`、`docs/patterns/`）；会话开场装载（load），交付后回写（retro）。
- **Intent Driven Development**——规格是唯一意图来源：intend → clarify/grill → plan → gapfill 补验证任务 → planverify 门禁 → implement → converge 补实现差距 → intentverify 独立校验不越出意图，以宪法与 ADR 为治理约束。四个校验技能的分工见 [docs/guides/校验技能对比.md](docs/guides/校验技能对比.md)。
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
   - che --version（应 ≥ 0.3.0）
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

# 可选：omp 插件全自动升级（默认只启动通知、手动升级）
omp config set marketplace.autoUpdate auto

# DSH 插件（根包兼作 DSH bundle；默认跟踪 main 最新，升级走 update）
dsh plugin --profile <name> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git
dsh plugin --profile <name> update ncw-delivery-harness   # 升级到 main 最新
dsh plugin --profile <name> remove ncw-delivery-harness

# che CLI（项目级安装 + 版本管理；先把 che 装到全局 PATH，见下节）
che pack init                    # 装到当前项目 .agents/skills/，记录版本到 .che/pack.json（默认装最新 vX.Y.Z tag）
che pack status                  # 已装版本 vs 最新 tag vs main；探测发版漏 tag（CHANNEL_DRIFT）
che pack update                  # 按 manifest 同步（--dry-run 先看计划；--ref 可钉 tag/分支/commit）
```

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |

omp 实测同时读项目级与全局级；OpenCode 官方支持同两个路径；DSH 同样官方支持手动拷贝（skill 是「被扫描的文件」，拷贝即安装、免重启热加载），原生插件安装见下文「DSH 插件」小节。

**che CLI 通道说明**：`che pack init` 默认解析仓内最新 `vX.Y.Z` tag（git tag 即发布锚点），技能装进项目 `.agents/skills/`，版本记录在 `.che/pack.json`（建议随项目提交，`che pack update` 会产生可 review 的 diff）；升级走 `che pack update`（manifest 驱动：加新、更托管、删上游移除，防新旧双份）。目标目录里非 che 装的同名技能目录视为手工资产，不加 `--force` 不会被覆盖；手工改坏托管技能时 `che pack update --force` 会整目录重装、恢复为上游版本（普通 update 在同版本下不动本地文件，`--force` 是唯一修复路径）。首次安装后仍需 `/che-project-init` 写 `.che/config.yml`。无 che 时的兜底仍是手工拷贝（`git clone` 后把 `skills/<name>/` 拷入发现目录），无版本管理、同名不覆盖。

### npm 运行时 CLI（`che` / `adrkit`，所有安装路径通用）

两个外部 CLI 不随任何插件路径分发，必须装在全局 PATH 上。`@newchiwan/che` 发布在公司 Nexus（公网 npmjs 上没有这个包），内网机器先做一次性 scope 配置：

```bash
npm config set @newchiwan:registry https://nexus.newchiwan.cn/repository/registry-npm/   # Nexus group（internal + 公网代理）
npm install -g @newchiwan/che@latest        # 特性路径解析（意图驱动 / grill / adrkit 系技能）
npm install -g @adrkit/cli@0.20.0           # 仅 adrkit 三技能需要
```

或直接运行 `/che-project-init`——它自检并代装这两个 CLI，che 安装 404 时会提示上面的 scope 配置。

升级 che：全局安装的直接 `che self-update`（`--check` 只查不装；开发仓 `file:` 链接的 che 会被拒绝，走 git pull）。

### omp 插件补充（更新与坑）

- 插件自带**启动更新检查**（`omp.extensions` 扩展，1.2.0 起）：每次会话启动对比远端最新 `vX.Y.Z` tag，有新版则 TUI 通知升级命令（24h 缓存、失败静默、`--no-extensions` 可退）。
- 更新两档：默认**启动通知 + 手动升级**（`omp plugin upgrade ncw-delivery@ncw-delivery-harness`，装完 `/reload-plugins` 或开新会话生效）；要**全自动**执行 `omp config set marketplace.autoUpdate auto`（`marketplace.autoUpdate` 默认 `notify` 只写 debug log——可见的通知由上面的插件自带扩展补齐）。
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

完整使用指南见 **[docs/guides/AI Native实践指南.md](docs/guides/AI%20Native实践指南.md)**：开发底座与 monorepo 结构约定、项目初始化与治理种子接入、主线流程（产品 / UI 设计 / 开发各侧顺序、交接门禁、质量环节、辅助链）、产物结构与从初始化到日常交付的完整路径。校验技能分工对比见 **[docs/guides/校验技能对比.md](docs/guides/校验技能对比.md)**。

## Pack 内容

技能清单与触发语**以各 `skills/<name>/SKILL.md` frontmatter 的 `description` 为准**，本 README 不维护副本。

0.4.0 起意图驱动技能由 `che-compound-*` 统一更名为 `che-*` 二段名（如 `/che-compound-plan` → `/che-plan`）。1.0.0 起 `che-specify` / `che-grill-me` / `che-intentguard` / `che-writeback` 更名为 `che-intend` / `che-grill` / `che-intentverify` / `che-retro`，`che-flow` / `che-mturtle-troubleshooting` / `che-project-arch` 删除（架构画像并入 `/che-project-init`）。从旧版升级后，手动删除技能发现目录里的全部残留旧目录——技能安装同名不覆盖，不删会新旧双份并存。

## 运行时与外部 CLI（排除 init）

`che-adr-*` 依赖外部 `@adrkit/cli`；特性路径解析依赖外部 `che` CLI（`@newchiwan/che`）：

| 能力 | 实现 / 入口 | 运行时前提 |
|---|---|---|
| adrkit `new/check/queue/lint/migrate/evaluate` | 外部 `@adrkit/cli`；`adr.sh` 是跨技能入口 | Node ≥22；`adrkit` 不可用时运行 `npm install -g @adrkit/cli@0.20.0` |
| grill、adrkit check/draft、speckit 全流程（analyze/clarify/constitution/converge/design/implement/plan/tasks/specify）的特性路径、知识库根（`che knowledge paths`）与模板解析 | 外部 `che` CLI（源与发布单元在 `packages/cli`，npm 包 `@newchiwan/che`，发布在公司 Nexus） | Node ≥22.18；`che` 不可用时运行 `npm install -g @newchiwan/che@latest`（先按「安装 → npm 运行时 CLI」配置 scope，公网无此包）；任务目录 `specs/NNN-{slug}/` 由 `che task create` 创建，session 绑定在 `.che/feature.json`（机器本地） |
| ADR scaffold / lint / legacy migration | `che-adr-draft/scripts/{scaffold.sh,adr.sh}` | 同 adrkit；全部走 pack-local 跨技能调用 |
| PingCode 卡操作（che-pingcode-* 五技能） | 无 bundle——依赖外部 `pingcode` CLI（`npm i -g @metaphorli/pingcode-cli`，保持 npm 最新版）；认证走项目级登录包装 `.che/pingcode-login.sh`（由 `/che-project-init` 接入链落盘并随仓库提交，OAuth 凭据封装在脚本内） | `bash .che/pingcode-login.sh status` 退出码 0 + 网络可达 PingCode；未认证时跑同脚本自动开浏览器授权（阻塞等回调属正常，给足 ≥300 秒）；CLI 本体 pack 不内置（API 演进留在上游 CLI） |

CLI 解析（`adrkit-lib.sh`）：只执行 PATH 上的 `adrkit` 与 `che`，不使用其他二进制路径或回退。不可用时退出并提示上述 npm 安装命令。

`intentverify` 的 checker 按 `auto` 策略选级，没有跨模型 CLI 时落到原生 Tier 2/3 subagent，仅强制 `cross-model` / `cli:model` 时需要外部模型 CLI；`planverify` 的 checker 固定为同模型新上下文的原生子代理，不需要任何外部模型 CLI。

**范围边界**：目标项目自身的 git / build / test / lint 工具链不随 pack 内置。

## 开发

```bash
npm ci     # 安装钉版本的 @adrkit/cli，并把仓内 @newchiwan/che（file:packages/cli）链接进 node_modules/.bin，供运行时契约测试使用
npm test   # 依次运行技能结构、che CLI 契约和技能运行时契约测试
```

新增技能 = 在 `skills/` 下建目录 + `SKILL.md`（frontmatter 含 `name`、`description`≤1024 字符）；`npm test` 会把关。omp 插件按 `skills/` 目录自动发现，无需另行登记。命名格式 `che-<name>`（如 `che-plan`），至少两段，全名 ≤32 字符。

提交信息格式：`<type>(<scope>): 中文主题`（不带工作项 ID），如 `refactor(skills): 技能更名`。type 取值：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。格式约定由 `/che-git-master` 技能在提交流程中执行，仓库不设强制 hook。

## 发布

**版本声明点**：根 `package.json#version` 是 pack 唯一版本源——omp 插件版本（`.omp-plugin/marketplace.json`，`npm test` 强制同步）与 DSH bundle 版本（原生读取）都从它推导；git tag `vX.Y.Z` 是 che 安装通道（`che pack init/status/update`）的发布锚点；根 `engines.che` 声明 pack 所需的 che CLI 最低版本（安装时抄进 `.che/pack.json`）。CLI 版本独立演进（`packages/cli/package.json` + `src/version.ts` 的 `CLI_VERSION`，`test-che-cli.sh` 强制一致）。

**发版一律走 `/release`**（流程见 `.agents/commands/release.md`）：定版本号 → 本版含 CLI 变更先发 Nexus → bump 根版本 + 同步 marketplace → `npm test` 全绿 → 生成 `docs/releases/X.Y.Z.md` 发布文档 → `chore(release)` 单提交（含发布文档）→ `git push origin main vX.Y.Z` 原子推送 → 创建 GitLab Release（发布说明即发布文档）→ postcondition 验证 tag / 发布文档 / Release 生效。没打 tag = che 通道没发版；漏 tag 会被任何项目里的 `che pack status` 探测为 `CHANNEL_DRIFT`。

只有 `@newchiwan/che` 发布到公司 Nexus（`internal-npm` hosted；安装侧走 `registry-npm` group）。**根包（即整个 pack）不发 npm**（`package.json` 已 `private: true` 防误发）——它的分发就是 omp / DSH 插件与 che 安装通道：

```bash
# @newchiwan/che（bun 打包 dist/cli.js 单文件——Node 不剥 node_modules 内类型，纯 TS tarball 经 npm -g 装出来跑不了；需本机有 bun）
bash release.sh              # 发布 packages/cli 当前版本，发布前自动核对 Nexus 最新版
bash release.sh 0.5.0        # 先回写版本到 package.json + src/version.ts，再发布
bash release.sh --check      # 只核对版本是否比线上新，不发布
```

- npm 认证写**用户级** `~/.npmrc`（`//nexus.newchiwan.cn/repository/internal-npm/:_auth` = base64(user:pass)，npm 按 registry URI 精确匹配凭据；devops 账号），绝不入仓库。
- 消费端（内网机器）的一次性 scope 配置见「安装 → npm 运行时 CLI」。
