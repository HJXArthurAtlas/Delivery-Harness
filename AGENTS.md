# Repository Guidelines

## 仓库定位

本仓是 newchiwan 团队的跨端 agent skill pack，向 DSH、OpenCode、omp 等端分发 PingCode 规格驱动流程及 adrkit、grill、compound、bug 扩展技能。

本仓同时维护 `@newchiwan/che` CLI；monorepo 骨架由 `council/monorepo-template` 负责。仓内无 CI，本地 `npm test` 是唯一质量门。

## 路径地图

| 路径 | 简要说明 |
|---|---|
| `skills/che-compound-*/` | 规格驱动开发主流程及 compound 扩展 |
| `skills/che-adr-*/` | ADR 检查、上下文和起草 |
| `skills/che-pingcode-*/` | PingCode 初始化、建卡与同步 |
| `skills/che-bug-*/` | Bug 评估、修复和验证 |
| `skills/che-project-init/` | 项目接入与基础配置 |
| `skills/che-mturtle-troubleshooting/` | 线上问题排查知识 |
| `packages/cli/` | `@newchiwan/che` 源码与发布脚本 |
| `tests/skills/` | 技能结构、CLI 和技能运行时测试 |
| `.omp-plugin/marketplace.json` | omp 插件 catalog |
| `dsh-entry.js`、`cordis.patch.yml` | DSH bundle 入口与补丁 |
| `.agents/commands/` | 仓内维护命令 |

## 插件分发

分发物为 `skills/` 中的技能及其运行时文件，消费端无构建步骤。

- **omp**：`.omp-plugin/marketplace.json` 是插件 catalog，`source` 固定为 `./`；插件只分发技能，绝不创建 `.omp-plugin/plugin.json`。
- **DSH**：根包兼作 dsh bundle，由 `package.json` 的 `dsh.bundle`、`cordis.patch.yml` 和 `dsh-entry.js` 组成，运行时只扫描包内 `skills/`。
- **OpenCode 等端**：将所需 `skills/<name>/` 复制到对应技能发现目录。
- 根包版本变化时，必须同步 `.omp-plugin/marketplace.json` 中的插件版本。

具体安装命令和用户操作见 `README.md`。

## 常用命令

```bash
npm ci
npm test
```

根包不发布 npm（`private: true`），推送 `main` 即发布 omp 与 DSH 插件；仅 `@newchiwan/che` 通过 `bash packages/cli/scripts/publish.sh` 发布到公司 Nexus。npm 认证只写用户级 `~/.npmrc`，绝不入库。

## 修改约束

- `SKILL.md` frontmatter 仅含 `name`、`description`；`name` 必须等于目录名，技能名使用 kebab-case、至少三段且不超过 32 字符。
- `description` 非空且不超过 1024 字符；字面引用的 `references/`、`scripts/` 文件必须存在。
- 仓内工具不新增 npm 依赖；外部 CLI 只从 PATH 调用。运行环境为 Node ≥ 22.18、bash 和 POSIX coreutils。
- 上游技能的 pack fork 差异记录在对应技能中，上游升级时必须保留。
- 技能写盘遵循同名不覆盖；版本号以仓内登记文件为准，不凭记忆填写。

## 验证与提交

- 修改技能、CLI 或分发配置后必须运行 `npm test`；三个测试脚本分别覆盖技能结构、che CLI 契约和技能运行时行为，具体契约以测试脚本为准。
- 提交信息使用 `<type>(<scope>): 中文主题`；type 为 `feat`、`fix`、`refactor`、`docs`、`test` 或 `chore`，不绑定工作项/故事卡 ID（溯源由 `specs/pingcode-mapping.json` 承担）。
- 一个逻辑改动一个提交，只包含相关文件，并通过 `npm test` 后再提交。

## 文档维护

- README 与使用指南的更新统一执行 `/readme-refresh`；触发条件、事实来源和同步规则见 `.agents/commands/readme-refresh.md`。
- 技能行为以各 `SKILL.md` 为准，测试契约以 `tests/skills/` 为准，不在本文复制详细规则。
- 本文常规保持 50～70 行。新增内容前必须先去重；超过 70 行时，应归并段落或将详细规则迁移到对应事实源，而不是继续扩写。
