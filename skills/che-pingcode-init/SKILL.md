---
name: che-pingcode-init
description: 交互式初始化 PingCode 集成配置：选择项目/产品/迭代/映射类型，生成 pingcode-config.yml。当用户要配置或重置 pingcode-config.yml、选择 PingCode 项目/产品/迭代/卡片类型映射、修正建卡映射层级、询问"怎么接入 PingCode"时使用——即使用户没提命令名，只要是给 spec 建卡流程做 PingCode 初始化配置也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# 初始化 PingCode 集成配置

> **Pack fork**：吸收自 [Spec-Kit-PingCode](https://github.com/HJXArthurAtlas/Spec-Kit-PingCode) v2.9.0（commit 4b5aeb3，MIT），正文为上游命令 `speckit.pingcode.init` 的 pack 改编。相对上游：配置落 `.che/pingcode-config.yml`（上游落项目根）；specify extension 的 hook 接线全部移除（pack 无 hook 执行机制，命令按流程节点手动调用）；命令名 `/speckit.pingcode.*` 改为 `/che-pingcode-*`；登录走 `/che-project-init` 落盘的项目级脚本 `.che/pingcode-login.sh`（未认证时自动登录，上游为提示用户手动登录后终止）。配置模板见本技能 `references/pingcode-config.template.yml`。前置依赖：`pingcode` CLI（`npm i -g @metaphorli/pingcode-cli`，保持 npm 最新版）。

交互式完成 PingCode 集成配置并直接生成 `.che/pingcode-config.yml`。所有类型/状态/优先级名都从项目实际字典探查后写入，不猜测；产品与迭代可固定到配置，也可留空走运行时解析链。

## 前置条件

1. `pingcode` CLI 已安装且在 PATH 中（安装：`npm i -g @metaphorli/pingcode-cli`）
2. 已认证：`pingcode auth status` 显示 `authenticated: true` 且 `token_valid: true`

CLI 缺失 → 提示安装并终止。未认证 → **不终止**：先告知用户「即将打开浏览器完成 PingCode 授权，完成后自动继续」，再执行项目级登录包装脚本（由 `/che-project-init` 接入链放置，模板随其技能分发）：

```bash
bash .che/pingcode-login.sh            # 已认证直接通过；未认证自动开浏览器登录并复检
```

脚本缺失 → 先重跑 `/che-project-init` 补放（或按「故障排除」环境变量口径手动登录），不要绕过脚本裸跑 `pingcode auth login`。脚本封装 OAuth client 凭据。`pingcode auth login` 自带本地回调监听（`127.0.0.1:8765`）：打开浏览器 → 阻塞等用户授权 → 回调到达自动换 token 并自行退出，**命令退出即登录完成，无需轮询**；挂起是正常状态，给足等待时间（≥300 秒），绝不因未退出而中止或杀进程（运行环境把长命令转入后台时，等其完成结果送达后继续）。浏览器打不开或 CLI 与浏览器不在同一机器（远程 SSH）→ 授权码兜底：`bash .che/pingcode-login.sh login --dry-run` 打印授权 URL 交用户，用户在浏览器完成授权后从重定向地址 `…/callback?code=…` 复制 `code` 交回，改跑 `bash .che/pingcode-login.sh login --code <授权码>`。登录失败或用户放弃才终止。

## 用户输入

可选参数：

- `--project <名称或ID>`：跳过项目选择，直接解析并锁定
- `--force`：已存在配置文件时不询问，直接覆盖（旧文件备份为 `.bak`）
- `--dry-run`：只输出将生成的配置内容，不写文件

## 步骤

### 1. 环境自检

```bash
command -v pingcode              # 缺失 → 提示安装 CLI，终止
pingcode auth status             # 未认证 → 跑 .che/pingcode-login.sh 自动登录（见前置条件），失败才终止
pingcode context list
```

### 2. 选择并锁定项目

- `--project` 提供时直接使用
- 否则看 `context list` 的 `dictionaries.projects`：≥ 1 → 从缓存 `projects.values[]` 列出（名称/标识符）供用户选择；0 → 请用户直接给出项目名称或标识符

确定后执行：

```bash
pingcode context set-current-project "<项目名称或ID>"
```

从输出 `preferences.current_project_id` 记下 project_id，后续字典键都基于它。名称解析失败 → 列出缓存 `projects.values[]` 供重选。

该命令会同时把类型/状态/优先级/迭代字典写入 `.pingcode/cache.json`；确认 `.pingcode/` 已被项目 `.gitignore` 忽略，没有则追加。

### 3. 选择产品（需求关联用）

`/che-pingcode-specstoissues` 创建卡片时要关联产品下的「需求」（idea）。查询产品：

```bash
pingcode product list --compact
```

- 恰好 1 个 → 询问是否固定到配置
- 多个 → 列出（名称/标识符）让用户选择其一或跳过
- 0 个或查询失败 → 写空字符串（运行时交互选择，或跳过需求关联）

选定 → `product: "<产品名称>"`；跳过 → `product: ""`。名称/标识符与 ID 的对应以 `product list` 输出为准，不猜测。

### 4. 选择映射类型（含需求树层级校验）

从缓存 `work_item_types["<project_id>"].values[]` 列出全部类型（`id`/`name`/`group`）让用户选择：

- `spec_artifact`：推荐 `group=requirement` 中名称含「特性/feature」的类型
- `story_artifact`：推荐「用户故事/story」类；用户可选择"不按章节建卡"（写空字符串）
- `task_artifact`：可选，推荐 `group=task` 中「任务/task」类；不选 = 任务不建卡（仅本地 checklist），配置里整个键不出现。选定后任务行建任务卡挂所属 story/spec 卡下，勾选流转受 `sync.complete_story_when_tasks_done` 控制
- 两者皆空 → 提示至少配置一项，回到本步重选

**需求树层级归类**（specstoissues 据此确定要确认的祖先层，层级：史诗=1/特性=2/用户故事=3/任务=4）：

- 规范名（含「史诗/epic」「特性/feature」「用户故事/story」「任务/task」）自动归类
- 非规范名 → 询问用户该类型归属第几层，并把 `<类型名>: <层>` 写入配置 `mapping.type_levels`（运行时识别用）
- 各映射必须落在相邻层级（不跳级）：`story_artifact` 非空时其层级必须 = spec 层级 + 1；`task_artifact` 非空时其层级必须 = story（或 spec，story 留空时）层级 + 1；违例（如 spec=史诗 + story=用户故事，中间跳过特性）→ 说明父子链会断裂，回到本步重选
- spec=用户故事（第 3 层）时无 requirement 下一层可用 → `story_artifact` 必须留空（`task_artifact` 仍可配第 4 层类型）

### 5. 选择收尾状态名

取收尾对象类型的状态集（键 `work_item_states["<project_id>::<type_id>"]`；spec-story 模式用 story 类型，spec-only 模式用 spec 类型）：

- `status_mapping.completed`：优先取 `type=completed` 的第一个状态名，并列出全部可选项让用户确认

### 6. 选择优先级名

列出 `work_item_priorities` 字典的全部名称：

- `priority_mapping.p1/p2/p3`：名称含「高/紧急」「中」「低」时自动建议对应档位，否则让用户逐档指定
- 项目无多级优先级概念 → 三档全部留空

### 7. 选择迭代并初始化 CLI 运行时上下文

```bash
pingcode sprint list <project_id> --status in_progress
```

- 恰好 1 个进行中 → 询问：固定到配置，还是留空（每次运行动态解析/询问）
- 多个 → 列出（名称/编号/起止日期）让用户选择其一或留空
- 0 个 → 写空字符串（运行时再解析，或届时选择"不挂迭代"）

选定 → `sprint: "<迭代名称>"`；留空 → `sprint: ""`

**CLI 运行时上下文初始化——本步总是执行：已有偏好时做校验与修复，不静默跳过**（偏好存在不代表新鲜或完整；`workitem create` 硬性要求 context 含当前用户与当前迭代，缺失会拒绝执行）：

1. 取当前用户 id：`pingcode directory me`
2. 写入偏好：
   - 迭代已定 → 一次管道喂齐三项（顺序固定：项目 → 迭代 → 用户，均可传编号或 ID），顺带保证 sprints/users 字典完整：

```bash
printf '<项目>\n<迭代ID>\n<用户ID>\n' | pingcode context init
```

   - 迭代留空 → 项目已由第 2 步设置，只补用户：`pingcode context set-current-user <用户ID>`
3. 迭代留空时的残留校验（必做）：检查 `context list` 的 `preferences.current_sprint_id`——
   - 无残留 → 回显"迭代将每次动态解析"
   - 有残留 → 对照缓存 sprints 字典查其状态：仍 `in_progress` → 回显并确认沿用；非进行中或查不到 → **不得静默保留**：`pingcode context set-current-sprint <最新进行中迭代ID>` 更新，或经用户明确接受"context 残留会优先于动态解析"的风险
4. 字典校验：`context list` 中类型/状态/优先级/sprints 字典非空；为空 → 类型/状态/优先级重跑第 2 步 `set-current-project`，sprints/users 重跑上面的管道 `context init`
5. 终态校验：`preferences` 应含 `current_project_id`、`current_user_id`（迭代已定则还有 `current_sprint_id`）

完成后回显 context 终态；`/che-pingcode-specstoissues` 运行时不再需要补建上下文。

### 8. 生成配置

按以下结构组装（`defaults` 两档优先级询问用户，可留空）：

```yaml
project: "<选定项目>"
product: "<选定产品 或 空>"
sprint: "<选定迭代 或 空>"

mapping:
  spec_artifact: "<选定>"
  story_artifact: "<选定 或 空>"
  # task_artifact 仅在用户选定任务映射时写入该键（不选则整个键不出现）:
  # task_artifact: "<选定>"
  # 仅当存在非规范名类型时由 init 写入层级归类，如:
  # type_levels:
  #   模块: 2

priority_mapping:
  p1: "<...>"
  p2: "<...>"
  p3: "<...>"

defaults:
  spec:
    priority: ""
  story:
    priority: ""

status_mapping:
  completed: "<选定>"

sync:
  complete_story_when_tasks_done: true
```

已存在配置文件：逐键展示新旧差异，未提供 `--force` 时询问覆盖或中止；覆盖前把旧文件复制为 `.che/pingcode-config.yml.bak`。

`--dry-run`：输出配置内容后结束，不写文件。

写入 `.che/pingcode-config.yml`（`.che/` 目录不存在时先创建）并回显：

```
✅ 配置已生成: .che/pingcode-config.yml
   项目: <名称>(<id>)
   产品: <名称 或 运行时选择>
   spec 卡: <spec_artifact>   story 卡: <story_artifact 或 不建>
   收尾状态: <completed 名>   迭代: <名 或 运行时解析>
   上下文: 用户 <名> ✓   当前迭代: <名 或 动态解析>   字典: ✓
```

### 9. 下一步

- 创建卡片：`/che-pingcode-specstoissues`（可先加 `--dry-run` 预览创建计划）
- 字典变化后重探/校准：`/che-pingcode-discover-context`

## 故障排除

| 症状 | 处理 |
|---|---|
| `command not found: pingcode` | `npm i -g @metaphorli/pingcode-cli` 安装 CLI |
| `authenticated: false` | 自动登录：`bash .che/pingcode-login.sh`（缺失先重跑 `/che-project-init` 补放；阻塞等浏览器回调属正常，给足 ≥300 秒；远程/无浏览器走 `login --dry-run` 取授权 URL + `login --code <授权码>`），或设置 `PINGCODE_CLIENT_ID`/`PINGCODE_CLIENT_SECRET` |
| 项目名解析失败 | 用 `pingcode context list` 查看缓存项目清单；确认名称/标识符后重试 |
| 产品列表为空/解析失败 | `pingcode product list --compact` 核对；企业未开通产品域时写空，运行时跳过需求关联 |
| 字典为空 | 重跑 `pingcode context set-current-project`；仍为空则检查 CLI 版本 |
| workspace context 报错 | 在 git 仓库根执行，或将 `PINGCODE_WORKSPACE_CACHE` 设为绝对路径 |
