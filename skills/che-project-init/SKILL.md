---
name: che-project-init
description: 交互式初始化项目 .che 配置：逐项讲解并确认 language（全 pack 输出语言）、require_intent（before_specify 门禁）、planverify_gate（before_implement 门禁）、checker（独立校验者策略）、pingcode_integration（PingCode 集成开关）五个配置项，生成 .che/config.yml（幂等增量：已初始化项目重跑只补缺失或非法的新配置项，已有合法配置沿用不重问）；顺带自检并按需安装 che / adrkit CLI；选择接入 PingCode 时自检并安装最新 pingcode CLI、引导登录、移交 /che-pingcode-init。当用户要初始化 .che 配置、设置或切换输出语言、开启或关闭规格流程门禁、配置校验者策略、接入或首次配置本 pack、harness 升级后补装新增配置项、检查 che/adrkit 有没有装时使用——即使用户没提命令名，意图匹配也用本 skill。
---

> **语言规则（pack fork，上游升级时保留；优先于本文件其他语言指示）**：任何输出前，读取项目根 `.che/config.yml` 的 `language:` 值（`zh-cn`、`en` 等语言代码），全程（含思考与所有对话输出）使用该语言；文件、键缺失或值非法时默认 `zh-cn`。路径、命令、键名与代码不翻译。

# 项目接入初始化

本技能是项目接入本 pack 的**第一步配置入口**：逐项向用户讲解并确认五个配置项，交互式生成项目根的 `.che/config.yml`。本技能**幂等可重复执行**：harness 迭代会新增配置键，已初始化的项目重跑时只补「缺失或值非法」的键（典型场景：新版 pack 新增了配置项），已有合法配置原样沿用、绝不重问、绝不改动。

职责边界（必须遵守）：

- 写 `.che/config.yml` + 维护项目根 `.gitignore` 的 che 忽略规则（见步骤 6）；**绝不**读写 `.che/feature.json` 的内容（session→slug 绑定表，机器本地，由 intent 阶段 `che task create` 写入——本技能只负责让 git 忽略它）。
- `.che/pingcode-config.yml` **绝不**由本技能直接生成——PingCode 接入链最后移交 `/che-pingcode-init` 完成。
- 本技能无 scripts：写盘由 agent 按本文件的模板完成。

## 配置项讲解（提问前必须逐条讲给用户）

每项提问前必须先用下面的通俗口径讲解：**这个配置配了有什么用、不配或改了有什么影响**；有多个选项的必须讲清每个选项的含义。然后对**本次需要提问的键**逐项单独提问（交互提问机制或自然对话；沿用的键不重复讲解，用户追问时再讲），**绝不**把多个问题打包成一次问完——用户必须有机会对单项追问。

**提问一律用自然语言**，按各项给出的「问法」口径发问，**绝不**把配置键名或选项字面值直接抛给用户——「`pingcode_integration` 要 on 还是 off？」是不合格的问法，应当像「是否开启 PingCode 同步？」这样问。键名只属于写盘与回显阶段，以及与用户核对技术细节（如环境变量冲突）时。

### 0. language（全 pack 输出语言；选项 zh-cn / en）

- **本项最先问，且固定用中文提问**：无论用户最终选哪种语言，本项的讲解与提问恒为中文；用户选定后，本次初始化后续所有讲解、提问与回显一律切换为所选语言（后续各项的中文「问法」口径不变，仅换语言呈现）。
- 问法：「所有技能的输出语言用哪个？之后所有技能的回复——包括思考过程——都会用这个语言。」
- **中文（zh-cn）**：对话输出（含思考与正文）使用中文；也是配置缺失时全 pack 的默认语言。
- **English（en）**：对话输出使用英文。
- 合法值：BCP-47 风格语言代码（`zh-cn`、`en`、`ja`…）。交互只提供上面两个常用选项；用户主动要求其他语言时按其要求写入对应代码。
- 本项没有环境变量覆盖。

### 1. require_intent（before_specify 门禁；默认 on；选项 on / off）

