---
name: che-config-init
description: 交互式初始化项目 .che 配置：逐项讲解并确认 require_intent（before_specify 门禁）、planverify_gate（before_implement 门禁）、checker（独立校验者策略）、pingcode_integration（PingCode 集成开关）四个配置项，生成 .che/config.yml；选择接入 PingCode 时自检并安装最新 pingcode CLI、引导登录、移交 /che-pingcode-init。当用户要初始化 .che 配置、开启或关闭规格流程门禁、配置校验者策略、接入或首次配置本 pack 时使用——即使用户没提命令名，意图匹配也用本 skill。
---

# 初始化项目 .che 配置

本技能是项目接入本 pack 的**第一步配置入口**：逐项向用户讲解并确认四个配置项，交互式生成项目根的 `.che/config.yml`。

职责边界（必须遵守）：

- 只写 `.che/config.yml`；**绝不**触碰 `.che/feature.json`（运行期特性指针，由 specify 阶段写入）。
- `.che/pingcode-config.yml` **绝不**由本技能直接生成——PingCode 接入链最后移交 `/che-pingcode-init` 完成。
- 本技能无 scripts：写盘由 agent 按本文件的模板完成。

## 配置项讲解（提问前必须逐条讲给用户）

每项提问前必须先用下面的通俗口径讲解：**这个配置配了有什么用、不配或改了有什么影响**；有多个选项的必须讲清每个选项的含义。然后逐项单独提问（交互提问机制或自然对话），**绝不**把四个问题打包成一次问完——用户必须有机会对单项追问。

### 1. require_intent（before_specify 门禁；默认 on；选项 on / off）

- **开（on）**：`/che-compound-specify` 之前必须先存在 intent 文档（`docs/intents/{slug}.intent.md`，由 `/che-compound-intent` 产出），没有就拦下 specify——强制「先想清楚为什么做，再写做什么」。
- **关（off）**：specify 直接放行，intent 变成可跳过。
- **影响**：这是流程纪律的强弱开关。正式项目建议开（防止没想清楚就开工）；个人临时试用可以关。
- 环境变量 `CHE_REQUIRE_INTENT` 优先于本配置。

### 2. planverify_gate（before_implement 门禁；默认 off；选项 block / off）

- **block**：进入 `/che-compound-implement` 前必须先跑过 `/che-compound-planverify` 且裁决不是 `BLOCKED_DRIFT`——计划没过独立审查就不准动代码。
- **off**：不拦截，planverify 做不做随用户。
- **影响**：block 多一道实现前的独立校验关卡，更稳但流程更长。新项目建议先 off 跑顺流程，再按需开。
- 环境变量 `SKC_PLANVERIFY_GATE` 优先于本配置。

### 3. checker（独立校验者策略；默认 auto）

planverify / intentguard 判定时**不让写计划/写代码的对话自己给自己打分**——判定外包给一个隔离的 checker。checker 按三级独立性阶梯选拔：跨厂商模型（Tier 1，如 codex / gemini）＞ 同家族便宜模型（Tier 2，subagent + haiku）＞ 同模型新上下文（Tier 3，subagent）。选项：

- `auto`：能爬多高爬多高；机器上没有异厂商 CLI 就落到 Tier 2 / Tier 3，不报错。**默认，适合大多数项目**。
- `cross-model`：硬性要求 Tier 1，找不到异厂商 CLI 就报错终止，绝不静默降级——适合对校验独立性要求高的项目。用户选它时必须先探测 `command -v codex` 与 `command -v gemini`，都没有要提醒用户（装任一 CLI 后才真正生效）并请其确认。
- `same-family`：钉死 Tier 2（同家族便宜模型）。
- `same-model`：钉死 Tier 3（同模型新上下文）。
- `cli:<model>`：显式指定外部 CLI 与模型，完全由用户指定。
- 环境变量 `SKC_CHECKER` 优先于本配置。

### 4. pingcode_integration（PingCode 集成开关；选项 on / off）

- **on**：本项目接入 PingCode 建卡链路（spec 卡 / story 卡 / 任务卡在 PingCode 建立与流转）。真正生效还需要 `.che/pingcode-config.yml`（项目/产品/迭代/映射配置，由 `/che-pingcode-init` 交互生成）。
- **off**：不接 PingCode，卡片流程全部留本地。
- 用户选 on 时，本技能顺手把环境装好：CLI 检查 → 登录 → 移交 `/che-pingcode-init`（见步骤 4）。

