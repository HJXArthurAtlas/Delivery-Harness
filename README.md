# ncw-specify

newchiwan 团队的跨端 agent skill pack：把团队标准 monorepo 的初始化 / 诊断流程与 speckit + PingCode 规格驱动开发流程做成可安装的 agent skill，DSH / OpenCode / omp / Claude Code 四端通用。初始化步骤与工具链版本钉子的单一载体是 `skills/monorepo-setup/references/init.md`（与模板仓 `monorepo-template` 的 `AGENTS-TEMPLATE.md` 巡检表版本同步）。

## Pack 内容

| skill | 用途 | 触发语示例 |
|---|---|---|
| `monorepo-setup` | 项目初始化（init）/ 结构环境诊断（diagnose），migrate 待标注 | 「按团队 monorepo 规范初始化/诊断这个项目」 |
| `speckit-flow` | speckit + PingCode AI native 开发流程的衔接与门禁（出规格建卡 → 接规格规划实现 → 卡片收尾） | 「这个需求转开发了，开始 plan」「出 spec 并建卡」 |

## 安装

四端全靠文件落位，无需包管理器或插件；项目级同名覆盖全局级（DSH rank 100/200 > 400/500）。

```bash
# 方式一：npx 直装（免克隆；私有仓需 git 凭证）
npx git+https://git.newchiwan.com/council/ncw-specify.git --global

# 方式二：克隆后执行
git clone https://git.newchiwan.com/council/ncw-specify.git && cd ncw-specify
node skills/monorepo-setup/scripts/sync.mjs             # 项目级：<cwd>/.agents/skills/ + <cwd>/.claude/skills/
node skills/monorepo-setup/scripts/sync.mjs --global    # 用户级：~/.agents/skills/ + ~/.claude/skills/
```

支持 `--dry-run` 预览、`--force` 覆盖同名；默认同名不覆盖。

| 目标目录 | 生效端 |
|---|---|
| `.agents/skills/`（项目）或 `~/.agents/skills/`（全局） | DSH / OpenCode / omp |
| `.claude/skills/`（项目）或 `~/.claude/skills/`（全局） | Claude Code |

omp 实测同时读项目级与全局级；DSH / OpenCode 官方支持同两个路径；DSH 无需 plugin——skill 是「被扫描的文件」，拷贝即安装，免重启热加载。

