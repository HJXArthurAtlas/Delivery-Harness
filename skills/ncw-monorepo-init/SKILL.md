---
name: ncw-monorepo-init
description: 把团队标准 monorepo 框架（monorepo-template）初始化进用户项目，或对既有项目做结构/环境诊断。当用户说"初始化项目""按团队规范搭 monorepo""接入模板仓""结构诊断""环境检查""我的项目为什么不符规范"，或任务涉及 monorepo-template 初始化、骨架复制、specify / adrkit / pingcode / grill / codegraph / AOCI 接入时使用本 skill——即使用户没提"monorepo"三个字，只要意图是把项目对齐团队 monorepo 规范也要使用。三种模式：init（空项目/缺骨架 → 全新初始化）、diagnose（已有骨架 → 结构与环境基线核对）、migrate（非空项目结构迁移，能力待标注）。
---

# ncw-monorepo-init

把团队标准 monorepo 框架装进用户项目。分工原则：**本 skill 承载流程**——init 步骤、诊断动作、版本钉子（初始化基线）都在本 skill；**模板仓承载载荷**——骨架文件与环境巡检表。版本钉子与模板仓 `AGENTS-TEMPLATE.md` 巡检表是同一基线的两处落点，改版本两处同改；骨架内容演进只改模板仓，本 skill 不动。

模板仓 canonical 地址（下文称"模板仓"）：

```text
https://git.newchiwan.com/council/monorepo-template.git
```

## 模式判定

先看用户项目根目录的实际状态，再选模式；拿不准就问一句，不要猜。

| 项目根状态 | 用户意图信号 | 模式 |
|---|---|---|
| 无 `AGENTS.md`、无 `.agents/` | "初始化""按团队规范搭""从零开始" | **init** → 读 `references/init.md` |
| 骨架存在（`AGENTS.md` / `.agents/` 任一在） | "检查一下""环境对不对""结构诊断""巡检" | **diagnose** → 读 `references/checklist.md` |
| 有业务代码但无骨架 | "迁移""改造成团队规范" | **migrate** → 见下，能力未标注 |

## migrate 模式（能力待标注）

非空项目的结构迁移能力**尚未在模板仓标注**，目前只有 init 覆盖全新初始化。所以：

1. 收集现状：业务代码布局、构建体系、 CI 现状。
2. 明确告知用户：迁移模式需要先在模板仓补充迁移规范（用户说过会后续标注），当前不能凭空搬目录或改结构。
3. 把收集到的现状整理好等用户补充规范，**不要动手迁移**。

## 安全边界（三种模式都必须遵守）

- **同名文件不覆盖**：骨架复制遇同名文件（如用户已有自己的 `README.md`、`Makefile`）一律跳过并列出来问用户，绝不静默覆盖。
- **不顺手写业务代码**：只做框架接入和结构对齐，业务实现一律不碰。
- **不改写骨架内容**：`AGENTS-TEMPLATE.md`（复制后改名 `AGENTS.md`）、`.agents/` 里模板自带的文件按原样落地；需要定制时改的是用户项目自己的登记信息（如 `AGENTS.md` 布局章节），不是骨架正文。
- **安装先汇报后执行**：环境检查发现缺失或版本不符时，全部查完后中断对话汇总汇报，经用户逐项确认才安装/升级；不要边查边装。
- **认知资产不进 .gitignore**：`aoci.txt` / `aoci.meta.txt` / `aoci.code.txt` / `AGENTS.md` 是要提交的认知资产。

## 分发与安装

本 skill 正本在团队 pack 仓 `ncw-delivery-harness`（与模板仓分离：模板仓 `.agents/skills/` 是随 init 复制的模板载荷，本 pack 是消费模板的元工具，独立发版）。各端都靠**文件落位**，不需要任何包管理器或插件：

| 端 | 项目级 | 全局级 |
|---|---|---|
| DSH / OpenCode / omp | 拷入 `<项目>/.agents/skills/`（init 流程的 pack 安装步完成） | 拷入 `~/.agents/skills/` |

- omp 实测同时读项目级与全局级；DSH 无需 plugin——skill 是「被扫描的文件」，拷贝即安装，免重启热加载。
- pack 安装器 `scripts/sync.mjs`（一次装整个 pack，`PACK_SKILLS` 列表 = `ncw-monorepo-init` + `ncw-speckit-flow`）：
  ```bash
  npx git+https://git.newchiwan.com/council/ncw-delivery-harness.git --global   # 免克隆直装用户级
  # 或克隆后：
  node skills/ncw-monorepo-init/scripts/sync.mjs             # 项目级：.agents/skills/
  node skills/ncw-monorepo-init/scripts/sync.mjs --global    # 用户级：~/.agents/skills/
  ```
  支持 `--dry-run` / `--force`；默认同名不覆盖，只列出冲突。
- 项目级同名 skill 覆盖全局级（DSH rank 100/200 > 400/500）——团队全局发、项目内可定制覆盖。
