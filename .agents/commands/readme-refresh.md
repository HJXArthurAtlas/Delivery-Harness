---
description: 刷新 README 的项目信息与用户手册——gh 取 GitHub 项目数据核对事实，校对安装命令与技能清单；输出中文、面向终端用户、保持简洁
---

# readme-refresh

更新本仓 `README.md` 的项目信息与 `docs/guides/` 用户手册（`AI Native实践指南.md` 使用指南、`校验技能对比.md` 校验技能分工对比）。事实一律现查，不凭记忆。

## 触发条件

以下变化后必须执行本命令：

- 分发模型或安装方式变化；
- 技能新增、删除、更名、用途或行为变化——校验技能（`che-gapfill` / `che-planverify` / `che-converge` / `che-intentverify`）的判定集、checker 独立性策略、机械层或产出物变化时，必须同步 `docs/guides/校验技能对比.md`；
- 开发命令、发布方式或测试规则变化；
- 用户使用流程变化。

## 更新规则

1. **校对项目事实**：
   - 简介段：项目链接、可见性、默认分支与 GitHub 项目数据一致（`gh repo view --json url,visibility,defaultBranchRef` 或 `git remote` 现查）；
   - 分发与安装：与 `package.json`、`.omp-plugin/marketplace.json`、`dsh-entry.js`、`cordis.patch.yml` 一致；`npx` / `git clone` 的 URL 必须等于 `git remote get-url origin` 解析后的 `https://github.com/<owner>/<repo>.git`；
   - 技能清单：与 `skills/` 逐一对应核对技能名、用途和触发语，权威描述以各 `skills/<name>/SKILL.md` frontmatter 的 `description` 为准；
   - 开发节：命令与 `package.json` 一致，测试说明与 `tests/skills/` 一致。
2. **控制同步范围**：上述事实变化时更新 `README.md`；用户使用流程变化时，同步更新 `docs/guides/AI Native实践指南.md`（含 §3.2 主线 mermaid 与 §3.3 产出物清单）。
3. **同步校验技能对比**：`docs/guides/校验技能对比.md` 的事实源是 `skills/che-gapfill/`、`che-planverify/`、`che-converge/`、`che-intentverify/` 四份 SKILL.md。2×2 框架（事前/事后 × 补任务/独立判定）与维度清单固定为：时机、输入、判断主体、机械层、产出物、判定集、检查维度、ADR/宪法、新鲜度、交互、失败语义、下游；表格内容逐格对照 SKILL.md 现查刷新，漂移以技能为准改文档并在汇报列出。
4. **处理文档冲突**：不改 `skills/` 内技能内容本身；发现技能文档与 README / `docs/guides/` 冲突时，以技能为准修改文档，并在汇报中列出冲突点。

## 完成标准

- 安装命令、插件说明、技能清单和开发说明均与仓库现状一致；
- 用户使用指南覆盖当前主流程，不保留已删除的命令或技能；
- 汇报列明更新范围、核对过的事实来源及发现的漂移。

## 输出要求

- 全中文；面向终端用户（装这个 pack 的人），不是本仓开发者；
- 简洁：能删的句子就删，表格优先于段落，不写显而易见的说明。

**Input**: 可选，本次重点刷新范围（如「只更新安装节」）
**Provided arguments**: $@
