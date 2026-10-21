# 服务与数据源映射（名称对号总表）

排查入口是用户的口头名称："中台财务"、"货运系统"、"开放平台"、"TMS"。本文件负责把口头名称对号到：**哪个环境 → Loki 的 namespace/app → 哪个数据库**。对号由排查者（你）完成，不向用户索取；清单没有的按"自助发现"补齐，补齐后回填本文件，让缓存越用越准。

## 名称对号总表

约定：namespace/app 为实测值；"uat 集群"含 `-dev`/`-test`/`-auto` 变体，按用户实际指的环境选。中台各服务库在当前挂载的 MySQL 实例中均不可见（见"数据库"一节），DB 列只写实测可见的。

| 口头叫法 | app | 生产 | UAT 集群 | 漳州 | 数据库（实测可见） |
| --- | --- | --- | --- | --- | --- |
| 网运通 / 货运 / freight（SaaS 生产 + 漳州私有化） | `freight-service-backend`（前端 `freight-web-admin/platform/shipper`） | `freight-prod` | `freight-uat` | `freight-zhangzhou`、`freight-zhangzhou-stg` | prod `freight`；uat `freight`；漳州 `freight` |
| 中台·资金/财务 | `newchiwan-finance`（伴生 `newchiwan-finance-syn`、`newchiwan-financial-credentials`） | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 中台·交易/订单/运单/账单 | `newchiwan-trade`、`newchiwan-source-trade` | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 中台·支付/发票/保理/ETC/积分/协议 | `newchiwan-payment`、`newchiwan-invoice`、`newchiwan-factoring`、`newchiwan-etc`、`newchiwan-integral`、`newchiwan-agreement` | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 中台·会员/风控/监控 | `newchiwan-member`（`-edge`）、`newchiwan-risk`（`-bff`）、`newchiwan-monitor` | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 中台·认证/基础服务/系统 | `newchiwan-auth`、`newchiwan-base-provider`、`newchiwan-system` | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 中台·其他域（工作流/生态/IoT 等） | `newchiwan-flow`、`newchiwan-engine`、`newchiwan-ecosphere`、`newchiwan-iot`、`newchiwan-bcdt` 等 | `newchiwan-prod` | `newchiwan-uat` | — | 未挂载 |
| 开放平台（对外推送出口） | `open-plat-backend` | `paas-prod` | UAT app 全集存在，namespace 归属直查确认 | — | uat `open_plat_dev` |
| 开放平台网关 | `open-platform-gateway`（UAT 另有 `newchiwan-open-plat-gateway`、`platform-gateway`） | prod 集群实证在 `newchiwan-stg`；prod 主体归属直查确认 | `newchiwan-uat` | — | — |
| open-api-bff（网关承接 + 推送组装） | `open-api-bff` | `paas-prod`（主体归属待确认；`newchiwan-stg` 实例已实证） | UAT app 全集存在 | — | — |
| 登录/统一认证 | `iam-user`、`iam-idp-backend`（`iam-gateway`、`iam-idp-frontend`） | `iam-prod` | `iam-uat`、`iam-dev` | — | uat `iam_user`、`iam_user_zk` |
| 调度 | `dispatcher`（`dispatcher-app-bff`） | `dispatcher-prod` | `dispatcher-test` | — | — |
| 智能调度 | `intelli-trans-dispatch` | `intelli-prod` | `intelli-uat` | — | uat `intelli_dispatch` |
| TMS3 运输管理 | `tms3-backend`（前端 `tms3-web`、`tms3-h5`、`tms3-platform-web`、`tms3-operate`） | `tms3-prod`、`tms3-stg` | `tms3-uat`、`tms3-dev`、`tms3-auto` | — | uat `tm_core`、`tm_base`、`tm_user`、`tm_report`、`tm_third_finance`、`tm_third_sap`、`tm_user_auto` 等 `tm_*` |
| TS 产品线（FMS/CRM/HRM/AMS/CLS/RMS/监管/ OBS/安防） | `ts-fms`、`ts-crm`、`ts-hrm`、`ts-ams`、`ts-cls`、`ts-rms`、`ts-regulatory`、`ts-obs`、`ts-security`、`ts-platform`、`ts-ams`、`ts-fms-bff`、`ts-open-platform`（前端 `ts-frontend-*`、`ts-h5`） | `ts-prod` | `ts-uat`、`ts-dev`、`ts-auto` | — | uat `ts-fms`、`ts-hrm`、`ts_ams`、`ts_bms`、`ts_cls`、`ts_invoice`、`ts_obs`、`ts_platform`、`ts_regulatory`、`ts_rms`、`ts_security`、`standard-fms` |
| 油品 | `oils-backend`、`oils-device`、`oils-home`（前端 `oils-applet-h5`） | `oils-prod`、`oils-stg` | `oils-test` | — | — |
| 数据平台 | `dp-api`、`dp-dw-backend`、`dp-tracking`、`dp-rw-udf`、`dp-bi-*`、`nlog-receiver`、`flink-cdc-*` | `dp-prod` | `dp-dev` | — | prod `dp_bi`；uat `dp_bi`、`dp_ds`、`dp_std_data`（及 `_standby`/`_taurusdb`） |
| PaaS（位置/轨迹/地址） | `paas-backend`、`paas-location`、`paas-track`、`paas-amap`、`paas-address-picker-web` | `paas-prod`、`paas-stg` | `paas-uat`、`paas-dev` | — | 无独立 stg 库：paas-stg 与 prod **共用数据库**，查 prod 实例 |
| NEWIS | `newis-system`（前端 `newis-web`） | `newis-prod` | — | — | — |
| zkenergy | `ts-frontend-crm-zkenergy` 等 | `zkenergy-prod` | `zkenergy-dev` | — | uat `crm_customer_zkenergy`、`iam_user_zk` |
| 各端 BFF 聚合层 | `driver-app-bff`、`cargoowner-web-bff`、`operator-app-bff`、`operator-web-bff`、`platform-web-bff`、`base-bff`、`capacity-partner-app-bff`、`newchiwan-open-bff`、`newchiwan-risk-bff` | `newchiwan-prod` 等 | 同 | — | — |
| 各端网关 | `cargoowner-gateway`、`driver-app-gateway`、`operator-gateway`、`platform-gateway` | — | `newchiwan-uat` 等 | — | — |
| Workflow 引擎（中间件） | `temporal` | `temporal`、`temporal-tms3-prod` | `temporal`、`temporal-tms3-dev` | `temporal-zhangzhou` | — |
| 前端 H5/Web（`*-web*`、`*-h5`、`*-frontend-*`、`app-view` 等） | 同名 app | 各产品 namespace 均有 | 同 | `freight-zhangzhou` | — |