- 问法：「要不要开启『先想清楚再动手』的门——写特性规格之前，必须先有一份讲清『为什么做』的 intent 文档，没有就拦下来？」
- **开（on）**：`/che-compound-specify` 之前必须先存在 intent 文档（`che paths` 解析的任务目录内 `intent.md`，由 `/che-compound-intent` 产出），没有就拦下 specify——强制「先想清楚为什么做，再写做什么」。
- **关（off）**：specify 直接放行，intent 变成可跳过。
- **影响**：这是流程纪律的强弱开关。正式项目建议开（防止没想清楚就开工）；个人临时试用可以关。
- 环境变量 `CHE_REQUIRE_INTENT` 优先于本配置。

### 2. planverify_gate（before_implement 门禁；默认 off；选项 block / off）

- 问法：「要不要在动手写代码之前，先让一个独立的 AI 审查者把实现计划过一遍？开了更稳，但流程会多一道检查。」
- **block**：进入 `/che-compound-implement` 前必须先跑过 `/che-compound-planverify` 且裁决不是 `BLOCKED_DRIFT`——计划没过独立审查就不准动代码。
- **off**：不拦截，planverify 做不做随用户。
- **影响**：block 多一道实现前的独立校验关卡，更稳但流程更长。新项目建议先 off 跑顺流程，再按需开。
- 环境变量 `SKC_PLANVERIFY_GATE` 优先于本配置。

### 3. checker（独立校验者策略；默认 auto）

- 问法：「审查计划/实现的那个独立 AI 审查者，要挑多独立的？」选项用大白话讲：自动挑最独立的（默认）/ 必须用别家模型 / 钉死同家族便宜模型 / 钉死同款模型 / 你自己指定 CLI 和模型。

planverify / intentguard 判定时**不让写计划/写代码的对话自己给自己打分**——判定外包给一个隔离的 checker。checker 按三级独立性阶梯选拔：跨厂商模型（Tier 1，如 codex / gemini）＞ 同家族便宜模型（Tier 2，subagent + haiku）＞ 同模型新上下文（Tier 3，subagent）。选项：

- `auto`：能爬多高爬多高；机器上没有异厂商 CLI 就落到 Tier 2 / Tier 3，不报错。**默认，适合大多数项目**。
- `cross-model`：硬性要求 Tier 1，找不到异厂商 CLI 就报错终止，绝不静默降级——适合对校验独立性要求高的项目。用户选它时必须先探测 `command -v codex` 与 `command -v gemini`，都没有要提醒用户（装任一 CLI 后才真正生效）并请其确认。
- `same-family`：钉死 Tier 2（同家族便宜模型）。
- `same-model`：钉死 Tier 3（同模型新上下文）。
- `cli:<model>`：显式指定外部 CLI 与模型，完全由用户指定。
- 环境变量 `SKC_CHECKER` 优先于本配置。

### 4. pingcode_integration（PingCode 集成开关；选项 on / off）

- 问法：「是否开启 PingCode 同步？开启后特性规格会自动建卡到 PingCode，建卡、对账、收尾流转都在 PingCode 上走。」
- **on**：本项目接入 PingCode 建卡链路（spec 卡 / story 卡 / 任务卡在 PingCode 建立与流转）。真正生效还需要 `.che/pingcode-config.yml`（项目/产品/迭代/映射配置，由 `/che-pingcode-init` 交互生成）。
- **off**：不接 PingCode，卡片流程全部留本地。
- 用户选 on 时，本技能顺手把环境装好：CLI 检查 → 登录 → 移交 `/che-pingcode-init`（见下方步骤 5「PingCode 接入链」）。

> 已退役键：`commit_story_id`（提交消息绑定故事卡 ID）已从本 pack 移除——提交消息不再携带工作项 ID（见 `/che-git-master`）。旧项目 `.che/config.yml` 里残留的该键按「pack 不认识的键」原样保留、不再询问。

## 步骤

### 1. 定位项目根与现状

