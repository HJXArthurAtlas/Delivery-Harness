# mturtle-skills

newchiwan 团队跨端 agent skill pack。与 [monorepo-template](https://git.newchiwan.com/council/monorepo-template.git)（项目模板载荷）分离：本仓只装「消费模板的元工具」，独立发版，不随模板 init 复制。

## Pack 内容

| skill | 用途 | 触发语示例 |
|---|---|---|
| `monorepo-setup` | 项目初始化（init）/ 结构环境诊断（diagnose），migrate 待标注 | 「按团队 monorepo 规范初始化/诊断这个项目」 |
| `speckit-flow` | speckit + PingCode AI native 开发流程的衔接与门禁（出规格建卡 → 接规格规划实现 → 卡片收尾） | 「这个需求转开发了，开始 plan」「出 spec 并建卡」 |

## 安装

四端全靠文件落位，无需包管理器或插件；项目级同名覆盖全局级（DSH rank 100/200 > 400/500）。

```bash
# 方式一：npx 直装（免克隆；私有仓需 git 凭证）
npx git+https://git.newchiwan.com/council/mturtle-skills.git --global

# 方式二：克隆后执行
git clone https://git.newchiwan.com/council/mturtle-skills.git && cd mturtle-skills
node skills/monorepo-setup/scripts/sync.mjs             # 项目级：<cwd>/.agents/skills/ + <cwd>/.claude/skills/
node skills/monorepo-setup/scripts/sync.mjs --global    # 用户级：~/.agents/skills/ + ~/.claude/skills/
```

支持 `--dry-run` 预览、`--force` 覆盖同名；默认同名不覆盖。

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |
| `.claude/skills/`（项目）或 `~/.claude/skills/`（全局） | Claude Code |

omp 实测同时读项目级与全局级；DSH / OpenCode 官方支持同两个路径；DSH 无需 plugin——skill 是「被扫描的文件」，拷贝即安装，免重启热加载。

## 与模板仓的分工

- **monorepo-template**：项目骨架与模板载荷（`AGENTS-TEMPLATE.md`、`.agents/skills/mturtle-*`、`.specify/` 等），init 时整体复制进用户项目；其 README 不再承载初始化提示词。
- **本仓**：承载团队**流程**——初始化步骤与版本钉子（`monorepo-setup/references/init.md`，与模板仓巡检表两处同步）、诊断基线、speckit 流程规范。项目内的 pack 技能由 init 第 7 步的同步动作拷入；全局安装覆盖个人所有项目。
