# speckit 技能迁移报告

日期：2026-10-17
范围：`ncw-speckit-constitution` + `ncw-speckit-{analyze,clarify,converge,implement,plan,specify,tasks}` 共 8 个技能，从 freight-mono 项目级 skill 迁入本仓 pack。
模式：完全复用 constitution 首迁确定的迁移模式（逐字拷贝英文正文 + 固定偏离集），逐技能独立提交。

## 源与目标

- 源（拷贝，非移动；源目录保持不动，去留由用户另行决定）：
  `/Users/zhihengli/Workspaces/newchiwan/freight/freight-mono/.agents/skills/speckit-<x>/SKILL.md`
- 目标：`skills/ncw-speckit-<x>/SKILL.md`（本仓 `ncw-delivery-harness`）
- 更名规则：`speckit-<x>` → `ncw-speckit-<x>`，全部 ≤32 字符、过 `^ncw-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$` 命名正则

| # | 技能 | 源行数 | 提交 |
|---|---|---|---|
| 1 | ncw-speckit-constitution | 179 | e28f8db |
| 2 | ncw-speckit-analyze | 259 | e54d8cf |
| 3 | ncw-speckit-clarify | 291 | b930cd1 |
| 4 | ncw-speckit-converge | 283 | 312366e |
| 5 | ncw-speckit-implement | 226 | 15be244 |
| 6 | ncw-speckit-plan | 166 | f9d4789 |
| 7 | ncw-speckit-specify | 345 | c125152 |
| 8 | ncw-speckit-tasks | 215 | 5d06605 |

## 通用偏离集（每个技能一致）

frontmatter 严格两字段 `name` + `description`（丢弃源 `compatibility`/`metadata`，`compatibility` 前提并入 description 并补触发条件）；正文英文逐字拷贝，除：

- **偏离 A（删节）**：删 extension hook 执行机制全部内容（各文件形态不同，见下表）。
- **偏离 B（新增节）**：在原 Pre-Execution Checks 位置插入 `## Extension Hooks Not Handled` 短节，声明 `hooks.before_<x>`/`hooks.after_<x>` 不会被执行，要求 agent 列出已注册 hook（扩展名 + 命令）提示用户手动执行。
- **偏离 C（路径改写）**：`.specify/scripts/python/<script>.py` 形式的调用行改写为 `` `.specify/scripts` → `python/<script>.py` `` 分段表述。原因：`npm test` 规则 4 用 `grep -oE '(references|scripts)/[A-Za-z0-9._-]+'` 扫 SKILL.md 并要求命中文件存在于技能目录，原写法命中 `scripts/python` 误报。改写后 agent 可拼出完整路径，语义不变。

## 各技能删节明细（偏离 A 的具体形态）

| 技能 | 删除内容 |
|---|---|
| constitution | `## Pre-Execution Checks`（38–72 行）+ `## Post-Execution Checks`（147–179 行至 EOF） |
| analyze | `## Pre-Execution Checks` + Execution Steps 内 `### 9. Check for extension hooks`（after-analyze，至 EOF 前） |
| clarify | `## Pre-Execution Checks` + `## Mandatory Post-Execution Hooks` + Done When 中引用该节的清单条目 |
| converge | `## Pre-Execution Checks` + `### 9. Check for extension hooks`（after-converge，至 EOF） |
| implement | `## Pre-Execution Checks` + `## Mandatory Post-Execution Hooks` + Done When 引用条目 |
| plan | `## Pre-Execution Checks` + `## Mandatory Post-Execution Hooks` + Done When 引用条目 |
| specify | `## Pre-Execution Checks` + `## Mandatory Post-Execution Hooks` + Done When 引用条目 |
| tasks | `## Pre-Execution Checks` + `## Mandatory Post-Execution Hooks` + Done When 引用条目 |

## 各技能路径改写明细（偏离 C）

| 技能 | 原调用 | 脚本 |
|---|---|---|
| constitution | resolve_template.py constitution-template --json | resolve_template.py |
| analyze / clarify / converge / implement | check_prerequisites.py（参数各不同） | check_prerequisites.py |
| plan | setup_plan.py --json | setup_plan.py |
| tasks | setup_tasks.py --json | setup_tasks.py |
| specify | 无（全文无 rule-4 命中） | — |

## specify 特有额外偏离

源文含 specify CLI 引用 `specify preset resolve spec-template`（Outline 第 3 步括号注），按「迁入技能不得含 specify CLI 引用」约束改写为 "the shared template resolver used by the other Spec Kit commands"。另有两处对删除节的悬空引用一并修正：Outline 第 2 步 hook 条件句（指向 Pre-Execution Checks → 改指 Extension Hooks Not Handled）、第 8c 步 "proceed to the Mandatory Post-Execution Hooks section" → "proceed to the Completion Report"。

## 被丢弃的 extension hook 点（需用户手动执行）

每个技能两个 hook 点，来自目标项目 `.specify/extensions.yml`：

`hooks.before_analyze` / `hooks.after_analyze`、`hooks.before_clarify` / `hooks.after_clarify`、`hooks.before_converge` / `hooks.after_converge`、`hooks.before_implement` / `hooks.after_implement`、`hooks.before_plan` / `hooks.after_plan`、`hooks.before_specify` / `hooks.after_specify`、`hooks.before_tasks` / `hooks.after_tasks`、`hooks.before_constitution` / `hooks.after_constitution`。

各技能「Extension Hooks Not Handled」节要求 agent 运行时列出已注册条目（扩展名 + 命令），由用户在对应动作前/后手动运行。

## 核查与前提

