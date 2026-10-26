# che 任务/会话模型重设计

状态：设计定稿，待实施。本文件是仓内设计记录，不随 pack 分发。

## 背景与动机

现行 `.che/feature.json` 是 repo 全局单指针，编码「当前特性是谁」。两个并行会话各跑一个特性时 last-writer-wins，下游命令会把制品写进对方的特性目录。而实际协作模型是：一个任务经手产品 → UI → 开发三人接力，每人各自本地 clone；同一开发者也可能并行推进多个任务。

重设计把「消歧」从 repo 级单例改为 session 级绑定，把「进度」保持在 per-任务推导，把「耗时」落为 per-任务元数据。

## 核心概念

- **任务（task）**：从 intent 开始的全流程实例。不等于 specify 产出的 spec——任务可能停在 intent 阶段永不到 specify。
- **任务目录**：`specs/<prefix>-<slug>/`，intent 时创建，全流程所有制品同目录。`specs/` 根名不动（上游 speckit 契约：`che paths` 的 `FEATURE_DIR`、`setup-plan`/`setup-tasks` 落盘位置）。
- **slug**：任务的稳定句柄，永不变形。目录前缀可变（见命名规则），slug 从目录名剥前缀解析。
- **路径是 CLI 的输出**：agent 只传 slug 与 session id，绝不传路径。

## 目录布局

```
specs/001-user-auth/                ← 任务目录，intent 时创建；推送后 git mv 为 NCW-4921-user-auth
├── metadata.json                   ← 阶段 runs 时间线（随任务提交）
├── intent.md                       ← 从 docs/intents/{slug}.intent.md 迁入
├── expectations.md                 ← 从 docs/expectations/{slug}.expectations.md 迁入
├── intentguard.briefing.md         ← 从 docs/intents/ 迁入
├── intentguard.checker.txt
├── planverify.briefing.md
├── planverify.checker.txt
├── spec.md / design-tasks.md / plan.md / tasks.md / research.md / data-model.md / quickstart.md / contracts/
```

全局产物不迁：`docs/adr/`（语料）、`docs/GLOSSARY.md`、`specs/pingcode-mapping.json`（跨任务登记表，保留）、`docs/compound/`、`docs/patterns/`、`docs/corrections/`。

## 命名规则

| 状态 | 目录名 | 例 |
|---|---|---|
| 未推送 PingCode | `{序号}-{slug}`，序号 3 位零填充，扫描现有最大值 +1 | `001-user-auth` |
| 已推送 PingCode | `{pingcode-identifier}-{slug}`，如 `NCW-123` 形态 identifier | `NCW-4921-user-auth` |

- 一律无时间戳。
- **推送时改名**（specstoissues 末尾 `git mv` + 同步 mapping.json 目录引用字段）。本地序号只承担推送前的临时唯一性，推送后由全局唯一的 PingCode ID 接管，跨 clone 序号冲突天然消解。
- slug 剥离正则（CLI 独家执行）：先试 identifier 模式 `^[A-Za-z][A-Za-z0-9]*-\d+-`，再试序号 `^\d+-`；两种前缀都唯一解析出 slug，`NCW-123` 内部连字符与 slug 分隔符无歧义。
- slug 唯一性由 CLI 在创建时强制（同 slug 两目录会让绑定解析歧义）。

## 状态模型：两层文件

### `.che/feature.json` → session 映射（gitignored，纯本地）

```json
{
  "bindings": {
    "<session-id>": { "slug": "user-auth", "bound_at": "2026-10-26T10:00:00Z" }
  }
}
```

- 一 session 一条，重绑覆写。值存 **slug 不存路径**——路径随改名失效，slug 现场解析 rename 透明。
- 三人接力 = 三台机器各自的本地文件各有一条指向同一 slug，互不同步（session id 各机不同，同步无意义）。
- `.che/` 的 gitignore 策略：`feature.json` 忽略；`config.yml`（门禁开关，项目级共享）提交。

### `specs/<dir>/metadata.json`（随任务提交）

```json
{
  "slug": "user-auth",
  "created_at": "2026-10-26T10:00:00Z",
  "runs": {
    "intent":  [{ "start": "2026-10-26T10:00:00Z", "end": "2026-10-26T10:25:00Z" }],
    "specify": [{ "start": "2026-10-26T14:00:00Z", "end": "2026-10-26T14:40:00Z" }],
    "plan":    [{ "start": "2026-10-27T09:00:00Z", "end": null }]
  }
}
```

