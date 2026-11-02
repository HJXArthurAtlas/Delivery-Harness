---
schemaVersion: 0.2.0
id: "0004"
title: "外部 HTTP 与对象存储 IO 禁止进入数据库事务"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, transactions, performance, resilience]
scope: component
reversibility: two-way-door
blastRadius: team
relatesTo: ["0001", "0003"]
affects:
  - type: path
    pattern: "services/**/application/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:36:40Z
---

# ADR-0004：外部 HTTP 与对象存储 IO 禁止进入数据库事务

## 背景

本决策适用于编写或 review 应用服务层涉及外部 HTTP 调用（第三方 URL 下载、外部接口请求）或对象存储（OBS）IO 的代码，目的是给数据库事务划定一条不允许外部 IO 进入的硬边界。

`@Transactional` 划定的事务内一旦触发外部 IO，数据库连接在整个外部调用期间被占用。外部 IO 耗时不可控（慢速 URL、对象转存），并发场景下每个事务可持连接数十秒，连接池耗尽，并放大锁竞争与长事务风险。问题是结构性的：不加边界规则，任何后续在事务性应用服务里「顺手」加外部调用的改动都会复发，逐案例修补不可持续。

本仓后端子项目尚未落地（见 ADR-0001，事务边界固定声明在 ApplicationService/Service）；在首个模块开工前固化这条边界，成本为零。

## 决策

- **应用服务中，外部 HTTP 调用与对象存储（OBS）IO 禁止写在数据库事务里面**——不得出现在 `@Transactional` 方法或 `TransactionTemplate` 事务单元的执行路径上。这是设计前提，不是等 review 修正的整改项。
- 合规落位：外部 IO 在无事务的入口方法完成（快照读取、HTTP 下载、对象转存），仅把结果数据交给事务单元完成全部数据库写入。

```text
入口方法（无 @Transactional）
├── 快照读取、外部 HTTP 下载、OBS 转存    ← 外部 IO 全部在此
└── 事务单元（@Transactional 方法 / TransactionTemplate）
    └── 全部数据库写入，无任何外部 IO
```

- 失败语义在事务外决定（如单次下载/转存失败记录告警、沿用旧值、不阻断同批其余项）——与调用方消费结果的位置一致。
- 事务单元内不得出现任何 HTTP 客户端 / 对象存储客户端调用；「事务内 HTTP/OBS 调用」是标准违规项。
- 双重执行点：(a) implement 阶段，编码与任务拆分时本边界为设计前提；(b) code-review 阶段，作为标准违规项拦截，是第二道防线而非唯一手段。

## 备选方案

### 方案 A：外部 IO 与数据库事务分离（本记录，选定）

| Dimension | Assessment |
|---|---|
| 连接占用 | 事务时长只含数据库操作，连接池行为可预测 |
| 失败语义 | 在事务外决定，与调用方消费位置一致，「跳过失败项继续」可表达 |
| 代价 | 服务需拆分入口方法与事务方法，结构略复杂 |

### 方案 B：允许外部 IO 写在事务内（便利写法）

**Pros:** 代码顺序直观，一个方法写完整个用例。
**Cons:** 事务期间连接被外部 IO 占用，并发下连接池耗尽、锁竞争与长事务放大；外部 IO 失败回滚整个用例，「跳过失败项继续」类语义无法表达。

### 方案 C：事务提交后再执行外部 IO（事件 / Outbox 模式）

**Pros:** 事务边界最干净，外部 IO 可补偿重试。
**Cons:** 需要事务性 Outbox / 本地消息表与后台执行器，首个模块前基础设施成本高；失败语义移入异步链路，排障复杂。列为 Revisit 方向，不作现状要求。

### 方案 D：Do nothing（不定规则）

外部调用「顺手」写进事务方法，问题以连接池告警形式在并发下才暴露，且症状远离违规点，定位成本高。

## 权衡

- 事务回滚后，已转存的对象成为孤儿文件；该损失在「外部 IO + 事务」组合下天然存在，本规则不消除也不加重。
- 事务外预读的快照与事务内写入之间存在竞态窗口（同一实体并发推送）；消除它需把外部 IO 结果传入事务并放弃快照重读，会扩大窗口，权衡后接受。
- 外部 IO 与落库不再是原子的：IO 成功但落库失败时，第三方侧认为已同步而本地缺失数据；依赖上游重试 / 重推语义缓解。

## 后果

- Easier: 连接池时长可预测；新外部调用点有明确放置规则；单测可以无数据源直通事务单元（mock `PlatformTransactionManager`）。
- Harder: 应用服务需要拆分入口方法与事务方法；reviewer 需警惕「顺手」把外部调用挪回事务路径。
- **何以为错：** 生产日志出现连接池等待/超时（HikariCP `connection is not available` 类）且耗时事务堆栈中含 HTTP/OBS 调用，即边界被破坏或规则不足。
- Revisit if: 引入事务性 Outbox / 本地消息表使外部 IO 可补偿，届时统一收口为「事务提交后执行外部 IO」的事件模式（方案 C）。
- 合规验证：定位命令或依赖检查扫描事务性应用服务中的 HTTP/OBS 客户端调用；review 核对事务单元执行路径上无外部 IO。

## 行动项

1. [ ] 评审：确认本仓后端采用 Spring 声明式 / 编程式事务（`@Transactional` / `TransactionTemplate`），本规则的「数据库事务」指这两者划定的边界。
2. [ ] 核对 affects 路径模式（后端子项目落地时与实际布局对齐一次，对齐 ADR-0001 同类行动项）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（规则本体保留在本记录，不设第二份副本）。