- **specify CLI**：8 个迁移后文件 grep `\bspecify +(init|check|version|preset)\b` 计数全 0（specify 技能的 `specify preset resolve` 已改写，见上）。
- **rule-4 字面量**：8 个文件 grep `(references|scripts)/[A-Za-z0-9._-]+` 计数全 0。
- **hooks 残留**：8 个文件 grep `Pre-Execution Checks|Post-Execution Checks|Mandatory Post-Execution Hooks|EXECUTE_COMMAND` 计数全 0。
- **绝对路径**：源文无 `/Users/`、`/home/` 泄漏（迁移后复查一致）。
- **前提**：目标项目须已初始化 spec-kit 结构（`.specify/` 目录，含 `scripts/python/` 各脚本与 `memory/`）；description 已并入此前提。

## Pack 级改动（每技能提交内同步）

- `skills/ncw-monorepo-init/scripts/sync.mjs:23` `PACK_SKILLS` 单行数组逐技能登记（`npm test` 规则 6 强制；保持单行字面量，测试按单行 grep 解析）。终态 10 项：`ncw-monorepo-init` + 8 个 speckit 技能 + `ncw-speckit-flow`（字母序）。
- `README.md`「Pack 内容」表、`AGENTS.md`「Key Directories」表逐技能插入对应行。
- `ncw-monorepo-init` 与 `ncw-speckit-flow` 的 SKILL.md / references 内容零改动。

## 验证结论（全部实跑）

1. 每技能保真 diff（源 `tail -n +9` vs 目标 `tail -n +5`）仅含上述计划内偏离。
2. `npm test` 随提交递增全绿：36 → 42 → 48 → 54 → 60 → 66 → 72 → **78 passed, 0 failed**。
3. 安装器 `--dry-run`（cwd=/tmp 避开自拷贝保护）：PLAN 覆盖全部 10 个技能（8 迁移 + flow + monorepo-init）。
4. 提交信息均过 `.githooks/commit-msg` 校验（`feat(skills): #TECH-000 …`）。

## 未做

- 源仓 freight-mono 的 8 个 `speckit-*` 目录未删除。
- `ncw-speckit-flow` 的 8 阶段流程表未纳入 constitution/analyze 等阶段（沿用首迁决策：治理与质量动作不在产品↔开发交接主线）。
- extension hook 机制整体不迁移；如未来需要，须另行设计不依赖 HookExecutor 的等价机制。

## 追加（2026-10-17）：bundled spec-kit 运行时（偏离 C 作废）

**动因**：使用环境不执行 `specify init`；且模板仓 `council/monorepo-template` 的 `.specify/` skeleton 仅含 `memory/constitution.md` + `.gitkeep`，不含 `scripts/python/` 与 `templates/`。按原迁移形态，技能在目标项目里的 `python3` 调用与模板解析全部会失败。

**变更**：

- 7 个技能携带 spec-kit v1.1.3 脚本逐字副本于各自 `scripts/`（SKILL.md 以 `scripts/<name>.py` 字面引用，`npm test` 规则 4 反向成为存在性保障）：
  - analyze / clarify / converge / implement：`check_prerequisites.py` + `common.py`
  - plan：`setup_plan.py` + `common.py`；tasks：`setup_tasks.py` + `common.py`；constitution：`resolve_template.py` + `common.py`
  - specify 无脚本调用（agent 原生建目录与 feature.json），仅携带 `references/spec-template.md`
- 4 个技能携带模板于 `references/`：specify / plan / tasks / constitution 各带对应 `<name>-template.md`
- SKILL.md 调用行改写：偏离 C 的「`.specify/scripts` → `python/<script>.py`」分段表述全部替换为本技能 `scripts/<name>.py` 直引 + 「verbatim spec-kit v1.1.3 helper」标注；模板消费技能增加 scaffold 指令——项目模板栈无法解析时，从本技能 `references/` 复制到项目 `.specify/templates/`（建目录、绝不覆盖已有项目模板）。
- 脚本以 CWD=项目根运行；`common.py` 经 `sys.path.insert(脚本所在目录)` 兜底导入，与脚本存放位置无关（已实测）。`common.py` 内 `.specify/scripts/python` 字样为上游注释，逐字保留。

**取舍**：`check_prerequisites.py` / `common.py` 在 4 技能间逐字重复——跨技能相对引用在项目级/全局级混合安装下不可靠，且规则 4 要求引用文件落于本技能目录内。升级 spec-kit 时须同步全部副本（`grep -rl check_prerequisites.py skills` 定位）；版本事实源仍为 `references/init.md` 的 v1.1.3 钉子。

**验证（全部实跑）**：

- `npm test`：89 passed, 0 failed（规则 4 新增 11 个存在性检查全过）。
- 无 init 冒烟（/tmp/speckit-smoke，无 `.specify/scripts`、无 specify CLI）：scaffold 4 模板后，analyze / clarify 检查器、setup_plan（plan.md 与捆绑模板字节一致）、setup_tasks、resolve_template(constitution-template) 全部 exit 0，输出字段符合 SKILL.md 要求。
- 负例（/tmp/speckit-neg）：tasks-template / constitution-template 缺失时 setup_tasks、resolve_template 按预期硬失败 exit 1——新 scaffold 指令覆盖的恰好是这两个失败点。
- 18 个捆绑文件与 freight-mono 源 `cmp` 字节一致；泄漏扫描无 `/Users/`、`/home/`。
- `sync.mjs --dry-run`：10 技能 PLAN 不变；`scripts/`、`references/` 随技能目录整树拷贝，安装器零改动。
