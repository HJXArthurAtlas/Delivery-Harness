---
schemaVersion: 0.2.0
id: "0002"
title: "业务异常定义归属领域层（Domain 定义，Application 可用）"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, exception, ddd, layering]
scope: component
reversibility: one-way-door
blastRadius: component
relatesTo: ["0001"]
affects:
  - type: path
    pattern: "services/**/domain/model/**"
  - type: path
    pattern: "services/**/frameworks/**/exception/**"
  - type: path
    pattern: "services/**/interfaces/**/exception/**"
  - type: path
    pattern: "services/**/i18n/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:32:54Z
---

# ADR-0002：业务异常定义归属领域层（Domain 定义，Application 可用）

## 背景

本决策适用于后端新增领域校验、定义业务异常与 review 异常落点的场景。后端错误对外契约由 `GlobalExceptionHandler` 机械派生：异常类名去 `Exception` 后转下划线大写得到对外 `code`（如 `OrderNotModifiableException` → `ORDER_NOT_MODIFIABLE`），文案查 i18n `messages.properties` 的 `error.<code>.text`，落空回退 `e.getMessage()`；前端按 `code` 匹配固定文案。因此**异常类的定义位置即对外错误契约的归属位置**。

本仓后端子项目尚未落地（见 ADR-0001，`modules/<m>/domain/model/**` 已预留 `exception/` 分包）。若首个模块开工前不定跨特性规则，异常落点会随个人习惯漂移成混置：`BizException` 标记基类与技术横切异常落 `frameworks/`，端侧语义异常落 `interfaces/`，用例语义异常落 `application/`，领域异常散落领域包；事后统一归属需回迁全部引用点。在落地前固化归属规则，成本为零。

## 决策

- **领域层（`modules/<m>/domain/model/**`）定义本领域的业务异常**：一个业务拒绝原因一个 `BizException` 子类，保持标记风格（无字段、无自定义构造），如 `InvalidOrderStateException`。
- **Application 层允许使用（声明、抛出）这些领域异常**：用例编排、业务规则判定中直接 `throw` 领域层定义的异常，不在 Application 层重复定义同义异常。
- 异常经 `GlobalExceptionHandler` 统一映射为 `ErrorMessage`（code 派生 + i18n 文案），Interfaces 层只做映射、不定义领域业务异常。
- **边界条款**：不属于任何业务领域的技术横切异常（远程调用、短信、Excel/协议/锁等）留在 `frameworks/` 的 exception 包；表达接口/端边界语义而非领域规则的认证、权限类异常允许留在 Interfaces 层。两类均不得作为「领域异常放别处」的先例。

### 方案 A：领域层定义（选定）

| Dimension | Assessment |
|---|---|
| 语义局部性 | 异常与触发它的领域不变量同包，重构领域模型时异常随之移动 |
| 对外契约 | code 由类名派生，领域词汇即错误码词汇，一处改名一处契约 |
| 复用 | 同一领域异常可被 Application 编排与领域模型共同抛出（如 `NotFoundException` 被多个 ApplicationService 复用） |
| 代价 | 新增异常需同步 `messages.properties` 键，漏配则回退 `e.getMessage()` 原文 |

### 方案 B：全部异常集中在 frameworks 共享包

**Pros:** 一处可见全部对外错误码；不污染领域包。
**Cons:** 领域词汇上浮到框架层，领域模型无法自表达拒绝语义；领域不变量被拆散到共享包，聚合无法自包含；落地后若再迁回领域包，牵动全部引用点，收益为零。

### 方案 C：按用例在 Application 层定义异常

**Pros:** 与用例一一对应，映射直观。
**Cons:** 领域模型自身无法抛语义化异常（领域层不允许依赖 Application）；每个 Application 异常需 `GlobalExceptionHandler` 显式分支映射，付出专门 handler 与错误码词表的成本；同义异常跨用例重复。

### 方案 D：Do nothing（不定规则）

后端落地后异常落点随个人习惯漂移成混置，事后统一归属需回迁全部引用点；本记录要消除的正是这个前景。

## 权衡

- 收益：领域模型可自表达拒绝语义；异常即错误契约，code 派生规则下类名即 API；Application 编排与领域模型复用同一异常类型。
- 代价：`GlobalExceptionHandler` 的 code 由类名机械派生，**重命名异常类即静默改变对外契约**（拼写错误直接成为错误码）；每新增异常必须同步 `messages.properties` 的 `error.<code>.text`，漏配时前端拿到 `e.getMessage()` 原文；前端第二份 code→文案表与本仓 i18n 双源可能不同步。

## 后果

- Easier: 新增领域校验（值对象构造即校验的风格）就地声明异常；错误码与 i18n 键从类名机械得出，零配置接入 handler。
- Harder: 异常类名成为公开契约，命名需评审；重构改名必须连同 `messages.properties`、前端文案表一起改。
- **何以为错：** 出现领域模型因「异常不在本层」而无法抛语义化异常、被迫返回 boolean/错误码穿透 Application 的情况；或审核通过后新增业务异常仍大量落在 Application/Interfaces 层。
- Revisit if: 错误契约机制改为显式注册（枚举/注解携带 code），类名派生规则废弃；或领域层需要携带结构化错误载荷（超出标记异常的表达能力）。

## 行动项

1. [ ] 评审：确认本仓后端采用「类名派生 code + i18n 文案」的错误契约机制与 `GlobalExceptionHandler` 单点映射（机制不同则改写或拒绝本记录）。
2. [ ] 核对 affects 路径模式与 i18n 文件落点（后端子项目落地时与实际布局对齐一次，对齐 ADR-0001 同类行动项）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（规则本体保留在本记录，不设第二份副本）。