**Namespace 命名规则**：`{产品前缀}-{环境后缀}`——生产 `xxxx-prod`、UAT `xxxx-uat`、stg `xxxx-stg`（跑在生产集群）；漳州例外用地名后缀（`freight-zhangzhou`、`temporal-zhangzhou`）。知道产品名和环境就能拼出 namespace 候选，再用 `{namespace="..."}` 直查验证。上表 app → namespace 归属：来自 2026-09-20 与 2026-10-14 实测扫描；只出现在集群 app 全集、未逐一直查归属的（如 `newchiwan-payment`），按命名规律写入并标注，拿不准就单独直查一次。

## 各环境 namespace 全集（2026-10-14 实测 label values）

### 生产集群（loki-ncw-prod）

业务 namespace：`freight-prod`、`newchiwan-prod`、`newchiwan-stg`、`paas-prod`、`paas-stg`、`iam-prod`、`dispatcher-prod`、`intelli-prod`、`tms3-prod`、`tms3-stg`、`ts-prod`、`oils-prod`、`oils-stg`、`dp-prod`、`newis-prod`、`zkenergy-prod`、`cubejs-prod`、`temporal`、`temporal-tms3-prod`。

**stg namespace 混在生产集群里**（实测归属）：

| namespace | app | 实测时间 |
| --- | --- | --- |
| `newchiwan-stg` | `open-platform-gateway`、`open-api-bff`（09-24 案例）、`gantry`、`newchiwan-shipper-web3`、`newchiwan-platform-web3` | 2026-10-14 |
| `paas-stg` | `paas-backend`、`paas-location` | 2026-10-14 |
| `oils-stg` | `oils-backend`（日志量极大） | 2026-10-14 |
| `tms3-stg` | `tms3-backend`（低频）、`tms3-web` | 2026-10-14 |

排查生产问题时的纪律：查询选择器明确写 `namespace="xxx-prod"`，不要用 `namespace=~".*prod.*"` 这类宽松正则把 stg 卷进来；stg 日志不能当生产证据。

