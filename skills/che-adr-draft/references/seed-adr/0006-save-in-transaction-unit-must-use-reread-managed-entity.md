---
schemaVersion: 0.2.0
id: "0006"
title: "事务单元内落库必须使用本事务内重读的受管实体"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, persistence, transactions, jpa, testing]
scope: domain
reversibility: two-way-door
blastRadius: team
relatesTo: ["0004"]
affects:
  - type: path
    pattern: "services/**/application/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:41:02Z
---

# ADR-0006：事务单元内落库必须使用本事务内重读的受管实体

## 背景

本决策适用于编写或 review「事务外读实体 → 事务单元内写实体」形态的应用服务链路——ADR-0004 合规落位后的标准形态（外部 IO 在事务外完成，DB 写入收口事务单元）。

仓储层惯用法 `saveOrUpdate` 的语义为 `entityManager.contains(entity) ? merge : persist`：走哪个分支由持久化上下文是否持有该实体决定，与「实体对象从哪来」无关。事务外读出的实体（无事务或 readOnly 事务读出即 detached）传入 `save()` 走 `persist` 分支，运行期直接抛 `InvalidDataAccessApiUsageException: detached entity passed to persist`。

该错误类对单元测试不可见：mock 仓储只记录调用、不感知受管状态，单测全绿不代表正确；只有走真实数据库的功能测试或运行期才会暴露。

问题是结构性的：ADR-0004 每外提一次外部 IO，就新增一处「事务外读 + 单元内写」组合；不立规则，该陷阱随每次外提复发。本记录是 ADR-0004 的伴生写侧规则。

## 决策

**事务单元内落库必须使用本事务内重读出的受管实体；禁止对事务外读出的实体直接 `save()`。**

1. **禁止对事务外读出的实体调用 `save()`**：非受管实体走 `persist` 分支，运行期抛 `InvalidDataAccessApiUsageException`。事务外读出的实体仅作决策输入（所需快照值写局部变量或 command 字段），不得流入事务单元的写路径。
2. **事务单元内按 id 重读为受管实体再落库**：`repository.of(id).orElseThrow(...)` 后，在受管实例上做领域变更并保存。重读即受管，`saveOrUpdate` 走 `merge` 分支，持久化上下文脏检查与乐观锁语义正常生效。重读缺失（如并发删除）抛业务异常快速失败，属正确行为。
3. **测试策略配套**：涉及「事务外读 + 事务内写」形态的链路，必须至少有一条走真实数据库的功能测试覆盖落库路径；单元测试 mock 仓储无法暴露本错误类，不得以单测绿替代。
4. **实现即遵守 + 双重执行点**：(a) implement 阶段——按 ADR-0004 拆分事务边界时，「单元内 save 的实体从哪来」是设计前提，不得先写 detached 落库再等 review 修正；(b) code-review 阶段——「事务单元内 save 的实体是否为事务内重读的受管实例」列为标准违规项拦截。

## 备选方案

### 方案 A：事务单元内按 id 重读为受管实体（选定）

| Dimension | Assessment |
|---|---|
| 正确性 | 重读即受管，`merge` 分支生效，脏检查与乐观锁语义保留 |
| 一致性 | 单一写法约定，不引入第二套落库风格 |
| 成本 | 每事务单元多一次主键读，代价可忽略 |
| 可检验 | review 有机械检查点：save 的实体是否为本事务内重读所得 |

### 方案 B：对 detached 快照调 `merge` 落库

**Pros:** 免去重读，改动最小。
**Cons:** `merge` 把过期快照整份复制回受管实体——预检到落库之间他方已变更的字段被静默覆盖（lost update），且绕过领域模型的变更方法；并发写场景下比显式快速失败更危险。拒绝。

### 方案 C：Do nothing（逐案发现）

**Cons:** 错误只在真实数据库运行期暴露，单测不可见，逐案发现不可靠。拒绝。

## 权衡

- 每个事务单元多一次主键读；相对其消除的运行期错误与丢失更新风险，代价可忽略。
- 预检快照与落库之间存在竞态窗口（重读前后他方变更）：快照值按调用方语义使用，与 ADR-0004 对事务外预读的权衡一致；受管实例上的字段级变更以重读状态为基底，不放大该窗口。
- 「事务外实体仅作决策输入」要求把所需值显式拷贝为局部变量 / command 字段，少量样板；收益是写路径的数据来源在代码结构上即可审查。

## 后果

- Easier: ADR-0004 后续外提有明确落位规则；`detached entity passed to persist` 从「功能测试/联调才暴露」变为「编码期即可规避」。
- Harder: 事务单元内多一步重读；reviewer 需核对 save 实体的来源。
- **何以为错：** 功能测试或生产日志再出现 `detached entity passed to persist`，即说明存在对事务外实体直接落库的链路。
- Revisit if: 后续为 repository `save` 引入受管状态断言等机械化兜底时，评估把本规则的执行点下沉到框架层，届时修订本记录。

## 行动项

1. [ ] 评审：确认本规则独立成文（写侧受管状态语义），不并入未来可能的持久化规则记录（查询侧规则另行成文，互补不稀释）。
2. [ ] code-review 清单加入检查项：「事务单元内 save 的实体是否为事务内重读的受管实例」（Decision 4 已固化表述）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（规则本体保留在本记录，不设第二份副本）。
