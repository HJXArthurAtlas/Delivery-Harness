# Repository Guidelines

## 仓库定位

本仓是开源的软件交付 Harness（Delivery Harness）——以知识工程、Intent Driven Development、Compound Engineering 为方法底座的跨端 agent skill pack，向 DSH、OpenCode、omp 等端分发意图驱动流程及 adrkit、grill、compound、bug 扩展技能。

本仓同时维护 `@hjxarthuratlas/che` CLI。仓内无 CI，本地 `npm test` 是唯一质量门。

## 路径地图

| 路径 | 简要说明 |
|---|---|
| `skills/che-{intend,clarify,design,plan,planverify,planverify-gate,implement,intentverify,grill,grill-with-docs,gapfill,analyze,converge,load,retro,constitution}/` | 意图驱动开发主流程及 compound 扩展 |
| `skills/che-adr-*/` | ADR 检查、上下文和起草 |
| `skills/che-pingcode-*/` | PingCode 初始化、建卡与同步 |
| `skills/che-bug-*/` | Bug 评估、修复和验证 |
| `skills/che-git-master/` | git 提交规范流程（消息格式、拆分、暂存边界） |
| `skills/che-project-init/` | 项目接入与基础配置、架构画像生成与对账（docs/architecture.md，仅已有代码仓库） |
| `packages/cli/` | `@hjxarthuratlas/che` 源码与发布脚本 |
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

根包不发布 npm（`private: true`）；omp 与 DSH 插件的分发以仓内容为准（marketplace add / dsh add 直接拉取本仓）。仅 `@hjxarthuratlas/che` 通过根 `release.sh` 发布到公共 npm（内部委托 `packages/cli/scripts/publish.sh` 打包推送）。npm 认证只写用户级 `~/.npmrc`，绝不入库。

## 修改约束

- `SKILL.md` frontmatter 仅含 `name`、`description`；`name` 必须等于目录名，技能名使用 kebab-case、至少两段且不超过 32 字符。
- `description` 非空且不超过 1024 字符；字面引用的 `references/`、`scripts/` 文件必须存在。
- 仓内工具不新增 npm 依赖；外部 CLI 只从 PATH 调用。运行环境为 Node ≥ 22.18、bash 和 POSIX coreutils。
- 上游技能的 pack fork 差异记录在对应技能中，上游升级时必须保留。
- 每个 `SKILL.md` 顶部带语言规则块：读项目根 `.che/config.yml` 的 `language:`（缺省 `zh-cn`）决定全 pack 输出语言（含思考）；新增技能必须携带，`/che-project-init` 负责写入该键。
- 技能写盘遵循同名不覆盖；版本号以仓内登记文件为准，不凭记忆填写。
- 基础宪法、种子 ADR 与 AGENTS 环境检查节的唯一维护处在 harness 内：`skills/che-constitution/references/seed-constitution.md`、`skills/che-adr-draft/references/seed-adr/` 与 `skills/che-project-init/references/seed-agents-env.md` 就地修改，无外部模板上游。

## 发布

用户说「发布 / 发版 / 升版本 / 打 tag / 出新版本」时，一律执行 `.agents/commands/release.md`，绝不手工 bump + push。要点：根 `package.json#version` 是 pack 唯一版本源，git tag `vX.Y.Z` 是 che 安装通道的发布原语（没打 tag = che 通道没发版）。GitHub Release 发布后 CI（`.github/workflows/publish-cli.yml`）自动检测 `packages/cli` 版本并发布 npm。

## 验证与提交

- 修改技能、CLI 或分发配置后必须运行 `npm test`；三个测试脚本分别覆盖技能结构、che CLI 契约和技能运行时行为，具体契约以测试脚本为准。
- 提交信息使用 `<type>(<scope>): 中文主题`；type 为 `feat`、`fix`、`refactor`、`docs`、`test` 或 `chore`，不绑定工作项/故事卡 ID（溯源由 `specs/pingcode-mapping.json` 承担）。
- 小步提交：一个逻辑改动一个提交，只包含相关文件；提交动作可在中途逐段进行，也可集中到收尾一次补齐，但拆分始终按小步规则（提交前过 `npm test`），无需等待指示——自动提交只到本地 commit，不 push。经 skill pack 流程开发的改动，页脚另加一行 `Co-Authored-By: Delivery Harness`。

## 文档维护

- README 与使用指南的更新统一执行 `/readme-refresh`；触发条件、事实来源和同步规则见 `.agents/commands/readme-refresh.md`。
- 技能行为以各 `SKILL.md` 为准，测试契约以 `tests/skills/` 为准，不在本文复制详细规则。
- 本文常规保持 50～70 行。新增内容前必须先去重；超过 70 行时，应归并段落或将详细规则迁移到对应事实源，而不是继续扩写。