环境定性：正式的 stg 环境只有 **paas-stg**（paas 的 stg，服务独立部署但与 prod 共用数据库——写操作直接落在生产数据上）。`newchiwan-stg`/`oils-stg`/`tms3-stg` 是集群中实测存在的 stg namespace（`newchiwan-stg` 曾实证消费 prod MQ 造成重复推送，见 cross-service.md 案例后续），是否算独立维护的环境以排查时验证为准。

### UAT 集群（loki-ncw-uat）

业务 namespace：`freight-uat`、`newchiwan-uat`、`newchiwan-dev`、`iam-uat`、`iam-dev`、`tms3-uat`、`tms3-dev`、`tms3-auto`、`ts-uat`、`ts-dev`、`ts-auto`、`oils-test`、`paas-uat`、`paas-dev`、`dispatcher-test`、`intelli-uat`、`zkenergy-dev`、`multica-dev`、`temporal`、`temporal-tms3-dev`。其余为 devops/基础设施（cd-dev、fe-dev、sonarqube、nexus、yapi、dependency-track、devsecops-dev 等）。

注意 `-dev`/`-auto` 与 `-uat` 并存：用户说"测试环境"时通常指 `-uat`，但开发自测问题可能落在 `-dev`——先确认。

### 漳州集群（loki-ncw-zhanzhou，私有化）

`freight-zhangzhou`（freight-service-backend + 前端 freight-web-*）、`freight-zhangzhou-stg`（staging）、`temporal-zhangzhou`；其余为基础设施（apisix/nacos/tdengine/tempo/loki/monitoring/xxl-job）。漳州只部署 freight 系。

## 数据库（2026-10-14 实测 SHOW DATABASES）

MySQL 数据源按实例挂载，**实例可见的库有限**；"没挂载"≠"库不存在"，只说明这条证据路径当前走不通。paas-stg 没有独立数据库，与 prod 共库——查 paas-stg 的数据直接用 prod 实例，同时注意 stg 的造数/测试会真实写入生产库。

| 数据源 | 实测可见的业务库 | 边界 |
| --- | --- | --- |
| prod（mysql-ncw-prod-freight） | `freight`、`dp_bi`、`newchiwan_bcdt` | **中台核心业务库（交易/资金/会员等）不在任何已挂载实例**。需要中台 DB 证据时：向用户声明缺口，证据改走日志 + 请对方按单号核实 |
| UAT（mysql-ncw-uat-freight） | 大共享实例：`freight`、`freight_model1`、`iam_user`、`iam_user_zk`、`intelli_dispatch`、`ts_*`（fms/hrm/ams/bms/cls/invoice/obs/platform/regulatory/rms/security）、`standard-fms`、`tm_*`（core/base/user/report/third_finance/third_sap）、`tpl_*`（order/finance/sap/user）、`crm*`、`open_plat_dev`、`newchiwan_report`、`finance_subsystem`、`dp_bi/dp_ds/dp_std_data*`、`flowable`、`oa`、`sync` 等 | 中台 newchiwan_trade/finance 同样不可见；uat 实例可写，改数前先向用户确认 |
| 漳州（mysql-new-zhanzhou-freight） | `freight` | 只读 |

每次使用前以 `SHOW DATABASES` + `information_schema.tables` 实测为准；发现新挂载或新库随手回填本表。

## URL 前缀 → 服务映射

开放平台对外 API 由 **open-api-bff** 承接（经 open-wyt/openuat 网关），再经 nacos 服务发现转发到各域服务；对外推送则由 open-api-bff 订阅组装后经 **open-plat-backend** 出口。前缀是判定"调的是谁"的第一线索：

### 开放平台对外（外部系统经网关调用中台）

| URL 前缀 | 承接 | 下一跳 |
| --- | --- | --- |
| `/v3/finance/pay/*`（含 `receive-bill`） | **open-api-bff** | → **newchiwan-trade** |
| `/v2/finance-platform/*`（pre-account/account/transaction/user/account-books） | **open-api-bff** | → newchiwan-finance（预付账户/财资域） |
| `/v3/tradeBill`、`/v3/trade-bargain`、`/v3/source` | **open-api-bff** | → newchiwan-trade |
| `/v2/orders`、`/v2/freight-sources`、`/v2/drivers`、`/v2/operators`、`/v2/contract`、`/v2/credit`、`/v2/insurance` 等 | **open-api-bff** | 各域服务 |
| `/cash-acount/*`（现金账户/提现/绑卡） | **open-api-bff** | → newchiwan-finance |

