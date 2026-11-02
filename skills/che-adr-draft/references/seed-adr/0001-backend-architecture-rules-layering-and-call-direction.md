---
schemaVersion: 0.2.0
id: "0001"
title: "后端架构规则：分层与调用方向"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, architecture, ddd, layering]
scope: domain
reversibility: two-way-door
blastRadius: team
relatesTo: []
affects:
  - type: path
    pattern: "services/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:26:58Z
---

# ADR-0001：后端架构规则——分层与调用方向

## 背景

本决策适用于新增后端模块、规划应用/领域/基础设施分层与调用方向、以及 review 跨层依赖的场景，目的是把 DDD 分层结构的调用方向、各层职责和 mapper 私有性固化为可执行的绑定规则。

本仓后端子项目尚未落地。在首个后端模块开工前固化分层约定，可以避免出现平行体系、跨层依赖失控和约定漂移；审核通过前本记录不约束任何实现，通过后按正文约束 `services/` 下后端子项目。

## 决策

> **规范正文**：本文件是后端分层与调用方向的规范性标准，独立约束后端子项目的新增与 review 工作，承载操作级绑定规则（各层职责与调用方向细则、Service/事务规则、各端 mapper 私有性、新建 domain 归属判断）与高阶不变量（DDD 分层结构、严格调用方向与事件唯一跨域协作、新建 domain/module 必须事先经用户确认）。规则正文以此文件为准，无第二份需要同步的副本。

### 绑定规则

- 严格调用方向：Controller → ApplicationService|Facade；ApplicationService → Repository / frameworks / events；跨 domain 协作 ONLY 通过 `ApplicationEvent` + Subscriber。domain 永不依赖 interfaces/application/infrastructure；Facade 和 Subscriber 永不直接触 Repository 或 frameworks；`frameworks/` 永不承载业务流程。
- ApplicationService 使用具体类（无 interface+impl），例外仅限 Repository、第三方能力、策略扩展点。事务边界 ONLY 声明在 ApplicationService/Service 上。
- 各端 mapper 私有：`interfaces/<caller>/mapper/` 属于各端私有；跨端共享 mapper 与跨端 mapper 继承 PROHIBITED；跨端重复的映射逻辑默认接受。
- 仓库真实落点（实际目录形态、跨模块落位）见后端子项目的 `AGENTS.md`；各层职责与调用方向细则见本文件「绑定规则」与「深层分包速查」。

### 深层分包速查

```text
interfaces/<caller-or-scenario>/
├── *Controller.java
├── request/
├── response/
├── mapper/
├── facade/
├── exception/
└── subscriber/
```

- `*Controller.java`：HTTP 路由、权限、参数校验、调用 ApplicationService 或 Facade。
- `request/`：HTTP 入参 DTO。
- `response/`：HTTP 出参 DTO。
- `mapper/`：Request/Response 与 Command/domain/read model 之间的转换。
- `facade/`：接口层适配编排，只能引用 ApplicationService。
- `subscriber/`：接口层事件订阅或适配处理，不能承载核心业务规则。

#### 各端 mapper 存量处置

跨端共享与继承禁令见本记录「绑定规则」。存量处置约定：若项目已存在跨端共享 mapper（如 `interfaces/shared/mapper/`），一律冻结——不新增复用方、不扩展用途；新增映射逻辑一律落在各端自己的 `mapper/`。

```text
modules/<domain>/application/
├── *ApplicationService.java
├── command/
├── mapper/
├── pipeline/
├── *Assembler.java
└── <business-capability>/
```

- `*ApplicationService.java`：用例入口、事务边界、流程编排。
- `command/`：应用层入参对象。
- `mapper/`：应用层内部转换。
- `pipeline/`：复杂用例流程、执行器、注册器、orchestrator。
- `*Assembler.java`：应用层组装器。

`command/` 中不得出现 HTTP 注解、Request/Response、Controller 类型。

```text
modules/<domain>/domain/
├── model/
├── service/
├── subscriber/
└── repository/
```

`model/` 下可按业务子域、聚合或领域概念拆分：

```text
domain/model/<subdomain-or-aggregate>/
├── <AggregateRoot>.java
├── <Entity>.java
├── <ValueObject>.java
├── <Enum>.java
├── *Repository.java
├── event/
├── exception/
└── read/
```

- `model/<subdomain>/`：聚合根、实体、值对象、枚举、状态、仓储接口。
- `service/`：领域服务；当业务规则不自然归属于单个实体/值对象时使用。
- `subscriber/`：响应 ApplicationEvent 的领域订阅处理，只能引用本 domain 的 ApplicationService。
- `repository/`：仓储接口的集中落位；已有子域风格时优先保持一致。

```text
modules/<domain>/infrastructure/
├── persistence/
├── resolve/
├── schedule/
└── <technical-capability>/
```

- `persistence/`：Repository 实现、JPA/JDBC/QueryDSL 查询。
- `resolve/`、`schedule/`、其他技术子包：模块内技术适配能力。
- infrastructure 可以实现 domain 定义的接口，也可以使用 frameworks，但不决定业务主流程。

```text
frameworks/<technical-or-vendor>/
├── *Client.java
├── *ClientImpl.java
├── *Configuration.java
├── *Properties.java
├── request/
├── response/
├── enums/
├── exception/
├── config/
└── logs/
```

