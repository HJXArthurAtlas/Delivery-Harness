# ncw-delivery-harness

newchiwan 团队的跨端 agent skill pack：把团队标准 monorepo 的初始化 / 诊断流程与 speckit + PingCode 规格驱动开发流程做成可安装的 agent skill，DSH / OpenCode / omp 等等。GitLab 项目：[Tech Council / ncw-delivery-harness](https://git.newchiwan.com/council/ncw-delivery-harness)（内部仓，默认分支 `main`）。初始化步骤与工具链版本钉子的单一载体是 `skills/ncw-monorepo-init/references/init.md`（与模板仓 `monorepo-template` 的 `AGENTS-TEMPLATE.md` 巡检表版本同步）。

## Pack 内容

| skill | 用途 | 触发语示例 |
|---|---|---|
| `ncw-monorepo-init` | 项目初始化（init）/ 结构环境诊断（diagnose），migrate 待标注 | 「按团队 monorepo 规范初始化/诊断这个项目」 |
| `ncw-speckit-analyze` | 跨工件一致性只读分析（上游 spec-kit /speckit.analyze 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「分析 spec/plan/tasks 一致性」 |
| `ncw-speckit-clarify` | 规格澄清问答（上游 spec-kit /speckit.clarify 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「澄清规格歧义」「补全需求细节」 |
| `ncw-speckit-constitution` | 创建/更新项目章程（上游 spec-kit /speckit.constitution 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「立章程」「修订治理原则」 |
| `ncw-speckit-converge` | 差距收敛（上游 spec-kit /speckit.converge 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「收敛剩余工作」「补齐未实现需求」 |
| `ncw-speckit-flow` | speckit + PingCode AI native 开发流程的衔接与门禁（出规格建卡 → 接规格规划实现 → 卡片收尾） | 「这个需求转开发了，开始 plan」「出 spec 并建卡」 |
| `ncw-speckit-implement` | 按 tasks.md 执行任务实现（上游 spec-kit /speckit.implement 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「开始实现」「按任务清单编码」 |
| `ncw-speckit-plan` | 实现规划与设计工件生成（上游 spec-kit /speckit.plan 命令的 pack 分发，正文英文原文；不含 extension hook 机制） | 「做这个需求的实现计划」「出 plan」 |

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

- 插件**只含 skills**，不含斜杠命令（`.agents/commands/` 不经插件分发）；要 `/readme-refresh` 等命令仍走上面的 sync 安装。
- 更新：`omp plugin upgrade ncw-delivery@ncw-delivery-harness`；装完 `/reload-plugins` 或开新会话生效。
- 注意 `marketplace.autoUpdate` 默认 `notify` 只写 debug log 不提示；要自动更新执行 `omp config set marketplace.autoUpdate auto`。
- catalog `version` 与 `package.json` 版本同步维护，`npm test` 校验二者一致。

## 开发

```bash
npm test   # 校验 skills/ 结构：SKILL.md 存在与 frontmatter 格式（name/description）、引用文件存在、绝对路径泄漏扫描、PACK_SKILLS 与目录一一对应；另校验 .agents/commands/ frontmatter 与 .omp-plugin/marketplace.json（命名合规、source 恰为 ./、version 与 package.json 同步）
```

新增技能 = 在 `skills/` 下建目录 + `SKILL.md`（frontmatter 含 `name`、`description`≤1024 字符）+ 在 `sync.mjs` 的 `PACK_SKILLS` 登记一行；`npm test` 会把关，缺登记即失败。命名格式 `ncw-{submodule}-action`（如 `ncw-monorepo-init`），全名 ≤32 字符。

提交信息格式：`<type>(<scope>): #<工作项ID> <主题>`，如 `refactor(skills): #TECH-1234 技能更名`；无对应工作项时 ID 用默认 `#TECH-000`。type 取值：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。提交时由 `.githooks/commit-msg` 强制校验；首次克隆后执行一次 `git config core.hooksPath .githooks` 激活。