### 中台域服务对外路径特征（网关/BFF 转发目标）

| 路径前缀 | 服务 | 说明 |
| --- | --- | --- |
| `/order`、`/waybill`、`/waybillStep`、`/freightSource`、`/tradeBill`、`/sourceGroup`、`/v3/orders`、`/v3/freight-sources`、`/v3/bill/*`、`/v3/finance/pay/*` | **newchiwan-trade** | 交易/订单/运单/账单全量路径；`/v3/finance/pay/receive-bill/{memberId}/{channel}/{payType}` 是 open-api-bff 受理后的真正记账入口 |
| `/v2/finance-platform/*`、资金流水查询 | **newchiwan-finance** | 资金/财务域（推送链取流水走这里） |
| `/risks`、`/v2/risks` | **newchiwan-risk** | 风控 |

### 中台 → 外部系统的推送入口（freight 实例）

| 路径 | 承接 | 说明 |
| --- | --- | --- |
| `POST /callback/newchiwan/data-push` | freight-service-backend | freight 的开放接口（中台推送入口），由 open-plat-backend 实际调用，密文；入口首行日志"收到Newchiwan数据推送"凡到达必有。其他外部系统的接入形态以各自实证为准，回填本节 |

### freight 库表（freight 专属实证样例，2026-09-24 鲁GW6321 车辆类型缺失排查）

| 表 | 内容 |
| --- | --- |
| `freight.vehicles` | 车辆主表；注意 `type_code` 存的是行驶证"车辆类型"**文字**（如"重型半挂牵引车"），不是监管代码集代码 |
| `freight.documents` + `freight.vehicle_documents` | 证件 JSON（`information`/`confirmed`）；行驶证 `information.vehicleType` = 监管代码集代码（Q11/H12），`typeCode` = 行驶证原文文字 |
| `freight.supervision_report` | 监管上报（report_type=ORDER/VEHICLE/DRIVER/FLOW…，`check_result`+`failure_reason`+`data_snapshot` JSON） |
| `freight.supervision_pre_check_rule` | 上报预检规则（NOT_NULL/ENUM 等，失败消息由 check_item_name + check_rule_name 动态拼接） |

车辆上报数据链：中台推送 → `POST /callback/newchiwan/data-push` → `NewchiwanOrderSyncServiceFacade.doSyncDriverVehicleWaybillAndSupplementaryDocuments`（日志行 `doCreateNewchiwanVehicle` 带完整推送 vehicle payload，kv 展开）→ `SaveNewchiwanVehicleCommand`（payload `drivingLicense.vehicleType`→文字、`drivingLicense.vehicleTypeCode`→代码）；监管侧 `SuperVisionInitSubscriber` 按运单/车辆/司机/流水初始化并预检。监管上报车辆类型代码取 `FJVehicleSettlementStrategy`：`firstNonBlank(行驶证 information.vehicleType, 道路运输证 information.vehicleType)`。

## 从问题语义到服务与数据面（agent 自行判断，不问用户）

用户只会描述现象（"流水没同步"、"支付卡住"、"回调没收到"、"最近错误变多"），把现象翻译成具体服务、namespace/app、表名是排查者（你）的职责，路径按序：

1. **名称对号总表**：先查上面已实证的条目（口头名称 → app/namespace，URL 前缀 → 服务）。
2. **数据源自助发现**：Loki 按 label 发现（方法见下）；MySQL `SHOW DATABASES` + `information_schema.tables` 按业务关键词找表。

两条路径走完仍无法锁定目标服务/表时，向用户提问——附上你尝试过的路径和候选清单让用户指认。提问是自助发现穷尽后的出口，不是默认动作。

按问题类型的推断起点（freight 实证样例，其他系统按"先查该系统主表状态字段"的同一思路套用）：

| 用户描述的现象 | 数据面起点 | 写入链路 |
| --- | --- | --- |
| "XX 流水没同步/对不上" | `account_flows`（有无、方向、金额） | 本地 Temporal workflow 或中台推送 subscriber（见 cross-service.md 的自发 MQ 自订阅模式） |
| "支付卡住/状态一直不变" | `bill_transactions`（状态机 + flow_no/paid_at）、`payable_bill_details` | 支付策略（PaymentStrategy）+ 推送链回填 |
| "代收/打款记录缺失" | `waybill_collection_logs`、`waybill_payment_logs` | 中台推送 → subscriber 落库 |
| "订单状态不对" | `waybills` 主表 → 顺着状态字段找关联表 | 领域事件 |
| "结算信息金额不对/为负"（运营端列表） | `waybill_bills`(PAYABLE).handled/unhandled 与 `waybill_bill_details`(DRIVER_RECEIVABLE) 对照——主表被重复累加而明细未动即推送重复污染 | 中台推送 account.sync.transaction（撮合分支无幂等，见 cross-service.md 案例后续） |