## 步骤

### 1. 定位项目根与现状

1. `git rev-parse --show-toplevel` 失败 → 终止：本技能必须在 git 项目内运行。
2. `.che/config.yml` 已存在 → 先读出全部现有键值备用（写盘阶段逐键对比）。

### 2. 环境变量冲突预检

`printenv CHE_REQUIRE_INTENT SKC_PLANVERIFY_GATE SKC_CHECKER` 有非空值 → 明确提醒用户：这些环境变量优先于 config.yml，本次写入的对应键在该 shell 不生效；经用户确认后继续。

### 3. 逐项提问

按上面四项的顺序讲解并问询，记录每项答案。`checker` 选 `cli:<model>` 时必须追问具体模型标识，写成完整值。

### 4. PingCode 接入链（仅当用户选择接入）

依次执行；任何一步失败必须停下按「故障排除」处理，**绝不**跳过继续：

1. **CLI 在位且版本达标**：`command -v pingcode` 与 `pingcode --version`（要求 ≥ 0.14.0）。CLI 缺失、版本不符、或无法输出版本 → `npm install -g @metaphorli/pingcode-cli@latest` 安装/重装最新版后复检。
2. **登录**：`pingcode auth status`。未认证 → 执行登录命令：`<待补充：登录命令由维护者提供后替换此占位>`。占位未替换时必须向用户当场询问登录命令并执行，**绝不**编造登录命令。
3. **复检认证**：`pingcode auth status` 必须显示 `authenticated: true` 且 `token_valid: true`。
4. **移交集成配置**：执行 `/che-pingcode-init` 交互生成 `.che/pingcode-config.yml`。用户在中途拒绝或中止 → 回来询问用户保持 `pingcode_integration: off` 还是稍后重跑。
5. **记录**：接入链全部走通 → `pingcode_integration: on`；用户拒绝接入或链路未走通 → `off`。必须诚实记录实际状态，**绝不**写未经跑通的 on。

### 5. 写 `.che/config.yml`

格式纪律：扁平键值文件，每行一个 `键: 值`；che CLI 逐行正则读首个 `键:`，因此注释行**必须**以 `#` 开头，键值行**绝不**出现在其他语法位置。

- 文件不存在 → `mkdir -p .che` 后按模板写入（值用用户所选）：

```yaml
# .che/config.yml — ncw-delivery-harness 项目配置（/che-config-init 生成）
# 环境变量优先于本文件：CHE_REQUIRE_INTENT、SKC_PLANVERIFY_GATE、SKC_CHECKER。

# before_specify 门禁：on 时 /che-compound-specify 前必须存在 intent 文档，无则拦截
require_intent: on

# before_implement 门禁：block 时实现前必须通过 /che-compound-planverify（off 不拦截）
planverify_gate: off

# planverify / intentguard 独立校验者策略（auto | cross-model | same-family | same-model | cli:<model>）
checker: auto

# PingCode 集成总开关：on 表示已接入（配合 .che/pingcode-config.yml 生效）
pingcode_integration: off
```

- 文件已存在 → 逐键展示新旧值差异：
  - 有变化 → 旧文件备份为 `.che/config.yml.bak` 后更新（同名不覆盖；用户拒绝 → 中止不写）。
  - 全部一致 → 回显「配置已是最新，无事可做」，不写盘。

### 6. 回显与下一步

```
✅ 配置已生成: .che/config.yml
   require_intent: <值>   planverify_gate: <值>
   checker: <值>   pingcode_integration: <值>
```

- 开始第一个特性：`/che-compound-intent`（全流程总览见 `/che-compound-flow`）。
- 已接入 PingCode：spec 建卡走 `/che-pingcode-specstoissues`。

## 故障排除

| 症状 | 处理 |
|---|---|
| 安装后仍 `command not found: pingcode` | 重开 shell 确认 npm 全局 bin 目录在 PATH 中 |
| `pingcode --version` 低于 0.14.0 | `npm install -g @metaphorli/pingcode-cli@latest` |
| `auth status` 始终未认证 | 检查登录命令输出；或改设 `PINGCODE_CLIENT_ID`/`PINGCODE_CLIENT_SECRET` |
| 非 git 目录被拒绝 | 切到项目根再运行本技能 |
