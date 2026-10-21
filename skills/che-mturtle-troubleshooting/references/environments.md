# 环境模型与工具映射

## 环境总览

新赤湾的服务分散在三套环境集群，**选错环境是排查中最常见也最致命的错误**——查了半天空气，结论全错。第一层区分是**生产 vs 测试（UAT）**：prod 集群与漳州（私有化）同属生产大类，都按生产纪律对待；uat 集群是测试大类。

| 环境 | 含义 | 需要的数据源 | 备注 |
| --- | --- | --- | --- |
| prod 集群 | **新赤湾全公司所有服务的生产环境** | Loki + MySQL（只读） | 中台各服务、开放平台、各产品线都在这里 |
| uat 集群 | UAT 环境 | Loki + MySQL（可写） | 另有 TDengine 时序库工具；集群内混有 `-dev`/`-test`/`-auto` namespace，不是都算 UAT |
| 漳州集群（zhanzhou） | **私有化部署**生产环境，目前承载网运通（freight）系（含 `freight-zhangzhou-stg`） | Loki + MySQL（只读） | 只部署网运通系；私有化调用的中台接口不在漳州（见下节） |
| paas-stg | paas 的 stg 环境，部署在生产集群 | Loki（prod 集群）+ MySQL（走 prod 实例） | **没有独立数据库，与 prod 共库**——stg 的写操作直接落在生产数据上：日志不能当生产证据，数据影响是真实的 |

**Namespace 命名规则**（对号捷径）：`{产品前缀}-{环境后缀}`——生产 `xxxx-prod`、UAT `xxxx-uat`、stg `xxxx-stg`（跑在生产集群）；漳州例外用地名后缀（`freight-zhangzhou`、`temporal-zhangzhou`）。产品前缀即系统名（freight、newchiwan、paas、iam、dispatcher、intelli、tms3、ts、oils、dp…）。知道产品名和环境就能拼出 namespace 候选，再用 `{namespace="..."}` 直查验证；反过来从后缀判环境。UAT 集群另有 `xxxx-dev`/`xxxx-test`/`xxxx-auto` 变体，不算 UAT 本体。

各环境 namespace/app 的实测全集见 `service-map.md`——那是权威清单，本文件只讲工具怎么选、坑在哪。

日志和数据库通过 MCP 数据源工具访问，具体工具名以当前会话实际挂载为准。识别归属的方法：工具/集群名里带环境段（如 `zhanzhou` → 漳州、`prod` → 生产、`uat` → UAT）。首次使用先读该工具的说明拿参数格式。开始排查前必须确认目标环境的数据源齐备（见 SKILL.md 的前置检查节）；有缺就终止任务并告知用户，由用户决定如何配置——不要拿别的环境凑数。

**MySQL 是按实例挂载的**：每个数据源只看得到所在实例的库。prod 实例只有 `freight`/`dp_bi`/`newchiwan_bcdt`——中台核心业务库当前不可见，这是排查中台问题时必须声明的证据边界（实测清单见 service-map.md 数据库一节）。

## 跨环境调用（重点）

私有化部署（漳州）调用的"外部接口"**不在漳州**：开放平台网关（`open-wyt.newchiwan.com`，UAT 为 `openuat.newchiwan.com`）后面的中台服务跑在 **prod 集群**。

排查私有化系统的跨系统问题时，两个环境都要查：

- 私有化侧（收到什么、发了什么、落库没有）→ 漳州工具。
- 中台侧（推送有没有发出、打款有没有执行）→ prod 工具。

先在本侧把"我们这边收没收到"钉死，再决定要不要去 prod 查中台侧——这能避免一上来就面对中台的日志海。

## 连接陷阱（实证踩过的坑）

### 业务 Loki MCP 的 401

`query_loki` 工具的实现可能先调权限要求更高的管理接口再查询；当 MCP 凭据只有查询权限时，这一步就 401，**表现为所有查询都失败**。2026-09-20 漳州排查时踩过，用户修复 MCP 凭据后恢复。

处置顺序：

1. 看错误原文，确认 401 来自哪个接口——通常是权限要求更高的管理类接口，而不是查询接口本身。
2. 向用户报告"数据源凭据对该接口无权限，请恢复/修复"，并附错误原文。
3. 等待期间继续推进**数据库侧**的事实收集——排查不必被日志工具阻塞。
4. 不要反复重试，也不要临时换到别的日志数据源凑数——先确认那个数据源上确实有目标环境的业务日志。

### label 接口与 query 接口权限可能不同