1. `git rev-parse --show-toplevel` 失败 → 终止：本技能必须在 git 项目内运行。
2. `.che/config.yml` 已存在 → 逐键读出现值，对照五个标准键（language 与四个流程键）标注状态：**已有且合法 / 缺失 / 值非法**（合法性口径见各配置项的选项定义）；pack 不认识的键原样保留、绝不删除，在回显中列出。此标注决定步骤 4 问哪些。

### 2. CLI 运行时自检（che / adrkit）

本技能是项目接入第一步，必须顺手把 pack 依赖的外部 CLI 备齐（技能运行时只执行 PATH 上的 CLI，任何插件安装路径都不会替你装）：

1. `command -v che` 缺失 → `npm install -g @newchiwan/che@latest` 后复检（che 无版本下限，latest 恒与技能文本对齐）。
2. `command -v adrkit` 缺失 → `npm install -g @adrkit/cli@0.20.0` 后复检（pack 按 0.20.0 钉）。
3. 已在 PATH 的**绝不**擅自升降级；adrkit 与 0.20.0 漂移且技能报错时，建议用户重装并经其确认。
4. 安装失败或用户拒绝 → **不阻塞**配置写入，在最终回显中标注缺失项与安装命令。

### 3. 环境变量冲突预检

`printenv CHE_REQUIRE_INTENT SKC_PLANVERIFY_GATE SKC_CHECKER` 有非空值 → 明确提醒用户：这些环境变量优先于 config.yml，本次写入的对应键在该 shell 不生效；经用户确认后继续。

### 4. 逐项提问

language 需要问时**最先问**（本项固定中文提问，用户选定后，本次会话后续讲解与提问切换为所选语言），再按上面 1～4 项的顺序走一遍，**只对步骤 1 标注为缺失或值非法的键**讲解并问询（先讲通俗口径，再按该项「问法」的自然语言提问，把答案落成对应的键值记录）；已有合法值的键**绝不重问**，原样沿用，回显标注「沿用现有」。`checker` 用户选「自己指定 CLI 和模型」时必须追问具体模型标识，写成 `cli:<model>` 完整值。用户显式点名重配某项或全部重配 → 按其指定范围重问，仍逐项单独问；五键全部沿用 → 跳到步骤 8 回显「配置已是最新」。

### 5. PingCode 接入链（仅当本次新选接入或用户显式要求补接）

本步只在 `pingcode_integration` 本次被问且用户选 on、或用户显式要求补接时执行：沿用现有 on 且 `.che/pingcode-config.yml` 已在位 → 跳过本步；沿用 on 但 config 缺失 → 询问现在补接（移交 `/che-pingcode-init`）还是保持现状（回显标注）。接入时依次执行；任何一步失败必须停下按「故障排除」处理，**绝不**跳过继续：

1. **CLI 在位且版本达标**：`command -v pingcode` 与 `pingcode --version`（要求 ≥ 0.14.0）。CLI 缺失、版本不符、或无法输出版本 → `npm install -g @metaphorli/pingcode-cli@latest` 安装/重装最新版后复检。
2. **登录**：`pingcode auth status`。未认证 → 执行登录命令：`<待补充：登录命令由维护者提供后替换此占位>`。占位未替换时必须向用户当场询问登录命令并执行，**绝不**编造登录命令。
3. **复检认证**：`pingcode auth status` 必须显示 `authenticated: true` 且 `token_valid: true`。
4. **移交集成配置**：执行 `/che-pingcode-init` 交互生成 `.che/pingcode-config.yml`。用户在中途拒绝或中止 → 回来询问用户保持 `pingcode_integration: off` 还是稍后重跑。
5. **记录**：接入链全部走通 → `pingcode_integration: on`；用户拒绝接入或链路未走通 → `off`。必须诚实记录实际状态，**绝不**写未经跑通的 on。

### 6. 确保 `.gitignore` 忽略机器本地绑定文件

`.che/feature.json`（session→slug 绑定表）是机器本地文件，入库无意义；`.che/*.bak` 是配置覆盖备份，同为本地噪声。`.che/config.yml` 与 `.che/pingcode-config.yml` 是项目共享配置，**保持提交**——所以忽略规则必须精确到文件，绝不整目录忽略 `.che/`。