- **只存不可推导的**：阶段 runs（start/end 对，墙钟，含人等闲置——如实标注为「流程跨度」非「纯工时」）。多 run 数组表达返工与断续会话；`end: null` = 进行中。
- **阶段、下一步、可选项一律不存储**：阶段 = 工件存在性推导（`che check` 引擎）；下一步/可选项 = 阶段的纯函数（9 阶段表 CLI 内置）。杜绝双事实源 drift。
- metadata 含人名级墙钟但不含机器身份（无 session id），随任务提交供接力三方互见。

## session 绑定与解析序

**session id 由 agent 经 CLI 参数传入**（bash 拿不到 agent 会话身份，CLI 不自行感知）：

```
che task create <slug> --session <id>     # 创建：分配序号 + slug 查重 + 建目录/metadata + 绑定
che feature bind <slug> --session <id>    # 重绑/换绑（同 session 覆写）
che feature bind --clear --session <id>   # 解绑
che paths --session <id> [--json]         # 读路径（或 CHE_SESSION_ID env；arg > env）
```

**解析序**：`--feature <slug>` 参数 > `CHE_FEATURE_DIRECTORY` env > session 绑定 > 歧义列表报错。

- 未绑定 + 单任务在飞 → 静默命中唯一候选；
- 未绑定 + 多任务在飞 → 报歧义列表（slug + 目录 + 推导阶段），agent 转问用户，不猜；
- 拿不到 session id 是**合法态**（各端 harness 不一定暴露），靠 `--feature` 兜底；
- 绑定 slug 解析不到目录（被删/改名后 slug 变）→ 报错列出现有任务。

## 阶段表（CLI 内置，推导引擎用）

intent → expectations → specify → clarify / design（涉 UI）→ plan → tasks → gapfill → planverify → intentguard → writeback → implement

每阶段的可选项（design 跳过条件、pingcode 建卡、adr-draft 等）沿 flow SKILL.md 现行表，阶段表改动 = CLI + 技能同步（本来就是 fork port 面）。

## 门禁变化

| 门禁 | 旧 | 新 |
|---|---|---|
| require-intent | 全局 `docs/intents/` 任意 `*.intent.md`；已登记特性按 slug 校验 | 绑定任务目录内 `intent.md` 存在且 slug 与绑定一致 |
| planverify-gate | `docs/intents/<slug>.planverify.md` | 任务目录内 `planverify.checker` 的 verdict（路径常量改任务目录） |

## 迁移面

- **CLI**：task create、feature bind、解析序重写、planverify-gate/intentguard 路径常量、slug 剥离正则、`test-che-cli.sh` 指针契约重写为 session 映射 + 任务创建契约。
- **技能**：intent（创建 + 绑定）、specstoissues（推送改名步）、require-intent / flow（门禁与 slug 叙述）重改；specify / plan / tasks / implement / analyze / converge / clarify / design / grill×2 / adr-check / adr-draft 路径引用跟随。全部属于「上游升级需 port」的 fork 段。
- **存量**：无。旧 timestamp 目录格式不再支持，clean cutover。

## 决策记录

| # | 决策 | 理由 |
|---|---|---|
| 1 | session 绑定走 CLI 传参，agent 不直写文件 | 写路径收口 CLI 与 pack「判定逻辑内联 CLI、技能薄封装」方向一致；字节契约/幂等/并发规则单点维护；契约测试可确定性驱动 |
| 2 | 绑定存 slug 不存路径 | 推送改名杀路径不杀 slug；路径推导归 CLI |
| 3 | 推送时改名 | 目录名始终忠实反映状态，PingCode ID 进名 = 主链路免查 mapping |
| 4 | 阶段推导不存储，metadata 只存 runs | 工件存在性已是事实源，存储必 drift |
| 5 | PingCode identifier（NCW-123 形态）作前缀 | 人眼可追踪；正则消歧连字符 |
| 6 | 序号 3 位零填充 | 字典序 = 创建序，溢出自然进位 |
| 7 | 阶段表进 CLI 硬编码 | 表稳定；避免又一处技能/数据同步浮点 |