`list_loki_label_names` 等 label 接口 401 不代表 `query_loki` 不可用——直接拿已知的 label 约定（见下）试探 query，能查就继续。

### label values 是集群全局的

`get_loki_label_values(label="app")` 返回整集群所有 app，**不能**由"这个 app 出现在 app 全集"推出"它在目标 namespace 有日志"。namespace/app 归属要么用映射清单，要么用 stream 元数据直查（`{namespace="..."}` 拉 1 条看 `stream.app`）。

## Loki label 约定与查询模式

label 约定全集群统一，以漳州 freight 为例（其他服务同样适用，namespace/app 换成对应值）：

- **业务日志的 stream 选择器**：`{namespace="freight-zhangzhou", app="freight-service-backend"}`
- 常用 label：`namespace`、`app`、`pod`、`service_name`、`container`
- 日志行内是结构化 kv（logback `kv()`）：业务单号、trace_id、transaction_no 都能直接文本过滤

查询模式速查：

```
按业务单号：   {namespace="...", app="..."} |= "D26091815534103938"
按 trace_id：  {namespace="...", app="..."} |= "6aaf708e5cf287fca16e47c2"
验证事件类型： {namespace="...", app="..."} |= "account.sync.transaction"
排除噪音：     ... |= "error" != "timeout"
统计出现次数： count_over_time({namespace="...", app="..."} |= "xxx"[15m])
判活一个 stream： count_over_time({namespace="...", app="..."}[24h])
```

**trace id 的覆盖与打通范围**：除漳州环境外，prod/UAT 的日志都带 trace id，且 newchiwan 系服务与开放平台之间已打通（极个别服务不统一）——跨服务问题拿到一个 trace id 就能跨服务串全链。漳州环境的 trace id 打通性不保证，以业务单号过滤为主。排查时优先引导用户提供 trace id（request id）。

时间窗与方向：

- `start`/`end` 接受 ISO8601 或 `now-1h` 相对时间。排查时**先宽后窄**：先用大窗口确认事件存在，再收窄看细节。
- `direction=forward` 按时间正序，适合还原时间线；`backward`（默认）适合看最新状态。

### 两个工具层限制（实测必撞）

1. **日志行默认被截断**：`max_per_line` 默认 100 字符，宽窗口命中多行时返回的行内容可能整段省略。看到行内容缺失时，缩小时间窗 + 减小 `limit` 重查，必要时 `max_per_line=0`（不限制）——不要基于被截断的结果下结论。
2. **单次查询约 30s 上限**：大时间窗 × 宽选择器会触发工具级超时（报错而非慢返回）。处置：缩小时间窗分段扫；只想确认"有没有/有多少"时用 `count_over_time(...[窗])` 的 instant 查询代替拉全量行。
3. **正则多 namespace 扫描会被 limit 截断**：高频 stream（如 oils-stg、cubejs-prod）会把低频 stream 挤出结果。重要 namespace 无返回时用 `{namespace="..."}` 单独直查——newis-prod、zkenergy-prod、cubejs-prod 都曾被扫描缺失误判为"停用"，2026-10-14 单独直查证实全部存活。

### 0 行结果的判读

"查询返回 0 行"有两种含义，混为一谈会得出假结论：

1. **查询窗或 stream 错了**：数据老化被清、label 拼错、时间窗没覆盖。验证：把选择器缩短到只剩 `{namespace, app}`、拉最近 1 条看时间戳。
2. **事件真的没发生**：stream 活着、窗口覆盖、文本标记也确认过（如 controller 入口日志），才能下"从未发生"的结论。

对照过成功样本的时间线后，0 行才最有说服力——例如正常单 4 秒闭环，异常单 6 小时 0 行，这就是"缺失"而非"延迟"。

## MySQL 使用要点

- 工具通常是只读 SQL（UAT 可写），直接 `SELECT`/`SHOW`/`information_schema`；改数前先向用户确认。
- **先 `SHOW DATABASES` 确认目标库在不在本实例**（各实例可见范围见 service-map.md）：不在就如实声明"该库未挂载"，不要在错误实例里碰运气。
- 不要假设业务表在默认 schema：用 `information_schema.tables` 跨库找表（`WHERE table_name LIKE '%flow%'`）。
- 时间字段优先用毫秒时间戳还是 datetime 以建表为准，先 `SHOW COLUMNS` 再写条件。
- 排查资金/流水类问题时，把关联表一次性查齐（主单、交易、流水、日志表），避免反复横跳。