frameworks 按共享技术能力或第三方系统拆分，不属于某个具体业务域，不承载业务主流程。

### 新建 domain/module 归属判断清单

本记录「决策」高阶不变量：优先扩展现有 domain，新建 domain/module 必须事先向用户说明原因、边界、协作方式和影响，经确认后才可继续。判断归属时至少核对：

- 业务语言是否与现有 domain/module 一致。
- 现有聚合、实体、值对象是否已经表达相关概念。
- 现有 ApplicationService 是否已有相似用例或可扩展流程。
- 现有 Repository、read model、查询能力是否覆盖相关数据生命周期。
- 事件、状态流转、权限、数据归属是否属于已有 domain/module。
- 这是否只是已有 domain/module 的新用例、新入口或新场景。
- 接口路径、页面入口或功能名称是否只是表现层变化，不能单独作为新建 domain/module 的理由。

### 评审清单

- Controller 是否只做 HTTP 适配和调用应用服务。
- Facade 是否只依赖 ApplicationService。
- ApplicationService 是否没有依赖 HTTP Request/Response。
- ApplicationService 是否直接使用具体类，而不是 interface + impl。
- 事务是否声明在 ApplicationService / Service 层。
- 跨 domain/module 协作是否通过 ApplicationEvent 和 Subscriber。
- Subscriber 是否只依赖本 domain/module 的 ApplicationService。
- Domain 是否没有依赖 Spring Web、JPA 实现、Feign Client。
- Infrastructure 是否没有决定业务主流程。
- frameworks 是否没有承载业务模块专属流程。
- 是否新建了平行体系而没有复用现有模块。
- interfaces 各端 mapper 是否独立：是否新建了跨端共享 mapper 或让一端 mapper 继承另一端。

### 常见坑

#### 坑 1：把 Controller 写成大业务层

**症状**：Controller 中出现状态流转、计价、仓储查询、第三方调用编排。

**后果**：HTTP 层和业务规则强耦合，无法复用，测试成本变高。

**修复**：Controller 只做适配，把用例编排放到 ApplicationService，把业务规则下沉到 domain。

#### 坑 2：只凭包名猜实现位置

**症状**：看到业务名就新建同名模块目录，不查已有调用链和仓储实现。

**后果**：产生平行体系，已有实现被绕开，行为不一致。

**修复**：先沿 Controller → ApplicationService → Repository → RepositoryJPA/JDBC 真实链路查清楚。

#### 坑 3：把 frameworks 当公共逻辑回收站

**症状**：业务判断、流程编排、模块专属逻辑被放进 `frameworks/`。

**后果**：跨模块基础设施被业务污染，依赖方向变乱。

**修复**：只有跨模块共享技术集成能力放 `frameworks/`，业务流程回到 application/domain。

#### 坑 4：测试策略只写"跑全量测试"

**症状**：计划里没有说明改动风险、定点测试和失败处理方式。

**后果**：验证慢且不聚焦，容易漏掉真正风险。

**修复**：先定点测试，再按改动类型选择与后端子项目构建体系匹配的验证命令（如 `compileJava`、`testFast`、`test`、`clean build`）。

#### 坑 5：提交时混入无关改动

**症状**：commit 包含用户本地改动、环境配置、临时文件或敏感信息。

**后果**：污染历史，可能泄露敏感数据。

**修复**：提交前严格检查 `git status` 和 `git diff`，只 stage 与需求相关文件。

## 备选方案

### 方案 A：采纳本分层规则（本记录）

按正文绑定规则与分包速查约束后端子项目。

**收益**：与团队既有实践、mturtle skills、评审清单完全对齐；首个模块开工前规则即已就绪。
**代价**：本仓尚无后端代码，规则中的路径与命令需在落地时与实际布局核对。

### 方案 B：不建立约束（维持空语料）

**收益**：零维护成本。
**代价**：首个后端模块从零决定分层，易与团队其他仓漂移，review 无清单可依。

## 权衡

- 在业务代码落地前固化分层形态，若后端最终不是 Spring Boot/Gradle 技术栈，正文需要大改。
- affects 模式与验证命令清单需在后端子项目落地时与实际布局核对一次。

## 后果

- 审核通过后，对 `services/` 下后端子项目的所有新增模块、分层落点与跨层调用具有约束力；review 时按「评审清单」逐项核对。
- 违反调用方向的典型可观测症状：Controller 内出现状态流转/计价/仓储查询（坑 1）、domain 包 import Spring Web/JPA 实现/Feign、`frameworks/` 出现业务编排逻辑、两端共享或继承同一个 mapper。
- 违反归属判断的症状：出现与既有模块平行的同名新体系、已有实现被绕开、行为不一致（坑 2）。
- 验证合规的方式：沿 Controller → ApplicationService → Repository → RepositoryJPA/JDBC 真实链路走查；按「评审清单」做 code review；对 domain 包做依赖方向检查（不得依赖 interfaces/application/infrastructure）。
- **何以为错**：审核发现本仓后端不采用 Spring Boot 分层形态，或规则与实际布局冲突无法裁剪——此时拒绝本记录（status → rejected）并关闭，不强行套用。

## 行动项

1. [ ] 确认本仓后端技术栈与分层形态（Spring Boot + Gradle）。
2. [ ] 核对 affects 路径模式与验证命令清单。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。
