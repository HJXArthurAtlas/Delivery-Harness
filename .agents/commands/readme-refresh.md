---
description: 刷新 README 的项目信息与用户手册——glab 取 GitLab 项目数据核对事实，校对安装命令与技能清单；输出中文、面向终端用户、保持简洁
---

# readme-refresh

更新本仓 `README.md` 的项目信息与 `docs/AI Native实践指南.md` 使用指南。事实一律现查，不凭记忆。

## 触发条件

以下变化后必须执行本命令：

- 分发模型或安装方式变化；
- 技能新增、删除、更名或用途变化；
- 开发命令、发布方式或测试规则变化；
- 用户使用流程变化。

## 更新规则

1. **校对项目事实**：
   - 简介段：项目链接、可见性、默认分支与 GitLab 项目数据一致（`glab api` 或 `git remote` 现查）；
   - 分发与安装：与 `package.json`、`.omp-plugin/marketplace.json`、`dsh-entry.js`、`cordis.patch.yml` 一致；`npx` / `git clone` 的 URL 必须等于 `http_url_to_repo`；
   - 技能清单：与 `skills/` 逐一对应核对技能名、用途和触发语，权威描述以各 `skills/<name>/SKILL.md` frontmatter 的 `description` 为准；
   - 开发节：命令与 `package.json` 一致，测试说明与 `tests/skills/` 一致。
2. **控制同步范围**：上述事实变化时更新 `README.md`；用户使用流程变化时，同步更新 `docs/AI Native实践指南.md`。
3. **处理文档冲突**：不改 `skills/` 内技能内容本身；发现技能文档与 README 冲突时，以技能为准修改 README，并在汇报中列出冲突点。

## 完成标准

- 安装命令、插件说明、技能清单和开发说明均与仓库现状一致；
- 用户使用指南覆盖当前主流程，不保留已删除的命令或技能；
- 汇报列明更新范围、核对过的事实来源及发现的漂移。

## 输出要求

- 全中文；面向终端用户（装这个 pack 的人），不是本仓开发者；
- 简洁：能删的句子就删，表格优先于段落，不写显而易见的说明。

**Input**: 可选，本次重点刷新范围（如「只更新安装节」）
**Provided arguments**: $@
