# 跨服务调用通道与推送链

新赤湾体系内服务独立部署、走 API 调用。用户问"这个接口调的是哪个服务"、"XX 为什么没同步过来"，回答依据是下面几条通道的归属知识（URL 前缀 → 服务的映射速查见 `service-map.md`）。

术语映射（对话与结论统一用这套叫法）：
- **"开放平台"** = **open-plat-backend**（生产在 `paas-prod` namespace）。它负责**实际调用外部系统的接口**——所有 newchiwan 对外的推送出口都在这里。
- **"开放接口"** = 外部系统侧暴露给中台的接口（freight 实证：`POST /callback/newchiwan/data-push`）。中台的推送（如 `account.sync.transaction`）打到外部系统的开放接口上。
- **open-api-bff** = 独立服务：对外承接网关转发来的 API；对内订阅域服务的消息、组装数据后交给 open-plat-backend 外推。

## 调用与推送通道全景

1. **外部系统 → 网关 → open-api-bff**：`*.newchiwan.com` 的 open/openapi/plat 网关域名（生产 `open-wyt`，UAT `openuat`）→ 网关流量由 **open-api-bff** 承接（受理语义的同步响应在这里返回），再经 nacos 服务发现转发到各域服务（newchiwan-trade / newchiwan-finance / newchiwan-member…）。
2. **中台内部服务直连**：域服务之间走 nacos 服务发现直接调用目标服务的接口，**不经过 open-api-bff / open-plat-backend**。
3. **newchiwan → 外部系统的推送**（异步，所有非 newchiwan 系的目标皆走此路径）：域服务**发 MQ** → **open-api-bff 订阅**该消息，在订阅处理里组装数据 → 调 **open-plat-backend 的 SDK** → **open-plat-backend 实际调用外部系统的开放接口**。

## 受理语义（资金接口的通用形态）

开放平台的资金类接口（如 `/v3/finance/pay/receive-bill`）是**受理语义**：同步响应只有 `message=success`、没有业务结果字段（没有流水号）。同步成功 ≠ 打款完成，真实结果靠异步推送回填。排查时把"受理成功但长时间无推送"作为异常点，而不是"受理失败"；对应的中间状态（如账单停在 PAYING、flow_no 为空）是预期内的暂态，不是根因本身。

## 对外推送链（以 account.sync.transaction → freight 为例）

**外部系统接收中台推送只有一条路径**（freight 实证；其他外部系统的入口路径与接入形态以各自实证为准，查清后回填 service-map.md）：中台调用外部系统的开放接口（freight 为 `/callback/newchiwan/data-push`）；进来后固定走"**自己发 MQ、自己订阅**"，所有事件类型皆然（不存在中台直接往外部系统 MQ 发消息的路径）。

中台侧的完整来源链（open-plat-backend 之前还有两级）：

```
newchiwan-trade 打款完成 → 发 MQ
  → open-api-bff 订阅消息，组装数据（从 newchiwan-finance 取资金流水等）
  → 调 open-plat-backend 的 SDK（MessagePublishApi.publish，event=account.sync.transaction）
  → open-plat-backend 实际调用 freight 开放接口：POST /callback/newchiwan/data-push（密文）
  → freight：解密 → 校验事件类型 → 自己发 MQ（freight_data_sync / account.sync.transaction）→ 自己订阅
  → subscriber 落 waybill_collection_logs → 业务事件 → account_flows 流水
```

排查"推送没到"时按链逐级定位：

| 断点 | 判定 |
| --- | --- |
| 域服务没发 MQ | 查该域服务（如 newchiwan-trade）的日志里业务完成事件 |
| open-api-bff 没订阅到/组装失败 | open-api-bff 的订阅与组装日志（报错或无记录） |
| open-plat-backend 没外推 | open-plat-backend 的外推日志；有 SDK 调用无外推 ⇒ 卡在最后一跳 |
| 目标系统没收到 | 目标系统开放接口的入口首行日志缺失 ⇒ 前面任一级断了，沿链向上查 |