在项目根 `.gitignore` 中幂等追加（已有同名规则行则跳过该行；`.gitignore` 不存在则创建）：

```gitignore
# che: session bindings are machine-local (config.yml / pingcode-config.yml stay tracked)
.che/feature.json
.che/*.bak
```

- 检查方式：逐行比对 `.gitignore` 是否已含 `.che/feature.json` 与 `.che/*.bak` 两行（trim 后精确匹配即可），缺哪行补哪行，连同注释块一起追加。
- 用户明确拒绝改 `.gitignore` → 跳过本步并在最终回显标注（绑定文件将来会出现在 `git status` 里，由用户自行处理）。

### 7. 写 `.che/config.yml`

格式纪律：扁平键值文件，每行一个 `键: 值`；che CLI 逐行正则读首个 `键:`，因此注释行**必须**以 `#` 开头，键值行**绝不**出现在其他语法位置。

- 文件不存在 → `mkdir -p .che` 后按模板写入（值用用户所选）：

```yaml
# .che/config.yml — ncw-delivery-harness 项目配置（/che-project-init 生成）
# 环境变量优先于本文件：CHE_REQUIRE_INTENT、SKC_PLANVERIFY_GATE、SKC_CHECKER。

# 全 pack 输出语言：所有技能对话输出（含思考）使用的语言代码（zh-cn / en 等）
language: zh-cn

# before_specify 门禁：on 时 /che-compound-specify 前必须存在 intent 文档，无则拦截
require_intent: on

# before_implement 门禁：block 时实现前必须通过 /che-compound-planverify（off 不拦截）
planverify_gate: off

# planverify / intentguard 独立校验者策略（auto | cross-model | same-family | same-model | cli:<model>）
checker: auto

# PingCode 集成总开关：on 表示已接入（配合 .che/pingcode-config.yml 生效）
pingcode_integration: off
```

- 文件已存在 → **只增补**步骤 4 的新答案（新增缺失键、修正非法值），已有合法键值逐字保留，绝不重写未询问的键；逐键展示增补前后的差异：
  - 有增补或修正 → 旧文件备份为 `.che/config.yml.bak` 后合并写盘（用户拒绝 → 中止不写）。
  - 无增补（全部沿用）→ 回显「配置已是最新，无事可做」，不写盘。

### 8. 回显与下一步

```
✅ 配置已生成: .che/config.yml
   language: <值>（全 pack 输出语言）
   require_intent: <值>   planverify_gate: <值>
   checker: <值>   pingcode_integration: <值>
   变更: <新增 键=值 …；修正 键=值 …；沿用 键 …；未识别键保留: 键 …（无增补时整行显示「已是最新」）>
   che: <✓ 或 ✗ + 安装命令>   adrkit: <✓ 或 ✗ + 安装命令>
   gitignore: <✓ 已忽略 .che/feature.json、.che/*.bak 或 +新增规则 或 用户拒绝跳过>
```

- 开始第一个特性：`/che-compound-intent`（全流程总览见 `/che-compound-flow`）。
- 已接入 PingCode：spec 建卡走 `/che-pingcode-specstoissues`。

## 故障排除

| 症状 | 处理 |
|---|---|
| `npm install -g` 失败 | 检查 npm registry 可达性与全局 bin 目录权限；企业内网确认内部 registry 镜像 |
| che 安装报 404（@newchiwan 不在公网） | 配置公司 Nexus 消费端：`npm config set @newchiwan:registry https://nexus.newchiwan.cn/repository/registry-npm/` 后重试 |
| 安装后仍 `command not found: pingcode` | 重开 shell 确认 npm 全局 bin 目录在 PATH 中 |
| `pingcode --version` 低于 0.14.0 | `npm install -g @metaphorli/pingcode-cli@latest` |
| `auth status` 始终未认证 | 检查登录命令输出；或改设 `PINGCODE_CLIENT_ID`/`PINGCODE_CLIENT_SECRET` |
| 非 git 目录被拒绝 | 切到项目根再运行本技能 |
