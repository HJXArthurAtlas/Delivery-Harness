---
description: 刷新 README 的项目信息与用户手册——glab 取 GitLab 项目数据核对事实，校对安装命令与技能清单；输出中文、面向终端用户、保持简洁
---

# readme-refresh

更新本仓 `README.md` 的项目信息与用户手册。事实一律现查，不凭记忆。

## 步骤

1. **校对更新**：
   - 简介段：项目链接、可见性、默认分支与 GitLab 项目数据一致（`glab api` 或 `git remote` 现查）；
   - 安装命令：`npx` / `git clone` 的 URL 必须等于 `http_url_to_repo`；
   - 「Pack 内容」表：与 `ls skills/` 逐一对应（技能名、用途、触发语）；技能已更名或新增时同步表格；
   - 「开发」节：与 `package.json` scripts、`tests/skills/test-skill-structure.sh` 规则同步。
2. **边界**：不改 `skills/` 内 skill 内容本身；发现 skill 文档与 README 冲突时以 skill 为准改 README，并在汇报中列出冲突点。

## 输出要求

- 全中文；面向终端用户（装这个 pack 的人），不是本仓开发者；
- 简洁：能删的句子就删，表格优先于段落，不写显而易见的说明。

**Input**: 可选，本次重点刷新范围（如「只更新安装节」）
**Provided arguments**: $@