目标系统侧入口首行必有日志仍是定责分水岭（入口路径与日志标记以该系统实证为准，freight 为 `/callback/newchiwan/data-push` + "收到Newchiwan数据推送"）：它缺失就能断定问题在目标系统之外（MQ 之后三级之一），再按上表向源头推进。同窗口对照一个无关事件的推送走通全链，可证明通道本身是活的。

## 跨服务串联利器：trace id

除漳州外，prod/UAT 日志都带 trace id，且 **newchiwan 系服务与开放平台之间 trace id 已打通**（极个别服务不统一）。跨服务排查时优先向用户引导提供 trace id（request id）：一个 id 可以在 open-plat-backend → 域服务 → open-api-bff → 外部系统（如 freight）的日志里各查各的、拼出完整时间线，比按单号在每段日志里反复对时间高效得多。

## 证据边界

- 对外调用的 HTTP 日志通常只有请求行和状态行（BASIC 级），响应体不落日志——结论里声明"响应体内容未落日志"，取证途径：接口文档 / 对方查单 / 临时加 DEBUG 日志。
- 开放平台内部转发到域服务的细节超出映射范围时，结论写"open-plat-backend 承接，内部路由需中台侧确认"，并给出可供对方查单的字段（appId、orderNo、时间点）。

## 完整案例（2026-09-20 漳州）

用户问：订单 `D26091815534103938` 平台→司机支付流水为什么没同步。

**发起链**：freight 调开放平台受理打款（`POST /v3/finance/pay/receive-bill`，open-api-bff 承接 → newchiwan-trade 记账），响应 success 无流水号，账单置 PAYING。

**推送链**：打款完成 → 域服务发 MQ → open-api-bff 订阅组装 → 调 open-plat-backend SDK → open-plat-backend 推送 freight 开放接口 → freight 自发 MQ → subscriber 落 `account_flows`。

**排查形状**：DB 钉异常形态（`bill_transactions` 卡 PAYING、flow_no 空）→ 成功单对照（4 秒闭环，有 flow_no）→ Loki 验证 `account.sync.transaction` 在 freight 侧 0 行（stream 存活 + 成功单对照 ⇒ 缺失非延迟）→ 同窗口无关事件推送对照证明推送通道活着 → 定责：中台侧从未发起这条推送，附 transaction_no 请对方核实出款状态；顺带发现 freight 侧对"SUCCESS 但无流水号"静默跳过、无补偿任务的代码缺陷，单独列出。

**案例后续（2026-09-24，同单号"司机结算 5900"新问题）**：上游三次推送的完整机制已实证——① 首推 13:35:19 被 freight 入口网关 `api.fjzwiot.com`（APISIX）**502 拒绝**（未达 freight），open-plat-backend 内部重试 62 分钟后 14:37:28 成功（打款到首推成功 62 分钟延迟即此）；② 第 2、3 次（15:25:10 / 15:42:32）由 **newchiwan-stg 的 open-api-bff** 消费同一条 prod MQ 消息（`topic_newchiwan_finance_account_transaction` 跨环境泄漏）触发，各自组装后调 prod open-plat 发布，故 messageId 各不相同。freight 侧 collection log 的 flowNo 幂等（BillTransactionWaybillSyncSubscriber）挡住了重复流水，但**撮合分支 `doSyncMatchmakingPayment`（SHIPPER_TO_DRIVER）没有幂等检查**（同文件 PLATFORM_TO_DRIVER / SHIPPER_TO_PLATFORM 分支都有）→ 每次推送经 `PayablePaymentCompletedEvent` → `updateWaybillPaymentStatus` → `updatePaidPricesById`（`handled += amount, unhandled -= amount` 原子累加、无守卫）→ 运营/企业端"司机结算信息"显示已收 5900 / 待收 -3800（真实应为 2100 / 0，`waybill_bill_details` 的 DRIVER_RECEIVABLE 明细未被动过可作对照）。资金无损：司机实收 1900+200 各一笔。教训：**flowNo 幂等必须覆盖全部推送分支**；重复推送已实证存在（上游泄漏 + 网关 502 重试都会造成），展示型汇总字段（waybill_bills.handled/unhandled）是最先暴露的受害面。bug 记录：`docs/bugs/settlement-duplicate-push/`。