其他系统的表结构按同一方法自助发现：`SHOW DATABASES` → `information_schema.tables` 按业务关键词 → `SHOW COLUMNS`；中台各 app（trade/source-trade/member/risk/system/base-provider 等）的精确业务域按名字推断起步，用"拉 1 条最近日志看内容"或"查 1 条数据看结构"快速验证，推断错了换下一个候选，成本很低。

## 已知不确定点（排查时按需核实，不阻塞、不问用户）

- ~~`freight-prod` 24h 无日志~~ 已解除：2026-10-14 实测 stream 存活（~1000 行/h，单副本）。对任何"疑似没日志"的 stream，用 `count_over_time({namespace,app}[24h])` 一次判活。
- 开放平台网关生产形态：prod 集群同时存在 `paas-prod/open-plat-backend` 与 `newchiwan-stg/open-platform-gateway`（stg 实例已实证），UAT 是 `newchiwan-open-plat-gateway`——三者角色对应关系排查时用日志内容验证。
- `open-api-bff` 生产主体 namespace 归属待确认（`paas-prod` 推断；`newchiwan-stg` 实例已实证）。

本清单由排查者维护：排查中自助发现的新服务/新表/新映射，随手按上面表格的格式回填（注明来源），让清单越用越全。

## 自助发现方法

### Loki：发现 namespace 和 app

```
1. 列出目标环境集群的所有 namespace：
   get_loki_label_values(label="namespace")
2. 按业务归属筛选（k8s namespace 通常带环境/产品前缀，如 freight-zhangzhou、newchiwan-prod）
3. 注意：label values 是集群全局的——get_loki_label_values(label="app")
   返回整集群所有 app，不能直接得出"这个 app 在目标 namespace"；
   归属确认用 query_loki 拉 stream 元数据：
   query_loki(query='{namespace=~"ns-a|ns-b"}', start="now-24h", limit=500, max_per_line=1)
   （从返回的 stream.app 收集；正则多 namespace 扫描会被 limit 截断，
   低流量 stream 会被高频 stream 挤出结果——重要 namespace 无返回时，
   必须用 {namespace="..."} 单独直查确认，不能凭扫描缺失断定"停用"）
4. 拿不准哪个 app 时，各拉最近 1 条日志看内容
```

低频服务 1h 窗口可能扫不到，放大到 24h；只想确认"有没有"用 `count_over_time({...}[窗])` instant 查询，返回还带 namespace/app 元数据，一举两得。没有 label 工具权限（401）时，直接用名称对号总表的已知约定试探 query。

### MySQL：发现库和表

```sql
-- 所有业务库
SHOW DATABASES;
-- 跨库找表
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_name LIKE '%waybill%' OR table_name LIKE '%flow%';
-- 看结构
SHOW COLUMNS FROM `表名`;
```

库不在任何已挂载实例里时，如实向用户声明"该服务的数据库未挂载，DB 证据走不通"，不要在错误的数据源里碰运气。

### 判断"这个系统部署在哪"

先从用户描述反推，按序：描述里的环境词（"漳州/私有化"→生产大类漳州集群，"生产/线上"→prod 集群，"UAT/测试"→uat 集群）；报错域名（`.newchiwan.com` 的 open/openapi/plat 网关 = 开放平台中台，在 prod 集群；`api.fjzwiot.com` = 漳州入口网关）；单号/业务对象格式（哪个产品的单据）；当前所在项目（项目目录对应的服务系，仅弱信号）。用户说"漳州环境"、"中台财务服务"这类话时，环境和系统信息其实已经在句子里了——名称对号总表直接给出 namespace/app/库。

只有描述里完全没有环境/系统信号、且不同环境的查法实质不同时，才向用户确认一句业务事实（"这个问题是发生在生产还是测试？"）。namespace/app、表这类技术映射优先自己解决；映射清单和自助发现都穷尽后仍无法确定的，同样可以向用户提问——附上候选和你排除的理由。
